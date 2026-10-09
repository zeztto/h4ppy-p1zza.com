import { projects, type Project } from './projects.js';
import { DEFAULT_SITE_PROFILE, DEFAULT_SITE_SECTIONS } from './site-content.js';

export const PORTFOLIO_REFRESH_REVISION = '2026-10-09';
export const ARCHIVED_PROJECT_IDS: string[] = ['prd-ai', 'onkura', 'pedals', 'srbbrs'];
export const BASELINE_PUBLISHED_PROJECT_IDS: string[] = [
  'lotto-generator',
  'server-time-sync',
  'unit-converter',
  'color-palette',
  'password-generator',
  'prd-ai',
  'realtime-exchange',
  'memomome',
  'finance-converter',
  'card-puzzle',
  'qr-ing',
  'emoji-list',
  'tetrix',
  'simple-calculator',
  'compound-calculator',
  'lorem-ipsum',
  'lottery-roulette',
  'tarot-card',
  'text-counter',
  'sudoku',
  'garlicton',
  'onkura',
  'qqwe',
  'qwee',
  'meetgirls',
  'srbbrs',
  'axmx',
  'pedals',
  'h4ppylabs',
];
export const NEWLY_PUBLISHED_PROJECT_IDS: string[] = [
  'lmml',
  'circlr',
  'nma-records',
  'p1zza-agent',
];
export type RefreshProject = Project & {
  sortOrder: number;
  isFeatured: boolean;
  isPublished: boolean;
};
export const PROJECT_CONTENT_UPDATES = projects as RefreshProject[];
export const PROFILE_CONTENT_UPDATE = DEFAULT_SITE_PROFILE;
export const SECTION_CONTENT_UPDATES = DEFAULT_SITE_SECTIONS.filter((section) =>
  ['projects', 'skills'].includes(section.id)
);
