import fs from 'node:fs';
import path from 'node:path';
import type { InquiryRow, ProjectRow, SiteProfileRow, SiteSectionRow, SiteSettingsRow } from '../../db/schema.js';
import { getProjectRepositoryUrl } from '../../src/data/project-repositories.js';

const PORTFOLIO_PROJECT_ID = 'h4ppy-p1zza-portfolio';

function parseArray(value: string | null | undefined) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

export function serializeArray(values: string[] | undefined) {
  return JSON.stringify(values ?? []);
}

function replacePortfolioProjectCount(value: string, publishedProjectCount: number) {
  return value
    .replace(/\d+개 프로젝트/g, `${publishedProjectCount}개 프로젝트`)
    .replace(/\d+개의 프로젝트/g, `${publishedProjectCount}개의 프로젝트`);
}

function resolveExistingStaticAssetUrl(assetUrl: string | null | undefined) {
  if (!assetUrl) {
    return '';
  }

  if (!assetUrl.startsWith('/')) {
    return assetUrl;
  }

  const relativeAssetPath = assetUrl.replace(/^\/+/, '');
  const candidates = [
    path.resolve(process.cwd(), 'dist', relativeAssetPath),
    path.resolve(process.cwd(), 'public', relativeAssetPath),
    path.resolve(process.cwd(), '..', 'dist', relativeAssetPath),
    path.resolve(process.cwd(), '..', 'public', relativeAssetPath),
    path.resolve(process.cwd(), '..', '..', 'dist', relativeAssetPath),
    path.resolve(process.cwd(), '..', '..', 'public', relativeAssetPath),
  ];

  return candidates.some((candidate) => fs.existsSync(candidate)) ? assetUrl : '';
}

export function mapProject(row: ProjectRow, publishedProjectCount?: number) {
  const thumbnailUrl = resolveExistingStaticAssetUrl(row.thumbnailUrl);
  const project = {
    id: row.id,
    name: row.name,
    description: row.description,
    url: row.url,
    repoUrl: getProjectRepositoryUrl(row.id),
    category: row.category,
    year: row.year ?? '',
    sortOrder: row.sortOrder,
    thumbnailUrl,
    thumbnail: thumbnailUrl,
    longDescription: row.longDescription ?? '',
    tags: parseArray(row.tagsJson),
    features: parseArray(row.featuresJson),
    techStack: parseArray(row.techStackJson),
    isFeatured: row.isFeatured,
    isPublished: row.isPublished,
    createdAt: row.createdAt?.toISOString() ?? null,
    updatedAt: row.updatedAt?.toISOString() ?? null,
  };

  if (project.id !== PORTFOLIO_PROJECT_ID || typeof publishedProjectCount !== 'number') {
    return project;
  }

  return {
    ...project,
    description: replacePortfolioProjectCount(project.description, publishedProjectCount),
    longDescription: replacePortfolioProjectCount(project.longDescription, publishedProjectCount),
    features: project.features.map((feature) =>
      replacePortfolioProjectCount(feature, publishedProjectCount)
    ),
  };
}

export function mapProfile(row: SiteProfileRow) {
  return {
    id: row.id,
    displayName: row.displayName,
    headline: row.headline,
    bioShort: row.bioShort,
    avatarUrl: row.avatarUrl ?? '',
    githubUrl: row.githubUrl ?? '',
    instagramUrl: row.instagramUrl ?? '',
    email: row.email ?? '',
    essayMarkdown: row.essayMarkdown,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapSection(row: SiteSectionRow) {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    description: row.description,
    sectionType: row.sectionType,
    templateKey: row.templateKey,
    contentJson: row.contentJson,
    enabled: row.enabled,
    sortOrder: row.sortOrder,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapSetting(row: SiteSettingsRow) {
  return {
    key: row.key,
    value: row.value,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapInquiry(row: InquiryRow) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? '',
    company: row.company ?? '',
    projectType: row.projectType ?? '',
    budget: row.budget ?? '',
    timeline: row.timeline ?? '',
    description: row.description,
    status: row.status,
    sourceUrl: row.sourceUrl ?? '',
    userAgent: row.userAgent ?? '',
    ipAddress: row.ipAddress ?? '',
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    resolvedAt: row.resolvedAt?.toISOString() ?? null,
  };
}
