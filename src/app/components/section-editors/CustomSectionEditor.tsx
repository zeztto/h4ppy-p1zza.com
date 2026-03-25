import { useState } from 'react';
import { X } from 'lucide-react';
import type { CustomSectionContent } from '@/app/lib/section-content-types';
import { Button } from '@/app/components/ui/button';
import { CustomSectionRenderer } from './CustomSectionRenderer';

const textareaClass =
  'w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm';

interface CustomSectionEditorProps {
  content: CustomSectionContent;
  sectionId: string;
  onSave: (content: CustomSectionContent) => void;
  onClose: () => void;
}

type TabKey = 'markdown' | 'css' | 'preview';

export function CustomSectionEditor({ content, sectionId, onSave, onClose }: CustomSectionEditorProps) {
  const [markdown, setMarkdown] = useState(content.markdown);
  const [css, setCss] = useState(content.css);
  const [tab, setTab] = useState<TabKey>('markdown');

  const handleSave = () => {
    onSave({ markdown, css });
  };

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: 'markdown', label: '마크다운' },
    { key: 'css', label: 'CSS' },
    { key: 'preview', label: '미리보기' },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-background border-l border-border shadow-xl z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">커스텀 섹션 편집</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex border-b border-border">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'border-b-2 border-primary text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'markdown' && (
            <textarea
              className={`${textareaClass} h-full min-h-[300px] resize-none`}
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="마크다운 또는 HTML을 입력하세요..."
            />
          )}

          {tab === 'css' && (
            <textarea
              className={`${textareaClass} h-full min-h-[300px] resize-none`}
              value={css}
              onChange={(e) => setCss(e.target.value)}
              placeholder="CSS 스타일을 입력하세요..."
            />
          )}

          {tab === 'preview' && (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <CustomSectionRenderer
                content={{ markdown, css }}
                sectionId={sectionId}
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSave}>저장</Button>
        </div>
      </div>
    </>
  );
}
