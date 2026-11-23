import { describe, expect, it } from 'vitest';
import { cosD, exactValue, normDeg, piFraction, quadrant, sinD, tanUndefined } from './angles';
import { angleFromSides, foot, heron, lawOfCosinesSide, solveTriangle } from './triangle';
import { asymptotes, evalWave, period, randomTarget, sameCurve, sampleWave, shiftX, type Wave } from './waves';
import { IDENTITIES, holds } from './identities';
import { angleSumFigure } from './angleSum';
import { closeEnough, towerProblem } from './problems';

describe('angles', () => {
  it('wraps angles into [0, 360)', () => {
    expect(normDeg(370)).toBe(10);
    expect(normDeg(-30)).toBe(330);
    expect(normDeg(360)).toBe(0);
  });

  it('knows the quadrants and the axes', () => {
    expect([45, 135, 225, 315].map(quadrant)).toEqual([1, 2, 3, 4]);
    expect([0, 90, 180, 270, 360].map(quadrant)).toEqual([0, 0, 0, 0, 0]);
  });

  it('gives exact values with the right signs (ASTC)', () => {
    expect(exactValue('sin', 30)).toBe('1/2');
    expect(exactValue('cos', 30)).toBe('√3/2');
    expect(exactValue('sin', 210)).toBe('−1/2');
    expect(exactValue('cos', 135)).toBe('−√2/2');
    expect(exactValue('tan', 120)).toBe('−√3');
    expect(exactValue('tan', 225)).toBe('1');
    expect(exactValue('cos', 90)).toBe('0');
    expect(exactValue('sin', 270)).toBe('−1');
    expect(exactValue('tan', 90)).toBeNull();
    expect(exactValue('sin', 37)).toBeNull();
  });

  it('exact values agree with Math', () => {
    const parse = (v: string) =>
      Number(
        eval(v.replace('−', '-').replace('√2', 'Math.SQRT2').replace('√3', 'Math.sqrt(3)')),
      );
    for (let d = 0; d < 360; d += 15) {
      for (const [fn, f] of [
        ['sin', sinD],
        ['cos', cosD],
      ] as const) {
        const v = exactValue(fn, d);
        if (v) expect(parse(v)).toBeCloseTo(f(d), 10);
      }
    }
  });

  it('writes radians as fractions of π', () => {
    expect([0, 30, 45, 60, 90, 180, 270, 360, 135, -90].map(piFraction)).toEqual([
      '0', 'π/6', 'π/4', 'π/3', 'π/2', 'π', '3π/2', '2π', '3π/4', '−π/2',
    ]);
    expect(piFraction(37)).toBeNull();
  });

  it('tan is undefined only at 90° + n·180°', () => {
    expect(tanUndefined(90)).toBe(true);
    expect(tanUndefined(270)).toBe(true);
    expect(tanUndefined(-90)).toBe(true);
    expect(tanUndefined(180)).toBe(false);
  });
});

