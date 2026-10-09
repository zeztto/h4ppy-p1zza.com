/** Raw UTF-16 character limits, checked before trimming on both client and server. */
export const INQUIRY_FIELD_LIMITS = {
  name: 120,
  email: 254,
  phone: 32,
  company: 200,
  projectType: 120,
  budget: 120,
  timeline: 120,
  description: 10_000,
  sourceUrl: 2048,
  turnstileToken: 2048,
} as const;

export type InquiryField = keyof typeof INQUIRY_FIELD_LIMITS;

const FIELD_LABELS: Record<InquiryField, string> = {
  name: '이름은',
  email: '이메일은',
  phone: '전화번호는',
  company: '회사명은',
  projectType: '프로젝트 유형은',
  budget: '예산은',
  timeline: '일정은',
  description: '프로젝트 설명은',
  sourceUrl: '출처 URL은',
  turnstileToken: '보안 인증 값은',
};

export function getInquiryOverflowMessage(field: InquiryField) {
  return `${FIELD_LABELS[field]} ${INQUIRY_FIELD_LIMITS[field]}자 이하로 입력해주세요.`;
}

export const INQUIRY_RATE_LIMIT_MESSAGE = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
export const INQUIRY_VERIFICATION_UNAVAILABLE_MESSAGE =
  '보안 인증을 확인할 수 없습니다. 잠시 후 다시 시도해주세요.';
