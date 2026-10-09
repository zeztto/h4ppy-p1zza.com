import type {
  ExperienceContent,
  HeroContent,
  ProjectsSectionContent,
  SkillsContent,
  TemplateKey,
  ValuesContent,
  SectionContent,
} from '../app/lib/section-content-types.js';

export type { SectionContent };

export interface SiteProfileContent {
  displayName: string;
  headline: string;
  bioShort: string;
  avatarUrl: string;
  githubUrl: string;
  instagramUrl: string;
  email?: string;
  essayMarkdown: string;
}

export interface SiteSectionContent {
  id: string;
  key: string;
  name: string;
  description: string;
  sectionType: string;
  templateKey: string | null;
  contentJson: string;
  enabled: boolean;
  sortOrder: number;
}

export const DEFAULT_SITE_PROFILE: SiteProfileContent = {
  displayName: 'h4ppy p1zza',
  headline: '웹 서비스 개발자',
  bioShort:
    '웹 서비스와 음악 작업 도구를 만듭니다. 한국 공연 정보를 모으는 lmml.kr을 비롯해, 필요한 기능을 기획하고 개발·운영합니다.',
  avatarUrl:
    'https://res.cloudinary.com/dnlcuy2aj/image/upload/v1775750758/p1zza/static/identity/profile.jpg',
  githubUrl: 'https://github.com/zeztto',
  instagramUrl: 'https://instagram.com/h4ppy_p1zza',
  email: '',
  essayMarkdown:
    "웹 서비스를 만들고 운영합니다. 음악 작업에 필요한 앱과 도구도 만듭니다. 기자, 콘텐츠 제작, 마케팅, 금융 일을 거쳐 지금은 개발을 하고 있습니다.\n\n최근에는 한국 메탈·하드코어·록 공연 정보를 모으는 lmml.kr을 개발·운영하고 있습니다. 공연 날짜와 라인업, 공연장, 예매 정보를 한곳에서 볼 수 있도록 정리합니다. 소셜 게시물에서 포스터와 본문을 가져와 공연 정보를 등록하고 수정하는 관리자 화면도 만들었습니다. 공연을 찾는 화면과 정보를 관리하는 화면을 함께 다듬고 있습니다.\n\n음악 쪽에서는 circlr를 만들고 있습니다. 곡의 구조를 원형 타임라인으로 보고, MIDI와 오디오를 다루는 macOS 앱입니다. 곡의 구간을 나누고 순서를 바꾸는 작업을 화면에서 어떻게 보여줄지, 편집할 때 무엇이 불편한지 하나씩 살펴보며 고치고 있습니다.\n\n작업할 때는 원하는 동작을 구체적으로 정하는 편입니다. 어떤 정보를 보여줄지, 버튼을 누르면 무엇이 바뀌어야 하는지, 작은 화면에서도 쓸 수 있는지부터 봅니다. 기능을 수정한 뒤에는 배포한 화면과 저장된 데이터까지 확인합니다. 기존 자료를 남겨둔 채 수정하고, 문제가 생겼을 때 되돌릴 방법도 준비합니다.\n\nAI도 개발에 많이 씁니다. 작업을 맡기고 결과를 보면서 빠진 조건이나 잘못된 동작을 다시 짚습니다. 기능을 만드는 일부터 검토와 배포까지, 각 단계에서 무엇을 맡기고 무엇을 확인할지 정리해 온 규칙은 p1zza-agent에 모아두었습니다.\n\n이 사이트에는 공개한 서비스와 도구를 정리해 놓았습니다. 각 프로젝트 페이지에서 현재 제공하는 기능과 관련 링크를 확인할 수 있습니다.",
};

