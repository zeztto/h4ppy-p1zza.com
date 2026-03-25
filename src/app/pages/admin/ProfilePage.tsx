import { useEffect, useState } from 'react';
import { getProfile, saveProfile } from '@/app/admin/services/api';
import type { AdminProfile } from '@/app/admin/types';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';

const emptyProfile: AdminProfile = {
  displayName: '',
  headline: '',
  bioShort: '',
  avatarUrl: '',
  githubUrl: '',
  instagramUrl: '',
  email: '',
  essayMarkdown: '',
};

const profileFields: (keyof AdminProfile)[] = [
  'displayName',
  'headline',
  'bioShort',
  'avatarUrl',
  'githubUrl',
  'instagramUrl',
  'email',
  'essayMarkdown',
];

function computeCompleteness(form: AdminProfile): number {
  const filled = profileFields.filter((key) => {
    const v = form[key];
    return typeof v === 'string' && v.trim().length > 0;
  });
  return Math.round((filled.length / profileFields.length) * 100);
}

function parseEssayMarkdown(markdown: string) {
  const sections: Array<{ heading?: string; paragraphs: string[] }> = [];
  let currentSection: { heading?: string; paragraphs: string[] } = { paragraphs: [] };
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) return;
    currentSection.paragraphs.push(paragraphBuffer.join(' ').trim());
    paragraphBuffer = [];
  };

  const flushSection = () => {
    flushParagraph();
    if (currentSection.heading || currentSection.paragraphs.length > 0) {
      sections.push(currentSection);
    }
    currentSection = { paragraphs: [] };
  };

  markdown.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      return;
    }
    if (trimmed.startsWith('## ')) {
      flushSection();
      currentSection.heading = trimmed.slice(3).trim();
      return;
    }
    paragraphBuffer.push(trimmed);
  });

  flushSection();
  return sections;
}

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring';

export default function ProfilePage() {
  const [form, setForm] = useState<AdminProfile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const profile = await getProfile();
        setForm(profile);
      } catch (err) {
        setError(err instanceof Error ? err.message : '프로필을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    void fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const updated = await saveProfile(form);
      setForm(updated);
      setSaveMessage({ type: 'success', text: '저장되었습니다.' });
    } catch (err) {
      setSaveMessage({
        type: 'error',
        text: err instanceof Error ? err.message : '저장에 실패했습니다.',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key: keyof AdminProfile, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaveMessage(null);
  };

  const completeness = computeCompleteness(form);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold">프로필</h1>
        <div className="mt-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold">프로필</h1>
        <p className="mt-4 text-destructive">{error}</p>
      </div>
    );
  }

  const essaySections = parseEssayMarkdown(form.essayMarkdown);

  return (
    <div>
      <h1 className="text-2xl font-bold">프로필</h1>

      <div className="mt-6 flex flex-col lg:flex-row gap-8">
        {/* Left column: form */}
        <div className="lg:w-1/2 space-y-6">
          {/* Completeness indicator */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">프로필 완성도</span>
              <span className="text-sm font-medium">{completeness}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">표시 이름</label>
            <input
              type="text"
              value={form.displayName}
              onChange={(e) => updateField('displayName', e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">한 줄 소개</label>
            <input
              type="text"
              value={form.headline}
              onChange={(e) => updateField('headline', e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">짧은 소개</label>
            <textarea
              rows={3}
              value={form.bioShort}
              onChange={(e) => updateField('bioShort', e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">아바타 URL</label>
            <input
              type="text"
              value={form.avatarUrl}
              onChange={(e) => updateField('avatarUrl', e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">GitHub URL</label>
            <input
              type="text"
              value={form.githubUrl}
              onChange={(e) => updateField('githubUrl', e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Instagram URL</label>
            <input
              type="text"
              value={form.instagramUrl}
              onChange={(e) => updateField('instagramUrl', e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">이메일</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">에세이 (Markdown)</label>
            <textarea
              rows={12}
              value={form.essayMarkdown}
              onChange={(e) => updateField('essayMarkdown', e.target.value)}
              className={`${inputClass} min-h-[300px]`}
            />
          </div>

          {saveMessage && (
            <p
              className={
                saveMessage.type === 'success' ? 'text-green-600 text-sm' : 'text-destructive text-sm'
              }
            >
              {saveMessage.text}
            </p>
          )}

          <Button onClick={() => void handleSave()} disabled={saving}>
            {saving ? '저장 중...' : '저장'}
          </Button>
        </div>

        {/* Right column: preview */}
        <div className="lg:w-1/2">
          <div className="lg:sticky lg:top-6">
            <Card className="bg-card rounded-xl border border-border p-6">
              <CardContent className="p-0">
                <div className="flex flex-col items-center text-center mb-6">
                  {form.avatarUrl ? (
                    <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-primary/20 mb-4">
                      <img
                        src={form.avatarUrl}
                        alt={form.displayName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-muted mb-4" />
                  )}
                  <h2 className="text-xl font-bold">{form.displayName || '이름 없음'}</h2>
                  {form.headline && (
                    <p className="text-muted-foreground mt-1">{form.headline}</p>
                  )}
                  {form.bioShort && (
                    <p className="text-sm text-muted-foreground mt-2">{form.bioShort}</p>
                  )}
                </div>

                {essaySections.length > 0 && (
                  <article className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                    {essaySections.map((section, i) => (
                      <section key={section.heading ?? `s-${i}`} className="space-y-2">
                        {section.heading && (
                          <h3 className="text-base font-bold text-foreground">
                            {section.heading}
                          </h3>
                        )}
                        {section.paragraphs.map((p, j) => (
                          <p key={`${section.heading ?? 'intro'}-${j}`}>{p}</p>
                        ))}
                      </section>
                    ))}
                  </article>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
