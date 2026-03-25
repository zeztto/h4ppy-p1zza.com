import { useState } from 'react';
import { X } from 'lucide-react';
import type { ProjectsSectionContent } from '@/app/lib/section-content-types';
import { Button } from '@/app/components/ui/button';

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring';

interface ProjectsSectionEditorProps {
  content: ProjectsSectionContent;
  sectionId: string;
  onSave: (content: ProjectsSectionContent) => void;
  onClose: () => void;
}

export function ProjectsSectionEditor({ content, onSave, onClose }: ProjectsSectionEditorProps) {
  const [title, setTitle] = useState(content.title);
  const [maxItems, setMaxItems] = useState(content.maxItems);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(content.showFeaturedOnly);

  const handleSave = () => {
    onSave({ title, maxItems, showFeaturedOnly });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-background border-l border-border shadow-xl z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">프로젝트 섹션 편집</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">섹션 제목</label>
            <input
              type="text"
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Featured Projects"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              최대 표시 수
            </label>
            <input
              type="number"
              className={inputClass}
              value={maxItems}
              disabled={showFeaturedOnly}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v) && v >= 1 && v <= 20) setMaxItems(v);
              }}
              min={1}
              max={20}
            />
            <p className="text-xs text-muted-foreground mt-1">
              추천 프로젝트만 표시가 켜져 있으면 최대 표시 수 제한은 적용되지 않습니다.
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showFeaturedOnly}
                onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium">추천 프로젝트만 표시</span>
            </label>
          </div>
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
