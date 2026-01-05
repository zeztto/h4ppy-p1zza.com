import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Github, Instagram } from "lucide-react";
import { Footer } from "./footer";

export function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-12 sm:py-16 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted mb-6">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-muted-foreground">About</span>
          </div>

          {/* Profile Image & Name */}
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-start mb-12">
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-primary/20">
                  <img
                    src="/profile.jpg"
                    alt="h4ppy p1zza"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="text-center sm:text-left">
              <h1 className="mb-3 text-3xl sm:text-4xl font-bold tracking-tight">
                h4ppy p1zza
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-4">
                Full-stack Web Developer
              </p>

              {/* Social Links */}
              <div className="flex gap-3 justify-center sm:justify-start">
                <a
                  href="https://github.com/zeztto"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm"
                >
                  <Github className="h-4 w-4" />
                  <span>GitHub</span>
                </a>
                <a
                  href="https://instagram.com/h4ppy_p1zza"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm"
                >
                  <Instagram className="h-4 w-4" />
                  <span>Instagram</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Essay Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="space-y-8 text-base sm:text-lg leading-relaxed text-muted-foreground p-0">

              <section className="space-y-4">
                <p className="first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:mr-1 first-letter:float-left">
                  코드는 언어이고, 프로그래밍은 글쓰기입니다.
                  저는 이 문장을 믿으며 지난 수년간 웹이라는 캔버스에 생각을 코드로 풀어왔습니다.
                  40대에 접어든 지금, 여전히 매일 아침 VS Code를 열며 설레는 마음을 느낍니다.
                </p>

                <p>
                  누군가는 이 나이에 새로운 것을 배우는 게 늦었다고 말할지 모릅니다.
                  하지만 저는 오히려 지금이 가장 좋은 시기라고 생각합니다.
                  젊은 시절의 급한 마음은 사라지고, 대신 깊이 있는 이해와 인내심이 자리 잡았습니다.
                  기술은 수단일 뿐이고, 진짜 중요한 것은 그 기술로 무엇을 만들어내느냐는 것을 알게 되었습니다.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">컴퓨터 과학에 대한 철학</h2>

                <p>
                  저에게 컴퓨터 과학은 단순한 기술이 아닌 <strong className="text-foreground">인간의 사고를 확장하는 도구</strong>입니다.
                  알고리즘은 우리의 논리적 사고를 정제하고, 데이터 구조는 세상을 바라보는 새로운 렌즈를 제공합니다.
                  코드를 작성한다는 것은 단순히 컴퓨터에게 명령을 내리는 것이 아니라,
                  복잡한 문제를 작은 조각으로 나누고, 각 조각의 본질을 이해하며,
                  다시 아름답게 조합하는 <em>사색의 과정</em>입니다.
                </p>

                <p>
                  특히 웹 기술은 매혹적입니다. 브라우저라는 제한된 환경 안에서도
                  Canvas API로 이미지를 편집하고, Web Audio API로 소리를 다루며,
                  Web Crypto API로 메시지를 암호화할 수 있습니다.
                  이 모든 것이 사용자의 컴퓨터에서, 서버의 개입 없이 일어납니다.
                  이것이 바로 <strong className="text-foreground">분산 컴퓨팅의 아름다움</strong>이며,
                  사용자의 프라이버시를 존중하는 윤리적 개발의 시작점입니다.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">만드는 것에 대하여</h2>

                <p>
                  23개가 넘는 프로젝트를 만들며 배운 것이 있습니다.
                  좋은 소프트웨어는 <strong className="text-foreground">문제 해결</strong>에서 시작하지만,
                  훌륭한 소프트웨어는 <strong className="text-foreground">사용자에 대한 공감</strong>에서 완성된다는 것입니다.
                </p>

                <p>
                  비밀번호 생성기를 만들 때, 단순히 난수를 생성하는 것이 아니라
                  <code className="text-sm bg-muted px-1.5 py-0.5 rounded">Math.random()</code>의 한계를 이해하고
                  <code className="text-sm bg-muted px-1.5 py-0.5 rounded">Web Crypto API</code>를 선택한 이유를 고민했습니다.
                  로또 번호 생성기에 12가지 알고리즘을 넣은 것은 단순한 기능의 나열이 아니라,
                  '무작위성'이라는 개념 자체에 대한 탐구였습니다.
                  피보나치 수열, 황금비, 소수... 이 모든 것이 자연의 패턴이자 동시에
                  인간이 만들어낸 추상의 산물입니다.
                </p>

                <p>
                  P2P 익명 게시판 Anonymo를 만들며
                  <strong className="text-foreground">탈중앙화</strong>와 <strong className="text-foreground">프라이버시</strong>에 대해 깊이 생각했습니다.
                  Gun.js로 구현한 서버리스 아키텍처는 단순히 기술적 선택이 아니라,
                  중앙 권력 없이도 사람들이 소통할 수 있다는 믿음의 구현체입니다.
                  E2EE로 암호화된 메시지는 기술적으로는 AES-GCM 알고리즘이지만,
                  철학적으로는 개인의 사생활을 보호하겠다는 약속입니다.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">경계에서의 실험</h2>

                <p>
                  저는 항상 경계에 매료되어 왔습니다.
                  브라우저가 할 수 있는 것과 없는 것 사이의 경계,
                  프론트엔드와 백엔드의 경계,
                  기술과 예술의 경계.
                </p>

                <p>
                  FFmpeg.wasm으로 브라우저에서 비디오를 변환하고,
                  Web Audio API로 오디오를 노멀라이즈하며,
                  Canvas API로 이미지를 실시간으로 편집하는 것—
                  이 모든 것이 불과 몇 년 전만 해도 불가능하다고 여겨졌던 일들입니다.
                  기술의 발전은 우리가 '불가능'이라고 생각했던 경계를 계속해서 허물어왔습니다.
                </p>

                <p>
                  C++과 JUCE로 VST 플러그인을 만들며 저수준 오디오 처리의 세계를 경험했고,
                  Phaser 3로 게임을 만들며 물리 엔진과 게임 루프의 우아함을 배웠습니다.
                  각각의 프로젝트는 단순한 결과물이 아닌,
                  <strong className="text-foreground">새로운 세계로 들어가는 문</strong>이었습니다.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">성능과 보안, 그리고 윤리</h2>

                <p>
                  번들 크기를 60% 줄이고, 105개의 미사용 의존성을 제거하는 것은
                  단순한 최적화가 아닙니다.
                  그것은 사용자의 시간과 데이터를 존중하는 행위입니다.
                  느린 인터넷을 사용하는 누군가에게 몇 초의 로딩 시간 단축은
                  더 나은 경험을 의미합니다.
                </p>

                <p>
                  Content Security Policy를 설정하고,
                  TypeScript strict mode를 활성화하며,
                  모든 입력값을 sanitize하는 것—
                  이것은 사용자를 보호하겠다는 개발자의 책임입니다.
                  보안은 기능이 아닌 <strong className="text-foreground">태도</strong>입니다.
                </p>

                <p>
                  모든 이미지와 문서 처리를 클라이언트 사이드에서 진행하는 것도 같은 맥락입니다.
                  서버로 파일을 전송하지 않는다는 것은 기술적 편의가 아닌,
                  사용자의 데이터 주권을 인정하는 <strong className="text-foreground">윤리적 선택</strong>입니다.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">배움의 여정</h2>

                <p>
                  40대라는 나이는 때로 핸디캡처럼 느껴질 수 있습니다.
                  하지만 저는 이것을 <strong className="text-foreground">강점</strong>으로 전환했습니다.
                  젊은 개발자들의 빠른 학습 속도는 부럽지만,
                  저는 그들이 아직 갖지 못한 것을 가지고 있습니다—
                  <em>맥락을 이해하는 능력</em>, <em>큰 그림을 보는 시야</em>,
                  그리고 <em>실패로부터 배우는 겸손함</em>입니다.
                </p>

                <p>
                  매일 새로운 것을 배웁니다.
                  어제는 FFmpeg.wasm의 메모리 관리를 공부했고,
                  오늘은 Gun.js의 P2P 동기화 메커니즘을 탐구했으며,
                  내일은 아마도 WebGPU나 WebAssembly의 새로운 가능성을 실험할 것입니다.
                  이 끝없는 학습의 여정이 저를 살아있게 만듭니다.
                </p>

                <p>
                  때로는 좌절합니다.
                  YouTube의 ytdl 차단, CORS 오류, 브라우저 호환성 문제...
                  하지만 이 모든 장애물은 결국 더 나은 해결책으로 이어졌습니다.
                  ytdl이 막히자 오라클 클라우드에 yt-dlp 서버를 구축했고,
                  CORS 문제는 서버리스 아키텍처로의 전환을 촉발했습니다.
                  <strong className="text-foreground">제약은 창의성의 어머니</strong>입니다.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">도구를 넘어, 표현으로</h2>

                <p>
                  프로그래밍은 저에게 <strong className="text-foreground">표현의 수단</strong>입니다.
                  작가가 언어로 세계를 그려내듯,
                  화가가 붓으로 감정을 표현하듯,
                  저는 코드로 생각을 구현합니다.
                </p>

                <p>
                  색상 팔레트 도구를 만들 때,
                  단순히 HEX를 RGB로 변환하는 계산기가 아닌,
                  디자이너가 색의 조화를 탐구할 수 있는 <em>놀이터</em>를 만들고 싶었습니다.
                  메모장 앱에 Undo/Redo를 넣은 것은 기능 명세가 아니라,
                  글쓰기의 과정—고치고, 되돌리고, 다시 시도하는—을 존중하고 싶었기 때문입니다.
                </p>

                <p>
                  각 프로젝트는 질문으로 시작됩니다.
                  "브라우저에서 정말로 오디오를 노멀라이즈할 수 있을까?"
                  "P2P만으로 익명 소통이 가능할까?"
                  "암호학적으로 안전한 난수를 어떻게 생성할까?"
                  이 질문들에 답하는 과정이 곧 코드가 되고,
                  코드는 다시 새로운 질문을 낳습니다.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">완성이 아닌 과정</h2>

                <p>
                  23개의 프로젝트를 완성했지만,
                  사실 하나도 '완성'되지 않았다고 생각합니다.
                  소프트웨어는 살아있는 유기체와 같아서 계속 진화합니다.
                  오늘 완벽해 보이는 코드도 내일이면 개선할 점이 보입니다.
                </p>

                <p>
                  이 포트폴리오 사이트 자체가 그 예입니다.
                  처음에는 단순한 프로젝트 목록이었지만,
                  점차 성능을 최적화하고(번들 크기 60% 감소),
                  보안을 강화하며(CSP, TypeScript strict mode),
                  접근성을 개선해왔습니다.
                  각각의 개선은 <strong className="text-foreground">"더 나은 것을 향한 끝없는 여정"</strong>의 한 걸음입니다.
                </p>

                <p>
                  완벽을 추구하지만 완벽주의자는 아닙니다.
                  Ship early, iterate often.
                  작동하는 것을 먼저 만들고, 그 다음 더 좋게 만듭니다.
                  MVP부터 시작해 점진적으로 개선하는 것이
                  처음부터 완벽을 추구하다 아무것도 출시하지 못하는 것보다 낫다는 것을 압니다.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">기술 너머의 가치</h2>

                <p>
                  React, TypeScript, Next.js—
                  이것들은 제가 사용하는 도구입니다.
                  하지만 도구가 목적이 되어서는 안 됩니다.
                  최신 프레임워크를 쫓는 것보다 중요한 것은
                  <strong className="text-foreground">문제의 본질을 이해하고 적절한 해결책을 선택하는 판단력</strong>입니다.
                </p>

                <p>
                  때로는 가장 단순한 해결책이 최선입니다.
                  거대한 상태 관리 라이브러리 대신 useState로 충분할 때가 많고,
                  복잡한 빌드 설정 대신 Vite의 기본값이 더 나을 수 있습니다.
                  오버엔지니어링을 피하고 <em>필요한 만큼만</em> 만드는 것,
                  이것이 성숙한 개발자의 덕목입니다.
                </p>

                <p>
                  동시에, 새로운 기술에 대한 호기심은 잃지 않았습니다.
                  Web Components, WebGPU, WebAssembly—
                  이 기술들이 주류가 되기 전부터 실험하고 학습합니다.
                  트렌드를 좇는 것이 아니라 트렌드를 이해하고,
                  그것이 진짜 문제를 해결하는지 판단할 수 있어야 합니다.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">앞으로의 여정</h2>

                <p>
                  40대 개발자로서 제 앞에는 아직 수십 년의 여정이 남아있습니다.
                  나이는 숫자일 뿐, 진짜 중요한 것은
                  <strong className="text-foreground">매일 조금씩 더 나아지려는 의지</strong>입니다.
                </p>

                <p>
                  다음에는 무엇을 만들까요?
                  어쩌면 WebRTC로 실시간 협업 도구를,
                  또는 WebGPU로 3D 시각화를,
                  아니면 전혀 새로운 분야에 도전할지도 모릅니다.
                  확실한 것은 계속 만들고, 계속 배우며, 계속 성장할 것이라는 점입니다.
                </p>

                <p>
                  이 포트폴리오는 지나온 길의 기록이자 동시에
                  앞으로 나아갈 방향의 나침반입니다.
                  각 프로젝트는 제가 던진 질문이고,
                  코드는 그 질문에 대한 답변이며,
                  여러분이 이것을 사용하는 순간,
                  그 대화는 계속됩니다.
                </p>

                <p className="text-foreground italic pt-4">
                  코드는 결국 사람을 위한 것입니다.
                  컴퓨터를 위한 것이 아니라,
                  그것을 사용할 인간을 위한 것입니다.
                  이것이 제가 개발자로서 가장 소중히 여기는 신념입니다.
                </p>

                <p className="text-sm text-muted-foreground pt-8">
                  — 2026년 1월, 코드를 쓰며
                </p>
              </section>

              {/* Technical Stack Badge Cloud */}
              <section className="pt-8 border-t">
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="secondary">React</Badge>
                  <Badge variant="secondary">TypeScript</Badge>
                  <Badge variant="secondary">Next.js</Badge>
                  <Badge variant="secondary">Vite</Badge>
                  <Badge variant="secondary">Supabase</Badge>
                  <Badge variant="secondary">Canvas API</Badge>
                  <Badge variant="secondary">Web Audio API</Badge>
                  <Badge variant="secondary">FFmpeg</Badge>
                  <Badge variant="secondary">Gun.js</Badge>
                  <Badge variant="secondary">Web Crypto</Badge>
                  <Badge variant="secondary">E2EE</Badge>
                  <Badge variant="secondary">P2P</Badge>
                  <Badge variant="secondary">C++</Badge>
                  <Badge variant="secondary">JUCE</Badge>
                  <Badge variant="secondary">Phaser 3</Badge>
                  <Badge variant="secondary">shadcn/ui</Badge>
                </div>
              </section>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="border-t pt-12 mt-16">
          <Footer />
        </div>
      </div>
    </div>
  );
}
