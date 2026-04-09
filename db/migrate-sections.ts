import type { DatabaseClient } from './client.js';

type ColumnMeta = {
  dataType: string;
  isNullable: boolean;
};

function selectRequiredText(columns: Map<string, ColumnMeta>, name: string) {
  if (!columns.has(name)) {
    throw new Error(`Legacy site_sections table is missing required column: ${name}`);
  }

  return name;
}

function selectKey(columns: Map<string, ColumnMeta>) {
  if (columns.has('key')) {
    return 'key';
  }

  if (columns.has('id')) {
    return 'id';
  }

  throw new Error('Legacy site_sections table is missing both key and id columns');
}

function selectId(columns: Map<string, ColumnMeta>) {
  if (columns.has('id') && columns.has('key')) {
    return 'COALESCE(id, key)';
  }

  return selectKey(columns);
}

function selectUpdatedAt(columns: Map<string, ColumnMeta>) {
  const column = columns.get('updated_at');
  if (!column) {
    return 'NOW()';
  }

  if (column.dataType.includes('timestamp')) {
    return 'COALESCE(updated_at, NOW())';
  }

  if (column.dataType === 'integer' || column.dataType === 'bigint' || column.dataType === 'numeric') {
    return 'COALESCE(TO_TIMESTAMP(updated_at / 1000.0), NOW())';
  }

  return 'NOW()';
}

function selectEnabled(columns: Map<string, ColumnMeta>) {
  const column = columns.get('enabled');
  if (!column) {
    return 'TRUE';
  }

  if (column.dataType === 'boolean') {
    return 'COALESCE(enabled, TRUE)';
  }

  return `CASE
    WHEN enabled IS NULL THEN TRUE
    WHEN enabled::text IN ('0', 'false', 'f') THEN FALSE
    ELSE TRUE
  END`;
}

function selectSortOrder(columns: Map<string, ColumnMeta>) {
  if (!columns.has('sort_order')) {
    return '0';
  }

  return 'COALESCE(sort_order, 0)';
}

export async function migrateSections(client: DatabaseClient): Promise<void> {
  const [tableInfo, primaryKeyInfo] = await Promise.all([
    client.query(
      `SELECT column_name, data_type, is_nullable
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'site_sections'`
    ),
    client.query(
      `SELECT kcu.column_name
       FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu
         ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
       WHERE tc.table_schema = 'public'
         AND tc.table_name = 'site_sections'
         AND tc.constraint_type = 'PRIMARY KEY'`
    ),
  ]);

  const columns = new Map<string, ColumnMeta>(
    tableInfo.rows.map((row: Record<string, unknown>) => [
      String(row['column_name'] ?? ''),
      {
        dataType: String(row['data_type'] ?? ''),
        isNullable: String(row['is_nullable'] ?? 'YES') === 'YES',
      },
    ])
  );

  if (columns.size === 0) {
    return;
  }

  const primaryKeyColumns = primaryKeyInfo.rows.map((row: Record<string, unknown>) =>
    String(row['column_name'] ?? '')
  );
  const idColumn = columns.get('id');
  const isAlreadyCurrent =
    columns.has('section_type') &&
    columns.has('template_key') &&
    columns.has('content_json') &&
    idColumn !== undefined &&
    idColumn.isNullable === false &&
    primaryKeyColumns.length === 1 &&
    primaryKeyColumns[0] === 'id';

  if (isAlreadyCurrent) {
    return;
  }

  const connection = await client.connect();

  try {
    await connection.query('BEGIN');
    await connection.query('ALTER TABLE site_sections RENAME TO site_sections_legacy');
    await connection.query(`
      CREATE TABLE site_sections (
        id TEXT PRIMARY KEY NOT NULL,
        key TEXT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        section_type TEXT NOT NULL DEFAULT 'template',
        template_key TEXT,
        content_json TEXT NOT NULL DEFAULT '{}',
        enabled BOOLEAN NOT NULL DEFAULT TRUE,
        sort_order INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMPTZ NOT NULL
      )
    `);

    const keyExpr = selectKey(columns);
    const idExpr = selectId(columns);
    const sectionTypeExpr = columns.has('section_type') ? 'COALESCE(section_type, \'template\')' : '\'template\'';
    const templateKeyExpr = columns.has('template_key')
      ? `COALESCE(template_key, ${keyExpr})`
      : keyExpr;
    const contentJsonExpr = columns.has('content_json') ? 'COALESCE(content_json, \'{}\')' : '\'{}\'';

    await connection.query(`
      INSERT INTO site_sections (
        id,
        key,
        name,
        description,
        section_type,
        template_key,
        content_json,
        enabled,
        sort_order,
        updated_at
      )
      SELECT
        ${idExpr},
        ${keyExpr},
        ${selectRequiredText(columns, 'name')},
        ${selectRequiredText(columns, 'description')},
        ${sectionTypeExpr},
        ${templateKeyExpr},
        ${contentJsonExpr},
        ${selectEnabled(columns)},
        ${selectSortOrder(columns)},
        ${selectUpdatedAt(columns)}
      FROM site_sections_legacy
    `);

    await connection.query('DROP TABLE site_sections_legacy');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL
      )
    `);
    await connection.query('COMMIT');
  } catch (error) {
    await connection.query('ROLLBACK');
    throw error;
  } finally {
    connection.release();
  }
}
