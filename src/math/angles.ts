/** Angles, quadrants and the exact values every student should recognise. */

export const DEG = Math.PI / 180;

export const toRad = (deg: number) => deg * DEG;
export const toDeg = (rad: number) => rad / DEG;

/** Wrap any angle into [0, 360). */
export function normDeg(deg: number): number {
  const r = deg % 360;
  return r < 0 ? r + 360 : r === -0 ? 0 : r;
}

export const sinD = (deg: number) => Math.sin(toRad(deg));
export const cosD = (deg: number) => Math.cos(toRad(deg));
export const tanD = (deg: number) => Math.tan(toRad(deg));

/**
 * 1–4 for an angle strictly inside a quadrant, 0 for an angle on an axis
 * (0°, 90°, 180°, 270°), where the point sits between two quadrants.
 */
export function quadrant(deg: number): 0 | 1 | 2 | 3 | 4 {
  const d = normDeg(deg);
  if (d % 90 === 0) return 0;
  return (Math.floor(d / 90) + 1) as 1 | 2 | 3 | 4;
}

/** Is tan undefined here (cos θ = 0)? */
export const tanUndefined = (deg: number) => normDeg(deg) % 180 === 90;

export type TrigFn = 'sin' | 'cos' | 'tan';

// Exact values on the "special" angles, as text. Everything else is decimal.
const SIN_EXACT: Record<number, string> = {
  0: '0',
  30: '1/2',
  45: '√2/2',
  60: '√3/2',
  90: '1',
};
const TAN_EXACT: Record<number, string> = { 0: '0', 30: '√3/3', 45: '1', 60: '√3' };

/**
 * Exact value of sin/cos/tan at a multiple of 30° or 45°, e.g. "−√3/2";
 * `null` for any other angle, and "∞" style undefined tan returns null too.
 */
export function exactValue(fn: TrigFn, deg: number): string | null {
  const d = normDeg(Math.round(deg * 1e6) / 1e6);
  if (!Number.isInteger(d) || (d % 30 !== 0 && d % 45 !== 0)) return null;
  // Reference angle and sign, the "Cycle down / spin around" idea from the packet
  const ref = d <= 90 ? d : d <= 180 ? 180 - d : d <= 270 ? d - 180 : 360 - d;
  const q = quadrant(d);
  let value: string | undefined;
  let negative = false;
  if (fn === 'sin') {
    value = SIN_EXACT[ref];
    negative = d > 180 && d < 360;
  } else if (fn === 'cos') {
    value = SIN_EXACT[90 - ref];
    negative = d > 90 && d < 270;
  } else {
    if (tanUndefined(d)) return null;
    value = TAN_EXACT[ref];
    negative = q === 2 || q === 4;
  }
  if (value === undefined) return null;
  return negative && value !== '0' ? `−${value}` : value;
}

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/** Radians as a fraction of π for whole-degree angles: 60 → "π/3", 270 → "3π/2", 0 → "0". */
export function piFraction(deg: number): string | null {
  if (!Number.isInteger(deg)) return null;
  if (deg === 0) return '0';
  const sign = deg < 0 ? '−' : '';
  const n = Math.abs(deg);
  const g = gcd(n, 180);
  const top = n / g;
  const bottom = 180 / g;
  if (bottom > 12) return null; // 37° = 37π/180 helps nobody
  return `${sign}${top === 1 ? '' : top}π${bottom === 1 ? '' : `/${bottom}`}`;
}
