import { config as loadEnv } from 'dotenv';
import { createApp } from './app.js';
import { env } from './env.js';
import type { createDatabase } from '../db/client.js';
import { createInquirySmtpSender } from './lib/inquiry-mail.js';
import {
  createInquiryMailWorker,
  createPostgresInquiryMailStore,
} from './lib/inquiry-mail-outbox.js';

loadEnv({ path: '.env.local', override: false });
loadEnv();

const app = await createApp();

const database = app.locals['database'] as ReturnType<typeof createDatabase>;
const worker = env.inquiryMail
  ? createInquiryMailWorker(
      createPostgresInquiryMailStore(database.client),
      createInquirySmtpSender(env.inquiryMail),
      env.inquiryMail,
      env.appOrigin
    )
  : null;
const server = app.listen(env.port, () => {
  console.warn(`Server listening on ${env.port}`);
  worker?.start();
});

let shutdown: Promise<void> | undefined;
function close() {
  if (shutdown) return shutdown;
  shutdown = (async () => {
    const httpClosed = new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
    const deadline = setTimeout(() => server.closeAllConnections(), 10_000);
    deadline.unref();
    try {
      await worker?.stop();
      await httpClosed;
    } finally {
      clearTimeout(deadline);
      await database.client.end();
    }
  })();
  return shutdown;
}
server.on('error', () => {
  console.error(JSON.stringify({ event: 'server-startup', code: 'listen-failed' }));
  process.exitCode = 1;
  void close();
});
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    void close();
  });
}
