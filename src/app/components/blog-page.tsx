import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Calendar, Clock } from "lucide-react";
import { Footer } from "./footer";

interface BlogPost {
  id: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  tags: string[];
  content: string;
}

const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "포트폴리오 웹사이트 제작기",
    description: "React와 Tailwind CSS를 사용하여 포트폴리오 웹사이트를 만든 경험을 공유합니다.",
    date: "2025-12-20",
    readTime: "5분",
    tags: ["React", "Tailwind CSS", "Portfolio"],
    content: "이번 포트폴리오 웹사이트는 React와 Tailwind CSS를 기반으로 제작했습니다. Shadcn UI를 활용하여 일관성 있는 디자인 시스템을 구축했고, iframe을 통해 각 프로젝트를 직접 체험할 수 있도록 구현했습니다."
  },
  {
    id: "2",
    title: "AI 기반 예측 플랫폼 '도파밈' 개발 후기",
    description: "LMSR 알고리즘과 게이미피케이션을 결합한 예측 플랫폼 개발 경험을 공유합니다.",
    date: "2025-12-10",
    readTime: "12분",
    tags: ["Next.js", "Supabase", "AI/ML", "Game Design"],
    content: "도파밈은 뉴스와 이슈를 게임처럼 즐기는 예측 플랫폼입니다. LMSR 알고리즘을 활용한 공정한 시장 메커니즘과 포인트 기반 게임 시스템 구현 과정에서 배운 점들을 상세히 다룹니다."
  },
  {
    id: "3",
    title: "VST 플러그인 개발: JUCE 프레임워크 입문기",
    description: "C++과 JUCE를 사용하여 오디오 플러그인을 만든 경험과 DSP 기초를 소개합니다.",
    date: "2025-11-28",
    readTime: "15분",
    tags: ["C++", "JUCE", "Audio", "DSP"],
    content: "h4ppy Labs 프로젝트를 통해 FUZZA와 DUCKAVERB 플러그인을 개발했습니다. JUCE 프레임워크의 기초부터 실시간 오디오 처리, VST3/AU 멀티 포맷 지원까지 오디오 플러그인 개발의 전 과정을 다룹니다."
  },
  {
    id: "4",
    title: "실용적인 웹 애플리케이션 개발하기",
    description: "사용자가 실제로 사용할 수 있는 유틸리티 웹앱을 만드는 과정과 노하우를 소개합니다.",
    date: "2025-11-15",
    readTime: "7분",
    tags: ["Web Development", "UX", "Tools"],
    content: "좋은 웹 애플리케이션은 단순히 기능만 작동하는 것이 아닙니다. 사용자의 실제 니즈를 파악하고, 직관적인 인터페이스로 문제를 해결해야 합니다. File Converter, Password Generator 등의 프로젝트를 통해 배운 점들을 공유합니다."
  },
  {
    id: "5",
    title: "Phaser 3로 웹 게임 만들기: Endless Blood 개발기",
    description: "Canvas 기반 게임 엔진을 활용한 웹 게임 개발 경험을 공유합니다.",
    date: "2025-10-22",
    readTime: "10분",
    tags: ["Phaser 3", "Game Development", "Canvas API"],
    content: "Endless Blood는 Phaser 3 엔진으로 제작한 액션 게임입니다. 게임 루프 설계, 충돌 감지, 파티클 시스템, 모바일 터치 컨트롤 등 웹 게임 개발에서 마주한 기술적 도전과 해결 방법을 소개합니다."
  },
  {
    id: "6",
    title: "React 컴포넌트 설계 패턴",
    description: "재사용 가능하고 확장 가능한 React 컴포넌트를 설계하는 방법을 다룹니다.",
    date: "2025-10-05",
    readTime: "10분",
    tags: ["React", "Design Patterns", "Best Practices"],
    content: "효율적인 React 컴포넌트 설계는 프로젝트의 성공을 좌우합니다. Composition Pattern, Compound Components, Custom Hooks 등 다양한 패턴을 실제 사례와 함께 설명합니다."
  },
  {
    id: "7",
    title: "Shadcn UI와 Neutral 테마로 일관된 디자인 시스템 구축하기",
    description: "컴포넌트 라이브러리를 활용한 디자인 시스템 구축 경험을 나눕니다.",
    date: "2025-09-18",
    readTime: "8분",
    tags: ["Shadcn UI", "Design System", "Tailwind CSS"],
    content: "모든 프로젝트에 일관된 디자인을 적용하기 위해 Shadcn UI와 Neutral 테마를 선택했습니다. 컴포넌트 커스터마이징, 테마 토큰 관리, 다크 모드 구현 등 실무에 바로 적용할 수 있는 노하우를 공유합니다."
  },
  {
    id: "8",
    title: "Tailwind CSS로 빠른 프로토타이핑",
    description: "Tailwind CSS를 활용하여 빠르게 프로토타입을 만드는 팁과 트릭을 소개합니다.",
    date: "2025-08-30",
    readTime: "6분",
    tags: ["Tailwind CSS", "CSS", "Prototyping"],
    content: "Tailwind CSS의 유틸리티 클래스 접근 방식은 빠른 개발을 가능하게 합니다. 커스텀 테마 설정, 반응형 디자인, 다크 모드 구현 등 실전에서 유용한 테크닉을 공유합니다."
  },
  {
    id: "9",
    title: "TypeScript로 타입 안정성 확보하기",
    description: "TypeScript를 사용하여 더 안전하고 유지보수하기 쉬운 코드를 작성하는 방법입니다.",
    date: "2025-08-10",
    readTime: "8분",
    tags: ["TypeScript", "JavaScript", "Type Safety"],
    content: "TypeScript는 대규모 프로젝트에서 필수입니다. 제네릭, 유틸리티 타입, 타입 가드 등을 활용하여 타입 안정성을 확보하고 개발 생산성을 높이는 방법을 알아봅니다."
  },
  {
    id: "10",
    title: "실시간 환율 API 통합 및 데이터 시각화",
    description: "외부 API 연동과 Recharts를 활용한 데이터 시각화 구현 경험을 다룹니다.",
    date: "2025-07-25",
    readTime: "9분",
    tags: ["REST API", "Recharts", "Data Visualization"],
    content: "실시간 환율 서비스를 개발하며 배운 API 통합 전략과 에러 핸들링, 캐싱 최적화 방법을 소개합니다. Recharts 라이브러리로 환율 추이를 효과적으로 시각화하는 방법도 함께 다룹니다."
  },
  {
    id: "11",
    title: "웹 성능 최적화 전략",
    description: "사용자 경험을 개선하기 위한 웹 성능 최적화 기법을 다룹니다.",
    date: "2025-07-05",
    readTime: "11분",
    tags: ["Performance", "Optimization", "Web Vitals"],
    content: "빠른 웹사이트는 사용자 만족도를 높입니다. Code Splitting, Lazy Loading, 이미지 최적화, 캐싱 전략 등 실전에서 바로 적용할 수 있는 성능 최적화 기법을 소개합니다."
  },
  {
    id: "12",
    title: "개발자를 위한 생산성 도구 모음",
    description: "개발 워크플로우를 개선하는 유용한 도구와 설정을 소개합니다.",
    date: "2025-06-20",
    readTime: "7분",
    tags: ["Productivity", "Tools", "Workflow"],
    content: "VS Code 확장, Git 워크플로우, 자동화 스크립트 등 개발 생산성을 높이는 도구들을 소개합니다. 실제로 사용하는 설정과 팁을 통해 더 효율적인 개발 환경을 만드는 방법을 알아봅니다."
  }
];

export function BlogPage() {
  return (
    <div className="container px-4 py-16 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted mb-6">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-muted-foreground">블로그</span>
        </div>
        
        <h1 className="mb-6 text-4xl sm:text-5xl lg:text-6xl tracking-tight">
          생각과{" "}
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            기록
          </span>
        </h1>
        
        <p className="text-muted-foreground text-lg max-w-3xl">
          개발하면서 배운 것들과 경험을 공유합니다. 
          웹 개발, 디자인, 그리고 기술에 대한 생각들을 기록합니다.
        </p>
      </div>

      {/* Blog Posts */}
      <div className="space-y-6">
        {blogPosts.map((post) => (
          <Card 
            key={post.id}
            className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/50"
          >
            <CardHeader>
              <div className="flex flex-wrap items-center gap-3 mb-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.date).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {post.readTime}
                </div>
              </div>
              <CardTitle className="group-hover:text-primary transition-colors">
                {post.title}
              </CardTitle>
              <CardDescription className="text-base">
                {post.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 line-clamp-2">
                {post.content}
              </p>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Footer />
    </div>
  );
}