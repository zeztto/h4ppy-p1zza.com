import { mkdir, rm, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import { projects } from '../src/data/projects.js';

const execFileAsync = promisify(execFile);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const chromeBinary = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const rawDir = path.join(rootDir, 'output', 'thumbnails', 'raw');
const tempDir = path.join(rootDir, 'output', 'thumbnails', 'temp');
const finalDir = path.join(rootDir, 'public', 'thumbnails');
const rawViewport = { width: 1440, height: 900 };
const finalViewport = { width: 1600, height: 900 };
const finalSize = { width: 1200, height: 675 };

interface ProjectThumbnailTarget {
  id: string;
  name: string;
  url: string;
  category: string;
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getTargets(): ProjectThumbnailTarget[] {
  return projects
    .filter((project) => project.category !== 'Websites' && project.id !== 'h4ppy-p1zza-portfolio')
    .map((project) => ({
      id: project.id,
      name: project.name,
      url: project.url,
      category: project.category,
    }));
}

async function runCommand(command: string, args: string[]) {
  await execFileAsync(command, args, {
    cwd: rootDir,
    maxBuffer: 10 * 1024 * 1024,
  });
}

async function ensureDirectories() {
  await Promise.all([
    mkdir(rawDir, { recursive: true }),
    mkdir(tempDir, { recursive: true }),
    mkdir(finalDir, { recursive: true }),
  ]);
}

async function captureRawScreenshot(target: ProjectThumbnailTarget, rawScreenshotPath: string) {
  await runCommand(chromeBinary, [
    '--headless=new',
    '--disable-gpu',
    '--disable-sync',
    '--disable-background-networking',
    '--hide-scrollbars',
    '--no-first-run',
    '--run-all-compositor-stages-before-draw',
    `--window-size=${rawViewport.width},${rawViewport.height}`,
    '--virtual-time-budget=18000',
    `--screenshot=${rawScreenshotPath}`,
    target.url,
  ]);
}

function buildCompositionHtml(target: ProjectThumbnailTarget, rawScreenshotPath: string) {
  const rawImageUrl = pathToFileURL(rawScreenshotPath).href;

  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(target.name)}</title>
    <style>
      :root {
        color-scheme: dark;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        overflow: hidden;
        background:
          radial-gradient(circle at 18% 20%, rgba(96, 165, 250, 0.28), transparent 34%),
          radial-gradient(circle at 82% 18%, rgba(244, 114, 182, 0.16), transparent 30%),
          linear-gradient(135deg, #040814 0%, #09101f 45%, #0c1424 100%);
        display: grid;
        place-items: center;
        font-family: "Pretendard", "SUIT", "Noto Sans KR", sans-serif;
      }

      .backdrop {
        position: fixed;
        inset: -5%;
        background-image: url("${rawImageUrl}");
        background-size: cover;
        background-position: center;
        filter: blur(40px) saturate(1.08);
        opacity: 0.42;
        transform: scale(1.08);
      }

      .noise {
        position: fixed;
        inset: 0;
        background:
          linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
        background-size: 32px 32px;
        mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.8), transparent 88%);
        opacity: 0.35;
      }

      .halo {
        position: fixed;
        inset: 0;
        display: grid;
        place-items: center;
      }

      .halo::before {
        content: "";
        width: 72vw;
        height: 72vh;
        border-radius: 999px;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.18), transparent 70%);
        filter: blur(26px);
      }

      .frame {
        position: relative;
        z-index: 1;
        padding: 18px;
        border-radius: 34px;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.06));
        border: 1px solid rgba(255, 255, 255, 0.18);
        box-shadow:
          0 42px 100px rgba(3, 8, 20, 0.48),
          0 12px 32px rgba(9, 14, 28, 0.28);
        backdrop-filter: blur(10px);
      }

      img {
        display: block;
        width: auto;
        max-width: min(1240px, 86vw);
        max-height: 78vh;
        height: auto;
        border-radius: 24px;
        background: #ffffff;
        box-shadow:
          0 18px 44px rgba(15, 23, 42, 0.32),
          0 0 0 1px rgba(255, 255, 255, 0.12);
      }
    </style>
  </head>
  <body>
    <div class="backdrop"></div>
    <div class="noise"></div>
    <div class="halo"></div>
    <div class="frame">
      <img src="${rawImageUrl}" alt="${escapeHtml(target.name)}" />
    </div>
  </body>
</html>`;
}

async function composeThumbnail(
  target: ProjectThumbnailTarget,
  rawScreenshotPath: string,
  composedPngPath: string
) {
  const compositionPath = path.join(tempDir, `${target.id}.html`);
  await writeFile(compositionPath, buildCompositionHtml(target, rawScreenshotPath), 'utf8');

  await runCommand(chromeBinary, [
    '--headless=new',
    '--disable-gpu',
    '--allow-file-access-from-files',
    '--hide-scrollbars',
    '--no-first-run',
    `--window-size=${finalViewport.width},${finalViewport.height}`,
    `--screenshot=${composedPngPath}`,
    pathToFileURL(compositionPath).href,
  ]);

  await rm(compositionPath, { force: true });
}

async function resizeAndConvertThumbnail(composedPngPath: string, finalJpgPath: string) {
  const resizedPngPath = composedPngPath.replace(/\.png$/, '.resized.png');

  await runCommand('sips', [
    '-z',
    `${finalSize.height}`,
    `${finalSize.width}`,
    composedPngPath,
    '--out',
    resizedPngPath,
  ]);

  await runCommand('sips', [
    '-s',
    'format',
    'jpeg',
    '-s',
    'formatOptions',
    '82',
    resizedPngPath,
    '--out',
    finalJpgPath,
  ]);

  await Promise.all([
    rm(composedPngPath, { force: true }),
    rm(resizedPngPath, { force: true }),
  ]);
}

async function generateThumbnail(target: ProjectThumbnailTarget) {
  const rawScreenshotPath = path.join(rawDir, `${target.id}.png`);
  const composedPngPath = path.join(tempDir, `${target.id}.png`);
  const finalJpgPath = path.join(finalDir, `${target.id}.jpg`);

  console.warn(`[thumbnail] ${target.id} capturing ${target.url}`);
  await captureRawScreenshot(target, rawScreenshotPath);
  await composeThumbnail(target, rawScreenshotPath, composedPngPath);
  await resizeAndConvertThumbnail(composedPngPath, finalJpgPath);
}

async function main() {
  const targets = getTargets();
  await ensureDirectories();

  const failures: string[] = [];

  for (const target of targets) {
    try {
      await generateThumbnail(target);
    } catch (error) {
      failures.push(target.id);
      const reason = error instanceof Error ? error.message : String(error);
      console.error(`[thumbnail] ${target.id} failed: ${reason}`);
    }
  }

  console.warn(
    JSON.stringify(
      {
        ok: failures.length === 0,
        generated: targets.length - failures.length,
        failed: failures,
      },
      null,
      2
    )
  );

  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

void main();
