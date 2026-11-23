# Trigonometry Playground · Trigonometrie în joacă

Interactive trigonometry labs for students, the sister site of the
[Physics Playground](https://mihaigociu.github.io/physics-simulations/).
Same stack (Astro 7 + Svelte 5, static), same look, Romanian and English.

The material follows Brent Hughes's trigonometry packet
(`(l) TRIG PACKET (JOINED).pdf`):

| Lab | What students do | Packet pages |
|---|---|---|
| 1. The right triangle | Drag the triangle; sin/cos/tan as ratios that don't change with size; Pythagoras → sin²+cos²=1; "how tall is the tower?" problems | table of sines, Pythagorean identities |
| 2. The unit circle | Spin a point; its height draws the sine wave; ASTC sign chart, reference angles, exact values, radians; "find the angle" challenge | "Calc part": spin around, sign chart |
| 3. The wave maker | y = A·trig(bx + φ) + k with sliders; period/shift/asymptotes; the packet's 5·tan(⅘x + 20°) − 8; "match the wave" game | Trig function graphing, pp. 1–6 |
| 4. Any triangle | Drag A, B, C; law of sines (= 2R, circumcircle), law of cosines, five area formulas (½bh, ½bc sin A, Heron, rs, abc/4R) | Derivation of trig laws; area formulas |
| 5. sin(A + B), step by step | The packet's picture proof of the angle-sum formulas, in 5 steps, with live A and B | Derivation of sum identities |
| 6. Identity or impostor? | Guess if a formula always holds, then see both sides graphed; real identities vs look-alikes | double/half angle, product/sum formulas |

Each lab has an explanation underneath (Markdown) and a 6-question quiz.

## Develop

Requires Node 22 or newer.

```bash
npm install
npm run dev      # http://localhost:4321/trigonometry/  (stop with: npx astro dev stop)
```

| Command | What it does |
|---|---|
| `npm test` | Unit tests (Vitest): the maths, the packet's worked example, every identity checked true/false, translations, quizzes |
| `npm run test:e2e` | Browser tests (Playwright, desktop + phone) on the built site; run `npm run build` first |
| `npm run check` | Type-check Astro, Svelte and TS |
| `npm run build` | Static site into `dist/` |

## Layout

```
src/
  math/      pure TS: angles & exact values, triangle solver, waves, identities, angle-sum figure
  labs/      one folder per lab (Svelte component, SVG scene)
  ui/        shared Svelte bits: Slider, Segmented, Toggle, Axes, Quiz, hero animation, SVG helpers
  content/   learn/<lang>/<lab>.md (explanations) and quiz/<lang>/<lab>.yaml
  i18n/      ro.json (reference) and en.json; a test keeps the keys in sync
  pages/     /<lang>/, /<lang>/<lab>/, /<lang>/<lab>/quiz/
```

Colours are fixed across the site: sin is red (vertical), cos blue
(horizontal), tan green.

## Deploy

Live site: <https://mihaigociu.github.io/trigonometry/>

Every push to `main` runs `.github/workflows/website.yml`, which checks,
tests, builds and publishes to GitHub Pages. One-time setup: in the repo on
GitHub, **Settings → Pages → Build and deployment → Source: GitHub Actions**.
