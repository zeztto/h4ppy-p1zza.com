/** Only absolute HTTP(S) URLs without credentials or control characters may be linked. */
export function getSafeExternalUrl(value: string): string | null {
  for (let index = 0; index < value.length; index++) {
    const code = value.charCodeAt(index);
    if (code < 32 || code === 127) return null;
  }
  if (/%(?:0[0-9a-f]|1[0-9a-f]|7f)/i.test(value)) return null;

  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    if (url.username || url.password) return null;
    return url.href;
  } catch {
    return null;
  }
}
