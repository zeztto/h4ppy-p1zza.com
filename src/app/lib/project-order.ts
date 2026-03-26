import type { PublicProject } from '@/app/lib/types';

function getTimestamp(value: string | null | undefined) {
  if (!value) {
    return 0;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function sortPortfolioProjects<T extends Pick<PublicProject, 'createdAt' | 'sortOrder' | 'name'>>(
  projects: T[],
) {
  return [...projects].sort((left, right) => {
    const createdDelta = getTimestamp(right.createdAt) - getTimestamp(left.createdAt);
    if (createdDelta !== 0) {
      return createdDelta;
    }

    const sortOrderDelta = left.sortOrder - right.sortOrder;
    if (sortOrderDelta !== 0) {
      return sortOrderDelta;
    }

    return left.name.localeCompare(right.name, 'ko');
  });
}
