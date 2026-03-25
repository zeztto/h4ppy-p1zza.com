import { useState } from 'react';
import { X } from 'lucide-react';
import type { HeroContent } from '@/app/lib/section-content-types';
import { Button } from '@/app/components/ui/button';

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring';

interface HeroEditorProps {
  content: HeroContent;
  sectionId: string;
  onSave: (content: HeroContent) => void;
  onClose: () => void;
}

export function HeroEditor({ content, onSave, onClose }: HeroEditorProps) {
  const [ctaText, setCtaText] = useState(content.ctaText);
  const [ctaLink, setCtaLink] = useState(content.ctaLink);
  const [showAvatar, setShowAvatar] = useState(content.showAvatar);
  const [layout, setLayout] = useState<HeroContent['layout']>(content.layout);

  const handleSave = () => {
    onSave({ ctaText, ctaLink, showAvatar, layout });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-background border-l border-border shadow-xl z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">히어로 섹션 편집</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">CTA 텍스트</label>
            <input
              type="text"
              className={inputClass}
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              placeholder="버튼 텍스트"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">CTA 링크</label>
            <input
              type="text"
              className={inputClass}
              value={ctaLink}
              onChange={(e) => setCtaLink(e.target.value)}
              placeholder="/portfolio"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showAvatar}
                onChange={(e) => setShowAvatar(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium">아바타 표시</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">레이아웃</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="layout"
                  value="centered"
                  checked={layout === 'centered'}
                  onChange={() => setLayout('centered')}
                />
                <span className="text-sm">중앙 정렬</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="layout"
                  value="left-aligned"
                  checked={layout === 'left-aligned'}
                  onChange={() => setLayout('left-aligned')}
                />
                <span className="text-sm">좌측 정렬</span>
              </label>
            </div>
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
