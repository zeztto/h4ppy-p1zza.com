import type { ProjectRow, SiteProfileRow, SiteSectionRow } from '../../db/schema.js';

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

export function mapProject(row: ProjectRow) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    url: row.url,
    category: row.category,
    year: row.year ?? '',
    sortOrder: row.sortOrder,
    thumbnailUrl: row.thumbnailUrl ?? '',
    thumbnail: row.thumbnailUrl ?? '',
    longDescription: row.longDescription ?? '',
    tags: parseArray(row.tagsJson),
    features: parseArray(row.featuresJson),
    techStack: parseArray(row.techStackJson),
    isFeatured: row.isFeatured,
    isPublished: row.isPublished,
    createdAt: row.createdAt?.toISOString() ?? null,
    updatedAt: row.updatedAt?.toISOString() ?? null,
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
    key: row.key,
    name: row.name,
    description: row.description,
    enabled: row.enabled,
    sortOrder: row.sortOrder,
    updatedAt: row.updatedAt.toISOString(),
  };
}
