import type { DatabaseClient } from './client.js';
import {
  DEFAULT_HERO_CONTENT,
  DEFAULT_PROJECTS_CONTENT,
  DEFAULT_VALUES_CONTENT,
  DEFAULT_SKILLS_CONTENT,
  DEFAULT_EXPERIENCE_CONTENT,
} from '../src/data/site-content.js';

const DEFAULT_HEADER_SETTINGS = {
  siteName: 'p1zza.kr',
  navLinks: [
    { label: '포트폴리오', to: '/portfolio' },
    { label: '프로필', to: '/profile' },
    { label: '제작 의뢰', to: '/inquiry' },
  ],
  showThemeToggle: true,
};

const DEFAULT_FOOTER_SETTINGS = {
  siteName: 'p1zza.kr',
  copyright: '\u00a9 2026 p1zza.kr. All rights reserved.',
  socialLinks: [
    { type: 'github', url: 'https://github.com/zeztto' },
    { type: 'instagram', url: 'https://instagram.com/h4ppy_p1zza' },
  ],
};

const DEFAULT_PORTFOLIO_GRID = {
  landingColumns: 3,
  portfolioPageColumns: 3,
};

const SECTION_CONTENT: Record<string, unknown> = {
  hero: DEFAULT_HERO_CONTENT,
  projects: DEFAULT_PROJECTS_CONTENT,
  values: DEFAULT_VALUES_CONTENT,
  skills: DEFAULT_SKILLS_CONTENT,
  experience: DEFAULT_EXPERIENCE_CONTENT,
};

export async function seedDefaults(client: DatabaseClient): Promise<void> {
  const now = new Date();

  // Seed default settings using INSERT OR IGNORE (won't overwrite existing)
  const settings = [
    { key: 'header', value: JSON.stringify(DEFAULT_HEADER_SETTINGS) },
    { key: 'footer', value: JSON.stringify(DEFAULT_FOOTER_SETTINGS) },
    { key: 'portfolio_grid', value: JSON.stringify(DEFAULT_PORTFOLIO_GRID) },
  ];

  for (const setting of settings) {
    await client.query(
      `INSERT INTO site_settings (key, value, updated_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (key) DO NOTHING`,
      [setting.key, setting.value, now]
    );
  }

  for (const [templateKey, content] of Object.entries(SECTION_CONTENT)) {
    await client.query(
      `UPDATE site_sections
       SET content_json = $1, template_key = $2, section_type = 'template'
       WHERE id = $3 AND content_json = '{}'`,
      [JSON.stringify(content), templateKey, templateKey]
    );
  }
}
