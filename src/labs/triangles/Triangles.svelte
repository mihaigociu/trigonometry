<script lang="ts">
  /**
   * Any-triangle lab: drag the corners A, B, C. Law of sines (with the
   * circumcircle, 2R), law of cosines, and five area formulas that always
   * give the same number.
   */
  import Segmented from '../../ui/Segmented.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { arcPath, arrowStep, startDrag, type Pt } from '../../ui/svg';
  import { t, tf, type Locale, type TKey } from '../../i18n';
  import { cosD, sinD } from '../../math/angles';
  import { foot, heron, solveTriangle } from '../../math/triangle';
  import { num } from '../../shared/format';

  let { lang }: { lang: Locale } = $props();
  const tr = (k: TKey) => t(lang, k);
  const n = (v: number, d = 2) => num(lang, v, d);

  const W = 720;
  const H = 480;
  const U = 40; // SVG units per length unit
  const XMAX = W / U;
  const YMAX = H / U;
  const toScreen = (p: Pt) => ({ x: p.x * U, y: H - p.y * U });

  type Corner = 'A' | 'B' | 'C';
  let pts = $state<Record<Corner, Pt>>({ A: { x: 3, y: 2 }, B: { x: 14, y: 2 }, C: { x: 7, y: 9.5 } });
  let snap = $state(true);
  let showCircum = $state(false);
  let showIn = $state(false);
  let showHeight = $state(false);
  let tab = $state<'sines' | 'cosines' | 'area'>('sines');
  let cosCorner = $state<Corner>('A');

  const T = $derived(solveTriangle(pts.A, pts.B, pts.C));
  const S = $derived({ A: toScreen(pts.A), B: toScreen(pts.B), C: toScreen(pts.C) });

  let svg: SVGSVGElement | undefined = $state();

  function move(c: Corner, p: Pt) {
    let x = Math.min(XMAX - 0.5, Math.max(0.5, p.x));
    let y = Math.min(YMAX - 0.5, Math.max(0.5, p.y));
    if (snap) {
      x = Math.round(x * 2) / 2;
      y = Math.round(y * 2) / 2;
    }
    const next = { ...pts, [c]: { x, y } };
    // Refuse to collapse two corners into one
    const others = (['A', 'B', 'C'] as const).filter((o) => o !== c);
    if (others.some((o) => Math.hypot(next[o].x - x, next[o].y - y) < 0.5)) return;
    pts = next;
  }

  const fromScreen = (p: Pt) => ({ x: p.x / U, y: (H - p.y) / U });

  function onKey(c: Corner, e: KeyboardEvent) {
    const st = arrowStep(e, 0.5);
    if (!st) return;
    e.preventDefault();
    move(c, { x: pts[c].x + st.x, y: pts[c].y + st.y });
  }

  // Angle arc at a corner, between the directions to the two other corners
  const dirDeg = (from: Pt, to: Pt) => (Math.atan2(-(to.y - from.y), to.x - from.x) * 180) / Math.PI;
  function arcAt(c: Corner) {
    const [p, q] = (['A', 'B', 'C'] as const).filter((o) => o !== c).map((o) => S[o]);
    const a0 = dirDeg(S[c], p!);
    let d = dirDeg(S[c], q!) - a0;
    d = ((d + 540) % 360) - 180;
    const mid = a0 + d / 2;
    return { path: arcPath(S[c], 30, a0, a0 + d), label: { x: S[c].x + 52 * cosD(mid), y: S[c].y - 52 * sinD(mid) + 6 } };
  }

  // Labels: corners pushed away from the centroid; sides at midpoints, pushed outwards
  const G = $derived({ x: (S.A.x + S.B.x + S.C.x) / 3, y: (S.A.y + S.B.y + S.C.y) / 3 });
  const away = (p: Pt, dist: number) => {
    const dx = p.x - G.x;
    const dy = p.y - G.y;
    const l = Math.hypot(dx, dy) || 1;
    return { x: p.x + (dx / l) * dist, y: p.y + (dy / l) * dist + 6 };
  };
  // Side label: just outside the side, anchored so the text never crosses it
  const sideLabel = (p: Pt, q: Pt) => {
    const m = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
    let nx = -(q.y - p.y);
    let ny = q.x - p.x;
    const l = Math.hypot(nx, ny) || 1;
    nx /= l;
    ny /= l;
    if (nx * (m.x - G.x) + ny * (m.y - G.y) < 0) {
      nx = -nx;
      ny = -ny;
    }
    const anchor = nx > 0.35 ? 'start' : nx < -0.35 ? 'end' : 'middle';
    return { x: m.x + nx * 12, y: m.y + ny * 12 + (ny > 0.35 ? 16 : ny < -0.35 ? -4 : 6), anchor };
  };

  const angleOf = { A: () => T.A, B: () => T.B, C: () => T.C };
  const sideOf = { A: () => T.a, B: () => T.b, C: () => T.c };
  const pair = $derived.by(() => {
    const [o1, o2] = (['A', 'B', 'C'] as const).filter((o) => o !== cosCorner);
    return { s1: sideOf[o1!](), s2: sideOf[o2!](), n1: o1!.toLowerCase(), n2: o2!.toLowerCase() };
  });

  const la = $derived(sideLabel(S.B, S.C));
  const lb = $derived(sideLabel(S.C, S.A));
  const lc = $derived(sideLabel(S.A, S.B));

  const hFoot = $derived(toScreen(foot(pts.C, pts.A, pts.B)));
  const kindKey = $derived(`triangles.kind_${T.kind}` as TKey);
  const corners = ['A', 'B', 'C'] as const;
  const colors: Record<Corner, string> = { A: '#d42a45', B: '#1e64c8', C: '#0a8a4a' };