export const DEFAULT_SITE_SECTIONS: SiteSectionContent[] = [
  {
    id: 'hero',
    key: 'hero',
    name: '히어로 섹션',
    description: '메인 소개 영역',
    sectionType: 'template',
    templateKey: 'hero',
    contentJson:
      '{"ctaText":"포트폴리오 보기","ctaLink":"/portfolio","showAvatar":true,"layout":"left-aligned"}',
    enabled: true,
    sortOrder: 0,
  },
  {
    id: 'projects',
    key: 'projects',
    name: '프로젝트',
    description: '웹사이트와 주요 프로젝트',
    sectionType: 'template',
    templateKey: 'projects',
    contentJson: '{"title":"대표 프로젝트","maxItems":6,"showFeaturedOnly":true}',
    enabled: true,
    sortOrder: 1,
  },
  {
    id: 'values',
    key: 'values',
    name: '핵심 가치',
    description: '개발 철학 및 가치',
    sectionType: 'template',
    templateKey: 'values',
    contentJson:
      '{"title":"핵심 가치","items":[{"icon":"Users","title":"사용자 중심","description":"모든 결정의 중심에 사용자를 놓습니다. 기술은 도구일 뿐, 사람이 편하게 쓸 수 있어야 합니다."},{"icon":"Lightbulb","title":"실용적 해결","description":"완벽보다 실용을 추구합니다. 일단 작동하는 것을 만들고, 그 다음 더 좋게 만듭니다."},{"icon":"TrendingUp","title":"지속적 성장","description":"매일 조금씩 나아가는 것을 믿습니다. 어제보다 나은 코드를 쓰고, 어제보다 나은 서비스를 만듭니다."}]}',
    enabled: true,
    sortOrder: 2,
  },
  {
    id: 'skills',
    key: 'skills',
    name: '기술 스택',
    description: '보유 기술 및 도구',
    sectionType: 'template',
    templateKey: 'skills',
    contentJson:
      '{"title":"기술 스택","categories":[{"name":"프론트엔드","items":["React","TypeScript","Next.js","Tailwind CSS","HTML/CSS"]},{"name":"백엔드","items":["Node.js","Express","PostgreSQL","SQLite","REST API"]},{"name":"개발·운영","items":["Git","Vite","Figma","Vercel","Cloudinary","Docker","Caddy","Cloudflare R2"]}]}',
    enabled: true,
    sortOrder: 3,
  },
  {
    id: 'experience',
    key: 'experience',
    name: '주요 업무',
    description: '제공하는 서비스와 경험',
    sectionType: 'template',
    templateKey: 'experience',
    contentJson:
      '{"title":"주요 업무","items":[{"title":"웹 애플리케이션 개발","description":"React, TypeScript 기반의 풀스택 웹 앱 개발"},{"title":"마케팅 랜딩페이지 제작","description":"전환율을 고려한 마케팅 페이지 기획 및 개발"},{"title":"UI/UX 설계","description":"사용자 경험을 최우선으로 한 인터페이스 설계"},{"title":"데이터 기반 의사결정","description":"분석과 데이터를 활용한 서비스 개선"}]}',
    enabled: true,
    sortOrder: 4,
  },
];

export const DEFAULT_HERO_CONTENT: HeroContent = {
  ctaText: '포트폴리오 보기',
  ctaLink: '/portfolio',
  showAvatar: true,
  layout: 'left-aligned',
};

export const DEFAULT_PROJECTS_CONTENT: ProjectsSectionContent = {
  title: '대표 프로젝트',
  maxItems: 6,
  showFeaturedOnly: true,
};

export const DEFAULT_VALUES_CONTENT: ValuesContent = {
  title: '핵심 가치',
  items: [
    {
      icon: 'Users',
      title: '사용자 중심',
      description:
        '모든 결정의 중심에 사용자를 놓습니다. 기술은 도구일 뿐, 사람이 편하게 쓸 수 있어야 합니다.',
    },
    {
      icon: 'Lightbulb',
      title: '실용적 해결',
      description:
        '완벽보다 실용을 추구합니다. 일단 작동하는 것을 만들고, 그 다음 더 좋게 만듭니다.',
    },
    {
      icon: 'TrendingUp',
      title: '지속적 성장',
      description:
        '매일 조금씩 나아가는 것을 믿습니다. 어제보다 나은 코드를 쓰고, 어제보다 나은 서비스를 만듭니다.',
    },
  ],
};

export const DEFAULT_SKILLS_CONTENT: SkillsContent = {
  title: '기술 스택',
  categories: [
    {
      name: '프론트엔드',
      items: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'HTML/CSS'],
    },
    {
      name: '백엔드',
      items: ['Node.js', 'Express', 'PostgreSQL', 'SQLite', 'REST API'],
    },
    {
      name: '개발·운영',
      items: ['Git', 'Vite', 'Figma', 'Vercel', 'Cloudinary', 'Docker', 'Caddy', 'Cloudflare R2'],
    },
  ],
};

export const DEFAULT_EXPERIENCE_CONTENT: ExperienceContent = {
  title: '주요 업무',
  items: [
    {
      title: '웹 애플리케이션 개발',
      description: 'React, TypeScript 기반의 풀스택 웹 앱 개발',
    },
    {
      title: '마케팅 랜딩페이지 제작',
      description: '전환율을 고려한 마케팅 페이지 기획 및 개발',
    },
    {
      title: 'UI/UX 설계',
      description: '사용자 경험을 최우선으로 한 인터페이스 설계',
    },
    {
      title: '데이터 기반 의사결정',
      description: '분석과 데이터를 활용한 서비스 개선',
    },
  ],
};

export const DEFAULT_SECTION_CONTENT: Record<TemplateKey, SectionContent> = {
  hero: DEFAULT_HERO_CONTENT,
  projects: DEFAULT_PROJECTS_CONTENT,
  values: DEFAULT_VALUES_CONTENT,
  skills: DEFAULT_SKILLS_CONTENT,
  experience: DEFAULT_EXPERIENCE_CONTENT,
};
