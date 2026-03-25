import type {
  AdminDashboardResponse,
  AdminProject,
  AdminProjectInput,
  AdminProfile,
  AdminSection,
  AdminSessionResponse,
} from '../types';

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function readResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function getErrorMessage(status: number, body: unknown): string {
  if (typeof body === 'string' && body.trim()) {
    return body;
  }

  if (body && typeof body === 'object') {
    const error = (body as { error?: unknown }).error;
    if (typeof error === 'string' && error.trim()) {
      return error;
    }
  }

  return `요청에 실패했습니다. (${status})`;
}

export async function adminRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(path, {
    ...init,
    headers,
    credentials: 'include',
  });

  const body = await readResponseBody(response);

  if (!response.ok) {
    throw new ApiError(response.status, getErrorMessage(response.status, body), body);
  }

  return body as T;
}

export async function getSession() {
  return adminRequest<AdminSessionResponse>('/api/auth/session');
}

export async function logout() {
  await adminRequest<void>('/api/auth/logout', { method: 'POST' });
}

export function startLogin() {
  window.location.assign('/api/auth/github/start');
}

export async function getDashboard() {
  return adminRequest<AdminDashboardResponse>('/api/admin/dashboard');
}

export async function getProjects() {
  return adminRequest<AdminProject[]>('/api/admin/projects');
}

export async function createProject(payload: AdminProjectInput) {
  return adminRequest<AdminProject>('/api/admin/projects', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateProject(projectId: string, payload: AdminProjectInput) {
  return adminRequest<AdminProject>(`/api/admin/projects/${projectId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteProject(projectId: string) {
  await adminRequest<void>(`/api/admin/projects/${projectId}`, {
    method: 'DELETE',
  });
}

export async function reorderProjects(projectIds: string[]) {
  await adminRequest<void>('/api/admin/projects/reorder', {
    method: 'PUT',
    body: JSON.stringify({ projectIds }),
  });
}

export async function getProfile() {
  return adminRequest<AdminProfile>('/api/admin/profile');
}

export async function saveProfile(payload: AdminProfile) {
  return adminRequest<AdminProfile>('/api/admin/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function getSections() {
  return adminRequest<AdminSection[]>('/api/admin/sections');
}

export async function saveSections(sections: AdminSection[]) {
  return adminRequest<AdminSection[]>('/api/admin/sections', {
    method: 'PUT',
    body: JSON.stringify({ sections }),
  });
}
