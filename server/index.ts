import { config as loadEnv } from 'dotenv';
import { createApp } from './app.js';
import { env } from './env.js';

loadEnv({ path: '.env.local', override: false });
loadEnv();

const app = await createApp();

app.listen(env.port, () => {
  console.warn(`Server listening on ${env.port}`);
});
