import { Github, Instagram } from "lucide-react";
import { Footer } from "./footer";

export function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-12 sm:py-16 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted mb-6">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-muted-foreground">About</span>
          </div>

          {/* Profile Image & Name */}
          <div className="flex flex-col items-center text-center mb-12">
            <div className="mb-6">
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-primary/20">
                <img
                  src="/profile.jpg"
                  alt="h4ppy p1zza"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <h1 className="mb-3 text-3xl sm:text-4xl font-bold tracking-tight">
              h4ppy p1zza
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-6">
              Full-stack Web Developer
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
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

        {/* Essay Content */}
        <article className="space-y-8 text-base sm:text-lg leading-relaxed text-muted-foreground">

          <section className="space-y-4">
            <p className="first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:mr-1 first-letter:float-left">
              매일 아침 컴퓨터 앞에 앉을 때마다 설렙니다.
              오늘은 무엇을 만들까, 어떤 문제를 해결할까 하는 기대감으로 하루를 시작합니다.
              40대에 접어든 지금도 그 설렘은 여전합니다.
            </p>

            <p>
              누군가는 이 나이에 새로운 것을 배우는 게 늦었다고 말할지 모릅니다.
              하지만 저는 오히려 지금이 가장 좋은 시기라고 생각합니다.
              젊은 시절의 조급함은 사라지고, 대신 여유와 인내가 생겼습니다.
              무엇이 정말 중요한지 알게 되었고, 불필요한 것들을 걸러낼 수 있게 되었습니다.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">여러 세계를 거쳐온 길</h2>

            <p>
              제 이력은 일직선이 아닙니다.
              20대에는 기자로 일했습니다.
              세상의 이야기를 듣고 기록하며, 복잡한 것을 단순하게 설명하는 법을 배웠습니다.
              좋은 글은 명확하고 간결해야 한다는 것, 핵심을 찌를 수 있어야 한다는 것을 그때 알았습니다.
            </p>

            <p>
              이후 콘텐츠를 만드는 사람이 되었습니다.
              글을 쓰고, 기획하고, 사람들이 왜 어떤 이야기에 끌리는지 연구했습니다.
              정보를 전달하는 것을 넘어 감정을 움직이는 법을 익혔습니다.
              지금 무언가를 만들 때도 항상 묻습니다—
              이것이 누군가의 마음에 닿을 수 있을까?
            </p>

            <p>
              마케터가 되어서는 숫자와 마주했습니다.
              사람들이 클릭하는 이유, 머무는 이유, 떠나는 이유를 데이터로 읽었습니다.
              숫자는 거짓말을 하지 않지만, 해석은 사람의 몫입니다.
              데이터 뒤에 숨은 사람을 보는 법을 배웠습니다.
            </p>

            <p>
              그리고 금융의 세계로 들어갔습니다.
              시장 메커니즘을 설계하고, 복잡한 계산을 하며,
              정밀함의 중요성을 배웠습니다.
              숫자 하나, 공식 하나가 얼마나 큰 차이를 만드는지 깨달았습니다.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">모든 경험이 하나로</h2>

            <p>
              그리고 결국 개발자가 되었습니다.
              돌아보면 각 경험이 다음 단계를 위한 준비였습니다.
              기자로서의 명확한 사고, 작가로서의 감수성,
              마케터로서의 데이터 감각, 금융인으로서의 정밀함—
              이 모든 것이 제가 만드는 것들 안에 녹아있습니다.
            </p>

            <p>
              개발자가 된 것은 우연이 아니었습니다.
              인공지능의 시대가 오고 있었고, 저는 확신했습니다.
              결국 기계와 대화할 수 있는 사람이 살아남을 것이라고.
              하지만 기계와 대화한다는 것은 단순히 명령어를 외우는 것이 아닙니다.
              무엇을 만들어야 하는지, 왜 만들어야 하는지 아는 것—
              그것은 여전히 인간만이 할 수 있는 일입니다.
            </p>

            <p>
              40대에 이 일을 시작한 것이 늦은 게 아니라 딱 맞는 때였습니다.
              저는 단지 코드를 쓰는 사람이 아닙니다.
              사람을 이해하고, 이야기를 만들고, 데이터를 읽고, 정밀하게 계산하는—
              모든 것을 할 수 있는 사람입니다.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">만드는 것에 대하여</h2>

            <p>
              저는 만드는 것을 좋아합니다.
              아이디어가 실제로 작동하는 무언가가 되는 순간,
              누군가 그것을 사용하고 도움을 받는 모습을 볼 때,
              그것이 제게 가장 큰 보람입니다.
            </p>

            <p>
              23개가 넘는 것들을 만들었습니다.
              어떤 것은 단순한 도구지만, 어떤 것은 복잡한 시스템입니다.
              하지만 모두에게 공통점이 있습니다—
              실제로 사람들이 사용할 수 있어야 한다는 것입니다.
              아무리 멋진 아이디어도 실제로 쓸모가 없다면 의미가 없습니다.
            </p>

            <p>
              비밀번호를 만드는 도구를 만들 때는 보안을 생각했고,
              메모장을 만들 때는 개인정보 보호를 최우선으로 했습니다.
              파일을 변환하는 도구는 사용자의 파일이 서버로 전송되지 않도록 설계했습니다.
              이것이 제가 생각하는 개발자의 책임입니다.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">한계를 넘어서</h2>

            <p>
              웹 브라우저는 제한된 환경입니다.
              하지만 그 안에서도 놀라운 것들을 할 수 있습니다.
              사진을 편집하고, 영상을 변환하고, 소리를 다루고, 게임을 만들 수 있습니다.
              불과 몇 년 전만 해도 불가능하다고 여겨졌던 일들입니다.
            </p>

            <p>
              장애물을 만날 때마다 배웁니다.
              막히면 돌아가고, 안 되면 다른 방법을 찾습니다.
              때로는 좌절하지만, 결국 해결책을 찾습니다.
              그 과정에서 더 나은 방법을 알게 되고, 더 많은 것을 배웁니다.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">완성이 아닌 과정</h2>

            <p>
              23개를 만들었지만 사실 하나도 완성되지 않았다고 생각합니다.
              만드는 것은 끝이 없습니다.
              오늘 좋아 보이는 것도 내일이면 더 나아질 수 있습니다.
              항상 개선할 부분이 보입니다.
            </p>

            <p>
              완벽을 추구하지만 완벽주의자는 아닙니다.
              일단 작동하는 것을 만들고, 그 다음 더 좋게 만듭니다.
              처음부터 완벽하려다 아무것도 못 만드는 것보다,
              부족해도 일단 세상에 내놓고 개선하는 것이 낫습니다.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">단순함의 가치</h2>

            <p>
              복잡한 것을 만드는 것은 쉽습니다.
              정말 어려운 것은 복잡한 것을 단순하게 만드는 것입니다.
              사용자는 내부가 어떻게 돌아가는지 알 필요가 없습니다.
              그저 원하는 것을 쉽게 할 수 있으면 됩니다.
            </p>

            <p>
              가장 좋은 도구는 존재감이 없는 도구입니다.
              사용자가 도구를 의식하지 않고 자신의 일에 집중할 수 있을 때,
              그것이 진짜 좋은 도구입니다.
              저는 그런 것들을 만들고 싶습니다.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">사람을 위한 기술</h2>

            <p>
              기술은 결국 사람을 위한 것입니다.
              아무리 혁신적인 기술도 사람의 삶을 나아지게 하지 못한다면
              의미가 없습니다.
            </p>

            <p>
              누군가의 시간을 절약해주고,
              복잡한 일을 간단하게 만들어주고,
              불가능해 보이던 것을 가능하게 만들어주는 것—
              그것이 제가 하는 일의 의미입니다.
            </p>

            <p>
              성능을 최적화하는 것은 사용자의 시간을 존중하는 것입니다.
              보안을 신경 쓰는 것은 사용자의 안전을 지키는 것입니다.
              개인정보를 수집하지 않는 것은 사용자의 권리를 인정하는 것입니다.
              이런 것들이 개발자로서 지켜야 할 최소한의 예의라고 생각합니다.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">배움은 끝이 없습니다</h2>

            <p>
              매일 새로운 것을 배웁니다.
              어제 몰랐던 것을 오늘 알게 되고,
              오늘 배운 것으로 내일 더 나은 것을 만듭니다.
              이 과정이 반복되는 것이 즐겁습니다.
            </p>

            <p>
              40대라는 나이가 때로는 부담이 될 수 있습니다.
              하지만 저는 이것을 강점으로 만들었습니다.
              젊은이들의 빠른 속도는 부럽지만,
              저는 그들이 아직 갖지 못한 것을 가지고 있습니다—
              맥락을 이해하는 능력, 큰 그림을 보는 시야,
              그리고 실패로부터 배우는 겸손함입니다.
            </p>

            <p>
              실패를 많이 했습니다.
              작동하지 않는 것들, 예상과 다른 결과들.
              하지만 모든 실패는 다음 시도를 위한 교훈이 되었습니다.
              실패를 두려워하지 않게 되었고, 오히려 실패에서 배우는 것을 즐기게 되었습니다.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">변화하는 세상에서</h2>

            <p>
              인공지능이 많은 것을 바꾸고 있습니다.
              코드를 작성하는 일조차도 기계가 대신할 수 있게 되었습니다.
              그렇다면 사람의 역할은 무엇일까요?
            </p>

            <p>
              저는 믿습니다.
              아무리 기술이 발전해도, 무엇을 만들어야 하는지,
              왜 만들어야 하는지를 결정하는 것은 사람의 몫이라고.
              기술은 도구일 뿐이고, 그 도구를 어떻게 사용할지는
              여전히 인간이 결정합니다.
            </p>

            <p>
              그래서 저는 계속 배웁니다.
              도구가 바뀌어도, 본질은 변하지 않습니다.
              사람을 이해하고, 문제를 파악하고, 해결책을 찾는 능력—
              이것은 어떤 시대에도 필요한 능력입니다.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">앞으로 나아가며</h2>

            <p>
              40대 개발자로서 제 앞에는 아직 긴 여정이 남아있습니다.
              나이는 숫자일 뿐입니다.
              중요한 것은 매일 조금씩 나아지려는 마음입니다.
            </p>

            <p>
              다음에는 무엇을 만들까요?
              아직 모릅니다.
              하지만 확실한 것은 계속 만들 것이고,
              계속 배울 것이며,
              계속 성장할 것이라는 점입니다.
            </p>

            <p>
              이 포트폴리오는 지나온 길의 기록입니다.
              동시에 앞으로 갈 길의 약속이기도 합니다.
              하나하나가 제가 세상에 던진 질문이고,
              여러분이 사용하는 순간,
              그 질문에 대한 대화가 시작됩니다.
            </p>

            <p className="text-foreground italic pt-6 border-t">
              만드는 것은 결국 사람을 위한 일입니다.
              기계를 위한 것이 아니라,
              그것을 사용할 사람을 위한 것입니다.
              이것이 제가 가장 소중히 여기는 믿음입니다.
            </p>

            <p className="text-sm pt-8">
              — 2026년 1월
            </p>
          </section>

        </article>

        {/* Footer */}
        <div className="border-t pt-12 mt-16">
          <Footer />
        </div>
      </div>
    </div>
  );
}
