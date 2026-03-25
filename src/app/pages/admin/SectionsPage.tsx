import { useEffect, useState, useCallback } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { getSections, saveSections } from '@/app/admin/services/api';
import type { AdminSection } from '@/app/admin/types';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';

export default function SectionsPage() {
  const [sections, setSections] = useState<AdminSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchSections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getSections();
      setSections(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '섹션을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSections();
  }, [fetchSections]);

  const handleToggle = (index: number) => {
    setSections((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], enabled: !next[index].enabled };
      return next;
    });
    setHasChanges(true);
    setSaveMessage(null);
  };

  const handleReorder = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    setSections((prev) => {
      const next = [...prev];
      const tempSort = next[index].sortOrder;
      next[index] = { ...next[index], sortOrder: next[targetIndex].sortOrder };
      next[targetIndex] = { ...next[targetIndex], sortOrder: tempSort };
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
    setHasChanges(true);
    setSaveMessage(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const updated = await saveSections(sections);
      setSections(updated);
      setHasChanges(false);
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

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Sections</h1>
        <div className="mt-6 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Sections</h1>
        <p className="mt-4 text-destructive">{error}</p>
        <Button variant="outline" className="mt-2" onClick={() => void fetchSections()}>
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sections</h1>
        <Button onClick={() => void handleSave()} disabled={!hasChanges || saving}>
          {saving ? '저장 중...' : '저장'}
        </Button>
      </div>

      {saveMessage && (
        <p
          className={`mt-3 text-sm ${
            saveMessage.type === 'success' ? 'text-green-600' : 'text-destructive'
          }`}
        >
          {saveMessage.text}
        </p>
      )}

      {sections.length === 0 ? (
        <p className="mt-6 text-muted-foreground">섹션이 없습니다.</p>
      ) : (
        <div className="space-y-3 mt-6">
          {sections.map((section, index) => (
            <Card
              key={section.key}
              className={`flex items-center justify-between p-4 ${
                !section.enabled ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                <Badge variant="outline" className="shrink-0">
                  {section.sortOrder}
                </Badge>
                <div className="min-w-0">
                  <p className="font-medium truncate">{section.name}</p>
                  {section.description && (
                    <p className="text-sm text-muted-foreground truncate">{section.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={section.enabled}
                    onChange={() => handleToggle(index)}
                    className="rounded"
                  />
                  활성
                </label>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleReorder(index, 'up')}
                  disabled={index === 0}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleReorder(index, 'down')}
                  disabled={index === sections.length - 1}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
