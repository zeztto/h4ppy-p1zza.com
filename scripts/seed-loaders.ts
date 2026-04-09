import { existsSync } from 'node:fs';
import path from 'node:path';
import { projects } from '../src/data/projects.js';
import { resolveStaticAssetUrl } from '../src/data/cloudinary-assets.js';
import { DEFAULT_SITE_PROFILE, DEFAULT_SITE_SECTIONS } from '../src/data/site-content.js';

export interface SeedProject {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  year: string | undefined;
  thumbnail: string | undefined;
  longDescription: string | undefined;
  tags: string[];
  features: string[];
  techStack: string[];
}

export interface SeedProfile {
  displayName: string;
  headline: string;
  bioShort: string;
  avatarUrl: string;
  githubUrl: string;
  instagramUrl: string;
  email: string | null;
  essayMarkdown: string;
}

export interface SeedSection {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  sortOrder: number;
}

function resolveThumbnail(projectId: string, thumbnail: string | undefined) {
  if (thumbnail) {
    return resolveStaticAssetUrl(thumbnail);
  }

  const cloudinaryThumbnailUrl = resolveStaticAssetUrl(`/thumbnails/${projectId}.jpg`);
  if (cloudinaryThumbnailUrl !== `/thumbnails/${projectId}.jpg`) {
    return cloudinaryThumbnailUrl;
  }

  const generatedThumbnailPath = path.join(
    process.cwd(),
    'output',
    'thumbnails',
    'final',
    `${projectId}.jpg`
  );

  const legacyGeneratedThumbnailPath = path.join(
    process.cwd(),
    'public',
    'thumbnails',
    `${projectId}.jpg`
  );

  if (existsSync(generatedThumbnailPath) || existsSync(legacyGeneratedThumbnailPath)) {
    return `/thumbnails/${projectId}.jpg`;
  }

  return undefined;
}

export async function loadSeedProjects(): Promise<SeedProject[]> {
  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    description: project.description,
    url: project.url,
    category: project.category,
    year: project.year,
    thumbnail: resolveThumbnail(project.id, project.thumbnail),
    longDescription: project.longDescription,
    tags: project.tags,
    features: project.features ?? [],
    techStack: project.techStack ?? [],
  }));
}

export async function loadSeedSections(): Promise<SeedSection[]> {
  return DEFAULT_SITE_SECTIONS.map((section) => ({
    key: section.key,
    name: section.name,
    description: section.description,
    enabled: section.enabled,
    sortOrder: section.sortOrder,
  }));
}

export async function loadSeedProfile(): Promise<SeedProfile> {
  return {
    displayName: DEFAULT_SITE_PROFILE.displayName,
    headline: DEFAULT_SITE_PROFILE.headline,
    bioShort: DEFAULT_SITE_PROFILE.bioShort,
    avatarUrl: DEFAULT_SITE_PROFILE.avatarUrl,
    githubUrl: DEFAULT_SITE_PROFILE.githubUrl,
    instagramUrl: DEFAULT_SITE_PROFILE.instagramUrl,
    email: DEFAULT_SITE_PROFILE.email ?? null,
    essayMarkdown: DEFAULT_SITE_PROFILE.essayMarkdown,
  };
}
