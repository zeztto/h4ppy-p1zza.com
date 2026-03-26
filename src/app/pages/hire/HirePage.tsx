import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  ClipboardList,
  Copy,
  Github,
  Instagram,
  Mail,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { usePublicData } from '@/app/hooks/usePublicData';
import type { PublicProfile } from '@/app/lib/types';
import { DEFAULT_SITE_PROFILE } from '@/data/site-content';

const inputClass =
  'w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring';

const textareaClass = `${inputClass} min-h-28 resize-y`;

const profileFallback: PublicProfile = {
  ...DEFAULT_SITE_PROFILE,
  id: 'primary',
  updatedAt: '',
  email: DEFAULT_SITE_PROFILE.email ?? '',
};

const serviceCards = [
  {
    title: '랜딩페이지와 브랜드 사이트',
    description: '제품의 첫인상을 정리하고, 메시지와 전환 구조를 함께 다듬는 작업입니다.',
  },
  {
    title: 'MVP와 내부 운영 도구',
    description: '빠르게 써볼 수 있는 제품, 관리자 화면, 실무용 대시보드를 현실적인 범위로 만듭니다.',
  },
  {
    title: '기존 서비스 개선',
    description: '퍼널, UI, 관리자 구조, 데이터 흐름까지 현재 서비스의 막힌 지점을 다시 설계합니다.',
  },
];

const fitItems = [
  '아이디어는 있는데 어디서부터 설계해야 할지 정리가 안 된 경우',
  '이미 서비스가 있지만 화면과 관리자 경험을 함께 개선하고 싶은 경우',
  '빠르게 만들되 조잡해 보이지 않는 결과물이 필요한 경우',
  '운영자가 직접 수정할 수 있는 구조까지 포함해 만들고 싶은 경우',
];

function buildInquiryTemplate(values: {
  name: string;
  company: string;
  projectType: string;
  goals: string;
  timeline: string;
  budget: string;
  reference: string;
}) {
  return [
    '안녕하세요. 업무 의뢰 문의드립니다.',
    '',
    `이름 / 팀명: ${values.name || '-'}`,
    `회사 / 서비스: ${values.company || '-'}`,
    `필요한 작업: ${values.projectType || '-'}`,
    `핵심 목표: ${values.goals || '-'}`,
    `희망 일정: ${values.timeline || '-'}`,
    `예상 예산: ${values.budget || '-'}`,
    `참고 링크: ${values.reference || '-'}`,
  ].join('\n');
}

