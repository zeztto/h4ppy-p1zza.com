/** Public portfolio content reviewed on 2026-10-09. Originals are preserved in archive/content-2026-10-09. */
export interface Project {
  id: string;
  name: string;
  description: string;
  url: string;
  tags: string[];
  category: string;
  longDescription?: string;
  features?: string[];
  techStack?: string[];
  year?: string;
  thumbnail?: string;
  sortOrder?: number;
  isFeatured?: boolean;
  isPublished?: boolean;
}

export const projects: Project[] = [
  {
    id: 'lmml',
    name: 'lmml.kr',
    description:
      '한국 메탈·하드코어·록 공연의 일정, 라인업, 공연장과 예매 정보를 모아 보여주는 서비스입니다.',
    url: 'https://lmml.kr/ko',
    category: 'Services',
    year: '2026',
    isFeatured: true,
    isPublished: true,
    longDescription:
      '다가오는 공연과 지난 공연을 날짜별로 살펴보고 라인업, 공연장, 입장료, 티켓 링크와 원본 공지를 확인할 수 있습니다. 관리자 화면에서는 소셜 게시물의 포스터와 본문을 가져와 공연 정보를 정리하고, 공연·공연장·밴드 정보를 관리합니다. 한국어와 영어를 지원합니다.',
    tags: ['Music', 'Live', 'CMS'],
    features: [
      '다가오는 공연·지난 공연 날짜별 탐색',
      '라인업·공연장·입장료·티켓 링크 확인',
      '소셜 게시물 기반 공연 정보 정리',
      '공연·공연장·밴드 관리자 CMS',
      '한국어·영어 지원',
    ],
    techStack: [
      'Next.js',
      'React',
      'TypeScript',
      'Tailwind CSS',
      'Drizzle ORM',
      'SQLite',
      'DeepSeek API',
      'Cloudflare R2',
    ],
    thumbnail: 'https://lmml.kr/opengraph-image',
    sortOrder: 0,
  },
  {
    id: 'circlr',
    name: 'circlr',
    url: 'https://github.com/zeztto/circlr/releases',
    category: 'Productivity',
    year: '2026',
    isFeatured: true,
    isPublished: true,
    description: '원형 타임라인으로 곡의 구조와 MIDI·오디오를 편집하는 macOS 음악 작업 앱입니다.',
    longDescription:
      '앨범·곡·섹션을 연결된 원형 타임라인으로 구성하고 하나의 캔버스에서 편곡을 다루는 macOS 앱입니다. MIDI와 오디오 편집, 악기·이펙트 라우팅, 프로젝트 저장과 WAV 내보내기, 로컬 MCP 연동을 제공합니다. Apple Silicon용 실행 파일과 소스가 공개되어 있습니다.',
    tags: ['Music', 'macOS', 'MIDI'],
    features: [
      '곡·섹션 원형 타임라인',
      'MIDI·오디오 편집',
      '악기·이펙트 라우팅',
      '프로젝트 저장과 WAV 내보내기',
      '로컬 MCP 연동',
    ],
    techStack: ['Swift', 'SwiftUI', 'AppKit', 'Core Audio', 'Python'],
    thumbnail:
      'https://raw.githubusercontent.com/zeztto/circlr/v1.2.0/docs/images/circlr-song-build253.jpg',
    sortOrder: 1,
  },
  {
    id: 'nma-records',
    name: 'NMA Records',
    url: 'https://nmarecords.com/',
    category: 'Services',
    year: '2026',
    isFeatured: true,
    isPublished: true,
    description: '음반·아티스트·레이블 정보와 문의 창구를 모은 NMA Records의 웹사이트입니다.',
    longDescription:
      'NMA Records의 음반 카탈로그와 아티스트 목록을 소개하는 웹사이트입니다. 작품의 연도·장르·트랙 정보, 아티스트 디스코그래피, 외부 스토어와 공식 링크, 문의 양식을 제공합니다.',
    tags: ['Music', 'Label', 'Catalog'],
    features: [
      '음반 카탈로그',
      '아티스트와 디스코그래피 소개',
      '외부 스토어·공식 링크',
      '문의 양식',
    ],
    techStack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Express', 'Turso'],
    thumbnail:
      'https://res.cloudinary.com/dnlcuy2aj/image/upload/v1791514457/portfolio-refresh-20261009/nma-records-f989fe02caf1.png',
    sortOrder: 2,
  },
  {
    id: 'p1zza-agent',
    name: 'p1zza-agent',
    url: 'https://github.com/zeztto/p1zza-agent',
    category: 'Tools',
    year: '2026',
    isFeatured: true,
    isPublished: true,
    description:
      'Claude와 Codex에서 역할별 AI 작업 규칙과 협업 흐름을 운영하는 agent 시스템입니다.',
    longDescription:
      'Everything Claude Code를 바탕으로 Claude와 Codex의 설치 패키지, 역할별 agent·skill, 공통 규칙과 전달 형식을 정리한 프로젝트입니다. 작업 소유권, 구현·검토·검증 경계와 문서 유지보수 규칙을 제공하고 설치 스크립트로 runtime에 적용할 수 있습니다.',
    tags: ['AI', 'Codex', 'Claude'],
    features: [
      'Claude·Codex 설치 패키지',
      '역할별 agent와 skill',
      '작업 소유권과 협업 전달 형식',
      '구현·검토·검증 공통 규칙',
      'runtime 설치 스크립트',
    ],
    techStack: ['Shell', 'Markdown', 'Python'],
    thumbnail:
      'https://res.cloudinary.com/dnlcuy2aj/image/upload/v1791514546/portfolio-refresh-20261009/p1zza-agent-dac8d8493a97.png',
    sortOrder: 3,
  },
  {
    id: 'garlicton',
    name: '갈릭톤 스튜디오',
    description:
      '갈릭톤 레코딩 스튜디오의 작업 음반, 서비스와 문의 창구를 소개하는 웹사이트입니다.',
    url: 'https://www.garlicton.com/ko',
    tags: ['Music', 'Studio', 'Recording'],
    category: 'Websites',
    longDescription:
      '메탈·헤비 음악을 중심으로 작업하는 갈릭톤 스튜디오의 공식 웹사이트입니다. 작업 음반과 영상, 엔지니어 소개, 레코딩·믹싱·마스터링·프로듀싱 서비스, 스튜디오 사진과 문의 양식을 한국어와 영어로 제공합니다.',
    features: [
      '음반·영상 작업 포트폴리오',
      '엔지니어 소개와 작업 이력',
      '레코딩·믹싱·마스터링·프로듀싱 안내',
      '스튜디오 사진과 연락처',
      '문의 양식',
      '한국어·영어 지원',
    ],
    techStack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Payload CMS', 'Cloudinary'],
    year: '2025',
    thumbnail:
      'https://res.cloudinary.com/dnlcuy2aj/image/upload/v1791514556/portfolio-refresh-20261009/garlicton-e5f9590c6c10.png',
    sortOrder: 4,
    isFeatured: true,
    isPublished: true,
  },
  {
    id: 'qwee',
    name: 'qwee.kr',
    description:
      '개인 프로필, 링크 모음, 소셜 아이콘, 테마를 한 페이지에 담아 공유하는 한국어 link-in-bio 서비스.',
    url: 'https://qwee.kr/',
    tags: ['Link-in-Bio', 'Creator Tools', 'Analytics'],
    category: 'Services',
    longDescription:
      '개인 프로필, 링크 목록, 소셜 아이콘과 테마를 한 페이지로 공유하는 한국어 link-in-bio 서비스입니다. Google OAuth로 로그인하고 대시보드에서 프로필과 링크를 편집하거나 드래그로 순서를 바꿀 수 있습니다. 프로필 조회수와 링크 클릭 수를 확인하며, Express API와 PostgreSQL을 사용합니다.',
    features: [
      '사용자명 기반 공개 프로필 페이지',
      'Google OAuth 로그인',
      '프로필·링크·소셜 아이콘 관리',
      '링크 드래그 순서 변경',
      '테마와 색상·카드 스타일 설정',
      '프로필 조회수·링크 클릭 분석',
    ],
    techStack: [
      'Next.js',
      'React',
      'TypeScript',
      'Express',
      'PostgreSQL',
      'Google OAuth',
      'Tailwind CSS',
      'Zustand',
      'Docker',
    ],
    year: '2026',
    thumbnail:
      'https://res.cloudinary.com/dnlcuy2aj/image/upload/v1791514554/portfolio-refresh-20261009/qwee-4d45a06c7a85.png',
    sortOrder: 5,
    isFeatured: true,
    isPublished: true,
  },
  {
    id: 'lotto-generator',
    name: '로또 번호 생성기',
    description: '대한민국 로또 6/45 번호를 12가지 알고리즘으로 생성합니다.',
    url: 'https://ws-09-lotto-gen.vercel.app/',
    tags: ['Utility', 'Algorithm'],
    category: 'Tools',
    longDescription:
      '12가지 다양한 알고리즘으로 로또 번호를 생성하는 웹 애플리케이션입니다. 완전 무작위, 홀짝 균형, 고저 균형, 연속번호 제한, 분산형, 패턴 회피, SHA-256 해시, 시간 기반, 피보나치, 소수, 황금비, LCG 방식을 지원합니다.',
    features: [
      '12가지 번호 생성 알고리즘',
      '최대 50개 번호 조합 생성',
      '중복 번호 제거',
      'TXT·CSV·JSON 내보내기',
      '키보드 탐색과 ARIA 속성 지원',
    ],
    techStack: ['React', 'TypeScript', 'Vite', 'shadcn/ui', 'SHA-256', 'LCG', 'Sonner'],
    year: '2025',
    thumbnail:
      'https://res.cloudinary.com/dnlcuy2aj/image/upload/v1775750724/p1zza/static/thumbnails/lotto-generator.jpg',
    sortOrder: 6,
    isFeatured: false,
    isPublished: true,
  },
  {
    id: 'server-time-sync',
    name: '도메인 시간대 비교',
    description: '도메인의 IP 위치로 추정한 시간대와 한국 시간을 비교하는 도구입니다.',
    url: 'https://server-time-sigma.vercel.app/',
    tags: ['Utility', 'Time', 'API'],
    category: 'Tools',
    longDescription:
      'DNS와 IP Geolocation으로 도메인이 연결된 IP의 위치와 시간대를 조회하고 한국 시간과 함께 표시합니다. 시각은 브라우저의 현재 시간을 해당 시간대로 변환해 보여주며, CDN을 사용하는 도메인에서는 엣지 서버의 시간대가 표시될 수 있습니다.',
    features: [
      '도메인 IP와 시간대 조회',
      'IP 위치 기반 시간대 추정',
      '한국 시간과 선택 시간대 비교',
      '수동 시간대 선택',
      '조회 결과 캐싱',
    ],
    techStack: [
      'React',
      'TypeScript',
      'Vite',
      'Tailwind CSS',
      'shadcn/ui',
      'Cloudflare DNS API',
      'ipapi.co',
    ],
    year: '2026',
    thumbnail:
      'https://res.cloudinary.com/dnlcuy2aj/image/upload/v1775750742/p1zza/static/thumbnails/server-time-sync.jpg',
    sortOrder: 7,
    isFeatured: false,
    isPublished: true,
  },
  {
    id: 'unit-converter',
    name: '단위 변환기',
    description: '길이, 무게, 온도, 부피 등 다양한 단위를 변환합니다.',
    url: 'https://ws-14-unit-converter.vercel.app/',
    tags: ['Utility', 'Calculator'],
    category: 'Tools',
    longDescription:
      '웹 브라우저에서 서버리스로 작동하는 단위 변환기입니다. 길이, 무게, 온도, 부피 등 4가지 카테고리의 다양한 단위를 간편하게 변환할 수 있으며, 양방향 변환을 지원합니다.',
    features: [
      '4가지 카테고리 (길이, 무게, 온도, 부피)',
      '길이: 미터, 킬로미터, 마일, 야드, 피트, 인치',
      '무게: 킬로그램, 그램, 톤, 파운드, 온스',
      '온도: 섭씨, 화씨, 켈빈',
      '부피: 리터, 갤런, 쿼트, 컵',
      '양방향 변환 및 실시간 계산',
    ],
    techStack: ['React', 'TypeScript', 'Vite', 'shadcn/ui', 'Tailwind CSS'],
    year: '2026',
    thumbnail:
      'https://res.cloudinary.com/dnlcuy2aj/image/upload/v1775750755/p1zza/static/thumbnails/unit-converter.jpg',
    sortOrder: 8,
    isFeatured: false,
    isPublished: true,
  },
  {
    id: 'color-palette',
    name: '색상 팔레트',
    description: '간단하고 직관적인 색상 선택 및 변환 도구입니다.',
    url: 'https://ws-10-color-palette.vercel.app/',
    tags: ['Design', 'Utility'],
    category: 'Tools',
    longDescription:
      '디자이너와 개발자를 위한 종합 색상 도구입니다. 20단계 그레이스케일과 20가지 색조에서 400가지 색상을 선택하고, HEX, RGB, HSL, CMYK 형식으로 변환할 수 있습니다.',
    features: [
      '20단계 그레이스케일 및 20가지 색조',
      '색조별 400색 (채도 x 명도 조합)',
      'HEX, RGB, HSL, CMYK 형식 변환',
      '원클릭 클립보드 복사',
      '즐겨찾기 저장 (최대 50개)',
      '최근 사용 히스토리 (최대 20개)',
      'URL 공유 및 CSS/JSON/Figma 내보내기',
    ],
    techStack: ['React', 'TypeScript', 'Vite', 'shadcn/ui', 'Tailwind CSS', 'Sonner'],
    year: '2025',
    thumbnail:
      'https://res.cloudinary.com/dnlcuy2aj/image/upload/v1775750700/p1zza/static/thumbnails/color-palette.jpg',
    sortOrder: 9,
    isFeatured: false,
    isPublished: true,
  },
  {
    id: 'password-generator',
    name: '비밀번호 생성기',
    description: 'Web Crypto API로 암호학적으로 안전한 비밀번호를 생성합니다.',
    url: 'https://ws-07-password-generator.vercel.app/',
    tags: ['Security', 'Utility'],
    category: 'Tools',
    longDescription:
      'Math.random() 대신 Web Crypto API를 사용하여 암호학적으로 안전한 비밀번호를 생성합니다. 최대 100개까지 동시 생성 가능하며, 대문자, 소문자, 숫자, 특수문자를 개별적으로 선택할 수 있습니다.',
    features: [
      'Web Crypto API (crypto.getRandomValues) 사용',
      '1-128자 길이 설정',
      '최대 100개 동시 생성',
      '개별 문자 타입 선택 (대소문자, 숫자, 특수문자)',
      '실시간 강도 평가기',
      'TXT 파일로 일괄 내보내기',
    ],
    techStack: ['React', 'TypeScript', 'Vite', 'Web Crypto API', 'shadcn/ui', 'Lucide'],
    year: '2025',
    thumbnail:
      'https://res.cloudinary.com/dnlcuy2aj/image/upload/v1775750729/p1zza/static/thumbnails/password-generator.jpg',
    sortOrder: 10,
    isFeatured: false,
    isPublished: true,
  },
  {
    id: 'realtime-exchange',
    name: '실시간 환율',
    description: '환율 조회, 통화 변환과 최근 환율 추이를 확인하는 도구입니다.',
    url: 'https://ws-06-realtime-exchange.vercel.app/',
    tags: ['Finance', 'API'],
    category: 'Finance',
    longDescription:
      '환율 API의 데이터를 바탕으로 주요 통화 환율을 조회하고 원화와 외화를 변환합니다. 최근 30일 환율 차트, 여행지 가격 환산과 표시할 통화 관리 기능을 제공합니다.',
    features: [
      '주요 통화 환율 조회',
      '원화·외화 양방향 변환',
      '최근 30일 환율 추이 차트',
      '여행지 가격 원화 환산',
      '표시 통화 선택과 순서 변경',
    ],
    techStack: [
      'React',
      'TypeScript',
      'Vite',
      'ExchangeRate-API',
      'Frankfurter API',
      'Recharts',
      'shadcn/ui',
    ],
    year: '2025',
    thumbnail:
      'https://res.cloudinary.com/dnlcuy2aj/image/upload/v1775750739/p1zza/static/thumbnails/realtime-exchange.jpg',
    sortOrder: 11,
    isFeatured: false,
    isPublished: true,
  },
  {
    id: 'memomome',
    name: '메모모미',
    description: '브라우저에 메모를 저장하고 편집·내보내기하는 웹 메모장입니다.',
    url: 'https://ws-05-memomome.vercel.app/',
    tags: ['Productivity', 'Notes'],
    category: 'Productivity',
    longDescription:
      '메모 본문과 편집 기록을 브라우저의 localStorage에 저장합니다. 자동 저장, 실행 취소·다시 실행, 찾기·바꾸기, 글자·단어·줄 통계와 여러 파일 형식의 내보내기를 제공합니다.',
    features: [
      '자동 저장 (타이핑 1초 후)',
      'Undo/Redo (최대 20단계, Ctrl+Z/Y)',
      '찾기/바꾸기 (대소문자 무시)',
      '메모 저장 관리 (최대 100개)',
      '실시간 통계 (문자, 단어, 줄 수)',
      '다양한 형식 내보내기 (TXT, MD, HTML, JSON, CSV)',
    ],
    techStack: ['React', 'TypeScript', 'Vite', 'localStorage', 'shadcn/ui', 'Sonner'],
    year: '2025',
    thumbnail:
      'https://res.cloudinary.com/dnlcuy2aj/image/upload/v1775750726/p1zza/static/thumbnails/memomome.jpg',
    sortOrder: 12,
    isFeatured: false,
    isPublished: true,
  },
  {
    id: 'finance-converter',
    name: '대출 이자 계산기',
    description: '4가지 상환 방식의 대출 이자를 계산하고 Excel/PDF로 내보냅니다.',
    url: 'https://ws-02-finance-converter-bci6.vercel.app/',
    tags: ['Finance', 'Calculator'],
    category: 'Finance',
    longDescription:
      '대출 금액, 연 이자율, 대출 기간을 입력하여 다양한 상환 방식에 따른 이자와 상환 계획을 계산합니다. 원리금균등, 원금균등, 만기일시, 체증식 상환을 지원하며, Excel과 PDF로 상세한 상환 일정표를 내보낼 수 있습니다.',
    features: [
      '원리금균등·원금균등·만기일시·체증식 계산',
      '거치 기간 설정',
      '만원·억원 및 년·개월·일 단위 입력',
      '월별 상환 일정표',
      'Excel 내보내기',
      '한글 PDF 내보내기',
    ],
    techStack: [
      'React',
      'TypeScript',
      'Vite',
      'xlsx',
      'jsPDF',
      'jspdf-autotable',
      'shadcn/ui',
      'Sonner',
    ],
    year: '2025',
    thumbnail:
      'https://res.cloudinary.com/dnlcuy2aj/image/upload/v1775750712/p1zza/static/thumbnails/finance-converter.jpg',
    sortOrder: 13,
    isFeatured: false,
    isPublished: true,
  },
  {
    id: 'card-puzzle',
    name: '카드 퍼즐',
    description: '카드를 뒤집어 같은 그림의 짝을 찾는 기억력 게임입니다.',
    url: 'https://card-puzzle-ten.vercel.app/',
    tags: ['Game', 'Memory', 'Puzzle'],
    category: 'Games',
    longDescription:
      '카드를 뒤집어 같은 그림의 짝을 찾는 기억력 게임입니다. 3단계 난이도(쉬움/보통/어려움)와 4가지 테마(동물/과일/이모지/기술)를 제공하며, 최고 기록이 로컬 스토리지에 저장됩니다.',
    features: [
      '3단계 난이도 (12장/16장/24장)',
      '4가지 테마 (동물, 과일, 이모지, 기술)',
      '실시간 타이머 및 시도 횟수',
      '난이도별 최고 기록 저장',
      '효과음 (음소거 가능)',
      '다크 모드 지원',
      '트위터/페이스북/카카오톡 공유',
    ],
    techStack: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'shadcn/ui', 'Lucide React'],
    year: '2026',
    thumbnail:
      'https://res.cloudinary.com/dnlcuy2aj/image/upload/v1775750699/p1zza/static/thumbnails/card-puzzle.jpg',
    sortOrder: 14,
    isFeatured: false,
    isPublished: true,
  },
  {
    id: 'qr-ing',
    name: '큐알잉',
    description: '빠르고 간편한 무료 한국어 QR코드 생성기입니다.',
    url: 'https://qr-ing.vercel.app/',
    tags: ['QR', 'Utility'],
    category: 'Archive',
    longDescription:
      '7가지 타입의 QR 코드를 간편하게 생성할 수 있는 한국어 QR 코드 생성기입니다. URL, 텍스트, 연락처, 이메일, 전화, 문자, WiFi 정보를 QR 코드로 변환하며, 크기, 오류 수정 레벨, 여백 등을 커스터마이징할 수 있습니다.',
    features: [
      '7가지 QR 타입 (URL, 텍스트, 연락처, 이메일, 전화, 문자, WiFi)',
      'QR 코드 크기 조절 (128px ~ 512px)',
      '오류 수정 레벨 설정 (L/M/Q/H)',
      'URL 자동 HTTPS 변환',
      '실시간 QR 코드 미리보기',
      'PNG 다운로드',
    ],
    techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'qrcode', 'shadcn/ui', 'Noto Sans KR'],
    year: '2025',
    thumbnail:
      'https://res.cloudinary.com/dnlcuy2aj/image/upload/v1775750736/p1zza/static/thumbnails/qr-ing.jpg',
    sortOrder: 15,
    isFeatured: false,
    isPublished: true,
  },
  {
    id: 'emoji-list',
    name: '이모지 모음',
    description: '이모지를 검색하고 클릭하면 클립보드에 복사되는 서버리스 웹 앱입니다.',
    url: 'https://emoji-list-seven.vercel.app/',
    tags: ['Utility', 'Emoji', 'Clipboard'],
    category: 'Tools',
    longDescription:
      '11개 카테고리로 분류된 이모지를 검색하고 클릭 한 번으로 클립보드에 복사할 수 있는 서버리스 웹 애플리케이션입니다. 즐겨찾기와 최근 사용 기록이 로컬 스토리지에 저장되어 자주 쓰는 이모지에 빠르게 접근할 수 있습니다.',
    features: [
      '이모지 또는 카테고리 이름으로 검색',
      '클릭하면 클립보드에 자동 복사',
      '즐겨찾기 저장 (localStorage)',
      '최근 사용 기록 최대 20개',
      '11개 카테고리별 탐색',
      '모바일, 태블릿, 데스크톱 반응형 디자인',
      'iframe 임베딩 지원',
    ],
    techStack: [
      'React',
      'TypeScript',
      'Vite',
      'Tailwind CSS',
      'shadcn/ui',
      'Sonner',
      'Lucide React',
    ],
    year: '2026',
    thumbnail:
      'https://res.cloudinary.com/dnlcuy2aj/image/upload/v1775750709/p1zza/static/thumbnails/emoji-list.jpg',
    sortOrder: 16,
    isFeatured: false,
    isPublished: true,
  },
  {
    id: 'tetrix',
    name: '테트릭스',
    description: 'Modern Guideline을 준수하는 서버리스 테트리스 게임입니다.',
    url: 'https://tetrix-six.vercel.app/',
    tags: ['Game', 'Puzzle', 'Classic'],
    category: 'Games',
    longDescription:
      '서버리스로 작동하는 완전한 테트리스 게임입니다. Modern Guideline을 준수하며, 모바일과 데스크톱 모두에서 플레이할 수 있습니다. SRS 회전 시스템, 고스트 피스, 홀드, 7-Bag 랜덤화 등 현대적인 테트리스 기능을 모두 지원합니다.',
    features: [
      'SRS 회전 시스템 + Wall Kick 지원',
      '고스트 피스 (블록 떨어질 위치 미리보기)',
      '홀드 기능 (블록 보관)',
      '넥스트 미리보기 (다음 3개 블록)',
      '7-Bag 랜덤화 (공정한 블록 분배)',
      'Modern Guideline 점수 시스템',
      'Back-to-Back 및 콤보 보너스',
      '리더보드 Top 10 로컬 저장',
      '모바일 터치 컨트롤',
    ],
    techStack: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Vitest'],
    year: '2026',
    thumbnail:
      'https://res.cloudinary.com/dnlcuy2aj/image/upload/v1775750752/p1zza/static/thumbnails/tetrix.jpg',
    sortOrder: 17,
    isFeatured: false,
    isPublished: true,
  },
  {
    id: 'simple-calculator',
    name: '계산기',
    description: '기본, Casio FX-570EX, TI-36X Pro, AlphaOmega 4가지 모드를 제공하는 계산기입니다.',
    url: 'https://simple-calculator-ten-lac.vercel.app/',
    tags: ['Utility', 'Calculator', 'Math'],
    category: 'Tools',
    longDescription:
      'React, TypeScript, Vite로 구축된 다양한 계산기 모드를 제공하는 서버리스 계산기 애플리케이션입니다. 기본 사칙연산부터 공학용 계산기까지 4가지 모드를 지원합니다.',
    features: [
      '기본 계산기: 사칙연산 및 메모리 기능 (M+, M-, MR, MC)',
      'Casio FX-570EX: 삼각함수, 로그, 지수 공학 계산',
      'TI-36X Pro: Texas Instruments 스타일 공학용',
      'AlphaOmega: 기본/삼각함수/통계/고급 탭 구분',
      'DEG/RAD 모드 전환',
      '반응형 디자인',
    ],
    techStack: ['React', 'TypeScript', 'Vite', 'mathjs', 'Tailwind CSS', 'Radix UI', 'Vitest'],
    year: '2026',
    thumbnail:
      'https://res.cloudinary.com/dnlcuy2aj/image/upload/v1775750746/p1zza/static/thumbnails/simple-calculator.jpg',
    sortOrder: 18,
    isFeatured: false,
    isPublished: true,
  },
  {
    id: 'compound-calculator',
    name: '복리 투자 수익 계산기',
    description: '원금과 이자율로 복리 투자 수익을 계산하는 도구입니다.',
    url: 'https://ws-16-compund-calculator.vercel.app/',
    tags: ['Finance', 'Investment'],
    category: 'Finance',
    longDescription:
      '원금과 이자율을 입력하여 복리 투자 수익을 정확하게 계산하는 웹 애플리케이션입니다. 일별, 월별, 연별 복리 주기를 지원하며, 원화와 달러 통화 선택이 가능합니다. 실효 수익률과 상세 내역 테이블을 제공합니다.',
    features: [
      '3가지 복리 주기 (일별, 월별, 연별)',
      '원화(KRW) 및 달러(USD) 지원',
      '실시간 계산 및 결과 표시',
      '지급 주기별 이자 및 잔액 상세 테이블',
      '실효 연수익률 계산',
      'iframe 임베딩 지원, PWA 지원',
    ],
    techStack: [
      'React',
      'TypeScript',
      'Vite',
      'shadcn/ui',
      'Tailwind CSS',
      'Sonner',
      'react-helmet-async',
    ],
    year: '2026',
    thumbnail:
      'https://res.cloudinary.com/dnlcuy2aj/image/upload/v1775750701/p1zza/static/thumbnails/compound-calculator.jpg',
    sortOrder: 19,
    isFeatured: false,
    isPublished: true,
  },
  {
    id: 'lorem-ipsum',
    name: '다국어 로렘 입숨 생성기',
    description: '11개 언어를 지원하는 현대적인 로렘 입숨 텍스트 생성기입니다.',
    url: 'https://ws-04-lorem-ipsum-generator.vercel.app/',
    tags: ['Text', 'Design'],
    category: 'Tools',
    longDescription:
      '11개 언어(한국어, 영어, 스페인어, 프랑스어, 독일어, 라틴어, 러시아어, 일본어, 중국어, 태국어)를 지원하는 로렘 입숨 생성기입니다. 4가지 텍스트 스타일(산문, 시, 카피, 리드)과 세밀한 커스터마이징 옵션을 제공합니다.',
    features: [
      '한국어·영어·일본어 등 11개 언어',
      '산문·시·카피·리드 스타일',
      '문단·문장·단어·글자 수 설정',
      '클립보드 복사와 TXT 다운로드',
      '실시간 글자 수 표시',
    ],
    techStack: ['React', 'TypeScript', 'Vite', 'shadcn/ui', 'Sonner'],
    year: '2025',
    thumbnail:
      'https://res.cloudinary.com/dnlcuy2aj/image/upload/v1775750720/p1zza/static/thumbnails/lorem-ipsum.jpg',
    sortOrder: 20,
    isFeatured: false,
    isPublished: true,
  },
  {
    id: 'lottery-roulette',
    name: '룰렛 추첨',
    description: '암호학적 난수와 모바일 친화적 UI를 결합한 웹 기반 룰렛 추첨 서비스입니다.',
    url: 'https://lottery-roulette-one.vercel.app/',
    tags: ['Lottery', 'Security', 'Embed'],
    category: 'Games',
    longDescription:
      'Web Crypto API와 Rejection Sampling으로 공정성을 확보한 룰렛 추첨 서비스입니다. 최근에는 모바일 중심 단일 화면으로 인터페이스를 다시 다듬고, 한번에 추첨·자동 연속 추첨·키보드 단축키·iframe 임베드 지원까지 포함해 이벤트 운영 화면으로 바로 쓸 수 있게 개선했습니다.',
    features: [
      'Web Crypto API 기반 추첨',
      '한 번에 추첨·순차 추첨·자동 연속 추첨',
      '번호 개수·당첨자 수·중복 허용 설정',
      '키보드 추첨·리셋 단축키',
      'Canvas 룰렛과 결과 표시',
      'iframe 임베딩',
    ],
    techStack: [
      'React',
      'TypeScript',
      'Vite',
      'Tailwind CSS',
      'shadcn/ui',
      'Web Crypto API',
      'Vitest',
    ],
    year: '2026',
    thumbnail:
      'https://res.cloudinary.com/dnlcuy2aj/image/upload/v1775750721/p1zza/static/thumbnails/lottery-roulette-v2.jpg',
    sortOrder: 21,
    isFeatured: false,
    isPublished: true,
  },
  {
    id: 'tarot-card',
    name: '타로카드 점',
    description: '신비로운 타로카드로 당신의 운세를 확인하세요.',
    url: 'https://tarot-card-two-mu.vercel.app/',
    tags: ['Entertainment', 'Fortune', 'Animation'],
    category: 'Games',
    longDescription:
      '22장의 메이저 아르카나 타로카드로 오늘의 운세, 연애운, 재물운, 건강운, 직장운 등 5가지 카테고리의 운세를 점칩니다. 카드 셔플과 뒤집기 애니메이션, Web Share API를 통한 결과 공유 기능을 제공합니다.',
    features: [
      '5가지 운세 카테고리 (오늘의 운세, 연애, 재물, 건강, 직장)',
      '22장 메이저 아르카나 카드',
      '정방향/역방향 해석 지원',
      '카드 셔플 및 뒤집기 애니메이션',
      '모바일 퍼스트 반응형 디자인',
      'Web Share API 및 클립보드 복사',
    ],
    techStack: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Framer Motion', 'shadcn/ui'],
    year: '2026',
    thumbnail:
      'https://res.cloudinary.com/dnlcuy2aj/image/upload/v1775750751/p1zza/static/thumbnails/tarot-card.jpg',
    sortOrder: 22,
    isFeatured: false,
    isPublished: true,
  },
  {
    id: 'text-counter',
    name: '텍스트 분석기',
    description: 'TXT, PDF, DOCX 파일의 텍스트를 분석하는 도구입니다.',
    url: 'https://ws-03-text-counter.vercel.app/',
    tags: ['Text', 'Utility'],
    category: 'Tools',
    longDescription:
      '한국어 및 영어 텍스트를 분석하여 상세한 통계를 제공하는 웹 애플리케이션입니다. TXT, MD, PDF, DOCX 파일을 지원하며, 드래그앤드롭으로 간편하게 업로드할 수 있습니다.',
    features: [
      '4가지 파일 형식 지원 (TXT, MD, PDF, DOCX)',
      '드래그앤드롭 파일 업로드 (최대 10MB)',
      '기본 통계 (글자, 단어, 문장, 문단 수)',
      '빈도 분석 (Top 10 단어, Top 10 문자)',
      '평균 통계 (평균 단어 길이, 평균 문장 길이)',
      '예상 읽기 시간 (200단어/분 기준)',
    ],
    techStack: ['React', 'TypeScript', 'Vite', 'PDF.js', 'Mammoth.js', 'shadcn/ui'],
    year: '2025',
    thumbnail:
      'https://res.cloudinary.com/dnlcuy2aj/image/upload/v1775750753/p1zza/static/thumbnails/text-counter.jpg',
    sortOrder: 23,
    isFeatured: false,
    isPublished: true,
  },
  {
    id: 'sudoku',
    name: '수도쿠',
    description: '5가지 난이도로 즐기는 한국어 수도쿠 게임입니다.',
    url: 'https://sudocux.vercel.app/',
    tags: ['Game', 'Puzzle', 'Logic'],
    category: 'Games',
    longDescription:
      '브라우저에서 서버리스로 동작하는 한국어 수도쿠 게임입니다. 쉬움부터 마스터까지 5가지 난이도를 제공하며, 노트 모드, 힌트, 일시정지 기능을 지원합니다. 최고 기록이 로컬 스토리지에 저장됩니다.',
    features: [
      '5가지 난이도 (쉬움, 보통, 어려움, 전문가, 마스터)',
      '노트 모드로 후보 숫자 메모',
      '힌트 기능',
      '일시정지 기능',
      '실수 카운트',
      '난이도별 최고 기록 저장',
      '키보드 입력 지원',
      'iframe 임베딩 지원',
    ],
    techStack: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Motion', 'Sonner', 'sudoku-gen'],
    year: '2026',
    thumbnail:
      'https://res.cloudinary.com/dnlcuy2aj/image/upload/v1775750749/p1zza/static/thumbnails/sudoku.jpg',
    sortOrder: 24,
    isFeatured: false,
    isPublished: true,
  },
  {
    id: 'qqwe',
    name: '99i.kr',
    description: '긴 URL을 짧은 링크로 바꾸고 클릭 통계를 확인하는 서비스입니다.',
    url: 'https://99i.kr/',
    tags: ['Short URL', 'Analytics', 'Utility'],
    category: 'Services',
    longDescription:
      '긴 URL을 짧은 링크로 발급하고, 링크별 클릭 수와 국가·유입 경로·기기 정보를 확인할 수 있는 웹 서비스입니다. 공개 홈페이지에는 링크 활용 사례와 요금제 안내를 제공하며, 관리자는 Google OAuth로 인증해 링크와 클릭 현황을 관리합니다.',
    features: [
      '랜덤 slug 기반 URL 단축',
      '짧은 링크 302 리디렉션',
      '링크별 클릭 통계와 기간 선택',
      '국가·유입 경로·기기 분석',
      'Google OAuth 관리자 인증',
      '링크 삭제와 입력 검증',
    ],
    techStack: [
      'Next.js',
      'React',
      'TypeScript',
      'Drizzle ORM',
      'PostgreSQL',
      'Tailwind CSS',
      'Recharts',
      'Google OAuth',
    ],
    year: '2026',
    thumbnail:
      'https://res.cloudinary.com/dnlcuy2aj/image/upload/v1775750735/p1zza/static/thumbnails/qqwe.jpg',
    sortOrder: 25,
    isFeatured: false,
    isPublished: true,
  },
  {
    id: 'meetgirls',
    name: 'MeetGirls',
    description: '여성 전용 1:1 채팅 서비스의 웹 애플리케이션입니다.',
    url: 'https://meetgirls.kr/',
    tags: ['Service', 'Lifestyle', 'Matchmaking'],
    category: 'Websites',
    longDescription:
      '여성 전용 1:1 대화방과 프로필 탐색을 제공하는 웹 애플리케이션입니다. 회원가입과 로그인, 대화 요청·메시지, 알림, 프로필 저장·차단과 신고 흐름을 구현했습니다. 관리자는 사용자와 대화방, 신고를 확인할 수 있습니다.',
    features: [
      '회원가입·로그인',
      '1:1 대화방과 메시지',
      '프로필 탐색과 대화 요청',
      '프로필 저장·차단',
      '신고와 알림',
      '관리자 사용자·신고 관리',
    ],
    techStack: ['Next.js', 'React', 'TypeScript', 'Prisma', 'PostgreSQL', 'JWT'],
    year: '2025',
    thumbnail:
      'https://res.cloudinary.com/dnlcuy2aj/image/upload/v1791514550/portfolio-refresh-20261009/meetgirls-d55e2aa8f254.png',
    sortOrder: 26,
    isFeatured: false,
    isPublished: true,
  },
  {
    id: 'axmx',
    name: 'AxMx',
    description:
      '테더 구매 상담과 협업 문의를 연결하고 가상자산 안내 콘텐츠를 제공하는 웹사이트입니다.',
    url: 'https://axmx.kr/',
    tags: ['Crypto', 'Fintech', 'Exchange'],
    category: 'Websites',
    longDescription:
      '원화 기준 테더 구매 상담을 시작할 수 있도록 문의 채널을 연결하는 웹사이트입니다. 상담 흐름과 FAQ, 파트너십·콘텐츠·미디어 협업 문의 안내, 가상자산·Web3·AI 관련 블로그를 제공합니다.',
    features: [
      '문의 채널 연결',
      '상담 흐름과 FAQ 안내',
      '파트너십·콘텐츠·미디어 협업 문의',
      '가상자산·Web3·AI 블로그',
      '구조화 데이터와 내부 콘텐츠 링크',
    ],
    techStack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
    year: '2025',
    thumbnail:
      'https://res.cloudinary.com/dnlcuy2aj/image/upload/v1791514548/portfolio-refresh-20261009/axmx-42b2caf08662.png',
    sortOrder: 27,
    isFeatured: false,
    isPublished: true,
  },
  {
    id: 'h4ppylabs',
    name: 'h4ppy Labs',
    description: 'FUZZA와 DUCKAVERB 오디오 플러그인의 기능과 다운로드를 소개하는 웹사이트입니다.',
    url: 'https://www.h4ppylabs.com/',
    tags: ['Audio', 'Open Source', 'Music'],
    category: 'Websites',
    longDescription:
      '뮤지션을 위한 오디오 도구를 소개하는 h4ppy Labs의 공식 웹사이트입니다. FUZZA 퍼즈 디스토션과 DUCKAVERB 덕킹 리버브의 조작법, 지원 형식, 설치 경로와 GitHub 다운로드를 제공합니다.',
    features: [
      'FUZZA 퍼즈 디스토션 소개',
      'DUCKAVERB 덕킹 리버브 소개',
      'Windows·macOS 설치 안내',
      'GitHub 다운로드와 소스 연결',
      '한국어·영어 전환',
    ],
    techStack: ['HTML', 'CSS', 'JavaScript', 'Google Analytics'],
    year: '2025',
    thumbnail:
      'https://res.cloudinary.com/dnlcuy2aj/image/upload/v1775750716/p1zza/static/thumbnails/h4ppylabs.jpg',
    sortOrder: 28,
    isFeatured: false,
    isPublished: true,
  },
];

/**
 * Get all unique categories from projects
 */
export const getCategories = (): string[] => {
  return [...new Set(projects.map((p) => p.category))];
};

/**
 * Get projects by category
 */
export const getProjectsByCategory = (category: string): Project[] => {
  if (category === 'All') return projects;
  return projects.filter((p) => p.category === category);
};

/**
 * Get project by ID
 */
export const getProjectById = (id: string): Project | undefined => {
  return projects.find((p) => p.id === id);
};

/**
 * Project count by category
 */
export const getProjectCountByCategory = (): Record<string, number> => {
  return projects.reduce(
    (acc, project) => {
      acc[project.category] = (acc[project.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
};
