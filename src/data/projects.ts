/**
 * Project Data
 *
 * Centralized project data for the portfolio website.
 * Total: 32 projects across 6 categories
 *
 * Categories:
 * - Media (4): Video, Audio, Image editing
 * - Tools (9): Utilities, converters, generators
 * - Finance (5): Financial calculators and trackers
 * - Productivity (3): Notes, analytics, collaboration
 * - Games (3): Entertainment and games
 * - Archive (8): Legacy and miscellaneous projects
 */

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
}

export const projects: Project[] = [
  // ============================================
  // 2026 Projects (Latest)
  // ============================================

  // NEW: Crypto Tracker - Finance
  {
    id: 'crypto-tracker',
    name: '코인 나우',
    description: '비트코인, 이더리움 등 주요 가상화폐의 실시간 시세와 차트를 확인할 수 있습니다.',
    url: 'https://ws-19-crypto-tracker.vercel.app/',
    tags: ['Finance', 'Crypto', 'Chart'],
    category: 'Finance',
    year: '2026',
    longDescription:
      'CoinGecko와 Binance API를 통해 실시간 가상화폐 시세를 조회하고, 원화(KRW)와 달러(USD) 간 전환이 가능한 웹 애플리케이션입니다. 1일/7일/30일/1년 기간별 가격 차트와 시가총액 기준 100개 코인 순위를 제공합니다.',
    features: [
      'CoinGecko + Binance API 실시간 시세',
      'KRW/USD 다중 통화 지원',
      'ExchangeRate-API 자동 환율 갱신',
      '1일/7일/30일/1년 가격 차트',
      '시가총액 순위 100개 코인',
      '24시간 상승/하락 필터링',
      '코인 이름/심볼 검색',
    ],
    techStack: [
      'React',
      'TypeScript',
      'Vite',
      'Tailwind CSS',
      'Radix UI',
      'Recharts',
      'Lucide React',
    ],
  },
  {
    id: 'insta-follower-check',
    name: '인스타그램 팔로워 분석',
    description: '브라우저에서 안전하게 인스타그램 팔로워를 분석하는 도구입니다.',
    url: 'https://ws-18-insta-follower-check.vercel.app/',
    tags: ['Social', 'Analytics'],
    category: 'Productivity',
    year: '2026',
    longDescription:
      '모든 데이터 처리가 브라우저에서 로컬로 진행되는 프라이버시 중심 인스타그램 팔로워 분석 도구입니다. 맞팔로우 확인, 팔로우백 없는 사람, 팔로우 안 한 사람, 차단된 프로필 등을 분석하고 TXT, HTML, JSON 형식으로 내보낼 수 있습니다.',
    features: [
      '맞팔로우 확인 (상호 팔로우)',
      '팔로우백 없는 사람 찾기',
      '팔로우 안 한 사람 찾기',
      '보류 중인 팔로우 요청 및 차단 프로필',
      '최근 언팔로우한 사람 추적',
      'TXT, HTML, JSON 형식 다운로드',
      '완전한 클라이언트 사이드 처리 (서버 전송 없음)',
    ],
    techStack: ['React', 'TypeScript', 'Vite', 'JSZip', 'shadcn/ui', 'Tailwind CSS'],
  },
  {
    id: 'salary-calculator',
    name: '2026년 연봉 계산기',
    description: '2026년 기준 연봉 및 실수령액을 계산하는 도구입니다.',
    url: 'https://ws-17-salary-calculator.vercel.app/',
    tags: ['Finance', 'Calculator'],
    category: 'Finance',
    year: '2026',
    longDescription:
      '2026년 최신 세율과 4대보험료를 반영한 연봉 계산기입니다. 연봉을 입력하면 월급, 4대보험, 소득세, 실수령액을 자동 계산하며, 역으로 원하는 실수령액에 필요한 연봉도 계산할 수 있습니다.',
    features: [
      '2026년 최신 세율 및 4대보험료 적용',
      '양방향 계산 (연봉<->실수령액)',
      '비과세 항목 설정 (식대, 교통비)',
      '이진 탐색 알고리즘으로 정확한 역산',
      '빠른 선택 버튼 (3천만원~1억원)',
      '월별 상세 내역 표시',
    ],
    techStack: ['React', 'TypeScript', 'Vite', 'shadcn/ui', 'React Hook Form', 'Motion', 'Sonner'],
  },
  {
    id: 'compound-calculator',
    name: '복리 투자 수익 계산기',
    description: '원금과 이자율로 복리 투자 수익을 계산하는 도구입니다.',
    url: 'https://ws-16-compund-calculator.vercel.app/',
    tags: ['Finance', 'Investment'],
    category: 'Finance',
    year: '2026',
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
  },
  {
    id: 'short-generator',
    name: '숏폼 비디오 변환기',
    description: '가로 영상을 세로 숏폼(9:16)으로 변환하는 도구입니다.',
    url: 'https://ws-15-short-generator.vercel.app/',
    tags: ['Video', 'Utility'],
    category: 'Media',
    year: '2026',
    longDescription:
      '브라우저에서 가로 영상을 세로 숏폼 형식(9:16)으로 변환하는 서버리스 웹 애플리케이션입니다. YouTube Shorts, TikTok, Instagram Reels에 최적화된 영상을 만들 수 있습니다.',
    features: [
      '가로 영상을 9:16 세로 비율로 자동 변환',
      '실시간 미리보기 및 구간 선택 (최대 1분)',
      '텍스트 오버레이 (위치, 크기, 색상 조정)',
      'WebM/MP4 포맷 선택',
      'Canvas API 실시간 렌더링 (30fps)',
      'FFmpeg.wasm MP4 변환',
    ],
    techStack: [
      'React',
      'TypeScript',
      'Vite',
      'Canvas API',
      'MediaRecorder API',
      'FFmpeg.wasm',
      'shadcn/ui',
    ],
  },
  // NEW: Server Time Sync - Tools
  {
    id: 'server-time-sync',
    name: '서버 시간 동기화',
    description: '웹사이트의 서버 시간을 실시간으로 확인하고 한국 시간과 비교합니다.',
    url: 'https://server-time-sigma.vercel.app/',
    tags: ['Utility', 'Time', 'API'],
    category: 'Tools',
    year: '2026',
    longDescription:
      'DNS와 IP Geolocation을 통해 웹사이트 서버의 타임존을 자동 감지하고, 서버 시간과 한국 시간(KST)을 실시간으로 비교하는 서버리스 웹 애플리케이션입니다.',
    features: [
      'DNS + IP Geolocation 자동 타임존 감지',
      '실시간 시간 동기화 (1초 간격)',
      '서버 시간 vs 한국 시간(KST) 비교',
      'HTTPS 강제 및 입력 검증',
      '레이트 리미팅 (10 req/min)',
      '1시간 캐싱으로 빠른 응답',
      '100% 클라이언트 측 실행',
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
  },
  {
    id: 'unit-converter',
    name: '단위 변환기',
    description: '길이, 무게, 온도, 부피 등 다양한 단위를 변환합니다.',
    url: 'https://ws-14-unit-converter.vercel.app/',
    tags: ['Utility', 'Calculator'],
    category: 'Tools',
    year: '2026',
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
  },
  {
    id: 'super-normalizer',
    name: '슈퍼 노멀라이저',
    description: '브라우저에서 작동하는 고성능 오디오 노멀라이제이션 도구입니다.',
    url: 'https://ws-13-super-normalizer.vercel.app/',
    tags: ['Audio', 'Utility'],
    category: 'Media',
    year: '2026',
    longDescription:
      '웹 브라우저에서 서버 업로드 없이 완전히 작동하는 오디오 노멀라이저입니다. Peak, RMS, LUFS 세 가지 방식의 노멀라이제이션을 지원하며, 실시간 파형 시각화와 다양한 포맷 출력을 제공합니다.',
    features: [
      '3가지 노멀라이제이션 방식 (Peak, RMS, LUFS)',
      '실시간 파형 시각화 및 비교',
      '다양한 입력 형식 (MP3, WAV, OGG, M4A)',
      '다양한 출력 형식 (WAV 16/24bit, FLAC, MP3, OGG)',
      '완전한 클라이언트 사이드 처리',
      'Canvas API 고해상도 렌더링',
    ],
    techStack: ['React', 'TypeScript', 'Vite', 'Web Audio API', 'Canvas API', 'shadcn/ui'],
  },

  // ============================================
  // 2025 Projects
  // ============================================
  {
    id: 'youtube-downloader',
    name: 'YouTube 다운로더',
    description: 'YouTube 영상을 다양한 형식으로 다운로드할 수 있습니다.',
    url: 'https://ws-11-yt-downloader.vercel.app/',
    tags: ['Media', 'Utility'],
    category: 'Media',
    year: '2025',
    longDescription:
      'YouTube 영상과 오디오를 다양한 형식으로 다운로드하는 웹 애플리케이션입니다. MP4, WebM, MP3 등 여러 포맷과 해상도를 지원하며, 썸네일과 자막도 다운로드할 수 있습니다.',
    features: [
      '영상 다운로드 (MP4, WebM, 1080p/720p/480p/360p)',
      '오디오 추출 (MP3, AAC, M4A, OPUS)',
      '썸네일 다운로드 (최대/고화질/중간/기본)',
      '자막 다운로드 (SRT, VTT, TXT)',
      '실시간 영상 정보 조회 (YouTube Data API)',
      '반응형 디자인 및 다크 모드 지원',
    ],
    techStack: [
      'React',
      'TypeScript',
      'Vercel Functions',
      '@distube/ytdl-core',
      'FFmpeg',
      'shadcn/ui',
    ],
  },
  {
    id: 'color-palette',
    name: '색상 팔레트',
    description: '간단하고 직관적인 색상 선택 및 변환 도구입니다.',
    url: 'https://ws-10-color-palette.vercel.app/',
    tags: ['Design', 'Utility'],
    category: 'Tools',
    year: '2025',
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
  },
  {
    id: 'lotto-generator',
    name: '로또 번호 생성기',
    description: '대한민국 로또 6/45 번호를 12가지 알고리즘으로 생성합니다.',
    url: 'https://ws-09-lotto-gen.vercel.app/',
    tags: ['Utility', 'Algorithm'],
    category: 'Tools',
    year: '2025',
    longDescription:
      '12가지 다양한 알고리즘으로 로또 번호를 생성하는 웹 애플리케이션입니다. 완전 무작위, 홀짝 균형, 고저 균형, 연속번호 제한, 분산형, 패턴 회피, SHA-256 해시, 시간 기반, 피보나치, 소수, 황금비, LCG 방식을 지원합니다.',
    features: [
      '12가지 다양한 알고리즘 (무작위, 홀짝, 피보나치, 황금비 등)',
      '최대 50개까지 동시 생성',
      '중복 번호 자동 제거',
      'TXT, CSV, JSON 형식 내보내기',
      '고유 파일명 생성 (해시 기반)',
      'WCAG 2.1 AA 접근성 준수',
    ],
    techStack: ['React', 'TypeScript', 'Vite', 'shadcn/ui', 'SHA-256', 'LCG', 'Sonner'],
  },
  {
    id: 'phopic',
    name: '포픽',
    description: '브라우저에서 작동하는 무료 온라인 이미지 편집 도구입니다.',
    url: 'https://ws-08-phopic-sgoz.vercel.app/',
    tags: ['Image', 'Editor'],
    category: 'Media',
    year: '2025',
    longDescription:
      '서버 업로드 없이 브라우저에서 완전히 작동하는 무료 온라인 이미지 편집 도구입니다. 크롭, 회전, 반전, 리사이즈, 14가지 필터 등 다양한 편집 기능을 제공하며, 모든 처리가 클라이언트 측에서 이루어져 개인정보가 완전히 보호됩니다.',
    features: [
      '크롭, 회전, 좌우/상하 반전, 리사이즈',
      '14가지 필터 (흑백, 세피아, 빈티지, 블러 등)',
      '밝기, 대비, 채도, RGB, Hue 조정',
      'Undo/Redo 기능 (최대 50단계)',
      'PNG, JPG, WebP 저장',
      '완전한 클라이언트 사이드 처리 (서버 업로드 없음)',
    ],
    techStack: ['React', 'TypeScript', 'Vite', 'Canvas API', 'shadcn/ui', 'Sonner'],
  },
  {
    id: 'password-generator',
    name: '비밀번호 생성기',
    description: 'Web Crypto API로 암호학적으로 안전한 비밀번호를 생성합니다.',
    url: 'https://ws-07-password-generator.vercel.app/',
    tags: ['Security', 'Utility'],
    category: 'Tools',
    year: '2025',
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
  },
  {
    id: 'realtime-exchange',
    name: '실시간 환율',
    description: '실시간 환율 조회 및 통화 변환 서비스입니다.',
    url: 'https://ws-06-realtime-exchange.vercel.app/',
    tags: ['Finance', 'API'],
    category: 'Finance',
    year: '2025',
    longDescription:
      '무료 API를 활용한 실시간 환율 조회 및 통화 변환 서비스입니다. 50개 이상의 주요 통화 환율을 실시간으로 제공하며, 30일 환율 차트와 여행지 물가 계산기를 포함합니다.',
    features: [
      '50개 이상 주요 통화 실시간 환율',
      '양방향 통화 변환 (KRW <-> 외화)',
      '30일 환율 추이 차트 (Recharts)',
      '여행지 물가 계산기',
      '통화 관리 (드래그앤드롭 정렬, 최대 18개)',
      'Context API로 API 호출 67% 감소',
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
  },
  {
    id: 'memomome',
    name: '메모모미',
    description: '모든 데이터가 로컬에만 저장되는 프라이버시 중심 웹 메모장입니다.',
    url: 'https://ws-05-memomome.vercel.app/',
    tags: ['Productivity', 'Notes'],
    category: 'Productivity',
    year: '2025',
    longDescription:
      '완전한 프라이버시를 보장하는 웹 메모장 애플리케이션입니다. 모든 데이터가 브라우저의 localStorage에만 저장되어 서버로 전송되지 않습니다. Undo/Redo, 찾기/바꾸기, 실시간 통계 등 강력한 기능을 제공합니다.',
    features: [
      '자동 저장 (타이핑 1초 후)',
      'Undo/Redo (최대 20단계, Ctrl+Z/Y)',
      '찾기/바꾸기 (대소문자 무시)',
      '메모 저장 관리 (최대 100개)',
      '실시간 통계 (문자, 단어, 줄 수)',
      '다양한 형식 내보내기 (TXT, MD, HTML, JSON, CSV)',
    ],
    techStack: ['React', 'TypeScript', 'Vite', 'localStorage', 'shadcn/ui', 'Sonner'],
  },
  {
    id: 'lorem-ipsum',
    name: '다국어 로렘 입숨 생성기',
    description: '11개 언어를 지원하는 현대적인 로렘 입숨 텍스트 생성기입니다.',
    url: 'https://ws-04-lorem-ipsum-generator.vercel.app/',
    tags: ['Text', 'Design'],
    category: 'Tools',
    year: '2025',
    longDescription:
      '11개 언어(한국어, 영어, 스페인어, 프랑스어, 독일어, 라틴어, 러시아어, 일본어, 중국어, 태국어)를 지원하는 로렘 입숨 생성기입니다. 4가지 텍스트 스타일(산문, 시, 카피, 리드)과 세밀한 커스터마이징 옵션을 제공합니다.',
    features: [
      '11개 언어 지원 (한국어, 영어, 일본어, 중국어 등)',
      '4가지 텍스트 스타일 (산문, 시, 카피, 리드)',
      '세밀한 조정 (문단 1-20, 문장 1-15, 단어 3-30, 글자 0-5000)',
      '클립보드 복사 및 TXT 파일 다운로드',
      '실시간 글자 수 카운터',
      '번들 크기 93% 감소 최적화 (90KB gzip)',
    ],
    techStack: ['React', 'TypeScript', 'Vite', 'shadcn/ui', 'Sonner'],
  },
  {
    id: 'text-counter',
    name: '텍스트 분석기',
    description: 'TXT, PDF, DOCX 파일의 텍스트를 분석하는 도구입니다.',
    url: 'https://ws-03-text-counter.vercel.app/',
    tags: ['Text', 'Utility'],
    category: 'Tools',
    year: '2025',
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
  },
  {
    id: 'finance-converter',
    name: '대출 이자 계산기',
    description: '4가지 상환 방식의 대출 이자를 계산하고 Excel/PDF로 내보냅니다.',
    url: 'https://ws-02-finance-converter-bci6.vercel.app/',
    tags: ['Finance', 'Calculator'],
    category: 'Finance',
    year: '2025',
    longDescription:
      '대출 금액, 연 이자율, 대출 기간을 입력하여 다양한 상환 방식에 따른 이자와 상환 계획을 계산합니다. 원리금균등, 원금균등, 만기일시, 체증식 상환을 지원하며, Excel과 PDF로 상세한 상환 일정표를 내보낼 수 있습니다.',
    features: [
      '4가지 상환 방식 (원리금균등, 원금균등, 만기일시, 체증식)',
      '거치 기간 설정 가능',
      '다양한 단위 지원 (만원/천원, 년/개월/일)',
      '월별 상환 일정표 (상환금액, 원금, 이자, 잔액)',
      'Excel 내보내기 (.xls, 한글 완벽 지원)',
      'PDF 내보내기 (NanumGothic 폰트 내장)',
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
  },
  {
    id: 'file-converter',
    name: '이미지/문서 파일 변환기',
    description: '브라우저에서 이미지와 문서를 실시간 변환하는 도구입니다.',
    url: 'https://ws-01-file-converter.vercel.app/',
    tags: ['Utility', 'Converter'],
    category: 'Tools',
    year: '2025',
    longDescription:
      '서버 업로드 없이 브라우저에서 직접 파일을 변환하는 도구입니다. 이미지(JPG, PNG, WebP, GIF, BMP)와 문서(PDF, TXT, MD, HTML) 간 자유로운 변환을 지원하며, 일괄 변환 시 ZIP 파일로 다운로드됩니다.',
    features: [
      '이미지 변환 (JPG, PNG, WebP, GIF, BMP <-> PDF)',
      '문서 변환 (PDF, TXT, MD, HTML 상호 변환)',
      '드래그앤드롭 파일 업로드',
      '일괄 변환 및 ZIP 다운로드',
      'Canvas API 실시간 변환',
      '완전한 클라이언트 사이드 처리 (서버 업로드 없음)',
    ],
    techStack: [
      'React',
      'TypeScript',
      'Vite',
      'Canvas API',
      'html2pdf.js',
      'PDF.js',
      'JSZip',
      'shadcn/ui',
    ],
  },

  // ============================================
  // Games Category (NEW)
  // ============================================

  // NEW: Lottery Roulette - Games
  {
    id: 'lottery-roulette',
    name: '룰렛 추첨',
    description: '암호학적으로 안전한 웹 기반 무작위 룰렛 추첨 시스템입니다.',
    url: 'https://lottery-roulette-one.vercel.app/',
    tags: ['Random', 'Security', 'Canvas'],
    category: 'Games',
    year: '2026',
    longDescription:
      'Web Crypto API와 Rejection Sampling을 사용하여 완벽한 공정성을 보장하는 룰렛 추첨 애플리케이션입니다. Canvas 기반 룰렛 휠 애니메이션과 66개 테스트 케이스로 검증된 신뢰성을 제공합니다.',
    features: [
      'Web Crypto API 암호학적 난수 생성',
      'Rejection Sampling으로 modulo bias 제거',
      '추첨 번호 개수 설정 (2-99)',
      '중복 허용/비허용 옵션',
      'Canvas 기반 룰렛 휠 애니메이션',
      'XSS 방어 및 CSP 헤더',
      '66개 테스트 케이스 통과',
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
  },
  // NEW: Tarot Card - Games
  {
    id: 'tarot-card',
    name: '타로카드 점',
    description: '신비로운 타로카드로 당신의 운세를 확인하세요.',
    url: 'https://tarot-card-two-mu.vercel.app/',
    tags: ['Entertainment', 'Fortune', 'Animation'],
    category: 'Games',
    year: '2026',
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
  },
  // NEW: Card Puzzle - Games
  {
    id: 'card-puzzle',
    name: '카드 퍼즐',
    description: '카드를 뒤집어 같은 그림의 짝을 찾는 기억력 게임입니다.',
    url: 'https://card-puzzle-ten.vercel.app/',
    tags: ['Game', 'Memory', 'Puzzle'],
    category: 'Games',
    year: '2026',
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
  },

  // ============================================
  // Portfolio Meta-Project
  // ============================================
  {
    id: 'h4ppy-p1zza-portfolio',
    name: 'h4ppy p1zza 포트폴리오',
    description: '32개 프로젝트를 소개하는 이 포트폴리오 사이트 자체입니다.',
    url: 'https://www.h4ppy-p1zza.com/',
    tags: ['Portfolio', 'Meta'],
    category: 'Archive',
    year: '2026',
    longDescription:
      '이 포트폴리오 웹사이트 자체도 하나의 프로젝트입니다. 성능 최적화(번들 크기 60% 감소), 보안 강화(CSP, TypeScript strict mode), SEO 최적화를 거쳐 완성되었습니다. 32개의 프로젝트를 인터랙티브하게 소개하며, 철학적 에세이 형식의 프로필 페이지를 포함합니다.',
    features: [
      '32개 프로젝트 인터랙티브 iframe 미리보기',
      '카테고리별 필터링 (Media, Tools, Finance, Productivity, Games, Archive)',
      '성능 최적화 (번들 60% 감소, 105개 의존성 제거)',
      '보안 강화 (CSP, 보안 헤더, TypeScript strict mode)',
      'SEO 완전 최적화 (메타 태그, sitemap, Open Graph)',
      '철학적 에세이 프로필 페이지',
      '담백한 문체로 누구나 읽을 수 있는 개발자 이야기',
    ],
    techStack: [
      'React',
      'TypeScript',
      'Vite',
      'shadcn/ui',
      'Tailwind CSS',
      'ESLint',
      'Prettier',
      'Vercel',
    ],
  },

  // ============================================
  // Archive Projects
  // ============================================
  {
    id: 'qr-ing',
    name: '큐알잉',
    description: '빠르고 간편한 무료 한국어 QR코드 생성기입니다.',
    url: 'https://qr-ing.vercel.app/',
    tags: ['QR', 'Utility'],
    category: 'Archive',
    year: '2025',
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
  },
  {
    id: 'keyframe-generator',
    name: '키프레임 생성기',
    description: 'AI 기반 시네마틱 키프레임을 생성하는 도구입니다.',
    url: 'https://keyframe-generator.vercel.app/',
    tags: ['AI', 'Video', 'Storyboard'],
    category: 'Archive',
    year: '2025',
    longDescription:
      'AI 기술을 활용하여 영상 제작을 위한 시네마틱 키프레임을 자동으로 생성하는 도구입니다. 스토리보드 제작 과정을 간소화하고 창의적인 영상 기획을 지원합니다.',
    features: [
      'AI 기반 이미지 생성',
      '시네마틱 스타일 키프레임 제작',
      '스토리보드 시퀀스 구성',
      '다양한 영상 스타일 프리셋',
      '고해상도 이미지 다운로드',
    ],
    techStack: ['React', 'TypeScript', 'AI Image Generation', 'Canvas API'],
  },
  {
    id: 'endless-blood',
    name: 'Endless Blood',
    description: 'Metroidvania와 Vampire Survivors 스타일의 웹 액션 로그라이크 게임입니다.',
    url: 'https://endless-blood.vercel.app/',
    tags: ['Game', 'Roguelike'],
    category: 'Archive',
    year: '2025',
    longDescription:
      'Phaser 3 엔진으로 제작한 2D 액션 로그라이크 게임입니다. Metroidvania 플랫포밍과 Vampire Survivors 스타일 파밍 액션이 결합되어 있으며, 시간에 따라 난이도가 증가하고 6가지 적과 2개의 보스가 등장합니다.',
    features: [
      '6가지 적 타입 (좀비, 해골, 아머, 위처, 뱀퍼, 박쥐)',
      '2개 보스 (3:30 초월 키메라, 7:00 슈퍼 샤먼)',
      '자동 타겟팅 발사 시스템',
      '레벨업 시 6가지 업그레이드 (데미지, 연사, 사거리, 속도, 체력, 멀티샷)',
      '보물상자 4가지 아이템 (체력, 자석, 쉴드, 경험치)',
      'Normal/Coward 난이도, 무작위 맵, 디버그 모드',
    ],
    techStack: ['Phaser 3', 'Vite', 'JavaScript', 'Arcade Physics', 'Canvas API'],
  },
  {
    id: 'dopameme',
    name: '도파밈',
    description: '게임처럼 즐기는 이슈 예측 플랫폼입니다.',
    url: 'https://www.dopameme.kr/',
    tags: ['Prediction', 'Game', 'Social'],
    category: 'Archive',
    year: '2025',
    longDescription:
      "대한민국 No.1 이슈 예측 플랫폼으로, 뉴스와 이슈를 단순 소비하는 것을 넘어 '예측'이라는 게임을 통해 자신의 의견을 표현하고 즐기는 새로운 인포테인먼트 서비스입니다. 도파민(Dopamine)과 밈(Meme)의 합성어로, 최신 트렌드와 이슈를 게임용 포인트 시스템으로 안전하게 즐길 수 있습니다.",
    features: [
      '정치, 경제, 스포츠 등 다양한 카테고리 예측',
      'LMSR 알고리즘 기반 공정한 시장 메커니즘',
      'AI 예측 정확도 87% 달성',
      '게임용 포인트 시스템 (현금 전환 불가)',
      '리더보드 및 리워드 시스템',
      '집단 지성 기반 인사이트 제공',
    ],
    techStack: ['Next.js', 'Supabase', 'AI/ML', 'LMSR Algorithm', 'TypeScript'],
  },
  {
    id: 'h4ppylabs',
    name: '해피랩스',
    description: '뮤지션을 위한 창의적인 가상악기와 이펙터를 만드는 사운드 연구소입니다.',
    url: 'https://www.h4ppylabs.com/',
    tags: ['Audio', 'VST', 'Music Production'],
    category: 'Archive',
    year: '2025',
    longDescription:
      'h4ppy Labs는 뮤지션을 위한 창의적인 가상악기와 이펙터를 만듭니다. 기술과 예술의 경계에서 새로운 영감을 주는 도구를 연구하며, 타협하지 않는 최상의 오디오 품질과 뮤지션의 상상력을 제한하지 않는 도구를 추구합니다.',
    features: [
      'FUZZA - 일렉트릭 기타용 퍼즈 디스토션 플러그인',
      'DUCKAVERB - 원노브 덕킹 리버브 플러그인',
      'VST3 / AU / Standalone 멀티 포맷 지원',
      'Zero Latency 실시간 오디오 처리',
      '크로스 플랫폼 (macOS, Windows)',
      '최신 DSP 기술 기반 사운드 엔진',
    ],
    techStack: ['C++', 'JUCE', 'DSP', 'VST3', 'Audio Unit', 'CMake'],
  },
  {
    id: 'nvidia-q3',
    name: '엔비디아 Q3',
    description: 'Nvidia Q3 실적 및 정보를 제공하는 사이트입니다.',
    url: 'https://nvidia-q3.vercel.app/',
    tags: ['Finance', 'News'],
    category: 'Archive',
    year: '2025',
    longDescription:
      'Nvidia의 분기별 실적을 시각화하고 분석하는 데이터 대시보드입니다. 투자자와 기술 애호가를 위한 인사이트를 제공합니다.',
    features: [
      '실적 데이터 시각화',
      '주가 차트 및 분석',
      '뉴스 및 공시 정보',
      '비교 분석 도구',
      '반응형 대시보드',
    ],
    techStack: ['React', 'TypeScript', 'Recharts', 'Finance API'],
  },
  {
    id: 'prime-distribution',
    name: '소수 분포, 양자역학, 그리고 홀로그래픽 우주',
    description: '리만 가설과 양자역학의 연결을 탐구하는 학술 논문 웹사이트입니다.',
    url: 'https://prime-distribution-quantum-mechanic.vercel.app/',
    tags: ['Science', 'Academic'],
    category: 'Archive',
    year: '2025',
    longDescription:
      '리만 가설의 소수 분포, Montgomery-Dyson 발견의 양자역학적 연결, 홀로그래픽 우주 이론을 통합한 학술 논문을 웹으로 구현한 프로젝트입니다. 다크 테마로 최적화된 읽기 경험과 7개 섹션의 논문 내용을 인터랙티브하게 제공합니다.',
    features: [
      '7개 논문 섹션 (서론, 양자역학적 해석, 홀로그래픽 원리 등)',
      '2025-2035 검증 가능한 5가지 이론적 예측',
      '다크 테마 최적화 읽기 경험',
      '목차 기반 섹션 네비게이션',
      'Markdown 렌더링 및 수식 지원',
      'PDF 다운로드 지원',
    ],
    techStack: [
      'React Router v7',
      'TypeScript',
      'Tailwind CSS',
      'Framer Motion',
      'Markdown',
      'Vite',
    ],
  },
  {
    id: 'eazy-youtube-share',
    name: '이지 유튜브 쉐어',
    description: 'YouTube 영상을 소셜 미디어에 공유하는 플랫폼입니다.',
    url: 'https://eazy-youtube-share.vercel.app/',
    tags: ['Social', 'YouTube'],
    category: 'Archive',
    year: '2025',
    longDescription:
      'Instagram 스타일의 UI로 YouTube 영상을 공유하는 소셜 미디어 플랫폼입니다. Supabase Auth를 활용한 사용자 인증, 댓글 시스템, 좋아요, 북마크 기능을 제공하며, 가로/세로 영상을 자동으로 감지하여 적절한 피드에 표시합니다.',
    features: [
      'Instagram 스타일 UI (피드, 릴스)',
      'Supabase Auth 사용자 인증',
      '가로/세로 영상 자동 감지 및 분류',
      '댓글 및 대댓글 시스템',
      '좋아요 및 북마크 기능',
      'YouTube URL 파싱 및 검색',
      'Binance 컬러 다크 테마',
    ],
    techStack: ['Next.js', 'TypeScript', 'Supabase', 'Tailwind CSS', 'YouTube API', 'shadcn/ui'],
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
