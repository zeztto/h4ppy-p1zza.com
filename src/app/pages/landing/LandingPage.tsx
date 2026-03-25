import { useCallback } from 'react';
import { usePublicData } from '@/app/hooks/usePublicData';
import { useEditMode } from '@/app/components/inline-edit/EditModeProvider';
import { InlineEditToolbar } from '@/app/components/inline-edit/InlineEditToolbar';
import { SectionAdder } from '@/app/components/inline-edit/SectionAdder';
import { updateSection, deleteSection } from '@/app/admin/services/api';
import type { PublicProject, PublicProfile, PublicSection } from '@/app/lib/types';
import type {
  HeroContent,
  ProjectsSectionContent,
  ValuesContent,
  SkillsContent,
  ExperienceContent,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleEdit = useCallback((_section: PublicSection) => {
    // Placeholder: will open SectionEditorModal in a future task
  }, []);

  const handleAdd = useCallback(() => {
    // Placeholder: will open SectionEditorModal for new section in a future task
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
    </>
  );
}
