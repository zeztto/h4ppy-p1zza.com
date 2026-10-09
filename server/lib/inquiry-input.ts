import { domainToASCII } from 'node:url';
import {
  INQUIRY_FIELD_LIMITS,
  getInquiryOverflowMessage,
  type InquiryField,
} from '../../src/shared/inquiry-contract.js';
import { assert } from './http.js';

function hasControlCharacter(value: string) {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code <= 0x1f || code === 0x7f) return true;
  }
  return false;
}

export function inquiryString(value: unknown, field: InquiryField) {
  if (value == null) return '';
  assert(typeof value === 'string', 400, `${field} must be a string`);
  assert(value.length <= INQUIRY_FIELD_LIMITS[field], 400, getInquiryOverflowMessage(field));
  return value.trim();
}

/** Bounded scans and label checks replace the former unbounded backtracking expression. */
export function isValidInquiryEmail(email: string) {
  if (email.length > INQUIRY_FIELD_LIMITS.email || /\s/u.test(email) || hasControlCharacter(email))
    return false;
  const separator = email.indexOf('@');
  if (separator < 1 || separator !== email.lastIndexOf('@') || separator > 64) return false;
  const local = email.slice(0, separator);
  if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;
  const rawDomain = email.slice(separator + 1);
  if ([...rawDomain].some((character) => '/\\:?#%[]'.includes(character))) return false;
  const domain = domainToASCII(rawDomain);
  if (!domain || domain.length > 253) return false;
  const labels = domain.split('.');
  return (
    labels.length > 1 &&
    labels.every(
      (label) =>
        label.length > 0 && label.length <= 63 && /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label)
    )
  );
}

export function safeHttpSourceUrl(value: string | null | undefined) {
  if (!value || value.length > INQUIRY_FIELD_LIMITS.sourceUrl || hasControlCharacter(value))
    return null;
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
    return url.href;
  } catch {
    return null;
  }
}
