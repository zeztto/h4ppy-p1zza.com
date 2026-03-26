import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { Send, CheckCircle, AlertCircle, Building2, Mail, Phone, User, FileText, Clock, Wallet } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

const TURNSTILE_SITE_KEY = import.meta.env['VITE_TURNSTILE_SITE_KEY'] ?? '';

interface TurnstileApi {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId?: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
    onTurnstileLoad?: () => void;
  }
}

const PROJECT_TYPES = [
  '웹사이트 제작',
  '웹 애플리케이션',
  '모바일 앱',
  '랜딩페이지',
  '솔루션 개발',
  '유지보수 / 리뉴얼',
  '기타',
];

const BUDGET_RANGES = [
  '100만원 미만',
  '100만원 ~ 300만원',
  '300만원 ~ 500만원',
  '500만원 ~ 1,000만원',
  '1,000만원 이상',
  '협의 필요',
];

const TIMELINE_OPTIONS = [
  '1주 이내',
  '2주 ~ 1개월',
  '1개월 ~ 3개월',
  '3개월 이상',
  '일정 협의',
];

interface InquiryForm {
  name: string;
  email: string;
  phone: string;
  company: string;
  projectType: string;
  budget: string;
  timeline: string;
  description: string;
}

const initialForm: InquiryForm = {
  name: '',
  email: '',
  phone: '',
  company: '',
  projectType: '',
  budget: '',
  timeline: '',
  description: '',
};

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

export function InquiryPage() {
  const [form, setForm] = useState<InquiryForm>(initialForm);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const renderTurnstile = useCallback(() => {
    if (!TURNSTILE_SITE_KEY || !turnstileRef.current || widgetIdRef.current || !window.turnstile) {
      return;
    }

    widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      callback: (token: string) => setTurnstileToken(token),
      'expired-callback': () => setTurnstileToken(''),
      'error-callback': () => setTurnstileToken(''),
      theme: 'auto',
    });
  }, []);

  const readTurnstileResponse = useCallback(() => {
    if (!turnstileRef.current) {
      return '';
    }

    const responseInput = turnstileRef.current.querySelector<HTMLInputElement>(
      'input[name="cf-turnstile-response"]'
    );

    return responseInput?.value?.trim() ?? '';
  }, []);

  // Load Turnstile script
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    if (window.turnstile) {
      renderTurnstile();
      return;
    }

    if (document.getElementById('cf-turnstile-script')) return;

    const script = document.createElement('script');
    script.id = 'cf-turnstile-script';
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit';
    script.async = true;
    script.defer = true;

    window.onTurnstileLoad = () => {
      renderTurnstile();
    };

    document.head.appendChild(script);

    return () => {
      delete window.onTurnstileLoad;
    };
  }, [renderTurnstile]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    },
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const resolvedTurnstileToken = turnstileToken || readTurnstileResponse();

    if (!form.name.trim() || !form.email.trim() || !form.description.trim()) {
      setErrorMsg('이름, 이메일, 프로젝트 설명은 필수 입력 항목입니다.');
      return;
    }

    if (TURNSTILE_SITE_KEY && !resolvedTurnstileToken) {
      setErrorMsg('보안 인증을 완료해주세요.');
      return;
    }

    setStatus('submitting');

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          sourceUrl: window.location.href,
          turnstileToken: resolvedTurnstileToken,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? '제출에 실패했습니다.');
      }

      setStatus('success');
      setForm(initialForm);
      setTurnstileToken('');
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current);
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current);
      }
      setTurnstileToken('');
    }
  };

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto px-6 py-24 text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="size-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle className="size-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground">제출 완료</h1>
        <p className="text-muted-foreground mt-4 leading-relaxed">
          제작 의뢰가 성공적으로 접수되었습니다.<br />
          확인 후 빠른 시일 내에 연락드리겠습니다.
        </p>
        <Button
          className="mt-8"
          onClick={() => setStatus('idle')}
        >
          새 의뢰 작성
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto px-6 py-24"
    >
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-foreground">제작 의뢰</h1>
        <p className="text-muted-foreground mt-3 text-lg leading-relaxed">
          웹사이트, 앱, 솔루션 개발을 의뢰해주세요.<br className="hidden sm:block" />
          AI 퍼스트 원칙으로 효율적이고 혁신적인 결과물을 제공합니다.
        </p>
      </div>

      {/* Company info card */}
      <div className="rounded-xl border border-border/50 bg-muted/30 p-6 mb-10">
        <div className="flex items-start gap-4">
          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">쓰리더블유 (3W)</h2>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              20년 이상 경력의 시니어 개발자가 CTO로 이끄는 웹, 솔루션, 앱 전문 개발사입니다.
              AI 퍼스트 원칙으로 제품을 개발합니다.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-8">
        {/* Contact info */}
        <fieldset className="space-y-5">
          <legend className="text-sm font-semibold text-foreground mb-1">연락처 정보</legend>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputField
              icon={<User className="size-4" />}
              label="이름"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="홍길동"
            />
            <InputField
              icon={<Mail className="size-4" />}
              label="이메일"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="email@example.com"
            />
            <InputField
              icon={<Phone className="size-4" />}
              label="연락처"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="010-0000-0000 (선택)"
            />
            <InputField
              icon={<Building2 className="size-4" />}
              label="회사/기관"
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="회사명 (선택)"
            />
          </div>
        </fieldset>

        {/* Project details */}
        <fieldset className="space-y-5">
          <legend className="text-sm font-semibold text-foreground mb-1">프로젝트 정보</legend>

          <SelectField
            icon={<FileText className="size-4" />}
            label="프로젝트 유형"
            name="projectType"
            value={form.projectType}
            onChange={handleChange}
            options={PROJECT_TYPES}
            placeholder="유형을 선택하세요"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <SelectField
              icon={<Wallet className="size-4" />}
              label="예산 범위"
              name="budget"
              value={form.budget}
              onChange={handleChange}
              options={BUDGET_RANGES}
              placeholder="예산을 선택하세요"
            />
            <SelectField
              icon={<Clock className="size-4" />}
              label="희망 일정"
              name="timeline"
              value={form.timeline}
              onChange={handleChange}
              options={TIMELINE_OPTIONS}
              placeholder="일정을 선택하세요"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-foreground">
              프로젝트 설명 <span className="text-destructive">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={6}
              placeholder="만들고 싶은 서비스, 주요 기능, 참고 사이트 등을 자유롭게 설명해주세요."
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-y min-h-[120px]"
            />
          </div>
        </fieldset>

        {/* Turnstile */}
        {TURNSTILE_SITE_KEY && (
          <div className="flex justify-start">
            <div ref={turnstileRef} />
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          disabled={status === 'submitting'}
          className="w-full sm:w-auto"
        >
          {status === 'submitting' ? (
            <>
              <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              제출 중...
            </>
          ) : (
            <>
              <Send className="size-4" />
              의뢰 제출
            </>
          )}
        </Button>
      </form>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared form components                                              */
/* ------------------------------------------------------------------ */

function InputField({
  icon,
  label,
  name,
  type = 'text',
  value,
  onChange,
  required,
  placeholder,
}: {
  icon: React.ReactNode;
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        />
      </div>
    </div>
  );
}

function SelectField({
  icon,
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
}: {
  icon: React.ReactNode;
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors appearance-none"
        >
          <option value="">{placeholder ?? '선택하세요'}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </span>
      </div>
    </div>
  );
}
