/**
 * The packet's picture proof of sin(A+B) and cos(A+B) (Derivation of Sum
 * identities, steps 1–3). All points sit in a unit-circle picture, origin O.
 *
 *   P: the tip of a radius 1 at angle A + B.
 *   Q: the foot of the perpendicular from P onto the line at angle A.
 *      |OQ| = cos B and |QP| = sin B (right triangle O-Q-P with angle B at O).
 *   Q's height is cos B · sin A, and going up from Q to P adds sin B · cos A
 *   (the small triangle at Q has the angle A at its top).
 */
import { cosD, sinD } from './angles';
import type { Pt } from './triangle';

export interface AngleSumFigure {
  O: Pt;
  P: Pt;
  Q: Pt;
  /** Below Q on the x axis. */
  Qx: Pt;
  /** Below P on the x axis. */
  Px: Pt;
  /** Level with Q, directly under P (the corner of the small red triangle). */
  corner: Pt;
  parts: {
    sinAcosB: number;
    cosAsinB: number;
    cosAcosB: number;
    sinAsinB: number;
  };
}

export function angleSumFigure(A: number, B: number): AngleSumFigure {
  const O = { x: 0, y: 0 };
  const P = { x: cosD(A + B), y: sinD(A + B) };
  const cosB = cosD(B);
  const Q = { x: cosB * cosD(A), y: cosB * sinD(A) };
  return {
    O,
    P,
    Q,
    Qx: { x: Q.x, y: 0 },
    Px: { x: P.x, y: 0 },
    corner: { x: P.x, y: Q.y },
    parts: {
      sinAcosB: sinD(A) * cosB,
      cosAsinB: cosD(A) * sinD(B),
      cosAcosB: cosD(A) * cosB,
      sinAsinB: sinD(A) * sinD(B),
    },
  };
}
