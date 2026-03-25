export interface AdminUser {
  id: string;
  githubLogin: string;
  avatarUrl: string | null;
  displayName: string | null;
  role: string;
}

export interface AdminSessionResponse {
  authenticated: boolean;
  user: AdminUser | null;
}

export interface AdminActivity {
  id: string;
  title: string;
  detail: string;
  type: 'project' | 'profile' | 'section' | 'auth';
  createdAt: string;
}

export interface AdminDashboardStats {
  projectsTotal: number;
  projectsPublished: number;
  projectsDraft: number;
  sectionsTotal: number;
  profileConfigured: boolean;
  lastUpdatedAt?: string | null;
}

export interface AdminDashboardResponse {
  stats: AdminDashboardStats;
  recentActivity?: AdminActivity[];
}

export interface AdminProject {
  id: string;
  name: string;
  description: string;
  url: string;
  tags: string[];
  category: string;
  longDescription: string;
  features: string[];
  techStack: string[];
  year: string;
  thumbnailUrl: string;
  sortOrder: number;
  isFeatured: boolean;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminProjectInput {
  id?: string;
  name: string;
  description: string;
  url: string;
  tags: string[];
  category: string;
  longDescription: string;
  features: string[];
  techStack: string[];
  year: string;
  thumbnailUrl: string;
  sortOrder: number;
  isFeatured: boolean;
  isPublished: boolean;
}

export interface AdminProfile {
  displayName: string;
  headline: string;
  bioShort: string;
  avatarUrl: string;
  githubUrl: string;
  instagramUrl: string;
  email: string;
  essayMarkdown: string;
  updatedAt?: string;
}

export interface AdminSection {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  sortOrder: number;
  updatedAt?: string;
}
