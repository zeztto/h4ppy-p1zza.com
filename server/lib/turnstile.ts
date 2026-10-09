import { INQUIRY_FIELD_LIMITS } from '../../src/shared/inquiry-contract.js';
import { env, isProduction } from '../env.js';

export interface TurnstileVerificationResult {
  success: boolean;
  errorCodes: string[];
}

interface VerificationOptions {
  secretKey: string;
  production: boolean;
  expectedHostname: string;
  timeoutMs?: number;
  maxConcurrent?: number;
  fetcher?: typeof fetch;
}

export function createTurnstileVerifier(options: VerificationOptions) {
  let active = 0;
  const timeoutMs = options.timeoutMs ?? 5000;
  const maxConcurrent = options.maxConcurrent ?? 8;
  const expectedHostname = options.expectedHostname.toLowerCase().replace(/\.$/, '');
  return async (token: string, remoteIp?: string): Promise<TurnstileVerificationResult> => {
    if (!token || token.length > INQUIRY_FIELD_LIMITS.turnstileToken)
      return { success: false, errorCodes: ['invalid-token-length'] };
    if (!options.secretKey)
      return {
        success: !options.production,
        errorCodes: options.production ? ['turnstile-not-configured'] : [],
      };
    if (active >= maxConcurrent) return { success: false, errorCodes: ['verification-busy'] };
    active += 1;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const body = new URLSearchParams({ secret: options.secretKey, response: token });
      if (remoteIp && remoteIp.length <= 64) body.set('remoteip', remoteIp);
      const verification = (async () => {
        const response = await (options.fetcher ?? fetch)(
          'https://challenges.cloudflare.com/turnstile/v0/siteverify',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body,
            signal: controller.signal,
          }
        );
        if (!response.ok) return { success: false, errorCodes: ['verification-unavailable'] };
        const payload: unknown = await response.json();
        if (!payload || typeof payload !== 'object' || Array.isArray(payload))
          return { success: false, errorCodes: ['verification-unavailable'] };
        const result = payload as Record<string, unknown>;
        if (result['success'] !== true) {
          const codes = Array.isArray(result['error-codes'])
            ? result['error-codes']
                .filter((code): code is string => typeof code === 'string' && code.length <= 128)
                .slice(0, 16)
            : [];
          return { success: false, errorCodes: codes };
        }
        if (
          typeof result['hostname'] !== 'string' ||
          result['hostname'].toLowerCase().replace(/\.$/, '') !== expectedHostname
        )
          return { success: false, errorCodes: ['invalid-hostname'] };
        return { success: true, errorCodes: [] };
      })();
      const deadline = new Promise<TurnstileVerificationResult>((resolve) => {
        timer = setTimeout(() => {
          controller.abort();
          resolve({ success: false, errorCodes: ['verification-timeout'] });
        }, timeoutMs);
      });
      return await Promise.race([verification, deadline]);
    } catch {
      return {
        success: false,
        errorCodes: [
          controller.signal.aborted ? 'verification-timeout' : 'verification-unavailable',
        ],
      };
    } finally {
      if (timer) clearTimeout(timer);
      active -= 1;
    }
  };
}

export const verifyTurnstileToken = createTurnstileVerifier({
  secretKey: env.turnstileSecretKey,
  production: isProduction,
  expectedHostname: new URL(env.appOrigin).hostname,
});
