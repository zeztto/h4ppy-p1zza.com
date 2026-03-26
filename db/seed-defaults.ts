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
    { label: 'Portfolio', to: '/portfolio' },
    { label: 'Hire', to: '/hire' },
    { label: 'Profile', to: '/profile' },
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
  const now = Date.now();

  // Seed default settings using INSERT OR IGNORE (won't overwrite existing)
  const settings = [
    { key: 'header', value: JSON.stringify(DEFAULT_HEADER_SETTINGS) },
    { key: 'footer', value: JSON.stringify(DEFAULT_FOOTER_SETTINGS) },
    { key: 'portfolio_grid', value: JSON.stringify(DEFAULT_PORTFOLIO_GRID) },
  ];

  for (const setting of settings) {
    await client.execute({
      sql: 'INSERT OR IGNORE INTO site_settings (key, value, updated_at) VALUES (?, ?, ?)',
      args: [setting.key, setting.value, now],
    });
  }

  const headerRow = await client.execute({
    sql: 'SELECT value FROM site_settings WHERE key = ?',
    args: ['header'],
  });
  const footerRow = await client.execute({
    sql: 'SELECT value FROM site_settings WHERE key = ?',
    args: ['footer'],
  });

  const headerValue = parseSettingValue(headerRow.rows[0]?.['value']);
  if (headerValue) {
    const siteName = getString(headerValue['siteName']);
    const navLinks = Array.isArray(headerValue['navLinks']) ? headerValue['navLinks'] : [];
    const hasHireLink = navLinks.some(
      (link) =>
        link &&
        typeof link === 'object' &&
        (getString(link.to) === '/hire' || getString(link.path) === '/hire')
    );

    if (siteName === 'h4ppy p1zza' || !hasHireLink) {
      await client.execute({
        sql: 'UPDATE site_settings SET value = ?, updated_at = ? WHERE key = ?',
        args: [
          JSON.stringify({
            ...headerValue,
            siteName: siteName === 'h4ppy p1zza' ? DEFAULT_HEADER_SETTINGS.siteName : siteName,
            navLinks: normalizeHeaderLinks(navLinks),
          }),
          now,
          'header',
        ],
      });
    }
  }

  const footerValue = parseSettingValue(footerRow.rows[0]?.['value']);
  if (footerValue) {
    const siteName = getString(footerValue['siteName']);
    const copyright = getString(footerValue['copyright']);

    if (siteName === 'h4ppy p1zza' || copyright.includes('h4ppy p1zza')) {
      await client.execute({
        sql: 'UPDATE site_settings SET value = ?, updated_at = ? WHERE key = ?',
        args: [
          JSON.stringify({
            ...footerValue,
            siteName: siteName === 'h4ppy p1zza' ? DEFAULT_FOOTER_SETTINGS.siteName : siteName,
            copyright:
              copyright.includes('h4ppy p1zza')
                ? DEFAULT_FOOTER_SETTINGS.copyright
                : copyright,
          }),
          now,
          'footer',
        ],
      });
    }
  }

  // Seed default section content — only update rows where content_json is still '{}'
  for (const [templateKey, content] of Object.entries(SECTION_CONTENT)) {
    await client.execute({
      sql: `UPDATE site_sections SET content_json = ?, template_key = ?, section_type = 'template' WHERE id = ? AND content_json = '{}'`,
      args: [JSON.stringify(content), templateKey, templateKey],
    });
  }
}

function parseSettingValue(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }

  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function getString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function normalizeHeaderLinks(navLinks: unknown[]) {
  const links = navLinks
    .map((link) => {
      if (!link || typeof link !== 'object') {
        return null;
      }

      const normalizedLink = link as Record<string, unknown>;
      const label = getString(normalizedLink['label']);
      const to = getString(normalizedLink['to']) || getString(normalizedLink['path']);
      if (!label || !to) {
        return null;
      }

      return { label, to };
    })
    .filter((link): link is { label: string; to: string } => Boolean(link));

  if (!links.some((link) => link.to === '/hire')) {
    const profileIndex = links.findIndex((link) => link.to === '/profile');
    if (profileIndex === -1) {
      links.push({ label: 'Hire', to: '/hire' });
    } else {
      links.splice(profileIndex, 0, { label: 'Hire', to: '/hire' });
    }
  }

  return links;
}
