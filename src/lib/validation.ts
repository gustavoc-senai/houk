/** Removes invisible characters commonly introduced by copy/paste or autofill. */
export function normalizeEmail(value: string) {
  return value.replace(/[\s\u200B-\u200D\uFEFF]/g, '').toLowerCase()
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value)
}
