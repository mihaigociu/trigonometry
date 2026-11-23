/** Word problems for the right-triangle lab: how tall is the tower? */

export interface TowerProblem {
  /** Distance from the observer to the base, metres. */
  distance: number;
  /** Angle of elevation to the top, degrees. */
  angle: number;
  /** Answer: distance · tan(angle), metres. */
  height: number;
}

export function towerProblem(rnd: () => number = Math.random): TowerProblem {
  const distance = 10 + 5 * Math.floor(rnd() * 9); // 10…50 m
  const angle = [20, 25, 30, 35, 40, 45, 50, 55, 60][Math.floor(rnd() * 9)]!;
  return { distance, angle, height: distance * Math.tan((angle * Math.PI) / 180) };
}

/** Within 3% (or 0.5 m) counts as right: students read the table to 4 digits. */
export function closeEnough(guess: number, answer: number): boolean {
  return Math.abs(guess - answer) <= Math.max(0.5, 0.03 * Math.abs(answer));
}
