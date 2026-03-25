export interface HeroContent {
  ctaText: string;
  ctaLink: string;
  showAvatar: boolean;
  layout: 'centered' | 'left-aligned';
}

export interface ProjectsSectionContent {
  title: string;
  maxItems: number;
  showFeaturedOnly: boolean;
}

export interface ValuesContent {
  title: string;
  items: Array<{ icon: string; title: string; description: string }>;
}

// Keeps string[] to match existing SkillsSection.tsx (spec had { name, level } but we simplify)
export interface SkillsContent {
  title: string;
  categories: Array<{ name: string; items: string[] }>;
}

// Omits icon field to match existing ExperienceSection.tsx
export interface ExperienceContent {
  title: string;
  items: Array<{ title: string; description: string }>;
}

export interface CustomSectionContent {
  markdown: string;
  css: string;
}

export type SectionType = 'template' | 'custom';
export type TemplateKey = 'hero' | 'projects' | 'values' | 'skills' | 'experience';

export type SectionContent =
  | HeroContent
  | ProjectsSectionContent
  | ValuesContent
  | SkillsContent
  | ExperienceContent
  | CustomSectionContent;
