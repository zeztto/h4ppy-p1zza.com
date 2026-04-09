import { config as loadEnv } from 'dotenv';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { v2 as cloudinary } from 'cloudinary';
import { resolveCloudinaryConfig } from '../server/lib/cloudinary.js';
import { STATIC_CLOUDINARY_ASSET_MAP } from '../src/data/cloudinary-assets.js';

loadEnv({ path: '.env.local', override: false });
loadEnv();

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const generatedFilePath = path.join(rootDir, 'src', 'data', 'cloudinary-assets.ts');
const reportDir = path.join(rootDir, 'output', 'cloudinary');
const reportPath = path.join(reportDir, 'static-assets.json');
const adminProjectsPath = path.join(rootDir, 'src', 'data', 'admin', 'projects.json');

interface UploadTarget {
  assetPath: string;
  localPath: string;
  publicId: string;
}

function getCloudinaryConfig() {
  const config = resolveCloudinaryConfig({
    cloudinaryCloudName: process.env['CLOUDINARY_CLOUD_NAME'] ?? '',
    cloudinaryApiKey: process.env['CLOUDINARY_API_KEY'] ?? '',
    cloudinaryApiSecret: process.env['CLOUDINARY_API_SECRET'] ?? '',
    cloudinaryUrl: process.env['CLOUDINARY_URL'] ?? '',
  });

  if (!config) {
    throw new Error('Cloudinary credentials are missing');
  }

  return config;
}

async function listThumbnailTargets() {
  const directories = [
    path.join(rootDir, 'output', 'thumbnails', 'final'),
    path.join(rootDir, 'public', 'thumbnails'),
  ];

  const targets = new Map<string, UploadTarget>();

  for (const directory of directories) {
    if (!existsSync(directory)) {
      continue;
    }

    const files = await readdir(directory, { withFileTypes: true });
    for (const file of files) {
      if (!file.isFile()) {
        continue;
      }

      const extension = path.extname(file.name).toLowerCase();
      if (!['.jpg', '.jpeg', '.png', '.webp'].includes(extension)) {
        continue;
      }

      const localPath = path.join(directory, file.name);
      const fileName = path.parse(file.name).name;
      const assetPath = `/thumbnails/${file.name}`;

      targets.set(assetPath, {
        assetPath,
        localPath,
        publicId: `p1zza/static/thumbnails/${fileName}`,
      });
    }
  }

  return Array.from(targets.values()).sort((left, right) => left.assetPath.localeCompare(right.assetPath));
}

async function getUploadTargets() {
  const thumbnailTargets = await listThumbnailTargets();

  const extras: UploadTarget[] = [
    {
      assetPath: '/profile.jpg',
      localPath: path.join(rootDir, 'public', 'profile.jpg'),
      publicId: 'p1zza/static/identity/profile',
    },
    {
      assetPath: '/og-image.png',
      localPath: path.join(rootDir, 'public', 'og-image.png'),
      publicId: 'p1zza/static/meta/og-image',
    },
  ];

  return [...thumbnailTargets, ...extras].filter((target) => existsSync(target.localPath));
}

function toGeneratedModule(assetMap: Record<string, string>) {
  return `export const STATIC_CLOUDINARY_ASSET_MAP = ${JSON.stringify(assetMap, null, 2)} as const;

export function resolveStaticAssetUrl(assetUrl: string | null | undefined) {
  if (!assetUrl) {
    return '';
  }

  return STATIC_CLOUDINARY_ASSET_MAP[assetUrl as keyof typeof STATIC_CLOUDINARY_ASSET_MAP] ?? assetUrl;
}
`;
}

async function loadExistingAssetMap() {
  const committedAssetMap: Record<string, string> = {
    ...STATIC_CLOUDINARY_ASSET_MAP,
  };

  if (!existsSync(reportPath)) {
    return committedAssetMap;
  }

  const raw = await readFile(reportPath, 'utf8');
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object') {
    return committedAssetMap;
  }

  return {
    ...committedAssetMap,
    ...(parsed as Record<string, string>),
  };
}

async function uploadAll() {
  const config = getCloudinaryConfig();

  cloudinary.config({
    cloud_name: config.cloudName,
    api_key: config.apiKey,
    api_secret: config.apiSecret,
    secure: true,
  });

  const targets = await getUploadTargets();
  const assetMap: Record<string, string> = await loadExistingAssetMap();
  let uploadedCount = 0;

  for (const target of targets) {
    const result = await cloudinary.uploader.upload(target.localPath, {
      public_id: target.publicId,
      overwrite: true,
      invalidate: true,
      resource_type: 'image',
      unique_filename: false,
      use_filename: false,
    });

    assetMap[target.assetPath] = result.secure_url;
    uploadedCount += 1;
  }

  await mkdir(reportDir, { recursive: true });
  await writeFile(generatedFilePath, toGeneratedModule(assetMap), 'utf8');
  await writeFile(reportPath, JSON.stringify(assetMap, null, 2), 'utf8');
  await syncAdminProjects(assetMap);

  console.log(
    JSON.stringify(
        {
          ok: true,
          uploaded: uploadedCount,
          mapped: Object.keys(assetMap).length,
          generatedFilePath,
          reportPath,
        },
      null,
      2
    )
  );
}

async function syncAdminProjects(assetMap: Record<string, string>) {
  const raw = await readFile(adminProjectsPath, 'utf8');
  const projects = JSON.parse(raw);

  if (!Array.isArray(projects)) {
    throw new Error('admin projects JSON must be an array');
  }

  const nextProjects = projects.map((project) => {
    if (
      project &&
      typeof project === 'object' &&
      typeof project['thumbnail'] === 'string' &&
      assetMap[project['thumbnail']]
    ) {
      return {
        ...project,
        thumbnail: assetMap[project['thumbnail']],
      };
    }

    return project;
  });

  await writeFile(adminProjectsPath, `${JSON.stringify(nextProjects, null, 2)}\n`, 'utf8');
}

void uploadAll();
