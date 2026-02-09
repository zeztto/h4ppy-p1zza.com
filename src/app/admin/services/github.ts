import { Octokit } from '@octokit/rest';

const REPO_OWNER = (import.meta.env['VITE_GITHUB_REPO_OWNER'] as string) || 'zeztto';
const REPO_NAME = (import.meta.env['VITE_GITHUB_REPO_NAME'] as string) || 'h4ppy-p1zza.com';

export interface GitHubFile {
  path: string;
  content: string;
  sha?: string;
}

export function createOctokit(token: string): Octokit {
  return new Octokit({ auth: token });
}

export async function getFileContent(
  octokit: Octokit,
  path: string
): Promise<{ content: string; sha: string } | null> {
  try {
    const response = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path,
    });

    if ('content' in response.data && response.data.type === 'file') {
      const content = atob(response.data.content.replace(/\n/g, ''));
      return { content, sha: response.data.sha };
    }
    return null;
  } catch (error) {
    if ((error as { status?: number }).status === 404) {
      return null;
    }
    throw error;
  }
}

export async function updateFile(
  octokit: Octokit,
  path: string,
  content: string,
  message: string,
  sha?: string
): Promise<void> {
  const encodedContent = btoa(unescape(encodeURIComponent(content)));

  const params: Parameters<typeof octokit.repos.createOrUpdateFileContents>[0] = {
    owner: REPO_OWNER,
    repo: REPO_NAME,
    path,
    message,
    content: encodedContent,
  };
  if (sha) {
    params.sha = sha;
  }
  await octokit.repos.createOrUpdateFileContents(params);
}

export async function getJsonFile<T>(
  octokit: Octokit,
  path: string
): Promise<{ data: T; sha: string } | null> {
  const result = await getFileContent(octokit, path);
  if (!result) return null;

  try {
    const data = JSON.parse(result.content) as T;
    return { data, sha: result.sha };
  } catch {
    console.error(`Failed to parse JSON from ${path}`);
    return null;
  }
}

export async function saveJsonFile<T>(
  octokit: Octokit,
  path: string,
  data: T,
  message: string,
  sha?: string
): Promise<void> {
  const content = JSON.stringify(data, null, 2);
  await updateFile(octokit, path, content, message, sha);
}
