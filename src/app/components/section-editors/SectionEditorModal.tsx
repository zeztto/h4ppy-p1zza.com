import { useState } from 'react';
import { X, Layout, FolderKanban, Heart, Cpu, Briefcase } from 'lucide-react';
import { createSection } from '@/app/admin/services/api';
import { DEFAULT_SECTION_CONTENT } from '@/data/site-content';
import type { TemplateKey } from '@/app/lib/section-content-types';
import { Button } from '@/app/components/ui/button';

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring';

interface SectionEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const TEMPLATES: Array<{
  key: TemplateKey;
  name: string;
  description: string;
  icon: typeof Layout;
}> = [
  { key: 'hero', name: '히어로', description: '메인 소개 영역', icon: Layout },
  { key: 'projects', name: '프로젝트', description: '프로젝트 목록', icon: FolderKanban },
  { key: 'values', name: '핵심 가치', description: '개발 철학 및 가치', icon: Heart },
  { key: 'skills', name: '기술 스택', description: '보유 기술 및 도구', icon: Cpu },
  { key: 'experience', name: '주요 업무', description: '제공하는 서비스', icon: Briefcase },
];

export function SectionEditorModal({ isOpen, onClose, onCreated }: SectionEditorModalProps) {
  const [tab, setTab] = useState<'template' | 'custom'>('template');
  const [customName, setCustomName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateTemplate = async (templateKey: TemplateKey) => {
    setCreating(true);
    setError(null);
    try {
      const tpl = TEMPLATES.find((t) => t.key === templateKey)!;
      await createSection({
        name: tpl.name,
        description: tpl.description,
        sectionType: 'template',
        templateKey,
        contentJson: JSON.stringify(DEFAULT_SECTION_CONTENT[templateKey]),
        enabled: true,
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '생성에 실패했습니다.');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateCustom = async () => {
    if (!customName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      await createSection({
        name: customName.trim(),
        description: '',
        sectionType: 'custom',
        templateKey: null,
        contentJson: JSON.stringify({ markdown: '', css: '' }),
        enabled: true,
      });
      onCreated();
      onClose();
      setCustomName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '생성에 실패했습니다.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-background border border-border rounded-xl shadow-xl w-full max-w-lg">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold">섹션 추가</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex border-b border-border">
            <button
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                tab === 'template'
                  ? 'border-b-2 border-primary text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setTab('template')}
            >
              템플릿
            </button>
            <button
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                tab === 'custom'
                  ? 'border-b-2 border-primary text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setTab('custom')}
            >
              커스텀
            </button>
          </div>

          <div className="p-4">
            {error && <p className="text-sm text-destructive mb-3">{error}</p>}

            {tab === 'template' ? (
              <div className="grid grid-cols-2 gap-3">
                {TEMPLATES.map((tpl) => {
                  const Icon = tpl.icon;
                  return (
                    <button
                      key={tpl.key}
                      disabled={creating}
                      onClick={() => void handleCreateTemplate(tpl.key)}
                      className="flex flex-col items-center gap-2 p-4 border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
                    >
                      <Icon className="h-6 w-6 text-primary" />
                      <span className="text-sm font-medium">{tpl.name}</span>
                      <span className="text-xs text-muted-foreground text-center">
                        {tpl.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">섹션 이름</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="새 커스텀 섹션"
                  />
                </div>
                <Button
                  className="w-full"
                  disabled={creating || !customName.trim()}
                  onClick={() => void handleCreateCustom()}
                >
                  {creating ? '생성 중...' : '생성'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
