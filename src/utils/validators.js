export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());
export const isPhone = (v) => /^[6-9]\d{9}$/.test(String(v || '').replace(/\D/g, '').slice(-10));
export const isRequired = (v) => String(v ?? '').trim().length > 0;
export const minLen = (v, n) => String(v ?? '').trim().length >= n;

export function validate(fields, rules) {
  // rules: { fieldName: [{test: fn, msg: string}] }
  for (const [name, checks] of Object.entries(rules)) {
    for (const { test, msg } of checks) {
      if (!test(fields[name])) return msg;
    }
  }
  return null;
}
