/** Numbers as students write them: Romanian uses a decimal comma. */
import type { Locale } from '../i18n';

const cache = new Map<string, Intl.NumberFormat>();

export function num(lang: Locale, value: number, digits = 2, fixed = false): string {
  if (!Number.isFinite(value)) return '∞';
  const key = `${lang}|${digits}|${fixed}`;
  let f = cache.get(key);
  if (!f) {
    f = new Intl.NumberFormat(lang === 'ro' ? 'ro-RO' : 'en-GB', {
      minimumFractionDigits: fixed ? digits : 0,
      maximumFractionDigits: digits,
      useGrouping: false,
    });
    cache.set(key, f);
  }
  // Avoid "-0", and use a real minus sign
  const out = f.format(Math.abs(value) < 0.5 * 10 ** -digits ? 0 : value);
  return out.replace('-', '−');
}

/** An angle: "37°" or "37,5°". */
export const deg = (lang: Locale, value: number, digits = 1) => `${num(lang, value, digits)}°`;

/** A signed term for formulas: "+ 3", "− 2,5". */
export function signed(lang: Locale, value: number, digits = 2): string {
  return value < 0 ? `− ${num(lang, -value, digits)}` : `+ ${num(lang, value, digits)}`;
}
