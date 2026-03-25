import { assert } from './http.js';

export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  name?: string | null;
}

interface ExchangeTokenParams {
  clientId: string;
  clientSecret: string;
  code: string;
  redirectUri: string;
}

export function buildGitHubAuthorizeUrl(params: {
  clientId: string;
  redirectUri: string;
  state: string;
}) {
  const query = new URLSearchParams({
    client_id: params.clientId,
    redirect_uri: params.redirectUri,
    scope: 'read:user',
    state: params.state,
  });

  return `https://github.com/login/oauth/authorize?${query.toString()}`;
}

export async function exchangeGitHubCode(params: ExchangeTokenParams) {
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: params.clientId,
      client_secret: params.clientSecret,
      code: params.code,
      redirect_uri: params.redirectUri,
    }),
  });

  assert(response.ok, 502, 'GitHub token exchange failed');

  const body = (await response.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  assert(!body.error, 400, body.error_description ?? body.error ?? 'GitHub auth failed');
  assert(body.access_token, 502, 'GitHub access token missing');

  return body.access_token;
}

export async function fetchGitHubUser(accessToken: string) {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'h4ppy-p1zza-admin',
    },
  });

  assert(response.ok, 502, 'GitHub user lookup failed');

  return (await response.json()) as GitHubUser;
}
