import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { projects as canonicalProjects } from '../src/data/projects.js';
import { DEFAULT_SITE_SECTIONS } from '../src/data/site-content.js';
import { loadSeedProjects, loadSeedSections } from './seed-loaders.js';
import {
  buildRefreshPlan,
  contentDigest,
  parseArguments,
  type ContentRow,
  type ContentSnapshot,
} from './refresh-portfolio-content.js';

function archivedJson<T>(name: string): T {
  return JSON.parse(
    readFileSync(new URL(`../archive/content-2026-10-09/${name}`, import.meta.url), 'utf8')
  ) as T;
}
const snakeCase = (key: string) => key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
function dbRow(row: ContentRow): ContentRow {
  return Object.fromEntries(
    Object.entries(row)
      .filter(([key]) => !['repoUrl', 'thumbnail'].includes(key))
      .map(([key, value]) => {
        if (['tags', 'features', 'techStack'].includes(key))
          return [`${snakeCase(key)}_json`, JSON.stringify(value)];
        return [snakeCase(key), value];
      })
  );
}
function fixture(): ContentSnapshot {
  const projects = archivedJson<ContentRow[]>('public-projects.json').map(dbRow);
  projects.push({
    ...projects[0],
    id: 'hidden-preserved',
    is_published: false,
    is_featured: false,
    description: 'must stay byte-identical',
  });
  const footer = dbRow(archivedJson<ContentRow>('public-settings-footer.json'));
  const footerValue = JSON.parse(String(footer['value'])) as ContentRow;
  footerValue['customOption'] = { retained: true };
  footer['value'] = JSON.stringify(footerValue);
  return {
    projects,
    site_profile: [dbRow(archivedJson<ContentRow>('public-profile.json'))],
    site_sections: archivedJson<ContentRow[]>('public-sections.json').map(dbRow),
    site_settings: [
      footer,
      {
        key: 'sentinel',
        value: 'private-setting-preserved',
        updated_at: '2026-01-01T00:00:00.000Z',
      },
    ],
  };
}

test('refresh unpublishes four originals without deleting or rewriting their content', () => {
  const snapshot = fixture();
  const plan = buildRefreshPlan(snapshot, '2026-10-09T03:00:00.000Z');
  assert.equal(plan.after.projects.filter((row) => row['is_published'] === true).length, 29);
  for (const id of ['prd-ai', 'onkura', 'pedals', 'srbbrs']) {
    const before = snapshot.projects.find((row) => row['id'] === id)!;
    const after = plan.after.projects.find((row) => row['id'] === id)!;
    assert.deepEqual(after, {
      ...before,
      is_published: false,
      is_featured: false,
      updated_at: '2026-10-09T03:00:00.000Z',
    });
  }
  assert.deepEqual(
    plan.after.projects.find((row) => row['id'] === 'hidden-preserved'),
    snapshot.projects.find((row) => row['id'] === 'hidden-preserved')
  );
  assert.equal(
    snapshot.projects.some((row) => row['id'] === 'lmml'),
    false
  );
});

test('newly published allowlist may create missing rows or publish existing hidden rows', () => {
  const snapshot = fixture();
  snapshot.projects.push({
    ...snapshot.projects[0],
    id: 'lmml',
    is_published: false,
    created_at: '2025-01-01T00:00:00.000Z',
  });
  const plan = buildRefreshPlan(snapshot);
  const lmmlAction = plan.actions.find((action) => action.id === 'lmml')!;
  assert.equal(lmmlAction.kind, 'update');
  assert.equal(
    plan.after.projects.find((row) => row['id'] === 'lmml')?.['created_at'],
    '2025-01-01T00:00:00.000Z'
  );
  assert.equal(plan.actions.find((action) => action.id === 'circlr')?.kind, 'insert');
});

test('repeat refresh has no timestamp churn and yields an identical digest', () => {
  const first = buildRefreshPlan(fixture(), '2026-10-09T03:00:00.000Z');
  const second = buildRefreshPlan(first.after, '2026-10-10T03:00:00.000Z');
  assert.deepEqual(second.actions, []);
  assert.equal(second.beforeDigest, second.afterDigest);
});

