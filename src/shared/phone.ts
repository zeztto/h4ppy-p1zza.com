const KOREAN_PHONE_NUMBER_PATTERN =
  /^(?:010\d{8}|01[1-9]\d{7}|02\d{7,8}|0[3-9][0-9]\d{7,8}|1(?:5|6|8)\d{6})$/;

export const PHONE_ERROR_MESSAGE = '유효한 전화번호를 입력해주세요.';

export function normalizePhoneForValidation(value: string) {
  return value.replace(/[^\d]/g, '');
}

export function hasPhoneInput(value: string) {
  return normalizePhoneForValidation(value).length > 0;
}

export function isValidKoreanPhoneNumber(value: string) {
  const normalized = normalizePhoneForValidation(value);
  return normalized.length > 0 && KOREAN_PHONE_NUMBER_PATTERN.test(normalized);
}
