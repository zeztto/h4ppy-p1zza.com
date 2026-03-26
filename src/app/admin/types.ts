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
  repoUrl: string;
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
  id: string;
  key: string | null;
  name: string;
  description: string;
  sectionType: string;
  templateKey: string | null;
  contentJson: string;
  enabled: boolean;
  sortOrder: number;
  updatedAt?: string;
}

export interface AdminSetting {
  key: string;
  value: string;
  updatedAt: string;
}

export interface AdminInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  projectType: string;
  budget: string;
  timeline: string;
  description: string;
  status: 'new' | 'contacted' | 'closed';
  sourceUrl: string;
  userAgent: string;
  ipAddress: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}
