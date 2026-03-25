import { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  X,
} from 'lucide-react';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  reorderProjects,
} from '@/app/admin/services/api';
import type { AdminProject, AdminProjectInput } from '@/app/admin/types';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';

const emptyForm: AdminProjectInput = {
  name: '',
  description: '',
  url: '',
  category: '',
  year: '',
  thumbnailUrl: '',
  longDescription: '',
  tags: [],
  features: [],
  techStack: [],
  sortOrder: 0,
  isFeatured: false,
  isPublished: false,
};

function arrayToText(arr: string[]): string {
  return arr.join('\n');
}

function textToArray(text: string): string[] {
  return text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

interface FormState {
  name: string;
  description: string;
  url: string;
  category: string;
  year: string;
  thumbnailUrl: string;
  longDescription: string;
  tagsText: string;
  featuresText: string;
  techStackText: string;
  isFeatured: boolean;
  isPublished: boolean;
}

function projectToFormState(p: AdminProjectInput): FormState {
  return {
    name: p.name,
    description: p.description,
    url: p.url,
    category: p.category,
    year: p.year,
    thumbnailUrl: p.thumbnailUrl,
    longDescription: p.longDescription,
    tagsText: arrayToText(p.tags),
    featuresText: arrayToText(p.features),
    techStackText: arrayToText(p.techStack),
    isFeatured: p.isFeatured,
    isPublished: p.isPublished,
  };
}

function formStateToInput(f: FormState, sortOrder: number): AdminProjectInput {
  return {
    name: f.name,
    description: f.description,
    url: f.url,
    category: f.category,
    year: f.year,
    thumbnailUrl: f.thumbnailUrl,
    longDescription: f.longDescription,
    tags: textToArray(f.tagsText),
    features: textToArray(f.featuresText),
    techStack: textToArray(f.techStackText),
    sortOrder,
    isFeatured: f.isFeatured,
    isPublished: f.isPublished,
  };
}

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProject, setEditingProject] = useState<AdminProject | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<FormState>(projectToFormState(emptyForm));
  const [saving, setSaving] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getProjects();
      setProjects(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '프로젝트를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  const panelOpen = isCreating || editingProject !== null;

  const openCreate = () => {
    setEditingProject(null);
    setForm(projectToFormState(emptyForm));
    setIsCreating(true);
  };

  const openEdit = (project: AdminProject) => {
    setIsCreating(false);
    setEditingProject(project);
    setForm(projectToFormState(project));
  };

  const closePanel = () => {
    setIsCreating(false);
    setEditingProject(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isCreating) {
        const input = formStateToInput(form, projects.length);
        await createProject(input);
      } else if (editingProject) {
        const input = formStateToInput(form, editingProject.sortOrder);
        await updateProject(editingProject.id, input);
      }
      closePanel();
      await fetchProjects();
    } catch (err) {
      alert(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제에 실패했습니다.');
    }
  };

  const handleToggle = async (project: AdminProject, field: 'isPublished' | 'isFeatured') => {
    try {
      const updated = await updateProject(project.id, {
        ...project,
        [field]: !project[field],
      });
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch (err) {
      alert(err instanceof Error ? err.message : '업데이트에 실패했습니다.');
    }
  };

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const newProjects = [...projects];
    const a = newProjects[index]!;
    const b = newProjects[targetIndex]!;
    newProjects[index] = b;
    newProjects[targetIndex] = a;
    setProjects(newProjects);

    try {
      await reorderProjects(newProjects.map((p) => p.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : '정렬에 실패했습니다.');
      await fetchProjects();
    }
  };

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Projects</h1>
        <div className="flex-1" />
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${inputClass} pl-9 w-full sm:w-64`}
          />
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          새 프로젝트
        </Button>
      </div>

      {loading && (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      )}

      {error && (
        <div className="mt-6 text-destructive">
          <p>{error}</p>
          <Button variant="outline" className="mt-2" onClick={() => void fetchProjects()}>
            다시 시도
          </Button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <p className="mt-6 text-muted-foreground">
          {searchTerm ? '검색 결과가 없습니다.' : '프로젝트가 없습니다.'}
        </p>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="mt-6 divide-y divide-border rounded-lg border border-border">
          {filtered.map((project, index) => (
            <div key={project.id} className="flex items-center gap-4 p-4">
              {project.thumbnailUrl ? (
                <img
                  src={project.thumbnailUrl}
                  alt={project.name}
                  className="h-10 w-10 rounded object-cover shrink-0"
                />
              ) : (
                <div className="h-10 w-10 rounded bg-muted shrink-0" />
              )}

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{project.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {project.category && (
                    <Badge variant="secondary" className="text-xs">
                      {project.category}
                    </Badge>
                  )}
                </div>
              </div>

              <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={project.isPublished}
                  onChange={() => void handleToggle(project, 'isPublished')}
                  className="rounded"
                />
                공개
              </label>

              <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={project.isFeatured}
                  onChange={() => void handleToggle(project, 'isFeatured')}
                  className="rounded"
                />
                추천
              </label>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => void handleReorder(index, 'up')}
                  disabled={index === 0}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => void handleReorder(index, 'down')}
                  disabled={index === filtered.length - 1}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openEdit(project)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => void handleDelete(project.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-over panel */}
      {panelOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={closePanel} />
          <div className="fixed top-0 right-0 w-full max-w-lg h-full bg-background border-l border-border shadow-xl z-50 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {isCreating ? '새 프로젝트' : '프로젝트 편집'}
              </h2>
              <Button variant="ghost" size="icon" onClick={closePanel}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">이름 *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">설명</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">URL</label>
                <input
                  type="text"
                  value={form.url}
                  onChange={(e) => updateField('url', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">카테고리</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => updateField('category', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">연도</label>
                  <input
                    type="text"
                    value={form.year}
                    onChange={(e) => updateField('year', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">썸네일 URL</label>
                <input
                  type="text"
                  value={form.thumbnailUrl}
                  onChange={(e) => updateField('thumbnailUrl', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">상세 설명</label>
                <textarea
                  rows={4}
                  value={form.longDescription}
                  onChange={(e) => updateField('longDescription', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">태그 (한 줄에 하나씩)</label>
                <textarea
                  rows={3}
                  value={form.tagsText}
                  onChange={(e) => updateField('tagsText', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">주요 기능 (한 줄에 하나씩)</label>
                <textarea
                  rows={3}
                  value={form.featuresText}
                  onChange={(e) => updateField('featuresText', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">기술 스택 (한 줄에 하나씩)</label>
                <textarea
                  rows={3}
                  value={form.techStackText}
                  onChange={(e) => updateField('techStackText', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => updateField('isFeatured', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">추천 프로젝트</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) => updateField('isPublished', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">공개</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={() => void handleSave()} disabled={saving || !form.name.trim()}>
                  {saving ? '저장 중...' : '저장'}
                </Button>
                <Button variant="outline" onClick={closePanel}>
                  취소
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
