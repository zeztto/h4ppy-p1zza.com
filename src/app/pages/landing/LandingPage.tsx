import { usePublicData } from '@/app/hooks/usePublicData';
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
  const { data: projects, loading: projectsLoading } =
    usePublicData<PublicProject[]>('projects');
  const { data: profile, loading: profileLoading } =
    usePublicData<PublicProfile>('profile', profileFallback);
  const { data: sections, loading: sectionsLoading } =
    usePublicData<PublicSection[]>('sections', sectionsFallback);

  const loading = projectsLoading || profileLoading || sectionsLoading;

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

  const sortedSections = (sections ?? sectionsFallback)
    .filter((s) => s.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);

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

  return <>{sortedSections.map(renderSection)}</>;
}
