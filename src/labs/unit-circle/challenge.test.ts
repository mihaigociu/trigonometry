import { describe, expect, it } from 'vitest';
import { makeTask, solves } from './challenge';
import { cosD, exactValue, sinD } from '../../math/angles';

describe('angle tasks', () => {
  it('always have an answer that fits the clue', () => {
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    for (let i = 0; i < 300; i++) {
      const task = makeTask(rnd);
      expect(task.answers.length).toBeGreaterThan(0);
      for (const a of task.answers) {
        expect(exactValue(task.fn, a)).toBe(task.value);
        const o = task.other === 'sin' ? sinD(a) : cosD(a);
        if (Math.abs(o) > 1e-9) expect(o > 0).toBe(task.positive);
      }
    }
  });

  it('a clue with a sign picks exactly one angle (away from the axes)', () => {
    const task = { fn: 'sin' as const, value: '−1/2', other: 'cos' as const, positive: true, answers: [330] };
    expect(solves(task, 331)).toBe(330);
    expect(solves(task, -30)).toBe(330);
    expect(solves(task, 210)).toBeNull();
  });
});
