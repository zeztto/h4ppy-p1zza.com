import { desc, eq } from 'drizzle-orm';
import { Router } from 'express';
import { nanoid } from 'nanoid';
import { inquiries } from '../../db/schema.js';
import { isValidKoreanPhoneNumber, PHONE_ERROR_MESSAGE } from '../../src/shared/phone.js';
import { mapInquiry } from '../lib/content.js';
import { env, isProduction } from '../env.js';
import { asyncHandler, assert, requireJsonObject } from '../lib/http.js';
import { verifyTurnstileToken } from '../lib/turnstile.js';
import { inquiryString, isValidInquiryEmail, safeHttpSourceUrl } from '../lib/inquiry-input.js';
import { createInquiryRateLimit } from '../lib/inquiry-rate-limit.js';
import { INQUIRY_VERIFICATION_UNAVAILABLE_MESSAGE } from '../../src/shared/inquiry-contract.js';
import { saveInquiryWithMail } from '../lib/inquiry-mail-outbox.js';

const INQUIRY_STATUSES = ['new', 'contacted', 'closed'] as const;

export function createPublicInquiryRouter() {
  const router = Router();

  router.post(
    '/',
    createInquiryRateLimit(),
    asyncHandler(async (req, res) => {
      const payload = requireJsonObject(req.body);
      const name = inquiryString(payload['name'], 'name');
      const email = inquiryString(payload['email'], 'email');
      const description = inquiryString(payload['description'], 'description');
      const turnstileToken = inquiryString(payload['turnstileToken'], 'turnstileToken');
      const phone = inquiryString(payload['phone'], 'phone') || null;
      const company = inquiryString(payload['company'], 'company') || null;
      const projectType = inquiryString(payload['projectType'], 'projectType') || null;
      const budget = inquiryString(payload['budget'], 'budget') || null;
      const timeline = inquiryString(payload['timeline'], 'timeline') || null;
      const rawSourceUrl = inquiryString(payload['sourceUrl'], 'sourceUrl');
      const sourceUrl = safeHttpSourceUrl(rawSourceUrl);
      assert(!rawSourceUrl || sourceUrl, 400, '유효한 HTTP 또는 HTTPS 출처 URL을 입력해주세요.');
      const userAgent = req.get('user-agent') ?? null;
      assert(!userAgent || userAgent.length <= 512, 400, 'User-Agent 값이 너무 깁니다.');

      assert(name, 400, '이름은 필수 입력 항목입니다.');
      assert(email, 400, '이메일은 필수 입력 항목입니다.');
      assert(description, 400, '프로젝트 설명은 필수 입력 항목입니다.');
      assert(isValidInquiryEmail(email), 400, '유효한 이메일 주소를 입력해주세요.');
      if (phone) assert(isValidKoreanPhoneNumber(phone), 400, PHONE_ERROR_MESSAGE);

      if (isProduction || env.turnstileSecretKey) {
        assert(turnstileToken, 400, '보안 인증을 완료해주세요.');
        const verification = await verifyTurnstileToken(turnstileToken, req.ip);
        const unavailable = verification.errorCodes.some((code) =>
          [
            'verification-busy',
            'verification-timeout',
            'verification-unavailable',
            'turnstile-not-configured',
          ].includes(code)
        );
        assert(!unavailable, 503, INQUIRY_VERIFICATION_UNAVAILABLE_MESSAGE);
        assert(verification.success, 400, '보안 인증에 실패했습니다. 다시 시도해주세요.');
      }

      const now = new Date();
      const row = {
        id: nanoid(),
        name,
        email,
        phone,
        company,
        projectType,
        budget,
        timeline,
        description,
        status: 'new',
        sourceUrl: sourceUrl ?? safeHttpSourceUrl(req.get('referer')),
        userAgent,
        ipAddress: req.ip ?? null,
        createdAt: now,
        updatedAt: now,
        resolvedAt: null,
      } as const;

      await saveInquiryWithMail(res.locals.db, row, env.inquiryMail !== null, env.appOrigin);

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
      assert(
        typeof payload['status'] === 'string' && payload['status'].length <= 32,
        400,
        'Invalid inquiry status'
      );
      const nextStatus = payload['status'].trim();
      assert(
        INQUIRY_STATUSES.includes(nextStatus as (typeof INQUIRY_STATUSES)[number]),
        400,
        'Invalid inquiry status'
      );

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
