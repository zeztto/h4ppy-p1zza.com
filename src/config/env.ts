function getEnvVar(key: keyof ImportMetaEnv, fallback?: string): string {
  const value = import.meta.env[key];

  if (!value && !fallback) {
    console.warn(`Environment variable ${key} is not set`);
    return '';
  }

  return value || fallback || '';
}

export const env = {
  app: {
    title: getEnvVar('VITE_APP_TITLE', 'Portfolio Website'),
    version: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  },
  features: {
    analytics: getEnvVar('VITE_ENABLE_ANALYTICS') === 'true',
    csp: getEnvVar('VITE_ENABLE_CSP') === 'true',
  },
} as const;

export const isProduction = import.meta.env.PROD;
export const isDevelopment = import.meta.env.DEV;
