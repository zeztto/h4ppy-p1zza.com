import { useState } from 'react';
import { X, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import type { ExperienceContent } from '@/app/lib/section-content-types';
import { Button } from '@/app/components/ui/button';

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring';

interface ExperienceEditorProps {
  content: ExperienceContent;
  sectionId: string;
  onSave: (content: ExperienceContent) => void;
  onClose: () => void;
}

export function ExperienceEditor({ content, onSave, onClose }: ExperienceEditorProps) {
  const [title, setTitle] = useState(content.title);
  const [items, setItems] = useState(content.items.map((item) => ({ ...item })));

  const handleAddItem = () => {
    setItems([...items, { title: '', description: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: 'title' | 'description', value: string) => {
    setItems(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const handleReorder = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const next = [...items];
    const temp = next[index]!;
    next[index] = next[targetIndex]!;
    next[targetIndex] = temp;
    setItems(next);
  };

  const handleSave = () => {
    onSave({ title, items });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-background border-l border-border shadow-xl z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">주요 업무 편집</h2>
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
              placeholder="주요 업무"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">항목</label>
              <Button variant="outline" size="sm" onClick={handleAddItem}>
                <Plus className="h-4 w-4" />
                추가
              </Button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="p-3 border border-border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">항목 {index + 1}</span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleReorder(index, 'up')}
                      disabled={index === 0}
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleReorder(index, 'down')}
                      disabled={index === items.length - 1}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <input
                  type="text"
                  className={inputClass}
                  value={item.title}
                  onChange={(e) => handleUpdateItem(index, 'title', e.target.value)}
                  placeholder="제목"
                />
                <textarea
                  className={inputClass}
                  value={item.description}
                  onChange={(e) => handleUpdateItem(index, 'description', e.target.value)}
                  placeholder="설명"
                  rows={2}
                />
              </div>
            ))}

            {items.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">항목이 없습니다.</p>
            )}
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
