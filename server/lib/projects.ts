import { eq, sql } from 'drizzle-orm';
import type { Database } from '../../db/client.js';
import { projects } from '../../db/schema.js';

export async function countPublishedProjects(db: Database) {
  const [row] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(projects)
    .where(eq(projects.isPublished, true));

  return row?.count ?? 0;
}
