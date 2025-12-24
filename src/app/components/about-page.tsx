import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Code2, Rocket, Zap, Target } from "lucide-react";

export function AboutPage() {
  const skills = [
    "React", "TypeScript", "Next.js", "Node.js", 
    "Tailwind CSS", "JavaScript", "HTML/CSS", "Git",
    "REST API", "Responsive Design", "UI/UX", "Web Development"
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
    }
  ];

  return (
    <div className="container px-4 py-16 max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted mb-6">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-muted-foreground">소개</span>
        </div>
        
        <h1 className="mb-6 text-4xl sm:text-5xl lg:text-6xl tracking-tight">
          안녕하세요,{" "}
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            h4ppy p1zza
          </span>
          입니다
        </h1>
        
        <p className="text-muted-foreground text-lg mb-4 max-w-3xl">
          웹 애플리케이션 개발을 전문으로 하는 개발자입니다. 
          사용자 경험을 최우선으로 생각하며, 실용적이고 아름다운 웹 서비스를 만듭니다.
        </p>
        
        <p className="text-muted-foreground text-lg max-w-3xl">
          다양한 도구와 기술을 활용하여 아이디어를 현실로 구현하고, 
          지속적인 학습과 발전을 통해 더 나은 개발자가 되기 위해 노력하고 있습니다.
        </p>
      </div>

      {/* Values */}
      <div className="mb-16">
        <h2 className="mb-8">핵심 가치</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value) => (
            <Card key={value.title}>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <value.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{value.title}</CardTitle>
                <CardDescription>{value.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="mb-16">
        <h2 className="mb-8">기술 스택</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="px-4 py-2">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Experience */}
      <div>
        <h2 className="mb-8">주요 업무</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>웹 개발</CardTitle>
              <CardDescription>
                React와 TypeScript를 활용한 현대적인 웹 애플리케이션 개발
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>• 싱글 페이지 애플리케이션 (SPA)</li>
                <li>• 반응형 웹 디자인</li>
                <li>• RESTful API 통합</li>
                <li>• 성능 최적화</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>UI/UX 디자인</CardTitle>
              <CardDescription>
                사용자 중심의 직관적이고 아름다운 인터페이스 디자인
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>• 사용자 인터페이스 디자인</li>
                <li>• 컴포넌트 라이브러리</li>
                <li>• 디자인 시스템</li>
                <li>• 접근성 (A11y)</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}