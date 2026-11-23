/**
 * Everything about a triangle given its three corners: sides, angles, the
 * laws of sines and cosines, and the area formulas from the packet
 * (½·b·c·sin A, Heron, r·s and abc/4R).
 *
 * Naming follows the packet: side a is opposite corner A, and so on.
 */

export interface Pt {
  x: number;
  y: number;
}

export interface TriangleInfo {
  /** Side lengths: a = |BC|, b = |CA|, c = |AB|. */
  a: number;
  b: number;
  c: number;
  /** Angles in degrees at A, B and C. */
  A: number;
  B: number;
  C: number;
  area: number;
  /** Semi-perimeter s = (a + b + c) / 2. */
  s: number;
  /** Circumradius (circle through the corners) and its centre. */
  R: number;
  circumcenter: Pt;
  /** Inradius (circle touching the sides) and its centre. */
  r: number;
  incenter: Pt;
  kind: 'acute' | 'right' | 'obtuse';
  /** Too flat to be a useful triangle. */
  degenerate: boolean;
}

export const dist = (p: Pt, q: Pt) => Math.hypot(p.x - q.x, p.y - q.y);

/** Angle opposite side `opp` from the law of cosines, in degrees. */
export function angleFromSides(opp: number, s1: number, s2: number): number {
  const cos = (s1 * s1 + s2 * s2 - opp * opp) / (2 * s1 * s2);
  return (Math.acos(Math.min(1, Math.max(-1, cos))) * 180) / Math.PI;
}

/** Third side from two sides and the angle between them (law of cosines). */
export function lawOfCosinesSide(s1: number, s2: number, angleDeg: number): number {
  return Math.sqrt(s1 * s1 + s2 * s2 - 2 * s1 * s2 * Math.cos((angleDeg * Math.PI) / 180));
}

export function heron(a: number, b: number, c: number): number {
  const s = (a + b + c) / 2;
  return Math.sqrt(Math.max(0, s * (s - a) * (s - b) * (s - c)));
}

export function solveTriangle(PA: Pt, PB: Pt, PC: Pt): TriangleInfo {
  const a = dist(PB, PC);
  const b = dist(PC, PA);
  const c = dist(PA, PB);
  const A = angleFromSides(a, b, c);
  const B = angleFromSides(b, c, a);
  const C = 180 - A - B;
  const area = Math.abs((PB.x - PA.x) * (PC.y - PA.y) - (PC.x - PA.x) * (PB.y - PA.y)) / 2;
  const s = (a + b + c) / 2;
  const degenerate = area < 1e-9 || Math.min(A, B, C) < 0.5;
  const R = degenerate ? Infinity : (a * b * c) / (4 * area);
  const r = s > 0 ? area / s : 0;

  // Circumcentre from the perpendicular bisectors
  const d = 2 * (PA.x * (PB.y - PC.y) + PB.x * (PC.y - PA.y) + PC.x * (PA.y - PB.y));
  const n = (p: Pt) => p.x * p.x + p.y * p.y;
  const circumcenter = degenerate
    ? { x: NaN, y: NaN }
    : {
        x: (n(PA) * (PB.y - PC.y) + n(PB) * (PC.y - PA.y) + n(PC) * (PA.y - PB.y)) / d,
        y: (n(PA) * (PC.x - PB.x) + n(PB) * (PA.x - PC.x) + n(PC) * (PB.x - PA.x)) / d,
      };
  const p = a + b + c;
  const incenter = { x: (a * PA.x + b * PB.x + c * PC.x) / p, y: (a * PA.y + b * PB.y + c * PC.y) / p };

  const biggest = Math.max(A, B, C);
  const kind = Math.abs(biggest - 90) < 0.5 ? 'right' : biggest > 90 ? 'obtuse' : 'acute';
  return { a, b, c, A, B, C, area, s, R, circumcenter, r, incenter, kind, degenerate };
}

/** Foot of the perpendicular from p onto the line through q1 and q2. */
export function foot(p: Pt, q1: Pt, q2: Pt): Pt {
  const dx = q2.x - q1.x;
  const dy = q2.y - q1.y;
  const t = ((p.x - q1.x) * dx + (p.y - q1.y) * dy) / (dx * dx + dy * dy);
  return { x: q1.x + t * dx, y: q1.y + t * dy };
}
