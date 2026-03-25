import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { SkillsContent } from '@/app/lib/section-content-types';
import { Button } from '@/app/components/ui/button';

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring';

interface SkillsEditorProps {
  content: SkillsContent;
  sectionId: string;
  onSave: (content: SkillsContent) => void;
  onClose: () => void;
}

export function SkillsEditor({ content, onSave, onClose }: SkillsEditorProps) {
  const [title, setTitle] = useState(content.title);
  const [categories, setCategories] = useState(
    content.categories.map((cat) => ({ ...cat, items: [...cat.items] })),
  );

  const handleAddCategory = () => {
    setCategories([...categories, { name: '', items: [] }]);
  };

  const handleRemoveCategory = (catIndex: number) => {
    setCategories(categories.filter((_, i) => i !== catIndex));
  };

  const handleUpdateCategoryName = (catIndex: number, name: string) => {
    setCategories(
      categories.map((cat, i) => (i === catIndex ? { ...cat, name } : cat)),
    );
  };

  const handleAddSkill = (catIndex: number) => {
    setCategories(
      categories.map((cat, i) =>
        i === catIndex ? { ...cat, items: [...cat.items, ''] } : cat,
      ),
    );
  };

  const handleRemoveSkill = (catIndex: number, skillIndex: number) => {
    setCategories(
      categories.map((cat, i) =>
        i === catIndex
          ? { ...cat, items: cat.items.filter((_, si) => si !== skillIndex) }
          : cat,
      ),
    );
  };

  const handleUpdateSkill = (catIndex: number, skillIndex: number, value: string) => {
    setCategories(
      categories.map((cat, i) =>
        i === catIndex
          ? {
              ...cat,
              items: cat.items.map((s, si) => (si === skillIndex ? value : s)),
            }
          : cat,
      ),
    );
  };

  const handleSave = () => {
    onSave({ title, categories });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-background border-l border-border shadow-xl z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">기술 스택 편집</h2>
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
              placeholder="기술 스택"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">카테고리</label>
              <Button variant="outline" size="sm" onClick={handleAddCategory}>
                <Plus className="h-4 w-4" />
                카테고리 추가
              </Button>
            </div>

            {categories.map((cat, catIndex) => (
              <div key={catIndex} className="p-3 border border-border rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className={inputClass}
                    value={cat.name}
                    onChange={(e) => handleUpdateCategoryName(catIndex, e.target.value)}
                    placeholder="카테고리 이름"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-destructive"
                    onClick={() => handleRemoveCategory(catIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="pl-2 space-y-2">
                  {cat.items.map((skill, skillIndex) => (
                    <div key={skillIndex} className="flex items-center gap-2">
                      <input
                        type="text"
                        className={inputClass}
                        value={skill}
                        onChange={(e) => handleUpdateSkill(catIndex, skillIndex, e.target.value)}
                        placeholder="기술명"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 h-8 w-8 text-destructive"
                        onClick={() => handleRemoveSkill(catIndex, skillIndex)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleAddSkill(catIndex)}
                  >
                    <Plus className="h-3 w-3" />
                    기술 추가
                  </Button>
                </div>
              </div>
            ))}

            {categories.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                카테고리가 없습니다.
              </p>
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
