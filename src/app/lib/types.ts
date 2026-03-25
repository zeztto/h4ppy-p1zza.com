// Public API response types — match server/lib/content.ts mapper functions exactly

// Matches mapProject() in server/lib/content.ts
export interface PublicProject {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  year: string;
  thumbnailUrl: string;       // server defaults to '' via ?? ''
  thumbnail: string;          // alias field, same as thumbnailUrl
  longDescription: string;    // server defaults to '' via ?? ''
  tags: string[];
  features: string[];
  techStack: string[];
  isFeatured: boolean;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string | null;   // ISO timestamp or null
  updatedAt: string | null;   // ISO timestamp or null
}

// Matches mapProfile() in server/lib/content.ts
export interface PublicProfile {
  id: string;                  // always 'primary'
  displayName: string;
  headline: string;
  bioShort: string;
  avatarUrl: string;
  githubUrl: string;
  instagramUrl: string;
  email: string;
  essayMarkdown: string;
  updatedAt: string;
}

// Matches mapSection() in server/lib/content.ts
export interface PublicSection {
  id: string;
  key: string | null;
  name: string;
  description: string;
  sectionType: string;
  templateKey: string | null;
  contentJson: string;
  enabled: boolean;
  sortOrder: number;
  updatedAt: string;
}

// Matches mapSetting() in server/lib/content.ts
export interface PublicSetting {
  key: string;
  value: string;
  updatedAt: string;
}
