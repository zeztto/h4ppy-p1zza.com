import { desc, eq } from 'drizzle-orm';
import { Router } from 'express';
import { nanoid } from 'nanoid';
import { inquiries } from '../../db/schema.js';
import { mapInquiry } from '../lib/content.js';
import { env, isProduction } from '../env.js';
import { asyncHandler, assert, requireJsonObject } from '../lib/http.js';
import { verifyTurnstileToken } from '../lib/turnstile.js';

function stringField(value: unknown, field: string, fallback = '') {
  if (value == null) {
    return fallback;
  }

  assert(typeof value === 'string', 400, `${field} must be a string`);
  return value.trim();
}

function toOptionalString(value: unknown, field: string) {
  const next = stringField(value, field);
  return next || null;
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getRequestIp(headers: Record<string, string | string[] | undefined>) {
  const forwardedFor = headers['x-forwarded-for'];

  if (Array.isArray(forwardedFor) && forwardedFor[0]) {
    return forwardedFor[0].split(',')[0]?.trim() ?? '';
  }

  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    return forwardedFor.split(',')[0]?.trim() ?? '';
  }

  const cfConnectingIp = headers['cf-connecting-ip'];
  if (Array.isArray(cfConnectingIp)) {
    return cfConnectingIp[0] ?? '';
  }

  return typeof cfConnectingIp === 'string' ? cfConnectingIp : '';
}

const INQUIRY_STATUSES = ['new', 'contacted', 'closed'] as const;

export function createPublicInquiryRouter() {
  const router = Router();

  router.post(
    '/',
    asyncHandler(async (req, res) => {
      const payload = requireJsonObject(req.body);
      const name = stringField(payload['name'], 'name');
      const email = stringField(payload['email'], 'email');
      const description = stringField(payload['description'], 'description');
      const turnstileToken = stringField(payload['turnstileToken'], 'turnstileToken');

      assert(name, 400, '이름은 필수 입력 항목입니다.');
      assert(email, 400, '이메일은 필수 입력 항목입니다.');
      assert(description, 400, '프로젝트 설명은 필수 입력 항목입니다.');
      assert(validateEmail(email), 400, '유효한 이메일 주소를 입력해주세요.');

      if (isProduction || env.turnstileSecretKey) {
        assert(turnstileToken, 400, '보안 인증을 완료해주세요.');

        const verification = await verifyTurnstileToken(turnstileToken, getRequestIp(req.headers));
        assert(verification.success, 400, '보안 인증에 실패했습니다. 다시 시도해주세요.');
      }

      const now = new Date();
      const row = {
        id: nanoid(),
        name,
        email,
        phone: toOptionalString(payload['phone'], 'phone'),
        company: toOptionalString(payload['company'], 'company'),
        projectType: toOptionalString(payload['projectType'], 'projectType'),
        budget: toOptionalString(payload['budget'], 'budget'),
        timeline: toOptionalString(payload['timeline'], 'timeline'),
        description,
        status: 'new',
        sourceUrl: toOptionalString(payload['sourceUrl'], 'sourceUrl') ?? req.get('referer') ?? null,
        userAgent: req.get('user-agent') ?? null,
        ipAddress: getRequestIp(req.headers) || req.ip || null,
        createdAt: now,
        updatedAt: now,
        resolvedAt: null,
      } as const;

      await res.locals.db.insert(inquiries).values(row);

      res.status(201).json({
        ok: true,
        id: row.id,
      });
    })
  );

  return router;
}

export function createAdminInquiryRouter() {
  const router = Router();

  router.get(
    '/',
    asyncHandler(async (_req, res) => {
      const rows = await res.locals.db.query.inquiries.findMany({
        orderBy: [desc(inquiries.createdAt)],
      });

      res.status(200).json(rows.map(mapInquiry));
    })
  );

  router.patch(
    '/:id',
    asyncHandler(async (req, res) => {
      const inquiryId = req.params['id'];
      assert(typeof inquiryId === 'string' && inquiryId.length > 0, 400, 'Inquiry id is required');

      const existing = await res.locals.db.query.inquiries.findFirst({
        where: eq(inquiries.id, inquiryId),
      });
      assert(existing, 404, 'Inquiry not found');

      const payload = requireJsonObject(req.body);
      const nextStatus = stringField(payload['status'], 'status');
      assert(INQUIRY_STATUSES.includes(nextStatus as (typeof INQUIRY_STATUSES)[number]), 400, 'Invalid inquiry status');

      const now = new Date();
      await res.locals.db
        .update(inquiries)
        .set({
          status: nextStatus,
          updatedAt: now,
          resolvedAt: nextStatus === 'closed' ? now : null,
        })
        .where(eq(inquiries.id, inquiryId));

      const updated = await res.locals.db.query.inquiries.findFirst({
        where: eq(inquiries.id, inquiryId),
      });
      assert(updated, 500, 'Updated inquiry missing');

      res.status(200).json(mapInquiry(updated));
    })
  );

  return router;
}
