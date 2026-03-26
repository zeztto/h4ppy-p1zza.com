import { env, isProduction } from '../env.js';

interface TurnstileVerificationResult {
  success: boolean;
  errorCodes: string[];
}

export async function verifyTurnstileToken(token: string, remoteIp?: string): Promise<TurnstileVerificationResult> {
  if (!env.turnstileSecretKey) {
    if (isProduction) {
      return {
        success: false,
        errorCodes: ['turnstile-not-configured'],
      };
    }

    return {
      success: true,
      errorCodes: [],
    };
  }

  const body = new URLSearchParams({
    secret: env.turnstileSecretKey,
    response: token,
  });

  if (remoteIp) {
    body.set('remoteip', remoteIp);
  }

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    return {
      success: false,
      errorCodes: ['turnstile-request-failed'],
    };
  }

  const payload = (await response.json()) as {
    success?: boolean;
    ['error-codes']?: string[];
  };

  return {
    success: payload.success === true,
    errorCodes: Array.isArray(payload['error-codes']) ? payload['error-codes'] : [],
  };
}