export function HirePage() {
  const { data: profile, loading, error } = usePublicData<PublicProfile>('profile', profileFallback);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [projectType, setProjectType] = useState('');
  const [goals, setGoals] = useState('');
  const [timeline, setTimeline] = useState('');
  const [budget, setBudget] = useState('');
  const [reference, setReference] = useState('');
  const [copied, setCopied] = useState(false);

  const p = profile ?? profileFallback;

  const inquiryTemplate = useMemo(
    () =>
      buildInquiryTemplate({
        name,
        company,
        projectType,
        goals,
        timeline,
        budget,
        reference,
      }),
    [budget, company, goals, name, projectType, reference, timeline],
  );

  const contactActions = [
    p.email
      ? {
          label: '이메일로 문의',
          href: `mailto:${p.email}?subject=${encodeURIComponent('프로젝트 의뢰 문의')}&body=${encodeURIComponent(inquiryTemplate)}`,
          icon: Mail,
          primary: true,
        }
      : null,
    p.instagramUrl
      ? {
          label: '인스타그램 DM',
          href: p.instagramUrl,
          icon: Instagram,
          primary: !p.email,
        }
      : null,
    p.githubUrl
      ? {
          label: 'GitHub 보기',
          href: p.githubUrl,
          icon: Github,
          primary: false,
        }
      : null,
  ].filter(Boolean) as Array<{
    label: string;
    href: string;
    icon: typeof Mail;
    primary: boolean;
  }>;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inquiryTemplate);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (copyError) {
      console.error('Failed to copy inquiry template', copyError);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="h-8 w-28 rounded-full bg-muted animate-pulse" />
            <div className="h-14 w-4/5 rounded-2xl bg-muted animate-pulse" />
            <div className="h-6 w-3/5 rounded-xl bg-muted animate-pulse" />
            <div className="grid gap-4 md:grid-cols-3 pt-8">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-40 rounded-xl border bg-card animate-pulse" />
              ))}
            </div>
          </div>
          <div className="h-[620px] rounded-3xl border bg-card animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-6 py-24">
        <p className="text-center text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.18),transparent_55%),radial-gradient(circle_at_top_right,rgba(15,23,42,0.08),transparent_45%)]" />
      <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="space-y-10"
          >
            <div className="space-y-5">
              <Badge variant="outline" className="rounded-full px-3 py-1 text-xs tracking-[0.18em] uppercase">
                Work with p1zza.kr
              </Badge>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground md:text-6xl md:leading-[1.05]">
                  함께 만들 가치가 있는 일이라면,
                  <br />
                  처음 구조부터 같이 잡습니다.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                  단순히 화면만 그리는 작업보다, 무엇을 만들고 왜 지금 만들어야 하는지까지
                  같이 정리하는 일을 선호합니다. 랜딩페이지, MVP, 관리자 화면, 기존 서비스
                  개선까지 현실적인 범위 안에서 빠르게 정리하고 구현합니다.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {contactActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={action.label}
                      asChild
                      variant={action.primary ? 'default' : 'outline'}
                      className="rounded-xl"
                    >
                      <a href={action.href} target="_blank" rel="noopener noreferrer">
                        <Icon className="size-4" />
                        {action.label}
                      </a>
                    </Button>
                  );
                })}
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-xl"
                  onClick={() => {
                    document.getElementById('brief-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  <ClipboardList className="size-4" />
                  문의 브리프 작성
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {serviceCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.08 * index }}
                >
                  <Card className="h-full rounded-xl border shadow-sm bg-card/85 backdrop-blur">
                    <CardHeader className="gap-3 px-5 pt-5">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        {index === 0 ? <Sparkles className="size-5" /> : index === 1 ? <BriefcaseBusiness className="size-5" /> : <ArrowUpRight className="size-5" />}
                      </div>
                      <CardTitle className="text-lg font-semibold">{card.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5">
                      <CardDescription className="text-sm leading-6">
                        {card.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="rounded-3xl border shadow-sm">
              <CardHeader className="gap-2 border-b">
                <CardTitle className="text-2xl font-semibold">이런 요청과 잘 맞습니다</CardTitle>
                <CardDescription className="text-sm leading-6">
                  의뢰 내용을 짧게만 보내도 되지만, 아래 항목이 선명할수록 더 빠르게 판단할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 py-6 md:grid-cols-2">
                {fitItems.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-xl border bg-muted/30 p-4">
                    <div className="mt-0.5 flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check className="size-4" />
                    </div>
                    <p className="text-sm leading-6 text-foreground/90">{item}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.section>

          <motion.aside
            id="brief-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="lg:sticky lg:top-24"
          >
            <Card className="rounded-[28px] border shadow-sm">
              <CardHeader className="gap-3 border-b bg-muted/25">
                <Badge variant="secondary" className="w-fit rounded-full px-3 py-1 text-[11px] tracking-[0.18em] uppercase">
                  Inquiry Brief
                </Badge>
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-semibold">의뢰 내용을 정리해서 바로 보낼 수 있게 만들었습니다</CardTitle>
                  <CardDescription className="text-sm leading-6">
                    아래 내용을 채운 뒤 복사해서 DM이나 이메일에 붙여 넣으세요. 별도 백엔드 없이도
                    문의가 흐트러지지 않도록 최소한의 구조를 먼저 잡아둔 방식입니다.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 py-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">이름 / 팀명</span>
                    <input
                      className={inputClass}
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="예: 홍길동 / Acme 팀"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">회사 / 서비스</span>
                    <input
                      className={inputClass}
                      value={company}
                      onChange={(event) => setCompany(event.target.value)}
                      placeholder="예: 신규 커머스 서비스"
                    />
                  </label>
                </div>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">필요한 작업</span>
                  <input
                    className={inputClass}
                    value={projectType}
                    onChange={(event) => setProjectType(event.target.value)}
                    placeholder="예: 랜딩페이지 리디자인 / 관리자 화면 구축"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">핵심 목표</span>
                  <textarea
                    className={textareaClass}
                    value={goals}
                    onChange={(event) => setGoals(event.target.value)}
                    placeholder="무엇을 개선하고 싶은지, 왜 지금 필요한지 적어주세요."
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">희망 일정</span>
                    <input
                      className={inputClass}
                      value={timeline}
                      onChange={(event) => setTimeline(event.target.value)}
                      placeholder="예: 4월 중 착수, 2주 내 1차"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">예상 예산</span>
                    <input
                      className={inputClass}
                      value={budget}
                      onChange={(event) => setBudget(event.target.value)}
                      placeholder="예: 300~500만원"
                    />
                  </label>
                </div>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">참고 링크</span>
                  <input
                    className={inputClass}
                    value={reference}
                    onChange={(event) => setReference(event.target.value)}
                    placeholder="레퍼런스, 현재 서비스, 피그마 링크 등"
                  />
                </label>

                <div className="rounded-2xl border bg-muted/35 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">복사될 문의 템플릿</p>
                      <p className="text-xs text-muted-foreground">DM이나 이메일에 바로 붙여 넣을 수 있습니다.</p>
                    </div>
                    <Button type="button" variant="outline" className="rounded-xl" onClick={() => void handleCopy()}>
                      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                      {copied ? '복사됨' : '복사'}
                    </Button>
                  </div>
                  <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-xl bg-background p-4 text-sm leading-6 text-foreground">
                    {inquiryTemplate}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}
