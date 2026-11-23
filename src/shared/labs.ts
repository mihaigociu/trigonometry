/**
 * The labs, in the suggested order. Titles and blurbs live in the i18n files
 * under `labs.<id>`; this file only holds what is not text.
 */

export type LabId = 'ratios' | 'unit-circle' | 'waves' | 'triangles' | 'angle-sum' | 'identities';

export interface LabInfo {
  id: LabId;
  /** Card accent colour on the home page. */
  accent: string;
  /** How hard: 1 = start here, 3 = for the brave. */
  stars: 1 | 2 | 3;
}

export const LABS: readonly LabInfo[] = [
  { id: 'ratios', accent: '#d42a45', stars: 1 },
  { id: 'unit-circle', accent: '#1e64c8', stars: 1 },
  { id: 'waves', accent: '#0a8a4a', stars: 2 },
  { id: 'triangles', accent: '#c26a00', stars: 2 },
  { id: 'angle-sum', accent: '#6a3fc8', stars: 3 },
  { id: 'identities', accent: '#b0237e', stars: 3 },
];

export const PHYSICS_URL = 'https://mihaigociu.github.io/physics-simulations/';
