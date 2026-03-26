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
const rawViewport = { width: 1360, height: 820 };
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
    .filter(
      (project) =>
        project.category !== 'Websites' &&
        project.category !== 'Services' &&
        project.id !== 'h4ppy-p1zza-portfolio'
    )
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
      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        width: 100vw;
        height: 100vh;
        overflow: hidden;
        background: #0b0f19;
      }

      img {
        display: block;
        width: 100vw;
        height: 100vh;
        object-fit: cover;
        object-position: center top;
        transform: scale(1.08);
        transform-origin: center top;
      }
    </style>
  </head>
  <body>
    <img src="${rawImageUrl}" alt="${escapeHtml(target.name)}" />
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
