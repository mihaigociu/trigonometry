/**
 * Identities from the packet (Pythagorean, angle sum, double and half angle,
 * product and sum formulas) plus look-alike "impostors" that are false.
 * x is the variable on the graph; B is a second angle set with a slider.
 */
import { cosD as c, sinD as s, tanD as t } from './angles';

export type Family = 'pythagoras' | 'sum' | 'double' | 'half' | 'product' | 'symmetry';

export interface Identity {
  id: string;
  family: Family;
  lhs: string;
  rhs: string;
  f: (x: number, B: number) => number;
  g: (x: number, B: number) => number;
  /** True identity, or an impostor that only looks right. */
  real: boolean;
  /** Uses the second angle B. */
  usesB?: boolean;
}

const sq = (v: number) => v * v;

export const IDENTITIES: readonly Identity[] = [
  { id: 'pyth1', family: 'pythagoras', lhs: 'sin²x + cos²x', rhs: '1', f: (x) => sq(s(x)) + sq(c(x)), g: () => 1, real: true },
  { id: 'pyth2', family: 'pythagoras', lhs: '1 + tan²x', rhs: '1 / cos²x', f: (x) => 1 + sq(t(x)), g: (x) => 1 / sq(c(x)), real: true },
  { id: 'fakePyth', family: 'pythagoras', lhs: 'sin x + cos x', rhs: '1', f: (x) => s(x) + c(x), g: () => 1, real: false },
  { id: 'sumSin', family: 'sum', lhs: 'sin(x + B)', rhs: 'sin x·cos B + cos x·sin B', f: (x, B) => s(x + B), g: (x, B) => s(x) * c(B) + c(x) * s(B), real: true, usesB: true },
  { id: 'sumCos', family: 'sum', lhs: 'cos(x + B)', rhs: 'cos x·cos B − sin x·sin B', f: (x, B) => c(x + B), g: (x, B) => c(x) * c(B) - s(x) * s(B), real: true, usesB: true },
  { id: 'diffCos', family: 'sum', lhs: 'cos(x − B)', rhs: 'cos x·cos B + sin x·sin B', f: (x, B) => c(x - B), g: (x, B) => c(x) * c(B) + s(x) * s(B), real: true, usesB: true },
  { id: 'fakeSum', family: 'sum', lhs: 'sin(x + B)', rhs: 'sin x + sin B', f: (x, B) => s(x + B), g: (x, B) => s(x) + s(B), real: false, usesB: true },
  { id: 'fakeDiff', family: 'sum', lhs: 'cos(x − B)', rhs: 'cos x − cos B', f: (x, B) => c(x - B), g: (x, B) => c(x) - c(B), real: false, usesB: true },
  { id: 'double1', family: 'double', lhs: 'sin 2x', rhs: '2·sin x·cos x', f: (x) => s(2 * x), g: (x) => 2 * s(x) * c(x), real: true },
  { id: 'double2', family: 'double', lhs: 'cos 2x', rhs: 'cos²x − sin²x', f: (x) => c(2 * x), g: (x) => sq(c(x)) - sq(s(x)), real: true },
  { id: 'double3', family: 'double', lhs: 'cos 2x', rhs: '1 − 2·sin²x', f: (x) => c(2 * x), g: (x) => 1 - 2 * sq(s(x)), real: true },
  { id: 'fakeDouble', family: 'double', lhs: 'sin 2x', rhs: '2·sin x', f: (x) => s(2 * x), g: (x) => 2 * s(x), real: false },
  { id: 'fakeDouble2', family: 'double', lhs: 'cos 2x', rhs: 'cos²x + sin²x', f: (x) => c(2 * x), g: (x) => sq(c(x)) + sq(s(x)), real: false },
  { id: 'half1', family: 'half', lhs: 'sin²x', rhs: '(1 − cos 2x) / 2', f: (x) => sq(s(x)), g: (x) => (1 - c(2 * x)) / 2, real: true },
  { id: 'half2', family: 'half', lhs: 'cos²x', rhs: '(1 + cos 2x) / 2', f: (x) => sq(c(x)), g: (x) => (1 + c(2 * x)) / 2, real: true },
  { id: 'fakeHalf', family: 'half', lhs: 'sin(x/2)', rhs: '(sin x) / 2', f: (x) => s(x / 2), g: (x) => s(x) / 2, real: false },
  { id: 'prod1', family: 'product', lhs: 'sin x·cos B', rhs: '½[sin(x + B) + sin(x − B)]', f: (x, B) => s(x) * c(B), g: (x, B) => (s(x + B) + s(x - B)) / 2, real: true, usesB: true },
  { id: 'prod2', family: 'product', lhs: 'sin x·sin B', rhs: '−½[cos(x + B) − cos(x − B)]', f: (x, B) => s(x) * s(B), g: (x, B) => -(c(x + B) - c(x - B)) / 2, real: true, usesB: true },
  { id: 'sum2prod', family: 'product', lhs: 'sin x + sin B', rhs: '2·sin((x + B)/2)·cos((x − B)/2)', f: (x, B) => s(x) + s(B), g: (x, B) => 2 * s((x + B) / 2) * c((x - B) / 2), real: true, usesB: true },
  { id: 'fakeProd', family: 'product', lhs: 'sin x·cos B', rhs: '½·sin(x + B)', f: (x, B) => s(x) * c(B), g: (x, B) => s(x + B) / 2, real: false, usesB: true },
  { id: 'sym1', family: 'symmetry', lhs: 'sin(180° − x)', rhs: 'sin x', f: (x) => s(180 - x), g: (x) => s(x), real: true },
  { id: 'sym2', family: 'symmetry', lhs: 'cos(−x)', rhs: 'cos x', f: (x) => c(-x), g: (x) => c(x), real: true },
  { id: 'sym3', family: 'symmetry', lhs: 'sin(90° − x)', rhs: 'cos x', f: (x) => s(90 - x), g: (x) => c(x), real: true },
  { id: 'fakeSym', family: 'symmetry', lhs: 'sin(−x)', rhs: 'sin x', f: (x) => s(-x), g: (x) => s(x), real: false },
];

/**
 * Check an identity numerically on many x (and B) values, ignoring points
 * where either side blows up (tan near 90°). Used by the tests to prove the
 * labels `real: true/false` are honest.
 */
export function holds(id: Identity, Bs: readonly number[] = [20, 50, 75, 130]): boolean {
  for (const B of id.usesB ? Bs : [0]) {
    for (let x = -360; x <= 360; x += 7) {
      const f = id.f(x, B);
      const g = id.g(x, B);
      if (!Number.isFinite(f) || !Number.isFinite(g) || Math.abs(f) > 1e6 || Math.abs(g) > 1e6) continue;
      if (Math.abs(f - g) > 1e-9 * Math.max(1, Math.abs(f))) return false;
    }
  }
  return true;
}
