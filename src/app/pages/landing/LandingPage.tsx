import { useCallback, useState } from 'react';
import { usePublicData } from '@/app/hooks/usePublicData';
import { useEditMode } from '@/app/components/inline-edit/EditModeProvider';
import { InlineEditToolbar } from '@/app/components/inline-edit/InlineEditToolbar';
import { SectionAdder } from '@/app/components/inline-edit/SectionAdder';
import { SectionEditorModal } from '@/app/components/section-editors/SectionEditorModal';
import { CustomSectionRenderer } from '@/app/components/section-editors/CustomSectionRenderer';
import { CustomSectionEditor } from '@/app/components/section-editors/CustomSectionEditor';
import { HeroEditor } from '@/app/components/section-editors/HeroEditor';
import { ValuesEditor } from '@/app/components/section-editors/ValuesEditor';
import { SkillsEditor } from '@/app/components/section-editors/SkillsEditor';
import { ExperienceEditor } from '@/app/components/section-editors/ExperienceEditor';
import { ProjectsSectionEditor } from '@/app/components/section-editors/ProjectsSectionEditor';
import { updateSection, deleteSection } from '@/app/admin/services/api';
import type { PublicProject, PublicProfile, PublicSection } from '@/app/lib/types';
import type {
  HeroContent,
  ProjectsSectionContent,
  ValuesContent,
  SkillsContent,
  ExperienceContent,
  CustomSectionContent,
  SectionContent,
} from '@/app/lib/section-content-types';
import { DEFAULT_SITE_PROFILE, DEFAULT_SITE_SECTIONS } from '@/data/site-content';
import { HeroSection } from './HeroSection';
import { ProjectsSection } from './ProjectsSection';
import { ValuesSection } from './ValuesSection';
import { SkillsSection } from './SkillsSection';
import { ExperienceSection } from './ExperienceSection';

const profileFallback: PublicProfile = {
  ...DEFAULT_SITE_PROFILE,
  id: 'primary',
  updatedAt: '',
  email: DEFAULT_SITE_PROFILE.email ?? '',
};

const sectionsFallback: PublicSection[] = DEFAULT_SITE_SECTIONS.map((s) => ({
  ...s,
  key: s.key ?? null,
  updatedAt: '',
}));

function parseContentJson<T>(json: string): T | undefined {
  if (!json || json === '{}') return undefined;
  try {
    return JSON.parse(json) as T;
  } catch {
    return undefined;
  }
}

