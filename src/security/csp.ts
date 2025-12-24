/**
 * Content Security Policy Configuration
 *
 * CSP helps prevent XSS, clickjacking, and other code injection attacks
 */

export interface CSPDirectives {
  'default-src': string[];
  'script-src': string[];
  'style-src': string[];
  'img-src': string[];
  'font-src': string[];
  'connect-src': string[];
  'frame-src': string[];
  'object-src': string[];
  'base-uri': string[];
  'form-action': string[];
  'frame-ancestors': string[];
}

const isDevelopment = process.env.NODE_ENV === 'development';

export const cspDirectives: CSPDirectives = {
  'default-src': ["'self'"],

  // Scripts: Allow self and inline for Vite HMR in dev
  'script-src': [
    "'self'",
    ...(isDevelopment ? ["'unsafe-inline'", "'unsafe-eval'"] : []),
  ],

  // Styles: Allow self and inline (Tailwind, inline styles)
  'style-src': ["'self'", "'unsafe-inline'"],

  // Images: Allow self, data URIs, and external project screenshots
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https://ws-08-phopic-sgoz.vercel.app',
    'https://ws-07-password-generator.vercel.app',
    'https://ws-06-realtime-exchange.vercel.app',
    'https://ws-05-memomome.vercel.app',
  ],

  // Fonts: Allow self and data URIs
  'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],

  // Connections: Allow self and external APIs
  'connect-src': [
    "'self'",
    ...(isDevelopment ? ['ws:', 'wss:'] : []), // WebSocket for HMR
  ],

  // Frames: Restrict to specific external projects
  'frame-src': [
    "'self'",
    'https://ws-08-phopic-sgoz.vercel.app',
    'https://ws-07-password-generator.vercel.app',
    'https://ws-06-realtime-exchange.vercel.app',
    'https://ws-05-memomome.vercel.app',
  ],

  // Objects: Block all plugins (Flash, Java, etc.)
  'object-src': ["'none'"],

  // Base URI: Prevent base tag injection
  'base-uri': ["'self'"],

  // Forms: Only allow forms to submit to self
  'form-action': ["'self'"],

  // Frame Ancestors: Prevent clickjacking
  'frame-ancestors': ["'none'"],
};

export function generateCSPHeader(directives: CSPDirectives): string {
  return Object.entries(directives)
    .map(([key, value]) => `${key} ${value.join(' ')}`)
    .join('; ');
}
