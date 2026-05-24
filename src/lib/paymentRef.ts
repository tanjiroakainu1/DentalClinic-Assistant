/** Clinic payment reference — e.g. GAL-20250524-K7M3P9 */
const REF_PREFIX = 'GAL';
const REF_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generatePaymentReference(existingRefs: Iterable<string> = []): string {
  const taken = new Set(existingRefs);
  const ymd = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  for (let attempt = 0; attempt < 64; attempt++) {
    let suffix = '';
    for (let i = 0; i < 6; i++) {
      suffix += REF_CHARS[Math.floor(Math.random() * REF_CHARS.length)];
    }
    const ref = `${REF_PREFIX}-${ymd}-${suffix}`;
    if (!taken.has(ref)) return ref;
  }

  return `${REF_PREFIX}-${Date.now().toString(36).toUpperCase()}`;
}

export function formatPaymentRefDisplay(ref?: string): string {
  return ref?.trim() || '—';
}
