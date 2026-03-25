import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { saveSetting } from '@/app/admin/services/api';
import { Button } from '@/app/components/ui/button';

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring';

interface NavLink {
  label: string;
  path: string;
}

interface HeaderData {
  siteName: string;
  navLinks: NavLink[];
  showThemeToggle: boolean;
}

interface HeaderEditorProps {
  data: HeaderData;
  onSaved: () => void;
  onClose: () => void;
}

export function HeaderEditor({ data, onSaved, onClose }: HeaderEditorProps) {
  const [siteName, setSiteName] = useState(data.siteName);
  const [navLinks, setNavLinks] = useState<NavLink[]>(
    data.navLinks.map((link) => ({ ...link })),
  );
  const [showThemeToggle, setShowThemeToggle] = useState(data.showThemeToggle);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddLink = () => {
    setNavLinks([...navLinks, { label: '', path: '' }]);
  };

  const handleRemoveLink = (index: number) => {
    setNavLinks(navLinks.filter((_, i) => i !== index));
  };

  const handleUpdateLink = (index: number, field: keyof NavLink, value: string) => {
    setNavLinks(
      navLinks.map((link, i) => (i === index ? { ...link, [field]: value } : link)),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const headerData: HeaderData = { siteName, navLinks, showThemeToggle };
      await saveSetting('header', JSON.stringify(headerData));
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-background border-l border-border shadow-xl z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">헤더 설정</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">사이트 이름</label>
            <input
              type="text"
              className={inputClass}
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="사이트 이름"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">내비게이션 링크</label>
              <Button variant="outline" size="sm" onClick={handleAddLink}>
                <Plus className="h-4 w-4" />
                추가
              </Button>
            </div>

            {navLinks.map((link, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  className={inputClass}
                  value={link.label}
                  onChange={(e) => handleUpdateLink(index, 'label', e.target.value)}
                  placeholder="라벨"
                />
                <input
                  type="text"
                  className={inputClass}
                  value={link.path}
                  onChange={(e) => handleUpdateLink(index, 'path', e.target.value)}
                  placeholder="/경로"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-destructive"
                  onClick={() => handleRemoveLink(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {navLinks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">
                링크가 없습니다.
              </p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showThemeToggle}
                onChange={(e) => setShowThemeToggle(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium">테마 전환 버튼 표시</span>
            </label>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={() => void handleSave()} disabled={saving}>
            {saving ? '저장 중...' : '저장'}
          </Button>
        </div>
      </div>
    </>
  );
}
