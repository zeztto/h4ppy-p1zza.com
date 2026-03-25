import { projects } from '../src/data/projects.js';
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

export async function loadSeedProjects(): Promise<SeedProject[]> {
  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    description: project.description,
    url: project.url,
    category: project.category,
    year: project.year,
    thumbnail: project.thumbnail,
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
