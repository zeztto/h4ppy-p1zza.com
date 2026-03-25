import { usePublicData } from '@/app/hooks/usePublicData';
import type { PublicProject, PublicProfile, PublicSection } from '@/app/lib/types';
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
  updatedAt: '',
}));

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
    switch (section.key) {
      case 'projects':
        return <ProjectsSection key={section.key} projects={projects ?? []} />;
      case 'values':
        return <ValuesSection key={section.key} />;
      case 'skills':
        return <SkillsSection key={section.key} />;
      case 'experience':
        return <ExperienceSection key={section.key} />;
      default:
        return null;
    }
  };

  return (
    <>
      <HeroSection profile={profile ?? profileFallback} />
      {sortedSections.map(renderSection)}
    </>
  );
}
