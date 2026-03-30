/**
 * Input sanitization utilities for preventing XSS and injection attacks.
 * Used at system boundaries to clean untrusted input.
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export function escapeForLog(input: string): string {
  return input.replace(/[\n\r\t]/g, ' ').substring(0, 1000);
}

/** @deprecated Use sanitizeHtml instead */
export function legacyEscape(input: string): string {
  return sanitizeHtml(input);
}
