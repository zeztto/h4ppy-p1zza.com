const PROJECT_CATEGORY_LABELS = new Map([
  ['All', '전체'],
  ['Websites', '웹사이트'],
  ['Services', '서비스'],
  ['Tools', '도구'],
  ['Finance', '금융'],
  ['Productivity', '생산성'],
  ['Media', '미디어'],
  ['Games', '게임'],
  ['Archive', '보관'],
]);

export function getProjectCategoryLabel(category: string) {
  return PROJECT_CATEGORY_LABELS.get(category) ?? category;
}
