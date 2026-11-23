/**
 * Graphs of y = A · trig(b·x + φ) + k, with x in degrees, the form the
 * packet's graphing pages use (its example is y = 5 tan(⅘x + 20°) − 8).
 */
import { DEG, type TrigFn } from './angles';

export interface Wave {
  fn: TrigFn;
  /** Amplitude (vertical stretch). Negative flips the graph. */
  A: number;
  /** Coefficient of x: squeezes (>1) or stretches (<1) the graph sideways. */
  b: number;
  /** Phase angle φ in degrees. */
  phi: number;
  /** Vertical shift. */
  k: number;
}

export const PARENT: Record<TrigFn, Wave> = {
  sin: { fn: 'sin', A: 1, b: 1, phi: 0, k: 0 },
  cos: { fn: 'cos', A: 1, b: 1, phi: 0, k: 0 },
  tan: { fn: 'tan', A: 1, b: 1, phi: 0, k: 0 },
};

/** The "prime period": 360° for sin and cos, 180° for tan. */
export const primePeriod = (fn: TrigFn) => (fn === 'tan' ? 180 : 360);

/** Period of the modified graph: prime period ÷ |b|. */
export const period = (w: Wave) => primePeriod(w.fn) / Math.abs(w.b);

/**
 * How far the graph slides sideways: setting b·x + φ = 0 gives x = −φ/b.
 * Positive means right.
 */
export const shiftX = (w: Wave) => (w.b === 0 ? 0 : -w.phi / w.b);

export function evalWave(w: Wave, xDeg: number): number {
  const u = (w.b * xDeg + w.phi) * DEG;
  const t = w.fn === 'sin' ? Math.sin(u) : w.fn === 'cos' ? Math.cos(u) : Math.tan(u);
  return w.A * t + w.k;
}

/** x positions (degrees) of tan's vertical asymptotes inside [x0, x1]. */
export function asymptotes(w: Wave, x0: number, x1: number): number[] {
  if (w.fn !== 'tan' || w.b === 0) return [];
  // b·x + φ = 90 + 180n
  const at = (n: number) => (90 + 180 * n - w.phi) / w.b;
  const lo = Math.min((w.b * x0 + w.phi - 90) / 180, (w.b * x1 + w.phi - 90) / 180);
  const hi = Math.max((w.b * x0 + w.phi - 90) / 180, (w.b * x1 + w.phi - 90) / 180);
  const out: number[] = [];
  for (let n = Math.ceil(lo); n <= Math.floor(hi); n++) out.push(at(n));
  return out.sort((p, q) => p - q);
}

/**
 * Sample the graph as polylines over [x0, x1]. Tan is cut at each asymptote
 * so the plot doesn't draw a fake vertical line joining +∞ to −∞.
 */
export function sampleWave(w: Wave, x0: number, x1: number, steps = 600): [number, number][][] {
  const cuts = asymptotes(w, x0, x1);
  const bounds = [x0, ...cuts, x1];
  const segments: [number, number][][] = [];
  for (let i = 0; i < bounds.length - 1; i++) {
    // Stay a hair away from each asymptote
    const eps = cuts.length ? (x1 - x0) * 1e-4 : 0;
    const a = bounds[i]! + (i === 0 ? 0 : eps);
    const z = bounds[i + 1]! - (i === bounds.length - 2 ? 0 : eps);
    const n = Math.max(8, Math.round((steps * (z - a)) / (x1 - x0)));
    const seg: [number, number][] = [];
    for (let j = 0; j <= n; j++) {
      const x = a + ((z - a) * j) / n;
      seg.push([x, evalWave(w, x)]);
    }
    segments.push(seg);
  }
  return segments;
}

/**
 * Do two waves draw the same curve? Checked on the graph, not on the
 * numbers: A = −1 with φ = 180° is the same curve as A = 1, φ = 0°.
 */
export function sameCurve(p: Wave, q: Wave, x0 = -360, x1 = 360, tol = 0.08): boolean {
  if (p.fn === 'tan' || q.fn === 'tan') {
    if (p.fn !== q.fn) return false;
    // Compare away from asymptotes, where both values are finite and moderate
    let checked = 0;
    for (let x = x0; x <= x1; x += 1.7) {
      const yp = evalWave(p, x);
      const yq = evalWave(q, x);
      if (Math.abs(yp - p.k) > 6 * Math.abs(p.A) || Math.abs(yq - q.k) > 6 * Math.abs(q.A)) continue;
      if (Math.abs(yp - yq) > tol * 2) return false;
      checked++;
    }
    return checked > 50;
  }
  for (let x = x0; x <= x1; x += 2.5) {
    if (Math.abs(evalWave(p, x) - evalWave(q, x)) > tol) return false;
  }
  return true;
}

/** A random target for the "match the wave" game, from friendly values. */
export function randomTarget(level: 1 | 2 | 3, rnd: () => number = Math.random): Wave {
  const pick = <T>(xs: readonly T[]) => xs[Math.floor(rnd() * xs.length)]!;
  const fn: TrigFn = level === 3 ? pick(['sin', 'cos', 'tan'] as const) : pick(['sin', 'cos'] as const);
  const A = level === 1 ? pick([0.5, 1, 1.5, 2, 2.5, 3]) : pick([-3, -2, -1.5, -1, 0.5, 1, 1.5, 2, 3]);
  const b = level === 1 ? 1 : pick([0.5, 1, 2, 3]);
  const phi = level === 1 ? 0 : pick([-90, -60, -45, -30, 0, 30, 45, 60, 90]);
  const k = level === 1 ? pick([-2, -1, 0, 1, 2]) : pick([-3, -2, -1, 0, 1, 2, 3]);
  const w = { fn, A, b, phi, k };
  // Never hand out the starting graph itself
  return sameCurve(w, PARENT[fn]) ? randomTarget(level, rnd) : w;
}