export function LandingPage() {
  const { isEditMode } = useEditMode();
  const { data: projects, loading: projectsLoading } =
    usePublicData<PublicProject[]>('projects');
  const { data: profile, loading: profileLoading } =
    usePublicData<PublicProfile>('profile', profileFallback);
  const { data: sections, loading: sectionsLoading, refetch: refetchSections } =
    usePublicData<PublicSection[]>('sections', sectionsFallback);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<PublicSection | null>(null);

  const loading = projectsLoading || profileLoading || sectionsLoading;

  const allSections = (sections ?? sectionsFallback)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const handleMoveUp = useCallback(
    async (section: PublicSection, index: number) => {
      if (index === 0) return;
      const prev = allSections[index - 1];
      if (!prev) return;
      try {
        await Promise.all([
          updateSection(section.id, { sortOrder: prev.sortOrder }),
          updateSection(prev.id, { sortOrder: section.sortOrder }),
        ]);
        refetchSections();
      } catch (err) {
        console.error('Failed to move section up:', err);
      }
    },
    [allSections, refetchSections],
  );

  const handleMoveDown = useCallback(
    async (section: PublicSection, index: number) => {
      if (index >= allSections.length - 1) return;
      const next = allSections[index + 1];
      if (!next) return;
      try {
        await Promise.all([
          updateSection(section.id, { sortOrder: next.sortOrder }),
          updateSection(next.id, { sortOrder: section.sortOrder }),
        ]);
        refetchSections();
      } catch (err) {
        console.error('Failed to move section down:', err);
      }
    },
    [allSections, refetchSections],
  );

  const handleToggleEnabled = useCallback(
    async (section: PublicSection) => {
      try {
        await updateSection(section.id, { enabled: !section.enabled });
        refetchSections();
      } catch (err) {
        console.error('Failed to toggle section:', err);
      }
    },
    [refetchSections],
  );

  const handleDelete = useCallback(
    async (section: PublicSection) => {
      try {
        await deleteSection(section.id);
        refetchSections();
      } catch (err) {
        console.error('Failed to delete section:', err);
      }
    },
    [refetchSections],
  );

  const handleEdit = useCallback((section: PublicSection) => {
    setEditingSection(section);
  }, []);

  const handleAdd = useCallback(() => {
    setAddModalOpen(true);
  }, []);

  const handleEditorSave = useCallback(
    async (content: SectionContent) => {
      if (!editingSection) return;
      try {
        await updateSection(editingSection.id, {
          contentJson: JSON.stringify(content),
        });
        refetchSections();
        setEditingSection(null);
      } catch (err) {
        console.error('Failed to save section:', err);
      }
    },
    [editingSection, refetchSections],
  );

  const handleEditorClose = useCallback(() => {
    setEditingSection(null);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // In edit mode show all sections; in normal mode only enabled ones
  const visibleSections = isEditMode
    ? allSections
    : allSections.filter((s) => s.enabled);

  const renderSection = (section: PublicSection) => {
    const tplKey = section.templateKey ?? section.key;
    switch (tplKey) {
      case 'hero': {
        const content = parseContentJson<HeroContent>(section.contentJson);
        return (
          <HeroSection
            key={section.id}
            profile={profile ?? profileFallback}
            {...(content ? { content } : {})}
          />
        );
      }
      case 'projects': {
        const content = parseContentJson<ProjectsSectionContent>(section.contentJson);
        return (
          <ProjectsSection
            key={section.id}
            projects={projects ?? []}
            {...(content ? { content } : {})}
          />
        );
      }
      case 'values': {
        const content = parseContentJson<ValuesContent>(section.contentJson);
        return (
          <ValuesSection
            key={section.id}
            {...(content ? { content } : {})}
          />
        );
      }
      case 'skills': {
        const content = parseContentJson<SkillsContent>(section.contentJson);
        return (
          <SkillsSection
            key={section.id}
            {...(content ? { content } : {})}
          />
        );
      }
      case 'experience': {
        const content = parseContentJson<ExperienceContent>(section.contentJson);
        return (
          <ExperienceSection
            key={section.id}
            {...(content ? { content } : {})}
          />
        );
      }
      default: {
        // Custom section or unknown template
        if (section.sectionType === 'custom') {
          const content = parseContentJson<CustomSectionContent>(section.contentJson);
          if (content) {
            return (
              <CustomSectionRenderer
                key={section.id}
                content={content}
                sectionId={section.id}
              />
            );
          }
        }
        return null;
      }
    }
  };

  const renderEditor = () => {
    if (!editingSection) return null;
    const tplKey = editingSection.templateKey ?? editingSection.key;

    if (editingSection.sectionType === 'custom') {
      const content = parseContentJson<CustomSectionContent>(editingSection.contentJson) ?? {
        markdown: '',
        css: '',
      };
      return (
        <CustomSectionEditor
          content={content}
          sectionId={editingSection.id}
          onSave={(c) => void handleEditorSave(c)}
          onClose={handleEditorClose}
        />
      );
    }

    switch (tplKey) {
      case 'hero': {
        const content = parseContentJson<HeroContent>(editingSection.contentJson) ?? {
          ctaText: '',
          ctaLink: '',
          showAvatar: true,
          layout: 'centered' as const,
        };
        return (
          <HeroEditor
            content={content}
            sectionId={editingSection.id}
            onSave={(c) => void handleEditorSave(c)}
            onClose={handleEditorClose}
          />
        );
      }
      case 'projects': {
        const content = parseContentJson<ProjectsSectionContent>(editingSection.contentJson) ?? {
          title: 'Featured Projects',
          maxItems: 6,
          showFeaturedOnly: false,
        };
        return (
          <ProjectsSectionEditor
            content={content}
            sectionId={editingSection.id}
            onSave={(c) => void handleEditorSave(c)}
            onClose={handleEditorClose}
          />
        );
      }
      case 'values': {
        const content = parseContentJson<ValuesContent>(editingSection.contentJson) ?? {
          title: '핵심 가치',
          items: [],
        };
        return (
          <ValuesEditor
            content={content}
            sectionId={editingSection.id}
            onSave={(c) => void handleEditorSave(c)}
            onClose={handleEditorClose}
          />
        );
      }
      case 'skills': {
        const content = parseContentJson<SkillsContent>(editingSection.contentJson) ?? {
          title: '기술 스택',
          categories: [],
        };
        return (
          <SkillsEditor
            content={content}
            sectionId={editingSection.id}
            onSave={(c) => void handleEditorSave(c)}
            onClose={handleEditorClose}
          />
        );
      }
      case 'experience': {
        const content = parseContentJson<ExperienceContent>(editingSection.contentJson) ?? {
          title: '주요 업무',
          items: [],
        };
        return (
          <ExperienceEditor
            content={content}
            sectionId={editingSection.id}
            onSave={(c) => void handleEditorSave(c)}
            onClose={handleEditorClose}
          />
        );
      }
      default:
        return null;
    }
  };

  return (
    <>
      {isEditMode && <SectionAdder onAdd={handleAdd} />}
      {visibleSections.map((section, index) => (
        <div key={section.id} className={!section.enabled && isEditMode ? 'opacity-50' : ''}>
          {isEditMode && (
            <div className="max-w-6xl mx-auto px-6">
              <InlineEditToolbar
                sectionName={section.name}
                sectionId={section.id}
                enabled={section.enabled}
                isFirst={index === 0}
                isLast={index === visibleSections.length - 1}
                onMoveUp={() => void handleMoveUp(section, index)}
                onMoveDown={() => void handleMoveDown(section, index)}
                onToggleEnabled={() => void handleToggleEnabled(section)}
                onEdit={() => handleEdit(section)}
                onDelete={() => void handleDelete(section)}
              />
            </div>
          )}
          {renderSection(section)}
          {isEditMode && <SectionAdder onAdd={handleAdd} />}
        </div>
      ))}

      {/* Add section modal */}
      <SectionEditorModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onCreated={() => refetchSections()}
      />

      {/* Editor panels */}
      {renderEditor()}
    </>
  );
}