describe('triangle', () => {
  it('solves the 3-4-5 right triangle', () => {
    // Right angle at C
    const t = solveTriangle({ x: 4, y: 0 }, { x: 0, y: 3 }, { x: 0, y: 0 });
    expect(t.a).toBeCloseTo(3);
    expect(t.b).toBeCloseTo(4);
    expect(t.c).toBeCloseTo(5);
    expect(t.C).toBeCloseTo(90);
    expect(t.kind).toBe('right');
    expect(t.area).toBeCloseTo(6);
    expect(t.R).toBeCloseTo(2.5); // hypotenuse is a diameter
    expect(t.r).toBeCloseTo(1); // (3 + 4 − 5) / 2
    expect(t.circumcenter.x).toBeCloseTo(2);
    expect(t.circumcenter.y).toBeCloseTo(1.5);
  });

  it('obeys the laws of sines and cosines, and all area formulas agree', () => {
    const t = solveTriangle({ x: 0, y: 0 }, { x: 7, y: 1 }, { x: 2.5, y: 5 });
    const k = 2 * t.R;
    const sin = (d: number) => Math.sin((d * Math.PI) / 180);
    expect(t.a / sin(t.A)).toBeCloseTo(k);
    expect(t.b / sin(t.B)).toBeCloseTo(k);
    expect(t.c / sin(t.C)).toBeCloseTo(k);
    expect(lawOfCosinesSide(t.b, t.c, t.A)).toBeCloseTo(t.a);
    expect(t.A + t.B + t.C).toBeCloseTo(180);
    expect(heron(t.a, t.b, t.c)).toBeCloseTo(t.area);
    expect(0.5 * t.b * t.c * sin(t.A)).toBeCloseTo(t.area);
    expect(t.r * t.s).toBeCloseTo(t.area);
    expect((t.a * t.b * t.c) / (4 * t.R)).toBeCloseTo(t.area);
  });

  it('flags obtuse and flat triangles', () => {
    expect(solveTriangle({ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 1, y: 1 }).kind).toBe('obtuse');
    expect(solveTriangle({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }).degenerate).toBe(true);
  });

  it('angleFromSides and foot', () => {
    expect(angleFromSides(1, 1, 1)).toBeCloseTo(60);
    expect(foot({ x: 2, y: 5 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toEqual({ x: 2, y: 0 });
  });
});

describe('waves', () => {
  // The packet's worked example
  const example: Wave = { fn: 'tan', A: 5, b: 4 / 5, phi: 20, k: -8 };

  it("reproduces the packet's y = 5 tan(⅘x + 20°) − 8", () => {
    expect(period(example)).toBeCloseTo(225);
    expect(shiftX(example)).toBeCloseTo(-25);
    // Point B: the y-intercept, 5·tan 20° − 8 ≈ −6.18
    expect(evalWave(example, 0)).toBeCloseTo(-6.18, 2);
    // Point C: (31¼°, −3), where tan = 1
    expect(evalWave(example, 31.25)).toBeCloseTo(-3, 6);
    // Point A: the x-intercept near 47.5° (packet rounds arctan 1.6 to 58°)
    expect(evalWave(example, 47.5)).toBeCloseTo(0, 0);
    // Asymptotes where ⅘x + 20 = 90 + 180n: x = 87.5 and x = −137.5
    expect(asymptotes(example, -200, 200)).toEqual([-137.5, 87.5]);
  });

  it('sin and cos have period 360/|b|', () => {
    expect(period({ fn: 'sin', A: 1, b: 2, phi: 0, k: 0 })).toBe(180);
    expect(period({ fn: 'cos', A: 1, b: 0.5, phi: 0, k: 0 })).toBe(720);
  });

  it('cuts tan into one piece per branch', () => {
    const segs = sampleWave({ fn: 'tan', A: 1, b: 1, phi: 0, k: 0 }, -360, 360);
    expect(segs).toHaveLength(5); // asymptotes at −270, −90, 90, 270
    expect(sampleWave({ fn: 'sin', A: 1, b: 1, phi: 0, k: 0 }, -360, 360)).toHaveLength(1);
  });

  it('recognises the same curve written two ways', () => {
    expect(sameCurve({ fn: 'sin', A: -1, b: 1, phi: 180, k: 0 }, { fn: 'sin', A: 1, b: 1, phi: 0, k: 0 })).toBe(true);
    expect(sameCurve({ fn: 'sin', A: 1, b: 1, phi: 90, k: 0 }, { fn: 'cos', A: 1, b: 1, phi: 0, k: 0 })).toBe(true);
    expect(sameCurve({ fn: 'sin', A: 2, b: 1, phi: 0, k: 0 }, { fn: 'sin', A: 1, b: 1, phi: 0, k: 0 })).toBe(false);
    expect(sameCurve(example, { ...example })).toBe(true);
    expect(sameCurve(example, { ...example, k: -7 })).toBe(false);
  });

  it('random targets are never the starting graph', () => {
    let seed = 1;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    for (let i = 0; i < 200; i++) {
      const level = ((i % 3) + 1) as 1 | 2 | 3;
      const w = randomTarget(level, rnd);
      expect(sameCurve(w, { fn: w.fn, A: 1, b: 1, phi: 0, k: 0 })).toBe(false);
      if (level < 3) expect(w.fn).not.toBe('tan');
    }
  });
});

describe('identities', () => {
  it.each(IDENTITIES.map((i) => [i.id, i] as const))('%s is labelled honestly', (_, identity) => {
    expect(holds(identity)).toBe(identity.real);
  });

  it('has unique ids and a mix of real ones and impostors in each family', () => {
    expect(new Set(IDENTITIES.map((i) => i.id)).size).toBe(IDENTITIES.length);
    for (const fam of new Set(IDENTITIES.map((i) => i.family))) {
      const xs = IDENTITIES.filter((i) => i.family === fam);
      expect(xs.some((i) => i.real), fam).toBe(true);
    }
    expect(IDENTITIES.filter((i) => !i.real).length).toBeGreaterThanOrEqual(6);
  });
});

describe('angle sum figure', () => {
  it('splits sin(A+B) and cos(A+B) the way the packet draws it', () => {
    for (const [A, B] of [
      [30, 20],
      [10, 70],
      [45, 40],
    ] as const) {
      const f = angleSumFigure(A, B);
      expect(f.P.y).toBeCloseTo(f.parts.sinAcosB + f.parts.cosAsinB);
      expect(f.P.x).toBeCloseTo(f.parts.cosAcosB - f.parts.sinAsinB);
      expect(f.Q.y).toBeCloseTo(f.parts.sinAcosB);
      expect(f.P.y - f.Q.y).toBeCloseTo(f.parts.cosAsinB);
      expect(f.Q.x - f.P.x).toBeCloseTo(f.parts.sinAsinB);
      // O-Q-P has a right angle at Q
      const dot = f.Q.x * (f.P.x - f.Q.x) + f.Q.y * (f.P.y - f.Q.y);
      expect(dot).toBeCloseTo(0);
    }
  });
});

describe('tower problems', () => {
  it('height = distance · tan(angle)', () => {
    const p = towerProblem(() => 0.5);
    expect(p.height).toBeCloseTo(p.distance * Math.tan((p.angle * Math.PI) / 180));
    expect(closeEnough(p.height * 1.02, p.height)).toBe(true);
    expect(closeEnough(p.height * 1.2, p.height)).toBe(false);
  });
});
