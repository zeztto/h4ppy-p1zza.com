import { useEffect, useState, useCallback } from 'react';
import { ChevronUp, ChevronDown, Plus, Pencil, Trash2 } from 'lucide-react';
import { getSections, saveSections, updateSection, deleteSection } from '@/app/admin/services/api';
import type { AdminSection } from '@/app/admin/types';
import type {
  HeroContent,
  ProjectsSectionContent,
  ValuesContent,
  SkillsContent,
  ExperienceContent,
  CustomSectionContent,
} from '@/app/lib/section-content-types';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { SectionEditorModal } from '@/app/components/section-editors/SectionEditorModal';
import { HeroEditor } from '@/app/components/section-editors/HeroEditor';
import { ProjectsSectionEditor } from '@/app/components/section-editors/ProjectsSectionEditor';
import { ValuesEditor } from '@/app/components/section-editors/ValuesEditor';
import { SkillsEditor } from '@/app/components/section-editors/SkillsEditor';
import { ExperienceEditor } from '@/app/components/section-editors/ExperienceEditor';
import { CustomSectionEditor } from '@/app/components/section-editors/CustomSectionEditor';

function getContentPreview(section: AdminSection): string {
  try {
    const content: unknown = JSON.parse(section.contentJson || '{}');
    if (!content || typeof content !== 'object') return '';

    switch (section.templateKey) {
      case 'hero':
        return (content as HeroContent).layout ?? '';
      case 'projects': {
        const p = content as ProjectsSectionContent;
        return `최대 ${String(p.maxItems)}개`;
      }
      case 'values': {
        const v = content as ValuesContent;
        return `${String(v.items?.length ?? 0)}개 항목`;
      }
      case 'skills': {
        const s = content as SkillsContent;
        return `${String(s.categories?.length ?? 0)}개 카테고리`;
      }
      case 'experience': {
        const e = content as ExperienceContent;
        return `${String(e.items?.length ?? 0)}개 항목`;
      }
      default:
        if (section.sectionType === 'custom') {
          const c = content as CustomSectionContent;
          const len = c.markdown?.length ?? 0;
          return len > 0 ? `${String(len)}자` : '';
        }
        return '';
    }
  } catch {
    return '';
  }
}

function parseContentJson<T>(section: AdminSection): T {
  try {
    return JSON.parse(section.contentJson || '{}') as T;
  } catch {
    return {} as T;
  }
}

export default function SectionsPage() {
  const [sections, setSections] = useState<AdminSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSection, setEditingSection] = useState<AdminSection | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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
      const item = next[index]!;
      next[index] = { ...item, enabled: !item.enabled };
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
      const a = next[index]!;
      const b = next[targetIndex]!;
      next[index] = { ...a, sortOrder: b.sortOrder };
      next[targetIndex] = { ...b, sortOrder: a.sortOrder };
      const tmp = next[index]!;
      next[index] = next[targetIndex]!;
      next[targetIndex] = tmp;
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

  const handleContentSave = async (sectionId: string, content: unknown) => {
    try {
      await updateSection(sectionId, {
        contentJson: JSON.stringify(content),
      });
      setEditingSection(null);
      await fetchSections();
      setSaveMessage({ type: 'success', text: '콘텐츠가 저장되었습니다.' });
    } catch (err) {
      setSaveMessage({
        type: 'error',
        text: err instanceof Error ? err.message : '저장에 실패했습니다.',
      });
    }
  };

  const handleDelete = async (sectionId: string) => {
    try {
      await deleteSection(sectionId);
      setDeleteConfirmId(null);
      await fetchSections();
      setSaveMessage({ type: 'success', text: '섹션이 삭제되었습니다.' });
    } catch (err) {
      setSaveMessage({
        type: 'error',
        text: err instanceof Error ? err.message : '삭제에 실패했습니다.',
      });
    }
  };

  const renderEditor = () => {
    if (!editingSection) return null;

    const sectionId = editingSection.id;

    switch (editingSection.templateKey) {
      case 'hero':
        return (
          <HeroEditor
            content={parseContentJson<HeroContent>(editingSection)}
            sectionId={sectionId}
            onSave={(c) => void handleContentSave(sectionId, c)}
            onClose={() => setEditingSection(null)}
          />
        );
      case 'projects':
        return (
          <ProjectsSectionEditor
            content={parseContentJson<ProjectsSectionContent>(editingSection)}
            sectionId={sectionId}
            onSave={(c) => void handleContentSave(sectionId, c)}
            onClose={() => setEditingSection(null)}
          />
        );
      case 'values':
        return (
          <ValuesEditor
            content={parseContentJson<ValuesContent>(editingSection)}
            sectionId={sectionId}
            onSave={(c) => void handleContentSave(sectionId, c)}
            onClose={() => setEditingSection(null)}
          />
        );
      case 'skills':
        return (
          <SkillsEditor
            content={parseContentJson<SkillsContent>(editingSection)}
            sectionId={sectionId}
            onSave={(c) => void handleContentSave(sectionId, c)}
            onClose={() => setEditingSection(null)}
          />
        );
      case 'experience':
        return (
          <ExperienceEditor
            content={parseContentJson<ExperienceContent>(editingSection)}
            sectionId={sectionId}
            onSave={(c) => void handleContentSave(sectionId, c)}
            onClose={() => setEditingSection(null)}
          />
        );
      default:
        if (editingSection.sectionType === 'custom') {
          return (
            <CustomSectionEditor
              content={parseContentJson<CustomSectionContent>(editingSection)}
              sectionId={sectionId}
              onSave={(c) => void handleContentSave(sectionId, c)}
              onClose={() => setEditingSection(null)}
            />
          );
        }
        return null;
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
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4" />
            섹션 추가
          </Button>
          <Button onClick={() => void handleSave()} disabled={!hasChanges || saving}>
            {saving ? '저장 중...' : '저장'}
          </Button>
        </div>
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
          {sections.map((section, index) => {
            const preview = getContentPreview(section);
            const isTemplate = section.sectionType === 'template';
            return (
              <Card
                key={section.id}
                className={`flex items-center justify-between p-4 ${
                  !section.enabled ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <Badge variant="outline" className="shrink-0">
                    {section.sortOrder}
                  </Badge>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{section.name}</p>
                      <Badge variant={isTemplate ? 'default' : 'secondary'} className="text-xs shrink-0">
                        {isTemplate ? '템플릿' : '커스텀'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {section.description && (
                        <span className="truncate">{section.description}</span>
                      )}
                      {preview && (
                        <>
                          {section.description && <span>&middot;</span>}
                          <span className="shrink-0">{preview}</span>
                        </>
                      )}
                    </div>
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
                    onClick={() => setEditingSection(section)}
                    title="편집"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {deleteConfirmId === section.id ? (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => void handleDelete(section.id)}
                      >
                        삭제
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirmId(null)}
                      >
                        취소
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => setDeleteConfirmId(section.id)}
                      title="삭제"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
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
            );
          })}
        </div>
      )}

      <SectionEditorModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={() => void fetchSections()}
      />

      {renderEditor()}
    </div>
  );
}
