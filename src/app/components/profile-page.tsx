import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Github, Instagram, Code2, Rocket, Target, Zap, Lightbulb } from "lucide-react";
import { Footer } from "./footer";

export function ProfilePage() {
  const skills = {
    "Frontend": ["React", "Next.js", "TypeScript", "JavaScript", "Tailwind CSS", "shadcn/ui"],
    "Backend": ["Node.js", "Express", "Supabase", "PostgreSQL", "REST API", "Serverless"],
    "Tools & DevOps": ["Git", "Vite", "Vercel", "GitHub Actions", "Docker", "ESLint"],
    "Libraries": ["Canvas API", "Web Audio API", "FFmpeg", "PDF.js", "Gun.js"],
    "Design": ["Figma", "Responsive Design", "UI/UX", "Accessibility", "SEO"],
    "Languages": ["C++", "JUCE", "Python", "DSP"],
    "Specialties": ["P2P", "E2EE", "Web Crypto", "Performance Optimization", "Security"]
  };

  const values = [
    {
      icon: Code2,
      title: "기술적 탁월함",
      description: "최신 기술과 모범 사례를 활용하여 고품질 코드를 작성합니다."
    },
    {
      icon: Rocket,
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
      icon: Zap,
      title: "빠른 실행력",
      description: "아이디어를 신속하게 프로토타입으로 전환합니다."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-12 sm:py-16 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted mb-6">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-muted-foreground">프로필</span>
          </div>

          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-primary/20">
                  <img
                    src="/profile.jpg"
                    alt="h4ppy p1zza"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                  <Code2 className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                h4ppy p1zza
              </h1>
              <p className="text-xl sm:text-2xl text-muted-foreground mb-6">
                풀스택 웹 서비스 개발자
              </p>

              <div className="space-y-4 text-base sm:text-lg text-muted-foreground mb-6">
                <p>
                  안녕하세요. 웹 기술에 대한 열정으로 가득한 풀스택 개발자입니다.
                  사용자에게 가치를 전달하는 서비스를 만드는 것을 좋아합니다.
                </p>
                <p>
                  React, TypeScript, Next.js를 중심으로 프론트엔드 개발을 하며,
                  Node.js와 Supabase로 백엔드를 구축합니다. 23개 이상의 웹 애플리케이션을
                  개발하며 다양한 도메인의 문제를 해결해왔습니다.
                </p>
                <p>
                  성능 최적화, 보안, 접근성을 중요하게 생각하며, 사용자 경험을
                  개선하기 위해 끊임없이 노력합니다. 새로운 기술을 배우고 실험하는 것을
                  즐기며, 코드 품질과 유지보수성을 항상 고려합니다.
                </p>
              </div>

              {/* Social Links */}
              <div className="flex gap-4">
                <a
                  href="https://github.com/zeztto"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                >
                  <Github className="h-5 w-5" />
                  <span className="hidden sm:inline">GitHub</span>
                </a>
                <a
                  href="https://instagram.com/h4ppy_p1zza"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                  <span className="hidden sm:inline">Instagram</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8">핵심 가치</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="group hover:border-primary/50 transition-all">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Skills */}
        <div className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8">기술 스택</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Object.entries(skills).map(([category, items]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-lg">{category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {items.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Experience Summary */}
        <div className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8">프로젝트 하이라이트</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-4xl sm:text-5xl font-bold text-primary mb-2">23+</div>
                <div className="text-sm text-muted-foreground">완성된 프로젝트</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-4xl sm:text-5xl font-bold text-primary mb-2">5</div>
                <div className="text-sm text-muted-foreground">카테고리</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-4xl sm:text-5xl font-bold text-primary mb-2">100%</div>
                <div className="text-sm text-muted-foreground">TypeScript 사용</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Journey */}
        <div className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8">개발 여정</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">풀스택 웹 개발자</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    프론트엔드부터 백엔드까지 전체 스택을 아우르는 웹 서비스를 개발합니다.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">React</Badge>
                    <Badge variant="outline" className="text-xs">Next.js</Badge>
                    <Badge variant="outline" className="text-xs">TypeScript</Badge>
                    <Badge variant="outline" className="text-xs">Node.js</Badge>
                    <Badge variant="outline" className="text-xs">Supabase</Badge>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-2">특화 분야</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">• 미디어 처리</span>
                      <p className="text-muted-foreground ml-4">Canvas API, FFmpeg, Web Audio API</p>
                    </div>
                    <div>
                      <span className="font-medium">• 보안 & 암호화</span>
                      <p className="text-muted-foreground ml-4">Web Crypto API, E2EE, P2P</p>
                    </div>
                    <div>
                      <span className="font-medium">• 성능 최적화</span>
                      <p className="text-muted-foreground ml-4">번들 최적화, 메모이제이션, Lazy Loading</p>
                    </div>
                    <div>
                      <span className="font-medium">• 데이터 시각화</span>
                      <p className="text-muted-foreground ml-4">Recharts, Canvas, 실시간 차트</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-2">관심 분야</h3>
                  <p className="text-muted-foreground text-sm">
                    웹 기술의 무한한 가능성을 탐구하며, 특히 브라우저 기반 미디어 처리,
                    암호화 통신, 성능 최적화에 관심이 많습니다. 오디오 처리(JUCE, VST),
                    게임 개발(Phaser), AI/ML 통합 등 다양한 분야를 경험했습니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="border-t pt-12">
          <Footer />
        </div>
      </div>
    </div>
  );
}
