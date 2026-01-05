import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "./ui/dropdown-menu";
import { ArrowRight, ChevronDown, Code2, ExternalLink, Grid3x3, X, Instagram, Home, Rocket, Zap, Target, Github, Palette, Lightbulb, MessageCircle, Wrench, Video, Check, Star, User } from "lucide-react";
import { Footer } from "./footer";
import { ProfilePage } from "./profile-page";

interface Project {
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

const projects: Project[] = [
  {
    id: "phopic",
    name: "포픽",
    description: "브라우저에서 작동하는 무료 온라인 이미지 편집 도구입니다.",
    url: "https://ws-08-phopic-sgoz.vercel.app/",
    tags: ["Image", "Editor"],
    category: "Media",
    year: "2025",
    longDescription: "서버 업로드 없이 브라우저에서 완전히 작동하는 무료 온라인 이미지 편집 도구입니다. 크롭, 회전, 반전, 리사이즈, 14가지 필터 등 다양한 편집 기능을 제공하며, 모든 처리가 클라이언트 측에서 이루어져 개인정보가 완전히 보호됩니다.",
    features: [
      "크롭, 회전, 좌우/상하 반전, 리사이즈",
      "14가지 필터 (흑백, 세피아, 빈티지, 블러 등)",
      "밝기, 대비, 채도, RGB, Hue 조정",
      "Undo/Redo 기능 (최대 50단계)",
      "PNG, JPG, WebP 저장",
      "완전한 클라이언트 사이드 처리 (서버 업로드 없음)"
    ],
    techStack: ["React", "TypeScript", "Vite", "Canvas API", "shadcn/ui", "Sonner"]
  },
  {
    id: "password-generator",
    name: "비밀번호 생성기",
    description: "Web Crypto API로 암호학적으로 안전한 비밀번호를 생성합니다.",
    url: "https://ws-07-password-generator.vercel.app/",
    tags: ["Security", "Utility"],
    category: "Tools",
    year: "2025",
    longDescription: "Math.random() 대신 Web Crypto API를 사용하여 암호학적으로 안전한 비밀번호를 생성합니다. 최대 100개까지 동시 생성 가능하며, 대문자, 소문자, 숫자, 특수문자를 개별적으로 선택할 수 있습니다.",
    features: [
      "Web Crypto API (crypto.getRandomValues) 사용",
      "1-128자 길이 설정",
      "최대 100개 동시 생성",
      "개별 문자 타입 선택 (대소문자, 숫자, 특수문자)",
      "실시간 강도 평가기",
      "TXT 파일로 일괄 내보내기"
    ],
    techStack: ["React", "TypeScript", "Vite", "Web Crypto API", "shadcn/ui", "Lucide"]
  },
  {
    id: "lotto-generator",
    name: "로또 번호 생성기",
    description: "대한민국 로또 6/45 번호를 12가지 알고리즘으로 생성합니다.",
    url: "https://ws-09-lotto-gen.vercel.app/",
    tags: ["Utility", "Algorithm"],
    category: "Tools",
    year: "2025",
    longDescription: "12가지 다양한 알고리즘으로 로또 번호를 생성하는 웹 애플리케이션입니다. 완전 무작위, 홀짝 균형, 고저 균형, 연속번호 제한, 분산형, 패턴 회피, SHA-256 해시, 시간 기반, 피보나치, 소수, 황금비, LCG 방식을 지원합니다.",
    features: [
      "12가지 다양한 알고리즘 (무작위, 홀짝, 피보나치, 황금비 등)",
      "최대 50개까지 동시 생성",
      "중복 번호 자동 제거",
      "TXT, CSV, JSON 형식 내보내기",
      "고유 파일명 생성 (해시 기반)",
      "WCAG 2.1 AA 접근성 준수"
    ],
    techStack: ["React", "TypeScript", "Vite", "shadcn/ui", "SHA-256", "LCG", "Sonner"]
  },
  {
    id: "color-palette",
    name: "색상 팔레트",
    description: "간단하고 직관적인 색상 선택 및 변환 도구입니다.",
    url: "https://ws-10-color-palette.vercel.app/",
    tags: ["Design", "Utility"],
    category: "Tools",
    year: "2025",
    longDescription: "디자이너와 개발자를 위한 종합 색상 도구입니다. 20단계 그레이스케일과 20가지 색조에서 400가지 색상을 선택하고, HEX, RGB, HSL, CMYK 형식으로 변환할 수 있습니다.",
    features: [
      "20단계 그레이스케일 및 20가지 색조",
      "색조별 400색 (채도 × 명도 조합)",
      "HEX, RGB, HSL, CMYK 형식 변환",
      "원클릭 클립보드 복사",
      "즐겨찾기 저장 (최대 50개)",
      "최근 사용 히스토리 (최대 20개)",
      "URL 공유 및 CSS/JSON/Figma 내보내기"
    ],
    techStack: ["React", "TypeScript", "Vite", "shadcn/ui", "Tailwind CSS", "Sonner"]
  },
  {
    id: "youtube-downloader",
    name: "YouTube 다운로더",
    description: "YouTube 영상을 다양한 형식으로 다운로드할 수 있습니다.",
    url: "https://ws-11-yt-downloader.vercel.app/",
    tags: ["Media", "Utility"],
    category: "Media",
    year: "2025",
    longDescription: "YouTube 영상과 오디오를 다양한 형식으로 다운로드하는 웹 애플리케이션입니다. MP4, WebM, MP3 등 여러 포맷과 해상도를 지원하며, 썸네일과 자막도 다운로드할 수 있습니다.",
    features: [
      "영상 다운로드 (MP4, WebM, 1080p/720p/480p/360p)",
      "오디오 추출 (MP3, AAC, M4A, OPUS)",
      "썸네일 다운로드 (최대/고화질/중간/기본)",
      "자막 다운로드 (SRT, VTT, TXT)",
      "실시간 영상 정보 조회 (YouTube Data API)",
      "반응형 디자인 및 다크 모드 지원"
    ],
    techStack: ["React", "TypeScript", "Vercel Functions", "@distube/ytdl-core", "FFmpeg", "shadcn/ui"]
  },
  {
    id: "anonymo",
    name: "Anonymo",
    description: "완전한 익명성을 보장하는 P2P 게시판 및 E2EE 채팅입니다.",
    url: "https://www.anonymo.live/",
    tags: ["Social", "P2P", "Security"],
    category: "Productivity",
    year: "2025",
    longDescription: "서버 없이 완전한 익명성을 보장하는 P2P 게시판 및 종단간 암호화(E2EE) 채팅 애플리케이션입니다. Gun.js를 활용한 분산 데이터베이스로 개인정보 수집 없이 실시간 소통이 가능합니다.",
    features: [
      "서버리스 P2P 아키텍처 (Gun.js)",
      "익명 랜덤 닉네임 자동 생성",
      "E2EE 1:1 채팅 (AES-GCM 암호화)",
      "실시간 게시판 및 댓글 동기화",
      "이미지/파일 전송 (256KB 청크)",
      "오프라인 우선 전략 (localStorage 캐싱)",
      "XSS 방지 및 Rate Limiting"
    ],
    techStack: ["React", "TypeScript", "Gun.js", "Gun SEA", "DOMPurify", "Web Crypto API", "shadcn/ui"]
  },
  {
    id: "super-normalizer",
    name: "슈퍼 노멀라이저",
    description: "브라우저에서 작동하는 고성능 오디오 노멀라이제이션 도구입니다.",
    url: "https://ws-13-super-normalizer.vercel.app/",
    tags: ["Audio", "Utility"],
    category: "Media",
    year: "2026",
    longDescription: "웹 브라우저에서 서버 업로드 없이 완전히 작동하는 오디오 노멀라이저입니다. Peak, RMS, LUFS 세 가지 방식의 노멀라이제이션을 지원하며, 실시간 파형 시각화와 다양한 포맷 출력을 제공합니다.",
    features: [
      "3가지 노멀라이제이션 방식 (Peak, RMS, LUFS)",
      "실시간 파형 시각화 및 비교",
      "다양한 입력 형식 (MP3, WAV, OGG, M4A)",
      "다양한 출력 형식 (WAV 16/24bit, FLAC, MP3, OGG)",
      "완전한 클라이언트 사이드 처리",
      "Canvas API 고해상도 렌더링"
    ],
    techStack: ["React", "TypeScript", "Vite", "Web Audio API", "Canvas API", "shadcn/ui"]
  },
  {
    id: "unit-converter",
    name: "단위 변환기",
    description: "길이, 무게, 온도, 부피 등 다양한 단위를 변환합니다.",
    url: "https://ws-14-unit-converter.vercel.app/",
    tags: ["Utility", "Calculator"],
    category: "Tools",
    year: "2026",
    longDescription: "웹 브라우저에서 서버리스로 작동하는 단위 변환기입니다. 길이, 무게, 온도, 부피 등 4가지 카테고리의 다양한 단위를 간편하게 변환할 수 있으며, 양방향 변환을 지원합니다.",
    features: [
      "4가지 카테고리 (길이, 무게, 온도, 부피)",
      "길이: 미터, 킬로미터, 마일, 야드, 피트, 인치",
      "무게: 킬로그램, 그램, 톤, 파운드, 온스",
      "온도: 섭씨, 화씨, 켈빈",
      "부피: 리터, 갤런, 쿼트, 컵",
      "양방향 변환 및 실시간 계산"
    ],
    techStack: ["React", "TypeScript", "Vite", "shadcn/ui", "Tailwind CSS"]
  },
  {
    id: "short-generator",
    name: "숏폼 비디오 변환기",
    description: "가로 영상을 세로 숏폼(9:16)으로 변환하는 도구입니다.",
    url: "https://ws-15-short-generator.vercel.app/",
    tags: ["Video", "Utility"],
    category: "Media",
    year: "2026",
    longDescription: "브라우저에서 가로 영상을 세로 숏폼 형식(9:16)으로 변환하는 서버리스 웹 애플리케이션입니다. YouTube Shorts, TikTok, Instagram Reels에 최적화된 영상을 만들 수 있습니다.",
    features: [
      "가로 영상을 9:16 세로 비율로 자동 변환",
      "실시간 미리보기 및 구간 선택 (최대 1분)",
      "텍스트 오버레이 (위치, 크기, 색상 조정)",
      "WebM/MP4 포맷 선택",
      "Canvas API 실시간 렌더링 (30fps)",
      "FFmpeg.wasm MP4 변환"
    ],
    techStack: ["React", "TypeScript", "Vite", "Canvas API", "MediaRecorder API", "FFmpeg.wasm", "shadcn/ui"]
  },
  {
    id: "realtime-exchange",
    name: "실시간 환율",
    description: "실시간 환율 조회 및 통화 변환 서비스입니다.",
    url: "https://ws-06-realtime-exchange.vercel.app/",
    tags: ["Finance", "API"],
    category: "Finance",
    year: "2025",
    longDescription: "무료 API를 활용한 실시간 환율 조회 및 통화 변환 서비스입니다. 50개 이상의 주요 통화 환율을 실시간으로 제공하며, 30일 환율 차트와 여행지 물가 계산기를 포함합니다.",
    features: [
      "50개 이상 주요 통화 실시간 환율",
      "양방향 통화 변환 (KRW ↔ 외화)",
      "30일 환율 추이 차트 (Recharts)",
      "여행지 물가 계산기",
      "통화 관리 (드래그앤드롭 정렬, 최대 18개)",
      "Context API로 API 호출 67% 감소"
    ],
    techStack: ["React", "TypeScript", "Vite", "ExchangeRate-API", "Frankfurter API", "Recharts", "shadcn/ui"]
  },
  {
    id: "memomome",
    name: "메모모미",
    description: "모든 데이터가 로컬에만 저장되는 프라이버시 중심 웹 메모장입니다.",
    url: "https://ws-05-memomome.vercel.app/",
    tags: ["Productivity", "Notes"],
    category: "Productivity",
    year: "2025",
    longDescription: "완전한 프라이버시를 보장하는 웹 메모장 애플리케이션입니다. 모든 데이터가 브라우저의 localStorage에만 저장되어 서버로 전송되지 않습니다. Undo/Redo, 찾기/바꾸기, 실시간 통계 등 강력한 기능을 제공합니다.",
    features: [
      "자동 저장 (타이핑 1초 후)",
      "Undo/Redo (최대 20단계, Ctrl+Z/Y)",
      "찾기/바꾸기 (대소문자 무시)",
      "메모 저장 관리 (최대 100개)",
      "실시간 통계 (문자, 단어, 줄 수)",
      "다양한 형식 내보내기 (TXT, MD, HTML, JSON, CSV)"
    ],
    techStack: ["React", "TypeScript", "Vite", "localStorage", "shadcn/ui", "Sonner"]
  },
  {
    id: "lorem-ipsum",
    name: "다국어 로렘 입숨 생성기",
    description: "11개 언어를 지원하는 현대적인 로렘 입숨 텍스트 생성기입니다.",
    url: "https://ws-04-lorem-ipsum-generator.vercel.app/",
    tags: ["Text", "Design"],
    category: "Tools",
    year: "2025",
    longDescription: "11개 언어(한국어, 영어, 스페인어, 프랑스어, 독일어, 라틴어, 러시아어, 일본어, 중국어, 태국어)를 지원하는 로렘 입숨 생성기입니다. 4가지 텍스트 스타일(산문, 시, 카피, 리드)과 세밀한 커스터마이징 옵션을 제공합니다.",
    features: [
      "11개 언어 지원 (한국어, 영어, 일본어, 중국어 등)",
      "4가지 텍스트 스타일 (산문, 시, 카피, 리드)",
      "세밀한 조정 (문단 1-20, 문장 1-15, 단어 3-30, 글자 0-5000)",
      "클립보드 복사 및 TXT 파일 다운로드",
      "실시간 글자 수 카운터",
      "번들 크기 93% 감소 최적화 (90KB gzip)"
    ],
    techStack: ["React", "TypeScript", "Vite", "shadcn/ui", "Sonner"]
  },
  {
    id: "text-counter",
    name: "텍스트 분석기",
    description: "TXT, PDF, DOCX 파일의 텍스트를 분석하는 도구입니다.",
    url: "https://ws-03-text-counter.vercel.app/",
    tags: ["Text", "Utility"],
    category: "Tools",
    year: "2025",
    longDescription: "한국어 및 영어 텍스트를 분석하여 상세한 통계를 제공하는 웹 애플리케이션입니다. TXT, MD, PDF, DOCX 파일을 지원하며, 드래그앤드롭으로 간편하게 업로드할 수 있습니다.",
    features: [
      "4가지 파일 형식 지원 (TXT, MD, PDF, DOCX)",
      "드래그앤드롭 파일 업로드 (최대 10MB)",
      "기본 통계 (글자, 단어, 문장, 문단 수)",
      "빈도 분석 (Top 10 단어, Top 10 문자)",
      "평균 통계 (평균 단어 길이, 평균 문장 길이)",
      "예상 읽기 시간 (200단어/분 기준)"
    ],
    techStack: ["React", "TypeScript", "Vite", "PDF.js", "Mammoth.js", "shadcn/ui"]
  },
  {
    id: "finance-converter",
    name: "대출 이자 계산기",
    description: "4가지 상환 방식의 대출 이자를 계산하고 Excel/PDF로 내보냅니다.",
    url: "https://ws-02-finance-converter-bci6.vercel.app/",
    tags: ["Finance", "Calculator"],
    category: "Finance",
    year: "2025",
    longDescription: "대출 금액, 연 이자율, 대출 기간을 입력하여 다양한 상환 방식에 따른 이자와 상환 계획을 계산합니다. 원리금균등, 원금균등, 만기일시, 체증식 상환을 지원하며, Excel과 PDF로 상세한 상환 일정표를 내보낼 수 있습니다.",
    features: [
      "4가지 상환 방식 (원리금균등, 원금균등, 만기일시, 체증식)",
      "거치 기간 설정 가능",
      "다양한 단위 지원 (만원/천원, 년/개월/일)",
      "월별 상환 일정표 (상환금액, 원금, 이자, 잔액)",
      "Excel 내보내기 (.xls, 한글 완벽 지원)",
      "PDF 내보내기 (NanumGothic 폰트 내장)"
    ],
    techStack: ["React", "TypeScript", "Vite", "xlsx", "jsPDF", "jspdf-autotable", "shadcn/ui", "Sonner"]
  },
  {
    id: "file-converter",
    name: "이미지·문서 파일 변환기",
    description: "브라우저에서 이미지와 문서를 실시간 변환하는 도구입니다.",
    url: "https://ws-01-file-converter.vercel.app/",
    tags: ["Utility", "Converter"],
    category: "Tools",
    year: "2025",
    longDescription: "서버 업로드 없이 브라우저에서 직접 파일을 변환하는 도구입니다. 이미지(JPG, PNG, WebP, GIF, BMP)와 문서(PDF, TXT, MD, HTML) 간 자유로운 변환을 지원하며, 일괄 변환 시 ZIP 파일로 다운로드됩니다.",
    features: [
      "이미지 변환 (JPG, PNG, WebP, GIF, BMP ↔ PDF)",
      "문서 변환 (PDF, TXT, MD, HTML 상호 변환)",
      "드래그앤드롭 파일 업로드",
      "일괄 변환 및 ZIP 다운로드",
      "Canvas API 실시간 변환",
      "완전한 클라이언트 사이드 처리 (서버 업로드 없음)"
    ],
    techStack: ["React", "TypeScript", "Vite", "Canvas API", "html2pdf.js", "PDF.js", "JSZip", "shadcn/ui"]
  },
  {
    id: "qr-ing",
    name: "큐알잉",
    description: "빠르고 간편한 무료 한국어 QR코드 생성기입니다.",
    url: "https://qr-ing.vercel.app/",
    tags: ["QR", "Utility"],
    category: "Archive",
    year: "2025",
    longDescription: "7가지 타입의 QR 코드를 간편하게 생성할 수 있는 한국어 QR 코드 생성기입니다. URL, 텍스트, 연락처, 이메일, 전화, 문자, WiFi 정보를 QR 코드로 변환하며, 크기, 오류 수정 레벨, 여백 등을 커스터마이징할 수 있습니다.",
    features: [
      "7가지 QR 타입 (URL, 텍스트, 연락처, 이메일, 전화, 문자, WiFi)",
      "QR 코드 크기 조절 (128px ~ 512px)",
      "오류 수정 레벨 설정 (L/M/Q/H)",
      "URL 자동 HTTPS 변환",
      "실시간 QR 코드 미리보기",
      "PNG 다운로드"
    ],
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "qrcode", "shadcn/ui", "Noto Sans KR"]
  },
  {
    id: "keyframe-generator",
    name: "키프레임 생성기",
    description: "AI 기반 시네마틱 키프레임을 생성하는 도구입니다.",
    url: "https://keyframe-generator.vercel.app/",
    tags: ["AI", "Video", "Storyboard"],
    category: "Archive",
    year: "2025",
    longDescription: "AI 기술을 활용하여 영상 제작을 위한 시네마틱 키프레임을 자동으로 생성하는 도구입니다. 스토리보드 제작 과정을 간소화하고 창의적인 영상 기획을 지원합니다.",
    features: [
      "AI 기반 이미지 생성",
      "시네마틱 스타일 키프레임 제작",
      "스토리보드 시퀀스 구성",
      "다양한 영상 스타일 프리셋",
      "고해상도 이미지 다운로드"
    ],
    techStack: ["React", "TypeScript", "AI Image Generation", "Canvas API"]
  },
  {
    id: "endless-blood",
    name: "Endless Blood",
    description: "Metroidvania와 Vampire Survivors 스타일의 웹 액션 로그라이크 게임입니다.",
    url: "https://endless-blood.vercel.app/",
    tags: ["Game", "Roguelike"],
    category: "Archive",
    year: "2025",
    longDescription: "Phaser 3 엔진으로 제작한 2D 액션 로그라이크 게임입니다. Metroidvania 플랫포밍과 Vampire Survivors 스타일 파밍 액션이 결합되어 있으며, 시간에 따라 난이도가 증가하고 6가지 적과 2개의 보스가 등장합니다.",
    features: [
      "6가지 적 타입 (좀비, 해골, 아머, 위처, 뱀퍼, 박쥐)",
      "2개 보스 (3:30 초월 키메라, 7:00 슈퍼 샤먼)",
      "자동 타겟팅 발사 시스템",
      "레벨업 시 6가지 업그레이드 (데미지, 연사, 사거리, 속도, 체력, 멀티샷)",
      "보물상자 4가지 아이템 (체력, 자석, 쉴드, 경험치)",
      "Normal/Coward 난이도, 무작위 맵, 디버그 모드"
    ],
    techStack: ["Phaser 3", "Vite", "JavaScript", "Arcade Physics", "Canvas API"]
  },
  {
    id: "dopameme",
    name: "도파밈",
    description: "게임처럼 즐기는 이슈 예측 플랫폼입니다.",
    url: "https://www.dopameme.kr/",
    tags: ["Prediction", "Game", "Social"],
    category: "Archive",
    year: "2025",
    longDescription: "대한민국 No.1 이슈 예측 플랫폼으로, 뉴스와 이슈를 단순 소비하는 것을 넘어 '예측'이라는 게임을 통해 자신의 의견을 표현하고 즐기는 새로운 인포테인먼트 서비스입니다. 도파민(Dopamine)과 밈(Meme)의 합성어로, 최신 트렌드와 이슈를 게임용 포인트 시스템으로 안전하게 즐길 수 있습니다.",
    features: [
      "정치, 경제, 스포츠 등 다양한 카테고리 예측",
      "LMSR 알고리즘 기반 공정한 시장 메커니즘",
      "AI 예측 정확도 87% 달성",
      "게임용 포인트 시스템 (현금 전환 불가)",
      "리더보드 및 리워드 시스템",
      "집단 지성 기반 인사이트 제공"
    ],
    techStack: ["Next.js", "Supabase", "AI/ML", "LMSR Algorithm", "TypeScript"]
  },
  {
    id: "h4ppylabs",
    name: "해피랩스",
    description: "뮤지션을 위한 창의적인 가상악기와 이펙터를 만드는 사운드 연구소입니다.",
    url: "https://www.h4ppylabs.com/",
    tags: ["Audio", "VST", "Music Production"],
    category: "Archive",
    year: "2025",
    longDescription: "h4ppy Labs는 뮤지션을 위한 창의적인 가상악기와 이펙터를 만듭니다. 기술과 예술의 경계에서 새로운 영감을 주는 도구를 연구하며, 타협하지 않는 최상의 오디오 품질과 뮤지션의 상상력을 제한하지 않는 도구를 추구합니다.",
    features: [
      "FUZZA - 일렉트릭 기타용 퍼즈 디스토션 플러그인",
      "DUCKAVERB - 원노브 덕킹 리버브 플러그인",
      "VST3 / AU / Standalone 멀티 포맷 지원",
      "Zero Latency 실시간 오디오 처리",
      "크로스 플랫폼 (macOS, Windows)",
      "최신 DSP 기술 기반 사운드 엔진"
    ],
    techStack: ["C++", "JUCE", "DSP", "VST3", "Audio Unit", "CMake"]
  },
  {
    id: "nvidia-q3",
    name: "엔비디아 Q3",
    description: "Nvidia Q3 실적 및 정보를 제공하는 사이트입니다.",
    url: "https://nvidia-q3.vercel.app/",
    tags: ["Finance", "News"],
    category: "Archive",
    year: "2025",
    longDescription: "Nvidia의 분기별 실적을 시각화하고 분석하는 데이터 대시보드입니다. 투자자와 기술 애호가를 위한 인사이트를 제공합니다.",
    features: [
      "실적 데이터 시각화",
      "주가 차트 및 분석",
      "뉴스 및 공시 정보",
      "비교 분석 도구",
      "반응형 대시보드"
    ],
    techStack: ["React", "TypeScript", "Recharts", "Finance API"]
  },
  {
    id: "prime-distribution",
    name: "소수 분포 양자역학",
    description: "소수 분포와 양자역학 시뮬레이션 프로젝트입니다.",
    url: "https://prime-distribution-quantum-mechanic.vercel.app/",
    tags: ["Science", "Simulation"],
    category: "Archive",
    year: "2025",
    longDescription: "수학과 물리학의 아름다움을 시각화하는 인터랙티브 시뮬레이션입니다. 소수의 분포와 양자역학의 원리를 탐구하세요.",
    features: [
      "실시간 소수 분포 시각화",
      "양자역학 시뮬레이션",
      "인터랙티브 파라미터 조절",
      "교육용 설명 제공",
      "고성능 Canvas 렌더링"
    ],
    techStack: ["React", "TypeScript", "Canvas API", "Web Workers"]
  },
  {
    id: "eazy-youtube-share",
    name: "이지 유튜브 쉐어",
    description: "YouTube 영상을 소셜 미디어에 공유하는 플랫폼입니다.",
    url: "https://eazy-youtube-share.vercel.app/",
    tags: ["Social", "YouTube"],
    category: "Archive",
    year: "2025",
    longDescription: "Instagram 스타일의 UI로 YouTube 영상을 공유하는 소셜 미디어 플랫폼입니다. Supabase Auth를 활용한 사용자 인증, 댓글 시스템, 좋아요, 북마크 기능을 제공하며, 가로/세로 영상을 자동으로 감지하여 적절한 피드에 표시합니다.",
    features: [
      "Instagram 스타일 UI (피드, 릴스)",
      "Supabase Auth 사용자 인증",
      "가로/세로 영상 자동 감지 및 분류",
      "댓글 및 대댓글 시스템",
      "좋아요 및 북마크 기능",
      "YouTube URL 파싱 및 검색",
      "Binance 컬러 다크 테마"
    ],
    techStack: ["Next.js", "TypeScript", "Supabase", "Tailwind CSS", "YouTube API", "shadcn/ui"]
  }
];

