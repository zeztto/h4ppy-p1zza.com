import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  ArrowRight,
  ChevronDown,
  Code2,
  ExternalLink,
  Grid3x3,
  X,
  Home,
  Rocket,
  Zap,
  Target,
  Github,
  Palette,
  Lightbulb,
  MessageCircle,
  Wrench,
  Video,
  User,
  Star,
  Check,
} from 'lucide-react';
import { Footer } from './footer';
import { ProfilePage } from './profile-page';
import { projects, type Project } from '@/data/projects';

export function PortfolioLayout() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'portfolio' | 'profile'>('home');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const categories = [...new Set(projects.map((p) => p.category))];

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
                <Home className="h-4 w-4 mr-2" />홈
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
                  <ExternalLink className="h-4 w-4 mr-2" />새 탭
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
                {categories
                  .filter((cat) => cat !== 'Archive')
                  .map((category) => (
                    <div key={category}>
                      <DropdownMenuLabel className="text-xs text-muted-foreground">
                        {category}
                      </DropdownMenuLabel>
                      {projects
                        .filter((p) => p.category === category)
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
                      const qrProject = projects.find((p) => p.id === 'qr-ing');
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
              <Home className="h-4 w-4 mr-1" />홈
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
                <p className="text-muted-foreground hidden sm:block">
                  {selectedProject.description}
                </p>
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
  onSelectProject,
}: {
  projects: Project[];
  onSelectProject: (project: Project) => void;
}) {
  const skillCategories = [
    {
      title: '프론트엔드',
      description: '사용자 인터페이스 개발 기술',
      skills: [
        'React',
        'TypeScript',
        'Next.js',
        'JavaScript',
        'HTML/CSS',
        'Tailwind CSS',
        'shadcn/ui',
        'Vite',
        'Canvas API',
        'CSS Animation',
      ],
    },
    {
      title: '백엔드 & API',
      description: '서버 및 API 개발',
      skills: [
        'Node.js',
        'Python',
        'REST API',
        'NextAuth.js',
        'bcryptjs',
        'DeepSeek API',
        'Web APIs',
      ],
    },
    {
      title: '데이터베이스 & ORM',
      description: '데이터 관리 및 ORM',
      skills: ['PostgreSQL', 'Prisma', 'Drizzle ORM', 'Drizzle Kit', 'Supabase'],
    },
    {
      title: '클라우드 & 인프라',
      description: '배포 및 클라우드 서비스',
      skills: ['Vercel', 'Railway', 'Neon', 'Google Cloud', 'Cloudinary'],
    },
    {
      title: '개발 도구',
      description: 'IDE, 버전 관리 및 테스팅',
      skills: ['VS Code', 'Cursor', 'Git', 'GitHub', 'Playwright', 'Claude Code', 'CMake'],
    },
    {
      title: '디자인 & 미디어',
      description: '디자인 및 멀티미디어 제작',
      skills: ['Figma', 'Photoshop', 'Premiere', 'Logic Pro', 'Reaper'],
    },
    {
      title: '특화 기술',
      description: '프로젝트별 전문 기술',
      skills: [
        'Phaser 3',
        'JUCE',
        'C++',
        'File Processing',
        'QR Code',
        'Data Visualization',
        'Game Development',
        'Security Tools',
      ],
    },
  ];

  const values = [
    {
      icon: Code2,
      title: '깔끔한 코드',
      description: '깔끔하고 유지보수 가능한 코드를 작성합니다.',
    },
    {
      icon: Rocket,
      title: '빠른 배포',
      description: '빠른 개발과 배포로 아이디어를 현실로 만듭니다.',
    },
    {
      icon: Zap,
      title: '성능 최적화',
      description: '최적화된 성능과 사용자 경험을 중요시합니다.',
    },
    {
      icon: Target,
      title: '사용자 중심',
      description: '사용자 중심의 직관적인 인터페이스를 설계합니다.',
    },
    {
      icon: Lightbulb,
      title: '지속적인 학습',
      description: '새로운 기술을 배우고 성장하는 것을 즐깁니다.',
    },
    {
      icon: Grid3x3,
      title: '문제 해결',
      description: '복잡한 문제를 창의적으로 해결하는 것에 열정이 있습니다.',
    },
  ];

  const experiences = [
    {
      icon: Code2,
      title: '웹 개발',
      description: 'React와 TypeScript를 활용한 현대적인 웹 애플리케이션 개발',
      items: [
        '싱글 페이지 애플리케이션 (SPA)',
        '반응형 웹 디자인',
        'RESTful API 통합',
        '성능 최적화',
      ],
    },
    {
      icon: Palette,
      title: 'UI/UX 디자인',
      description: '사용자 중심의 직관적이고 아름다운 인터페이스 디자인',
      items: ['사용자 인터페이스 디자인', '컴포넌트 라이브러리', '디자인 시스템', '접근성 (A11y)'],
    },
    {
      icon: Lightbulb,
      title: '서비스 기획',
      description: '아이디어 발굴부터 제품 출시까지 전체 프로세스 기획',
      items: [
        '서비스 기획 및 요구사항 분석',
        '프로토타이핑 및 MVP 개발',
        '사용자 시나리오 설계',
        '기능 우선순위 결정',
      ],
    },
    {
      icon: MessageCircle,
      title: '기술 컨설팅',
      description: '프로젝트에 적합한 기술 스택 및 아키텍처 컨설팅',
      items: [
        '기술 스택 선정 및 조언',
        '코드 리뷰 및 품질 개선',
        '아키텍처 설계 지원',
        '성능 분석 및 최적화',
      ],
    },
    {
      icon: Wrench,
      title: '유지 보수 & 기술 지원',
      description: '안정적인 서비스 운영과 지속적인 기술 지원',
      items: [
        '버그 수정 및 문제 해결',
        '보안 업데이트 및 패치',
        '개발 환경 구축 지원',
        '기술 문서 작성 및 교육',
      ],
    },
    {
      icon: Video,
      title: '콘텐츠 제작',
      description: '서비스에 필요한 다양한 형태의 크리에이티브 콘텐츠 제작',
      items: [
        '카피라이팅 & 리드 작성',
        '사운드 디자인 & 음악',
        '영상 편집 & 모션 그래픽',
        '블로그 & 기술 아티클',
      ],
    },
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
          안녕하세요,{' '}
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            h4ppy p1zza
          </span>
          입니다
        </h1>

        <p className="text-muted-foreground text-lg mb-4 max-w-2xl mx-auto">
          웹 애플리케이션 개발을 전문으로 하는 개발자입니다. 사용자 경험을 최우선으로 생각하며,
          실용적이고 아름다운 웹 서비스를 만듭니다.
        </p>

        <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
          다양한 도구와 기술을 활용하여 아이디어를 현실로 구현하고, 지속적인 학습과 발전을 통해 더
          나은 개발자가 되기 위해 노력하고 있습니다.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
          <div className="text-center px-6 py-4 rounded-lg bg-muted/50">
            <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {projects.length}
            </div>
            <div className="text-muted-foreground font-medium">프로젝트</div>
          </div>
          <div className="w-px h-16 bg-border hidden sm:block" />
          <div className="text-center px-6 py-4 rounded-lg bg-muted/50">
            <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {[...new Set(projects.map((p) => p.category))].length}
            </div>
            <div className="text-muted-foreground font-medium">카테고리</div>
          </div>
          <div className="w-px h-16 bg-border hidden sm:block" />
          <div className="text-center px-6 py-4 rounded-lg bg-muted/50">
            <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {[...new Set(projects.flatMap((p) => p.tags))].length}
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
  onSelectProject,
}: {
  projects: Project[];
  onSelectProject: (project: Project) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const categories = ['All', ...new Set(projects.map((p) => p.category))];

  const filteredProjects =
    selectedCategory === 'All' ? projects : projects.filter((p) => p.category === selectedCategory);

  return (
    <div className="container px-4 py-16 mx-auto max-w-7xl">
      {/* Hero Section */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="mb-4">전체 프로젝트</h1>

        <p className="text-muted-foreground text-lg">
          총 {projects.length}개의 프로젝트를 진행했습니다. 각 프로젝트의 상세한 정보를 확인하고
          직접 체험해보세요.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Projects List */}
      <div className="space-y-8 mb-12">
        {filteredProjects.map((project) => (
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
                    <p className="text-muted-foreground">{project.description}</p>
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
                  <Button size="sm" onClick={() => onSelectProject(project)} className="flex-1">
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
