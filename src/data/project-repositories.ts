export const PROJECT_REPOSITORY_URLS: Record<string, string> = {
  'lotto-generator': 'https://github.com/zeztto/ws_09_lotto-gen',
  'server-time-sync': 'https://github.com/zeztto/server-time',
  'unit-converter': 'https://github.com/zeztto/ws_14_unit-converter',
  'color-palette': 'https://github.com/zeztto/ws_10_color-palette',
  'password-generator': 'https://github.com/zeztto/ws_07_password-generator',
  'realtime-exchange': 'https://github.com/zeztto/ws_06_realtime-exchange',
  memomome: 'https://github.com/zeztto/ws_05_memomome',
  'finance-converter': 'https://github.com/zeztto/ws_02_finance-converter',
  'card-puzzle': 'https://github.com/zeztto/card-puzzle',
  'qr-ing': 'https://github.com/zeztto/qr-ing',
  'emoji-list': 'https://github.com/zeztto/emoji-list',
  tetrix: 'https://github.com/zeztto/tetrix',
  'simple-calculator': 'https://github.com/zeztto/simple-calculator',
  'compound-calculator': 'https://github.com/zeztto/ws_16_compund-calculator',
  'lorem-ipsum': 'https://github.com/zeztto/ws_04_lorem-ipsum-generator',
  'lottery-roulette': 'https://github.com/zeztto/lottery-roulette',
  'tarot-card': 'https://github.com/zeztto/tarot-card',
  'text-counter': 'https://github.com/zeztto/ws_03_text-counter',
  sudoku: 'https://github.com/zeztto/sudocux',
  qqwe: 'https://github.com/zeztto/99i-kr-url-short',
  qwee: 'https://github.com/zeztto/qwee-kr-link-in-bio',
  h4ppylabs: 'https://github.com/zeztto/h4ppylabs.com',
  circlr: 'https://github.com/zeztto/circlr',
  'p1zza-agent': 'https://github.com/zeztto/p1zza-agent',
};

export function getProjectRepositoryUrl(projectId: string) {
  return PROJECT_REPOSITORY_URLS[projectId] ?? '';
}
