import { config as loadEnv } from 'dotenv';
import { readEnvironment } from './env-config.js';

loadEnv({ path: '.env.local', override: false });
loadEnv();

export const env = readEnvironment(process.env);

export const isProduction = env.nodeEnv === 'production';