export function PortfolioLayout() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'portfolio' | 'profile'>('home');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const categories = [...new Set(projects.map(p => p.category))];

  const handleNavigation = (page: 'home' | 'portfolio' | 'profile') => {
    setCurrentPage(page);
    setSelectedProject(null);
  };

  // Cleanup iframe on project change
  useEffect(() => {
    if (!selectedProject) return;

    const iframe = iframeRef.current;
    if (!iframe) return;

    // Cleanup function
    return () => {
      if (iframe.contentWindow) {
        iframe.src = 'about:blank';
      }
    };
  }, [selectedProject?.id]);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 mx-auto max-w-6xl">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => handleNavigation('home')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Code2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h4 className="tracking-tight">h4ppy p1zza</h4>
              </div>
            </button>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Button
                variant={currentPage === 'home' && !selectedProject ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleNavigation('home')}
              >
                <Home className="h-4 w-4 mr-2" />
                홈
              </Button>
              <Button
                variant={currentPage === 'portfolio' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleNavigation('portfolio')}
              >
                <Grid3x3 className="h-4 w-4 mr-2" />
                포트폴리오
              </Button>
              <Button
                variant={currentPage === 'profile' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleNavigation('profile')}
              >
                <User className="h-4 w-4 mr-2" />
                프로필
              </Button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {selectedProject && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedProject(null)}
                  className="hidden sm:flex"
                >
                  <X className="h-4 w-4 mr-2" />
                  닫기
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newWindow = window.open('', '_blank');
                    if (newWindow) {
                      newWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                          <head>
                            <title>${selectedProject.name} - h4ppy p1zza</title>
                            <style>
                              body { margin: 0; padding: 0; overflow: hidden; }
                              iframe { width: 100vw; height: 100vh; border: 0; }
                            </style>
                          </head>
                          <body>
                            <iframe src="${selectedProject.url}" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"></iframe>
                          </body>
                        </html>
                      `);
                      newWindow.document.close();
                    }
                  }}
                  className="hidden sm:flex"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  새 탭
                </Button>
              </>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://github.com/zeztto', '_blank')}
            >
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">GitHub</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" size="sm">
                  <Grid3x3 className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Applications</span>
                  <span className="sm:hidden">Apps</span>
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>내 프로젝트</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {categories.filter(cat => cat !== 'Archive').map((category) => (
                  <div key={category}>
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                      {category}
                    </DropdownMenuLabel>
                    {projects
                      .filter(p => p.category === category)
                      .map((project) => (
                        <DropdownMenuItem
                          key={project.id}
                          onClick={() => {
                            setSelectedProject(project);
                            setCurrentPage('home');
                          }}
                          className="cursor-pointer"
                        >
                          <div className="flex flex-col gap-1 w-full">
                            <span>{project.name}</span>
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {project.description}
                            </span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                  </div>
                ))}
                <div>
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Archive
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => {
                      const qrProject = projects.find(p => p.id === 'qr-ing');
                      if (qrProject) {
                        setSelectedProject(qrProject);
                        setCurrentPage('home');
                      }
                    }}
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col gap-1 w-full">
                      <span>큐알잉</span>
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        QR 코드를 생성하고 관리할 수 있는 도구입니다.
                      </span>
                    </div>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleNavigation('portfolio')}
                  className="cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full">
                    <span>더보기</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-border">
          <div className="container flex items-center justify-around px-4 py-2 mx-auto max-w-7xl">
            <Button
              variant={currentPage === 'home' && !selectedProject ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handleNavigation('home')}
            >
              <Home className="h-4 w-4 mr-1" />
              홈
            </Button>
            <Button
              variant={currentPage === 'portfolio' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handleNavigation('portfolio')}
            >
              <Grid3x3 className="h-4 w-4 mr-1" />
              포트폴리오
            </Button>
            <Button
              variant={currentPage === 'profile' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handleNavigation('profile')}
            >
              <User className="h-4 w-4 mr-1" />
              프로필
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {selectedProject ? (
          <div className="flex flex-col min-h-full">
            {/* Project Info Bar */}
            <div className="bg-muted/50 border-b border-border px-6 py-3">
              <div className="container flex items-center gap-3 mx-auto max-w-7xl">
                <Badge variant="secondary">{selectedProject.category}</Badge>
                <h3>{selectedProject.name}</h3>
                <span className="text-muted-foreground hidden sm:inline">—</span>
                <p className="text-muted-foreground hidden sm:block">{selectedProject.description}</p>
              </div>
            </div>
            
            {/* Iframe */}
            <div className="bg-muted/30" style={{ minHeight: 'calc(100vh - 12rem)' }}>
              <iframe
                ref={iframeRef}
                src={selectedProject.url}
                className="w-full border-0"
                style={{ height: 'calc(100vh - 12rem)' }}
                title={selectedProject.name}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer 'none'; camera 'none'; geolocation 'none'; microphone 'none'"
              />
            </div>

            {/* Footer */}
            <div className="container px-4 py-8 mx-auto max-w-7xl">
              <Footer />
            </div>
          </div>
        ) : currentPage === 'portfolio' ? (
          <PortfolioPage projects={projects} onSelectProject={setSelectedProject} />
        ) : currentPage === 'profile' ? (
          <ProfilePage />
        ) : (
          <LandingPage projects={projects} onSelectProject={setSelectedProject} />
        )}
      </main>
    </div>
  );
}

function LandingPage({ 
  projects, 
  onSelectProject 
}: { 
  projects: Project[]; 
  onSelectProject: (project: Project) => void;
}) {
  const skillCategories = [
    {
      title: "프론트엔드",
      description: "사용자 인터페이스 개발 기술",
      skills: ["React", "TypeScript", "Next.js", "JavaScript", "HTML/CSS", "Tailwind CSS", "shadcn/ui", "Vite", "Canvas API", "CSS Animation"]
    },
    {
      title: "백엔드 & API",
      description: "서버 및 API 개발",
      skills: ["Node.js", "Python", "REST API", "NextAuth.js", "bcryptjs", "DeepSeek API", "Web APIs"]
    },
    {
      title: "데이터베이스 & ORM",
      description: "데이터 관리 및 ORM",
      skills: ["PostgreSQL", "Prisma", "Drizzle ORM", "Drizzle Kit", "Supabase"]
    },
    {
      title: "클라우드 & 인프라",
      description: "배포 및 클라우드 서비스",
      skills: ["Vercel", "Railway", "Neon", "Google Cloud", "Cloudinary"]
    },
    {
      title: "개발 도구",
      description: "IDE, 버전 관리 및 테스팅",
      skills: ["VS Code", "Cursor", "Git", "GitHub", "Playwright", "Claude Code", "CMake"]
    },
    {
      title: "디자인 & 미디어",
      description: "디자인 및 멀티미디어 제작",
      skills: ["Figma", "Photoshop", "Premiere", "Logic Pro", "Reaper"]
    },
    {
      title: "특화 기술",
      description: "프로젝트별 전문 기술",
      skills: ["Phaser 3", "JUCE", "C++", "File Processing", "QR Code", "Data Visualization", "Game Development", "Security Tools"]
    }
  ];

  const values = [
    {
      icon: Code2,
      title: "깔끔한 코드",
      description: "깔끔하고 유지보수 가능한 코드를 작성합니다."
    },
    {
      icon: Rocket,
      title: "빠른 배포",
      description: "빠른 개발과 배포로 아이디어를 현실로 만듭니다."
    },
    {
      icon: Zap,
      title: "성능 최적화",
      description: "최적화된 성능과 사용자 경험을 중요시합니다."
    },
    {
      icon: Target,
      title: "사용자 중심",
      description: "사용자 중심의 직관적인 인터페이스를 설계합니다."
    },
    {
      icon: Lightbulb,
      title: "지속적인 학습",
      description: "새로운 기술을 배우고 성장하는 것을 즐깁니다."
    },
    {
      icon: Grid3x3,
      title: "문제 해결",
      description: "복잡한 문제를 창의적으로 해결하는 것에 열정이 있습니다."
    }
  ];

  const experiences = [
    {
      icon: Code2,
      title: "웹 개발",
      description: "React와 TypeScript를 활용한 현대적인 웹 애플리케이션 개발",
      items: [
        "싱글 페이지 애플리케이션 (SPA)",
        "반응형 웹 디자인",
        "RESTful API 통합",
        "성능 최적화"
      ]
    },
    {
      icon: Palette,
      title: "UI/UX 디자인",
      description: "사용자 중심의 직관적이고 아름다운 인터페이스 디자인",
      items: [
        "사용자 인터페이스 디자인",
        "컴포넌트 라이브러리",
        "디자인 시스템",
        "접근성 (A11y)"
      ]
    },
    {
      icon: Lightbulb,
      title: "서비스 기획",
      description: "아이디어 발굴부터 제품 출시까지 전체 프로세스 기획",
      items: [
        "서비스 기획 및 요구사항 분석",
        "프로토타이핑 및 MVP 개발",
        "사용자 시나리오 설계",
        "기능 우선순위 결정"
      ]
    },
    {
      icon: MessageCircle,
      title: "기술 컨설팅",
      description: "프로젝트에 적합한 기술 스택 및 아키텍처 컨설팅",
      items: [
        "기술 스택 선정 및 조언",
        "코드 리뷰 및 품질 개선",
        "아키텍처 설계 지원",
        "성능 분석 및 최적화"
      ]
    },
    {
      icon: Wrench,
      title: "유지 보수 & 기술 지원",
      description: "안정적인 서비스 운영과 지속적인 기술 지원",
      items: [
        "버그 수정 및 문제 해결",
        "보안 업데이트 및 패치",
        "개발 환경 구축 지원",
        "기술 문서 작성 및 교육"
      ]
    },
    {
      icon: Video,
      title: "콘텐츠 제작",
      description: "서비스에 필요한 다양한 형태의 크리에이티브 콘텐츠 제작",
      items: [
        "카피라이팅 & 리드 작성",
        "사운드 디자인 & 음악",
        "영상 편집 & 모션 그래픽",
        "블로그 & 기술 아티클"
      ]
    }
  ];

  return (
    <div className="container px-4 py-16 mx-auto max-w-6xl">
      {/* Hero Section */}
      <div className="max-w-3xl mx-auto text-center mb-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted mb-6">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-muted-foreground">새로운 프로젝트 진행 가능</span>
        </div>
        
        <h1 className="mb-6 text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-relaxed xl:whitespace-nowrap">
          안녕하세요,{" "}
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            h4ppy p1zza
          </span>
          입니다
        </h1>
        
        <p className="text-muted-foreground text-lg mb-4 max-w-2xl mx-auto">
          웹 애플리케이션 개발을 전문으로 하는 개발자입니다. 
          사용자 경험을 최우선으로 생각하며, 실용적이고 아름다운 웹 서비스를 만듭니다.
        </p>
        
        <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
          다양한 도구와 기술을 활용하여 아이디어를 현실로 구현하고, 
          지속적인 학습과 발전을 통해 더 나은 개발자가 되기 위해 노력하고 있습니다.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
          <div className="text-center px-6 py-4 rounded-lg bg-muted/50">
            <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">{projects.length}</div>
            <div className="text-muted-foreground font-medium">프로젝트</div>
          </div>
          <div className="w-px h-16 bg-border hidden sm:block" />
          <div className="text-center px-6 py-4 rounded-lg bg-muted/50">
            <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {[...new Set(projects.map(p => p.category))].length}
            </div>
            <div className="text-muted-foreground font-medium">카테고리</div>
          </div>
          <div className="w-px h-16 bg-border hidden sm:block" />
          <div className="text-center px-6 py-4 rounded-lg bg-muted/50">
            <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {[...new Set(projects.flatMap(p => p.tags))].length}
            </div>
            <div className="text-muted-foreground font-medium">기술</div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="mb-20">
        <h2 className="mb-8 text-center">주요 프로젝트</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {projects.slice(0, 9).map((project) => (
            <Card 
              key={project.id} 
              className="group cursor-pointer transition-all hover:shadow-lg hover:scale-105 hover:border-primary/50"
              onClick={() => onSelectProject(project)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {project.category}
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Values */}
      <div className="mb-20">
        <h2 className="mb-8 text-center">핵심 가치</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {values.map((value) => (
            <Card key={value.title}>
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <value.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>{value.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{value.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="mb-20">
        <h2 className="mb-8 text-center">기술 스택</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {skillCategories.map((category) => (
            <Card key={category.title}>
              <CardHeader>
                <CardTitle>{category.title}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="px-3 py-1">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div className="mb-20">
        <h2 className="mb-8 text-center">주요 업무</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {experiences.map((experience) => (
            <Card key={experience.title}>
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <experience.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>{experience.title}</CardTitle>
                <CardDescription>{experience.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  {experience.items.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

function PortfolioPage({ 
  projects, 
  onSelectProject 
}: { 
  projects: Project[]; 
  onSelectProject: (project: Project) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const categories = ["All", ...new Set(projects.map(p => p.category))];
  
  const filteredProjects = selectedCategory === "All" 
    ? projects 
    : projects.filter(p => p.category === selectedCategory);

  return (
    <div className="container px-4 py-16 mx-auto max-w-7xl">
      {/* Hero Section */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="mb-4">
          전체 프로젝트
        </h1>
        
        <p className="text-muted-foreground text-lg">
          총 {projects.length}개의 프로젝트를 진행했습니다. 각 프로젝트의 상세한 정보를 확인하고 직접 체험해보세요.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Projects List */}
      <div className="space-y-8 mb-12">
        {filteredProjects.map((project, index) => (
          <Card key={project.id} className="overflow-hidden">
            <div className="grid md:grid-cols-3 gap-6 p-6">
              {/* Left: Basic Info */}
              <div className="md:col-span-1">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        {project.category}
                      </Badge>
                      {project.year && (
                        <Badge variant="outline" className="text-xs">
                          {project.year}
                        </Badge>
                      )}
                    </div>
                    <h3 className="mb-2">{project.name}</h3>
                    <p className="text-muted-foreground">
                      {project.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => onSelectProject(project)}
                    className="flex-1"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    열어보기
                  </Button>
                </div>
              </div>

              {/* Right: Details */}
              <div className="md:col-span-2 space-y-6">
                {/* Description */}
                {project.longDescription && (
                  <div>
                    <h4 className="mb-3 flex items-center gap-2">
                      <span>프로젝트 소개</span>
                    </h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {project.longDescription}
                    </p>
                  </div>
                )}

                {/* Features */}
                {project.features && project.features.length > 0 && (
                  <div>
                    <h4 className="mb-3">주요 기능</h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {project.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tech Stack */}
                {project.techStack && project.techStack.length > 0 && (
                  <div>
                    <h4 className="mb-3">기술 스택</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.techStack.map((tech) => (
                        <Badge key={tech} variant="secondary" className="px-3 py-1">
                          <Code2 className="h-3 w-3 mr-1" />
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}