test('profile identity, footer social/custom options, unrelated sections/settings survive', () => {
  const snapshot = fixture();
  const plan = buildRefreshPlan(snapshot);
  const beforeProfile = snapshot.site_profile[0]!;
  const afterProfile = plan.after.site_profile[0]!;
  for (const key of ['display_name', 'avatar_url', 'github_url', 'instagram_url', 'email'])
    assert.equal(afterProfile[key], beforeProfile[key]);
  const oldFooter = JSON.parse(String(snapshot.site_settings[0]?.['value'])) as ContentRow;
  const newFooter = JSON.parse(String(plan.after.site_settings[0]?.['value'])) as ContentRow;
  assert.deepEqual(newFooter, { ...oldFooter, copyright: '© 2026 p1zza.kr' });
  for (const id of ['hero', 'values', 'experience'])
    assert.deepEqual(
      plan.after.site_sections.find((row) => row['id'] === id),
      snapshot.site_sections.find((row) => row['id'] === id)
    );
  assert.deepEqual(plan.after.site_settings[1], snapshot.site_settings[1]);
});

test('unknown published and missing expected targets refuse a refresh', () => {
  const unknown = fixture();
  unknown.projects.push({ ...unknown.projects[0], id: 'unexpected-public', is_published: true });
  assert.throws(() => buildRefreshPlan(unknown), /Unknown published project/);
  const missing = fixture();
  missing.projects = missing.projects.filter((row) => row['id'] !== 'garlicton');
  assert.throws(() => buildRefreshPlan(missing), /Missing expected published project/);
  const missingArchive = fixture();
  missingArchive.projects = missingArchive.projects.filter((row) => row['id'] !== 'prd-ai');
  assert.throws(() => buildRefreshPlan(missingArchive), /Missing required projects target/);
});

test('digest changes for content drift and ignores row ordering', () => {
  const snapshot = fixture();
  const reordered = structuredClone(snapshot);
  reordered.projects.reverse();
  assert.equal(contentDigest(snapshot), contentDigest(reordered));
  reordered.site_profile[0]!['bio_short'] = 'Concurrent admin edit';
  assert.notEqual(contentDigest(snapshot), contentDigest(reordered));
});

test('CLI defaults to dry-run and refuses apply without a valid reviewed digest', () => {
  assert.equal(parseArguments([]).apply, false);
  assert.throws(() => parseArguments(['--apply']), /requires --expected-digest/);
  assert.throws(() => parseArguments(['--apply', '--expected-digest', 'invalid']), /SHA-256/);
  assert.throws(() => parseArguments(['--unexpected']), /Unknown argument/);
  assert.equal(parseArguments(['--apply', '--expected-digest', 'a'.repeat(64)]).apply, true);
});

test('safe seed loaders retain reviewed publication, feature, order, and section content', async () => {
  const seedProjects = await loadSeedProjects();
  assert.deepEqual(
    seedProjects.map((project) => ({
      id: project.id,
      isFeatured: project.isFeatured,
      isPublished: project.isPublished,
      sortOrder: project.sortOrder,
    })),
    canonicalProjects.map((project) => ({
      id: project.id,
      isFeatured: project.isFeatured,
      isPublished: project.isPublished,
      sortOrder: project.sortOrder,
    }))
  );
  assert.equal(seedProjects.filter((project) => project.isFeatured).length, 6);
  const seedSections = await loadSeedSections();
  assert.deepEqual(
    seedSections.map((section) => ({
      key: section.key,
      sectionType: section.sectionType,
      templateKey: section.templateKey,
      contentJson: section.contentJson,
    })),
    DEFAULT_SITE_SECTIONS.map((section) => ({
      key: section.key,
      sectionType: section.sectionType,
      templateKey: section.templateKey,
      contentJson: section.contentJson,
    }))
  );
});
