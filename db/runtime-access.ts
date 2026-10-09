import type { DatabaseClient } from './client.js';

const requiredColumns = {
  admin_users:
    'id, github_id, github_login, role, avatar_url, display_name, created_at, updated_at',
  sessions: 'id, session_hash, user_id, expires_at, created_at, updated_at',
  projects:
    'id, name, description, url, category, year, thumbnail_url, long_description, tags_json, features_json, tech_stack_json, sort_order, is_featured, is_published, created_at, updated_at',
  site_profile:
    'id, display_name, headline, bio_short, avatar_url, github_url, instagram_url, email, essay_markdown, updated_at',
  site_sections:
    'id, key, name, description, section_type, template_key, content_json, enabled, sort_order, updated_at',
  site_settings: 'key, value, updated_at',
  inquiries:
    'id, name, email, phone, company, project_type, budget, timeline, description, status, source_url, user_agent, ip_address, created_at, updated_at, resolved_at',
} as const;

export async function assertDatabaseReady(client: DatabaseClient, requireRestrictedRole = false) {
  if (requireRestrictedRole) {
    const access = await client.query<{
      elevated: boolean;
      role_memberships: boolean;
      schema_create: boolean;
      owns_tables: boolean;
    }>(
      `SELECT EXISTS (
          SELECT 1 FROM pg_roles
          WHERE rolname IN (session_user, current_user)
            AND (rolsuper OR rolcreaterole OR rolcreatedb OR rolbypassrls OR rolreplication)
        ) AS elevated,
        EXISTS (
          SELECT 1 FROM pg_roles subject CROSS JOIN pg_roles target
          WHERE subject.rolname IN (session_user, current_user)
            AND target.oid <> subject.oid
            AND pg_has_role(subject.oid, target.oid, 'MEMBER')
        ) AS role_memberships,
        (has_schema_privilege(session_user, 'public', 'CREATE') OR
          has_schema_privilege(current_user, 'public', 'CREATE')) AS schema_create,
        EXISTS (
          SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p')
            AND c.relname = ANY($1::text[]) AND
              (pg_has_role(session_user, c.relowner, 'MEMBER') OR
                pg_has_role(current_user, c.relowner, 'MEMBER'))
        ) AS owns_tables
       WHERE EXISTS (SELECT 1 FROM pg_roles WHERE rolname = current_user)
         AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = session_user)`,
      [Object.keys(requiredColumns)]
    );
    const role = access.rows[0];
    if (
      !role ||
      role.elevated !== false ||
      role.role_memberships !== false ||
      role.schema_create !== false ||
      role.owns_tables !== false
    ) {
      throw new Error(
        'Production database connection must use a non-owner application role without DDL privileges or role memberships'
      );
    }
  }

  try {
    for (const [table, columns] of Object.entries(requiredColumns)) {
      // Identifiers come exclusively from the application schema above, never from a request.
      await client.query(`SELECT ${columns} FROM public.${table} LIMIT 0`);
    }
  } catch {
    throw new Error('Database schema is not ready; run db:bootstrap with migration credentials');
  }
}