</script>

<div class="lab">
  <div class="lab__scene">
    <svg bind:this={svg} viewBox="0 0 {W} {H}" role="img" aria-label={tf(lang, 'triangles.sceneLabel', { A: n(T.A, 0), B: n(T.B, 0), C: n(T.C, 0) })}>
      <!-- grid -->
      {#each Array.from({ length: Math.floor(XMAX) + 1 }, (_, i) => i) as i (i)}
        <line x1={i * U} x2={i * U} y1="0" y2={H} class="grid" />
      {/each}
      {#each Array.from({ length: Math.floor(YMAX) + 1 }, (_, i) => i) as i (i)}
        <line x1="0" x2={W} y1={H - i * U} y2={H - i * U} class="grid" />
      {/each}

      {#if showCircum && !T.degenerate && T.R < 60}
        {@const O = toScreen(T.circumcenter)}
        <circle cx={O.x} cy={O.y} r={T.R * U} fill="none" stroke="#c26a00" stroke-width="2.5" />
        <line x1={O.x} y1={O.y} x2={S.A.x} y2={S.A.y} stroke="#c26a00" stroke-width="2" stroke-dasharray="6 5" />
        <circle cx={O.x} cy={O.y} r="4" fill="#c26a00" />
        <text x={(O.x + S.A.x) / 2 + 8} y={(O.y + S.A.y) / 2} class="extra" fill="#c26a00">R = {n(T.R, 2)}</text>
      {/if}
      {#if showIn && !T.degenerate}
        {@const I = toScreen(T.incenter)}
        <circle cx={I.x} cy={I.y} r={T.r * U} fill="#efe9fb" stroke="#6a3fc8" stroke-width="2.5" />
        <circle cx={I.x} cy={I.y} r="4" fill="#6a3fc8" />
        <text x={I.x + 8} y={I.y - 6} class="extra" fill="#6a3fc8">r = {n(T.r, 2)}</text>
      {/if}

      <polygon points="{S.A.x},{S.A.y} {S.B.x},{S.B.y} {S.C.x},{S.C.y}" fill="rgb(255 255 255 / 0.6)" stroke="var(--hyp)" stroke-width="4" stroke-linejoin="round" />

      {#if showHeight && !T.degenerate}
        <line x1={S.C.x} y1={S.C.y} x2={hFoot.x} y2={hFoot.y} stroke="#555" stroke-width="2.5" stroke-dasharray="7 5" />
        <line x1={S.A.x} y1={S.A.y} x2={hFoot.x} y2={hFoot.y} stroke="#555" stroke-width="1.5" stroke-dasharray="2 4" />
        <text x={(S.C.x + hFoot.x) / 2 + 8} y={(S.C.y + hFoot.y) / 2} class="extra" fill="#555">h = {n(T.c ? (2 * T.area) / T.c : 0, 2)}</text>
      {/if}

      <!-- angles -->
      {#each corners as c (c)}
        {@const arc = arcAt(c)}
        {@const value = angleOf[c]()}
        <path d={arc.path} fill="none" stroke={colors[c]} stroke-width="3" />
        <text x={arc.label.x} y={arc.label.y} text-anchor="middle" class="ang" fill={colors[c]}>{n(value, 0)}°</text>
      {/each}

      <!-- sides: a opposite A, etc. -->
      <text x={la.x} y={la.y} text-anchor={la.anchor} class="side">a = {n(T.a, 1)}</text>
      <text x={lb.x} y={lb.y} text-anchor={lb.anchor} class="side">b = {n(T.b, 1)}</text>
      <text x={lc.x} y={lc.y} text-anchor={lc.anchor} class="side">c = {n(T.c, 1)}</text>

      <!-- corners -->
      {#each corners as c (c)}
        {@const p = S[c]}
        {@const lp = away(p, 30)}
        <g
          class="handle"
          role="slider"
          tabindex="0"
          aria-label={tf(lang, 'triangles.corner', { c })}
          aria-valuenow={Math.round(angleOf[c]())}
          aria-valuetext="{c}: {n(angleOf[c](), 0)}°"
          onpointerdown={(e) => svg && startDrag(e, svg, (q) => move(c, fromScreen(q)))}
          onkeydown={(e) => onKey(c, e)}
        >
          <circle cx={p.x} cy={p.y} r="13" fill="#fff" stroke={colors[c]} stroke-width="4" />
          <circle cx={p.x} cy={p.y} r="28" fill="transparent" />
        </g>
        <text x={lp.x} y={lp.y} text-anchor="middle" class="corner" fill={colors[c]}>{c}</text>
      {/each}
    </svg>
  </div>

  <div class="lab__panel">
    <div class="card">
      <p class="eq">A + B + C = {n(T.A, 0)}° + {n(T.B, 0)}° + {n(T.C, 0)}° = 180°</p>
      <p class="muted">{tr(kindKey)}{T.degenerate ? ` · ${tr('triangles.flat')}` : ''}</p>
    </div>

    <Segmented
      label={tr('triangles.show')}
      bind:value={tab}
      options={[
        { value: 'sines', label: tr('triangles.tabSines') },
        { value: 'cosines', label: tr('triangles.tabCosines') },
        { value: 'area', label: tr('triangles.tabArea') },
      ]}
    />

    {#if tab === 'sines'}
      <div class="card">
        <h3>{tr('triangles.sinesTitle')}</h3>
        <p class="eq num">a / sin A = {n(T.a, 2)} / {n(sinD(T.A), 3)} = <strong>{n(T.a / sinD(T.A), 2)}</strong></p>
        <p class="eq num">b / sin B = {n(T.b, 2)} / {n(sinD(T.B), 3)} = <strong>{n(T.b / sinD(T.B), 2)}</strong></p>
        <p class="eq num">c / sin C = {n(T.c, 2)} / {n(sinD(T.C), 3)} = <strong>{n(T.c / sinD(T.C), 2)}</strong></p>
        <p class="eq num">2R = 2 · {n(T.R, 2)} = <strong>{n(2 * T.R, 2)}</strong></p>
        <p class="muted">{tr('triangles.sinesText')}</p>
      </div>
      <Toggle label={tr('triangles.circumcircle')} bind:checked={showCircum} color="#c26a00" />
    {:else if tab === 'cosines'}
      {@const opp = sideOf[cosCorner]()}
      {@const ang = angleOf[cosCorner]()}
      {@const lo = cosCorner.toLowerCase()}
      <Segmented
        label={tr('triangles.whichAngle')}
        bind:value={cosCorner}
        options={corners.map((c) => ({ value: c, label: c, color: colors[c] }))}
      />
      <div class="card">
        <h3>{tr('triangles.cosinesTitle')}</h3>
        <p class="eq">{lo}² = {pair.n1}² + {pair.n2}² − 2·{pair.n1}·{pair.n2}·cos {cosCorner}</p>
        <p class="eq num">
          {n(opp * opp, 1)} = {n(pair.s1 ** 2, 1)} + {n(pair.s2 ** 2, 1)} − 2·{n(pair.s1, 1)}·{n(pair.s2, 1)}·{n(cosD(ang), 3)}
        </p>
        <p class="eq num">{n(opp * opp, 1)} = <strong>{n(pair.s1 ** 2 + pair.s2 ** 2 - 2 * pair.s1 * pair.s2 * cosD(ang), 1)}</strong> ✓</p>
        <p class="muted">
          {Math.abs(ang - 90) < 0.5 ? tr('triangles.cosinesRight') : ang > 90 ? tr('triangles.cosinesObtuse') : tr('triangles.cosinesText')}
        </p>
      </div>
    {:else}
      {@const base = T.c}
      {@const h = base ? (2 * T.area) / base : 0}
      <div class="card areas">
        <h3>{tr('triangles.areaTitle')}</h3>
        <p class="num"><span>½ · c · h</span> = ½ · {n(base, 2)} · {n(h, 2)} = <strong>{n(0.5 * base * h, 2)}</strong></p>
        <p class="num"><span>½ · b · c · sin A</span> = ½ · {n(T.b, 2)} · {n(T.c, 2)} · {n(sinD(T.A), 3)} = <strong>{n(0.5 * T.b * T.c * sinD(T.A), 2)}</strong></p>
        <p class="num"><span>√(s(s−a)(s−b)(s−c))</span> = <strong>{n(heron(T.a, T.b, T.c), 2)}</strong> <small>({tr('triangles.heron')}, s = {n(T.s, 2)})</small></p>
        <p class="num"><span>r · s</span> = {n(T.r, 2)} · {n(T.s, 2)} = <strong>{n(T.r * T.s, 2)}</strong></p>
        <p class="num"><span>abc / 4R</span> = <strong>{n(T.degenerate ? 0 : (T.a * T.b * T.c) / (4 * T.R), 2)}</strong></p>
        <p class="muted">{tr('triangles.areaText')}</p>
      </div>
      <Toggle label={tr('triangles.height')} bind:checked={showHeight} color="#555" />
      <Toggle label={tr('triangles.incircle')} bind:checked={showIn} color="#6a3fc8" />
      <Toggle label={tr('triangles.circumcircle')} bind:checked={showCircum} color="#c26a00" />
    {/if}

    <Toggle label={tr('triangles.snap')} bind:checked={snap} />
    <p class="muted">{tr('triangles.tip')}</p>
  </div>
</div>

<style>
  .grid {
    stroke: var(--grid);
    stroke-width: 1;
  }

  .side {
    font-size: 18px;
    font-weight: 700;
    fill: var(--hyp);
  }

  .ang {
    font-size: 16px;
    font-weight: 700;
  }

  .corner {
    font-size: 22px;
    font-weight: 700;
  }

  .extra {
    font-size: 16px;
    font-weight: 700;
  }

  .eq {
    font-size: var(--text-base);
    margin-bottom: var(--space-1);
  }

  .areas p {
    white-space: normal;
    overflow-wrap: anywhere;
  }

  .areas p span {
    font-weight: 700;
    color: var(--brand);
  }
</style>
