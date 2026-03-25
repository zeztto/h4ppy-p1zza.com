import { createHash } from 'node:crypto';
import { assert } from './http.js';

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export function resolveCloudinaryConfig(env: {
  cloudinaryCloudName: string;
  cloudinaryApiKey: string;
  cloudinaryApiSecret: string;
  cloudinaryUrl: string;
}): CloudinaryConfig | null {
  if (env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret) {
    return {
      cloudName: env.cloudinaryCloudName,
      apiKey: env.cloudinaryApiKey,
      apiSecret: env.cloudinaryApiSecret,
    };
  }

  if (!env.cloudinaryUrl) {
    return null;
  }

  const parsed = new URL(env.cloudinaryUrl);
  return {
    cloudName: parsed.hostname,
    apiKey: decodeURIComponent(parsed.username),
    apiSecret: decodeURIComponent(parsed.password),
  };
}

export function signCloudinaryUpload(
  config: CloudinaryConfig,
  payload: Record<string, string | number>
) {
  assert(config.cloudName && config.apiKey && config.apiSecret, 500, 'Cloudinary config missing');

  const sorted = Object.entries(payload)
    .filter(([, value]) => value !== '')
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  const signature = createHash('sha1')
    .update(`${sorted}${config.apiSecret}`)
    .digest('hex');

  return {
    signature,
    apiKey: config.apiKey,
    cloudName: config.cloudName,
    timestamp: String(payload['timestamp']),
  };
}
