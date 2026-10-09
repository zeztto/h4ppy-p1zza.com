import { Socket } from 'node:net';
import nodemailer, { type SendMailOptions, type SMTPTransportOptions } from 'nodemailer';
import type { InquiryRow } from '../../db/schema.js';
import { isValidInquiryEmail } from './inquiry-input.js';

export const INQUIRY_MAIL_RECIPIENT = 'cs@lmml.kr';
export const INQUIRY_MAIL_SEND_DEADLINE_MS = 30_000;
export type InquiryMailConfig = {
  host: string;
  port: 465 | 587;
  user: string;
  pass: string;
  from: string;
};
export type InquiryMailErrorCode =
  | 'send-timeout'
  | 'worker-shutdown'
  | 'recipient-rejected'
  | 'invalid-mail'
  | 'smtp-auth'
  | 'smtp-timeout'
  | 'smtp-dns'
  | 'smtp-connection'
  | 'smtp-tls'
  | 'smtp-envelope'
  | 'smtp-unavailable';
export class InquiryMailError extends Error {
  constructor(readonly code: InquiryMailErrorCode) {
    super(code);
  }
}
export function inquiryMailErrorCode(error: unknown): InquiryMailErrorCode {
  if (error instanceof InquiryMailError) return error.code;
  const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : null;
  switch (code) {
    case 'EAUTH':
      return 'smtp-auth';
    case 'ETIMEDOUT':
      return 'smtp-timeout';
    case 'EDNS':
      return 'smtp-dns';
    case 'ECONNECTION':
    case 'ESOCKET':
      return 'smtp-connection';
    case 'ETLS':
      return 'smtp-tls';
    case 'EENVELOPE':
      return 'smtp-envelope';
    default:
      return 'smtp-unavailable';
  }
}

export function buildInquiryMail(
  inquiry: InquiryRow,
  messageId: string,
  config: InquiryMailConfig,
  appOrigin: string
): SendMailOptions {
  if (
    !isValidInquiryEmail(inquiry.email) ||
    !/^<inquiry-[a-z\d_-]+@[a-z\d.-]+>$/i.test(messageId)
  ) {
    throw new InquiryMailError('invalid-mail');
  }
  const adminLink = new URL('/admin/inquiries', appOrigin).toString();
  const created = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(inquiry.createdAt);
  const provided = (value: string | null) => value || '미입력';
  return {
    from: config.from,
    to: INQUIRY_MAIL_RECIPIENT,
    envelope: { from: config.from, to: [INQUIRY_MAIL_RECIPIENT] },
    replyTo: { address: inquiry.email },
    subject: 'p1zza.kr 제작 의뢰 접수',
    messageId,
    date: inquiry.createdAt,
    text: [
      'p1zza.kr에서 제작 의뢰가 접수되었습니다.',
      '',
      `접수 번호: ${inquiry.id}`,
      `접수 시각: ${created} (한국 표준시 KST)`,
      `이름: ${inquiry.name}`,
      `이메일: ${inquiry.email}`,
      `연락처: ${provided(inquiry.phone)}`,
      `회사·단체: ${provided(inquiry.company)}`,
      `프로젝트 유형: ${provided(inquiry.projectType)}`,
      `예산: ${provided(inquiry.budget)}`,
      `일정: ${provided(inquiry.timeline)}`,
      `접수 출처: ${provided(inquiry.sourceUrl)}`,
      '',
      '프로젝트 설명:',
      inquiry.description,
      '',
      `관리 페이지: ${adminLink}`,
    ].join('\n'),
    disableFileAccess: true,
    disableUrlAccess: true,
  };
}

type MailTransport = {
  sendMail(mail: SendMailOptions): Promise<{ accepted: unknown[]; rejected: unknown[] }>;
  close(): void;
};
export type InquiryMailSender = {
  send(mail: SendMailOptions): Promise<void>;
  close(): Promise<void>;
};

export function createInquirySmtpSender(
  config: InquiryMailConfig,
  options: {
    transportFactory?: (options: SMTPTransportOptions) => MailTransport;
    socketFactory?: () => Socket;
    deadlineMs?: number;
  } = {}
): InquiryMailSender {
  const createTransport =
    options.transportFactory ?? ((smtp: SMTPTransportOptions) => nodemailer.createTransport(smtp));
  const active = new Set<() => void>();
  let closed = false;
  return {
    async send(mail) {
      if (closed) throw new InquiryMailError('worker-shutdown');
      const sockets = new Set<Socket>();
      const socketTimers = new Set<ReturnType<typeof setTimeout>>();
      let cancelled = false;
      let transport: MailTransport | undefined;
      let cancel!: (reason: InquiryMailError) => void;
      const cancellation = new Promise<never>((_resolve, reject) => {
        cancel = reject;
      });
      const shutdown = () => {
        cancelled = true;
        cancel(new InquiryMailError('worker-shutdown'));
      };
      active.add(shutdown);
      const deadline = setTimeout(
        () => {
          cancelled = true;
          cancel(new InquiryMailError('send-timeout'));
        },
        Math.min(options.deadlineMs ?? INQUIRY_MAIL_SEND_DEADLINE_MS, INQUIRY_MAIL_SEND_DEADLINE_MS)
      );
      try {
        transport = createTransport({
          host: config.host,
          port: config.port,
          secure: config.port === 465,
          requireTLS: true,
          tls: { rejectUnauthorized: true, minVersion: 'TLSv1.2', servername: config.host },
          auth: { user: config.user, pass: config.pass },
          forceAuth: true,
          connectionTimeout: 5000,
          greetingTimeout: 5000,
          dnsTimeout: 5000,
          socketTimeout: 10000,
          logger: false,
          debug: false,
          disableFileAccess: true,
          disableUrlAccess: true,
          // Owning the raw socket makes the total deadline abort a live TLS stream too.
          // Nodemailer's non-pooled close() alone does not close an active SMTP connection.
          getSocket: (_smtp, callback) => {
            if (cancelled) {
              callback(new InquiryMailError('worker-shutdown'));
              return;
            }
            const socket = (options.socketFactory ?? (() => new Socket()))();
            sockets.add(socket);
            let returned = false;
            const finish = (error: Error | null) => {
              if (returned) return;
              returned = true;
              clearTimeout(timer);
              socketTimers.delete(timer);
              callback(error, error ? false : { connection: socket });
            };
            // Includes Node's DNS lookup and connection establishment in one 5s bound.
            const timer = setTimeout(() => {
              finish(new InquiryMailError('smtp-connection'));
              socket.destroy();
            }, 5000);
            socketTimers.add(timer);
            socket.once('error', (error) => finish(error));
            socket.once('connect', () =>
              finish(cancelled ? new InquiryMailError('worker-shutdown') : null)
            );
            socket.connect({ host: config.host, port: config.port });
          },
        });
        const result = await Promise.race([transport.sendMail(mail), cancellation]);
        if (
          !result.accepted.some(
            (address) =>
              typeof address === 'string' && address.toLowerCase() === INQUIRY_MAIL_RECIPIENT
          ) ||
          result.rejected.length
        ) {
          throw new InquiryMailError('recipient-rejected');
        }
      } finally {
        clearTimeout(deadline);
        active.delete(shutdown);
        for (const timer of socketTimers) clearTimeout(timer);
        for (const socket of sockets) socket.destroy();
        transport?.close();
      }
    },
    async close() {
      closed = true;
      for (const cancel of active) cancel();
    },
  };
}
