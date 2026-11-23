/** "Find the angle" tasks for the unit-circle lab, built from exact values. */
import { cosD, exactValue, sinD, tanD, type TrigFn } from '../../math/angles';

export interface AngleTask {
  /** The function whose value is given, e.g. sin θ = −1/2… */
  fn: TrigFn;
  value: string;
  /** …and the sign of a second function, to pick one answer out of two. */
  other: TrigFn;
  positive: boolean;
  /** Every angle in [0°, 360°) that fits. */
  answers: number[];
}

const fns: Record<TrigFn, (d: number) => number> = { sin: sinD, cos: cosD, tan: tanD };

export function makeTask(rnd: () => number = Math.random): AngleTask {
  const candidates: number[] = [];
  for (let d = 0; d < 360; d += 15) if (exactValue('sin', d) && (d % 90 !== 0 || rnd() < 0.3)) candidates.push(d);
  const d = candidates[Math.floor(rnd() * candidates.length)]!;
  const fn: TrigFn = (['sin', 'cos', 'tan'] as const)[Math.floor(rnd() * 3)]!;
  // tan isn't defined on the vertical axis; fall back to sin there
  const f = exactValue(fn, d) ? fn : 'sin';
  const value = exactValue(f, d)!;
  const others = (['sin', 'cos'] as const).filter((g) => g !== f && Math.abs(fns[g](d)) > 1e-9);
  const other: TrigFn = others[0] ?? (f === 'sin' ? 'cos' : 'sin');
  const positive = fns[other](d) > 0;
  const answers: number[] = [];
  for (let a = 0; a < 360; a += 15) {
    if (exactValue(f, a) !== value) continue;
    const o = fns[other](a);
    if (Math.abs(o) < 1e-9 && others.length) continue;
    if (others.length && o > 0 !== positive) continue;
    answers.push(a);
  }
  return { fn: f, value, other, positive, answers };
}

/** Does the angle (degrees, any range) solve the task, within `tol` degrees? */
export function solves(task: AngleTask, angle: number, tol = 2): number | null {
  const a = ((angle % 360) + 360) % 360;
  for (const ans of task.answers) {
    const diff = Math.abs(a - ans);
    if (Math.min(diff, 360 - diff) <= tol) return ans;
  }
  return null;
}
