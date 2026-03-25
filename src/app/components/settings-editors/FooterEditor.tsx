import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { saveSetting } from '@/app/admin/services/api';
import { Button } from '@/app/components/ui/button';

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring';

const SOCIAL_TYPES = ['github', 'instagram', 'email', 'twitter', 'linkedin'] as const;
type SocialType = (typeof SOCIAL_TYPES)[number];

interface SocialLink {
  type: SocialType;
  url: string;
}

interface FooterData {
  siteName: string;
  copyright: string;
  socialLinks: SocialLink[];
}

interface FooterEditorProps {
  data: FooterData;
  onSaved: () => void;
  onClose: () => void;
}

export function FooterEditor({ data, onSaved, onClose }: FooterEditorProps) {
  const [siteName, setSiteName] = useState(data.siteName);
  const [copyright, setCopyright] = useState(data.copyright);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(
    data.socialLinks.map((link) => ({ ...link })),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddLink = () => {
    setSocialLinks([...socialLinks, { type: 'github', url: '' }]);
  };

  const handleRemoveLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const handleUpdateLinkType = (index: number, type: SocialType) => {
    setSocialLinks(
      socialLinks.map((link, i) => (i === index ? { ...link, type } : link)),
    );
  };

  const handleUpdateLinkUrl = (index: number, url: string) => {
    setSocialLinks(
      socialLinks.map((link, i) => (i === index ? { ...link, url } : link)),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const footerData: FooterData = { siteName, copyright, socialLinks };
      await saveSetting('footer', JSON.stringify(footerData));
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
          <h2 className="text-lg font-semibold">푸터 설정</h2>
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

          <div>
            <label className="block text-sm font-medium mb-1">저작권 텍스트</label>
            <input
              type="text"
              className={inputClass}
              value={copyright}
              onChange={(e) => setCopyright(e.target.value)}
              placeholder="(c) 2024 All rights reserved."
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">소셜 링크</label>
              <Button variant="outline" size="sm" onClick={handleAddLink}>
                <Plus className="h-4 w-4" />
                추가
              </Button>
            </div>

            {socialLinks.map((link, index) => (
              <div key={index} className="flex items-center gap-2">
                <select
                  className={`${inputClass} w-32 shrink-0`}
                  value={link.type}
                  onChange={(e) => handleUpdateLinkType(index, e.target.value as SocialType)}
                >
                  {SOCIAL_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  className={inputClass}
                  value={link.url}
                  onChange={(e) => handleUpdateLinkUrl(index, e.target.value)}
                  placeholder="URL"
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

            {socialLinks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">
                소셜 링크가 없습니다.
              </p>
            )}
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
