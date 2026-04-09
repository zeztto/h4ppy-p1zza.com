import type {
  ExperienceContent,
  HeroContent,
  ProjectsSectionContent,
  SkillsContent,
  TemplateKey,
  ValuesContent,
  SectionContent,
} from '../app/lib/section-content-types.js';
import { resolveStaticAssetUrl } from './cloudinary-assets.js';

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
  headline: 'Full-stack Web Developer',
  bioShort:
    '웹 애플리케이션 개발을 전문으로 하는 개발자입니다. 사용자 경험을 최우선으로 생각하며, 실용적이고 아름다운 웹 서비스를 만듭니다.',
  avatarUrl: resolveStaticAssetUrl('/profile.jpg'),
  githubUrl: 'https://github.com/zeztto',
  instagramUrl: 'https://instagram.com/h4ppy_p1zza',
  email: '',
  essayMarkdown: `매일 아침 컴퓨터 앞에 앉을 때마다 설렙니다. 오늘은 무엇을 만들까, 어떤 문제를 해결할까 하는 기대감으로 하루를 시작합니다. 40대에 접어든 지금도 그 설렘은 여전합니다.

누군가는 이 나이에 새로운 것을 배우는 게 늦었다고 말할지 모릅니다. 하지만 저는 오히려 지금이 가장 좋은 시기라고 생각합니다. 젊은 시절의 조급함은 사라지고, 대신 여유와 인내가 생겼습니다. 무엇이 정말 중요한지 알게 되었고, 불필요한 것들을 걸러낼 수 있게 되었습니다.

## 여러 세계를 거쳐온 길

제 이력은 일직선이 아닙니다. 20대에는 기자로 일했습니다. 세상의 이야기를 듣고 기록하며, 복잡한 것을 단순하게 설명하는 법을 배웠습니다. 좋은 글은 명확하고 간결해야 한다는 것, 핵심을 찌를 수 있어야 한다는 것을 그때 알았습니다.

이후 콘텐츠를 만드는 사람이 되었습니다. 글을 쓰고, 기획하고, 사람들이 왜 어떤 이야기에 끌리는지 연구했습니다. 정보를 전달하는 것을 넘어 감정을 움직이는 법을 익혔습니다. 지금 무언가를 만들 때도 항상 묻습니다. 이것이 누군가의 마음에 닿을 수 있을까?

마케터가 되어서는 숫자와 마주했습니다. 사람들이 클릭하는 이유, 머무는 이유, 떠나는 이유를 데이터로 읽었습니다. 숫자는 거짓말을 하지 않지만, 해석은 사람의 몫입니다. 데이터 뒤에 숨은 사람을 보는 법을 배웠습니다.

그리고 금융의 세계로 들어갔습니다. 시장 메커니즘을 설계하고, 복잡한 계산을 하며, 정밀함의 중요성을 배웠습니다. 숫자 하나, 공식 하나가 얼마나 큰 차이를 만드는지 깨달았습니다.

## 모든 경험이 하나로

그리고 결국 개발자가 되었습니다. 돌아보면 각 경험이 다음 단계를 위한 준비였습니다. 기자로서의 명확한 사고, 작가로서의 감수성, 마케터로서의 데이터 감각, 금융인으로서의 정밀함. 이 모든 것이 제가 만드는 것들 안에 녹아있습니다.

개발자가 된 것은 우연이 아니었습니다. 인공지능의 시대가 오고 있었고, 저는 확신했습니다. 결국 기계와 대화할 수 있는 사람이 살아남을 것이라고. 하지만 기계와 대화한다는 것은 단순히 명령어를 외우는 것이 아닙니다. 무엇을 만들어야 하는지, 왜 만들어야 하는지 아는 것, 그것은 여전히 인간만이 할 수 있는 일입니다.

40대에 이 일을 시작한 것이 늦은 게 아니라 딱 맞는 때였습니다. 저는 단지 코드를 쓰는 사람이 아닙니다. 사람을 이해하고, 이야기를 만들고, 데이터를 읽고, 정밀하게 계산하는 모든 것을 할 수 있는 사람입니다.

## 만드는 것에 대하여

저는 만드는 것을 좋아합니다. 아이디어가 실제로 작동하는 무언가가 되는 순간, 누군가 그것을 사용하고 도움을 받는 모습을 볼 때, 그것이 제게 가장 큰 보람입니다.

23개가 넘는 것들을 만들었습니다. 어떤 것은 단순한 도구지만, 어떤 것은 복잡한 시스템입니다. 하지만 모두에게 공통점이 있습니다. 실제로 사람들이 사용할 수 있어야 한다는 것입니다. 아무리 멋진 아이디어도 실제로 쓸모가 없다면 의미가 없습니다.

비밀번호를 만드는 도구를 만들 때는 보안을 생각했고, 메모장을 만들 때는 개인정보 보호를 최우선으로 했습니다. 파일을 변환하는 도구는 사용자의 파일이 서버로 전송되지 않도록 설계했습니다. 이것이 제가 생각하는 개발자의 책임입니다.

## 한계를 넘어서

웹 브라우저는 제한된 환경입니다. 하지만 그 안에서도 놀라운 것들을 할 수 있습니다. 사진을 편집하고, 영상을 변환하고, 소리를 다루고, 게임을 만들 수 있습니다. 불과 몇 년 전만 해도 불가능하다고 여겨졌던 일들입니다.

장애물을 만날 때마다 배웁니다. 막히면 돌아가고, 안 되면 다른 방법을 찾습니다. 때로는 좌절하지만, 결국 해결책을 찾습니다. 그 과정에서 더 나은 방법을 알게 되고, 더 많은 것을 배웁니다.

## 완성이 아닌 과정

23개를 만들었지만 사실 하나도 완성되지 않았다고 생각합니다. 만드는 것은 끝이 없습니다. 오늘 좋아 보이는 것도 내일이면 더 나아질 수 있습니다. 항상 개선할 부분이 보입니다.

완벽을 추구하지만 완벽주의자는 아닙니다. 일단 작동하는 것을 만들고, 그 다음 더 좋게 만듭니다. 처음부터 완벽하려다 아무것도 못 만드는 것보다, 부족해도 일단 세상에 내놓고 개선하는 것이 낫습니다.

## 단순함의 가치

복잡한 것을 만드는 것은 쉽습니다. 정말 어려운 것은 복잡한 것을 단순하게 만드는 것입니다. 사용자는 내부가 어떻게 돌아가는지 알 필요가 없습니다. 그저 원하는 것을 쉽게 할 수 있으면 됩니다.

가장 좋은 도구는 존재감이 없는 도구입니다. 사용자가 도구를 의식하지 않고 자신의 일에 집중할 수 있을 때, 그 도구는 성공한 것입니다.

## 앞으로도 계속

이 포트폴리오는 지나온 길의 기록입니다. 동시에 앞으로 갈 길의 약속이기도 합니다. 하나하나가 제가 세상에 던진 질문이고, 여러분이 사용하는 순간, 그 질문에 대한 대화가 시작됩니다.

만드는 것은 결국 사람을 위한 일입니다. 기계를 위한 것이 아니라, 사람의 삶을 조금 더 나아지게 하는 일입니다.`,
};

export const DEFAULT_SITE_SECTIONS: SiteSectionContent[] = [
  {
    id: 'hero',
    key: 'hero',
    name: '히어로 섹션',
    description: '메인 소개 영역',
    sectionType: 'template',
    templateKey: 'hero',
    contentJson: '{}',
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
    contentJson: '{}',
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
    contentJson: '{}',
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
    contentJson: '{}',
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
    contentJson: '{}',
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
  title: 'Featured Projects',
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
      name: 'Frontend',
      items: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'HTML/CSS'],
    },
    {
      name: 'Backend',
      items: ['Node.js', 'Express', 'PostgreSQL', 'SQLite', 'REST API'],
    },
    {
      name: 'Tools',
      items: ['Git', 'Vite', 'Figma', 'Vercel', 'Railway', 'Cloudinary'],
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
