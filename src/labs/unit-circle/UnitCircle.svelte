<script lang="ts">
  /**
   * Unit circle lab ("spin around"): drag the point around the circle. Its
   * height is sin θ and its sideways distance is cos θ. To the right, the
   * height is drawn against the angle, which is the sine wave.
   */
  import { onMount } from 'svelte';
  import Slider from '../../ui/Slider.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import Axes from '../../ui/Axes.svelte';
  import { arcPath, makeScale, startDrag, type Pt } from '../../ui/svg';
  import { t, tf, type Locale, type TKey } from '../../i18n';
  import { cosD, exactValue, normDeg, piFraction, quadrant, sinD, tanD, tanUndefined, toDeg } from '../../math/angles';
  import { num } from '../../shared/format';
  import { makeTask, solves, type AngleTask } from './challenge';
  import { Width } from '../../ui/width.svelte';

  let { lang }: { lang: Locale } = $props();
  const tr = (k: TKey) => t(lang, k);
  const n = (v: number, d = 3) => num(lang, v, d, true);

  // Wide screens: circle and graph side by side, with the same vertical scale
  // so the point's height lines up with the wave. Phones: graph under the circle.
  const box = new Width();
  let sceneEl: HTMLElement | undefined = $state();
  $effect(() => (sceneEl ? box.observe(sceneEl) : undefined));
  const narrow = $derived(box.px < 640);
  const W = $derived(narrow ? 480 : 960);
  const H = $derived(narrow ? 790 : 440);
  const C = $derived(narrow ? { x: 240, y: 205 } : { x: 210, y: 220 });
  const R = $derived(narrow ? 165 : 170);
  const g = $derived(
    narrow
      ? makeScale([0, 360], [-1.25, 1.25], { left: 44, right: 462, top: 440, bottom: 775 })
      : makeScale([0, 360], [-1.25, 1.25], { left: 450, right: 935, top: C.y - 1.25 * R, bottom: C.y + 1.25 * R }),
  );

  let angle = $state(40);
  let snap = $state(false);
  let showTan = $state(false);
  let spinning = $state(false);

  const a = $derived(normDeg(angle));
  const P = $derived({ x: C.x + R * cosD(a), y: C.y - R * sinD(a) });
  const q = $derived(quadrant(a));
  const refAngle = $derived(a <= 90 ? a : a <= 180 ? 180 - a : a <= 270 ? a - 180 : 360 - a);
  const rad = $derived(piFraction(Math.round(a)));

  let svg: SVGSVGElement | undefined = $state();

  function setAngle(next: number) {
    let v = normDeg(next);
    if (snap) v = normDeg(Math.round(v / 15) * 15);
    angle = Math.round(v);
  }

  function fromPoint(p: Pt) {
    stop();
    // Drag on the circle, or along the graph
    const onGraph = narrow ? p.y > g.top - 10 : p.x > g.left - 10;
    if (onGraph) setAngle(Math.min(359, Math.max(0, g.ix(p.x))));
    else setAngle(toDeg(Math.atan2(C.y - p.y, p.x - C.x)));
  }

  // ---- spin animation ----
  let raf = 0;
  let last = 0;
  function frame(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    angle = normDeg(angle + 45 * dt);
    raf = requestAnimationFrame(frame);
  }
  function play() {
    spinning = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    spinning = false;
    cancelAnimationFrame(raf);
  }
  onMount(() => stop);

  // ---- paths ----
  const curve = (f: (d: number) => number, upTo = 360) => {
    let d = '';
    for (let x = 0; x <= upTo; x += 2) d += `${x === 0 ? 'M' : 'L'}${g.sx(x).toFixed(1)} ${g.sy(f(x)).toFixed(1)}`;
    if (upTo % 2) d += `L${g.sx(upTo).toFixed(1)} ${g.sy(f(upTo)).toFixed(1)}`;
    return d;
  };
  const sinFull = $derived(curve(sinD));
  const cosFull = $derived(curve(cosD));
  const tanPath = $derived.by(() => {
    let d = '';
    for (const [x0, x1] of [
      [0, 89],
      [91, 269],
      [271, 360],
    ] as const) {
      for (let x = x0; x <= x1; x += 1) {
        const y = Math.max(-1.25, Math.min(1.25, tanD(x)));
        d += `${x === x0 ? 'M' : 'L'}${g.sx(x).toFixed(1)} ${g.sy(y).toFixed(1)}`;
      }
    }
    return d;
  });
  const sinTrace = $derived(curve(sinD, Math.floor(a)));

  // Tangent: where the line from the centre through P meets x = 1
  const T = $derived.by(() => {
    if (tanUndefined(Math.round(a * 10) / 10)) return null;
    const v = tanD(a);
    return Math.abs(v) > 1.25 ? null : { x: C.x + R, y: C.y - R * v };
  });

  // ---- challenge ----
  let task = $state<AngleTask | null>(null);
  let found = $state<number | null>(null);
  let streak = $state(0);

  function newTask() {
    stop();
    task = makeTask();
    found = null;
  }

  $effect(() => {
    if (!task || found !== null || spinning) return;
    const hit = solves(task, a, 2);
    if (hit !== null) {
      found = hit;
      angle = hit;
      streak++;
    }
  });

  const signWord = (v: number) => (Math.abs(v) < 1e-9 ? '0' : v > 0 ? '+' : '−');
  const fmtVal = (fn: 'sin' | 'cos' | 'tan') => {
    if (fn === 'tan' && tanUndefined(a)) return tr('unitCircle.undefined');
    const v = fn === 'sin' ? sinD(a) : fn === 'cos' ? cosD(a) : tanD(a);
    const exact = exactValue(fn, a);
    return exact && !['0', '1', '−1'].includes(exact) ? `${exact} ≈ ${n(v)}` : n(v);
  };

  // The sign chart, written inside the circle on the diagonals
  const quadLabels = $derived(
    (
      [
        [1, 1, -1, 'unitCircle.signAll'],
        [2, -1, -1, 'unitCircle.signSin'],
        [3, -1, 1, 'unitCircle.signTan'],
        [4, 1, 1, 'unitCircle.signCos'],
      ] as const
    ).map(([q, sx, sy, text]) => ({ q, x: C.x + sx * R * 0.5, y: C.y + sy * R * 0.62 + 5, text })),
  );
</script>

<div class="lab">
  <div class="lab__scene" bind:this={sceneEl}>
    <svg
      bind:this={svg}
      viewBox="0 0 {W} {H}"
      role="img"
      aria-label={tf(lang, 'unitCircle.sceneLabel', { a: Math.round(a), s: n(sinD(a)), c: n(cosD(a)) })}
      onpointerdown={(e) => svg && startDrag(e, svg, fromPoint)}
    >
      <!-- quadrant sign chart -->
      {#each quadLabels as ql (ql.q)}
        <text
          x={ql.x}
          y={ql.y}
          text-anchor="middle"
          class="quad"
          class:quad--on={q === ql.q}>{tr(ql.text)}</text
        >
      {/each}

      <!-- axes and circle -->
      <line x1={C.x - R - 25} x2={C.x + R + 25} y1={C.y} y2={C.y} class="axis" />
      <line x1={C.x} x2={C.x} y1={C.y - R - 25} y2={C.y + R + 25} class="axis" />
      <circle cx={C.x} cy={C.y} r={R} fill="none" stroke="var(--axis)" stroke-width="2" />
      <text x={C.x + R + 6} y={C.y - 8} class="tick">0°</text>
      <text x={C.x + 6} y={C.y - R - 8} class="tick">90°</text>
      <text x={C.x - R - 6} y={C.y - 8} class="tick" text-anchor="end">180°</text>
      <text x={C.x + 6} y={C.y + R + 20} class="tick">270°</text>
      <text x={C.x - 8} y={C.y + 18} class="tick" text-anchor="end">1 = r</text>

      <!-- tangent line -->
      {#if showTan}
        <line x1={C.x + R} x2={C.x + R} y1={C.y - R * 1.25} y2={C.y + R * 1.25} stroke="var(--tan)" stroke-width="1.5" stroke-dasharray="4 5" />
        {#if T}
          <line x1={C.x} y1={C.y} x2={T.x} y2={T.y} stroke="var(--tan)" stroke-width="2" stroke-dasharray="7 5" />
          <line x1={C.x + R} y1={C.y} x2={T.x} y2={T.y} stroke="var(--tan)" stroke-width="6" stroke-linecap="round" />
          <text x={T.x + 10} y={T.y + 6} class="lbl tan">tan</text>
        {/if}
      {/if}

      <!-- angle, cos, sin, radius -->
      <path d={arcPath(C, 36, 0, Math.max(a, 0.01))} fill="none" stroke="var(--brand)" stroke-width="3" />
      <text x={C.x + 44 * cosD(a / 2)} y={C.y - 44 * sinD(a / 2) + 6} class="lbl theta">θ</text>
      <line x1={C.x} y1={C.y} x2={P.x} y2={C.y} stroke="var(--cos)" stroke-width="7" stroke-linecap="round" />
      <line x1={P.x} y1={C.y} x2={P.x} y2={P.y} stroke="var(--sin)" stroke-width="7" stroke-linecap="round" />
      <line x1={C.x} y1={C.y} x2={P.x} y2={P.y} stroke="var(--hyp)" stroke-width="3" />
      <text x={(C.x + P.x) / 2} y={C.y + (sinD(a) >= 0 ? 24 : -12)} text-anchor="middle" class="lbl cos">cos</text>
      <text x={P.x + (cosD(a) >= 0 ? 10 : -10)} y={(C.y + P.y) / 2 + 6} text-anchor={cosD(a) >= 0 ? 'start' : 'end'} class="lbl sin">sin</text>

      <!-- graph -->
      <Axes s={g} xStep={90} yStep={0.5} />
      <path d={cosFull} fill="none" stroke="var(--cos)" stroke-width="2" opacity="0.35" />
      <path d={sinFull} fill="none" stroke="var(--sin)" stroke-width="2" opacity="0.3" />
      {#if showTan}<path d={tanPath} fill="none" stroke="var(--tan)" stroke-width="2" opacity="0.5" />{/if}
      <path d={sinTrace} fill="none" stroke="var(--sin)" stroke-width="5" stroke-linecap="round" />
      {#if !narrow}
        <line x1={P.x} y1={P.y} x2={g.sx(a)} y2={P.y} stroke="var(--sin)" stroke-width="1.5" stroke-dasharray="5 5" />
      {/if}
      <line x1={g.sx(a)} x2={g.sx(a)} y1={g.sy(0)} y2={g.sy(sinD(a))} stroke="var(--sin)" stroke-width="3" />
      <circle cx={g.sx(a)} cy={g.sy(cosD(a))} r="6" fill="var(--cos)" />
      <circle cx={g.sx(a)} cy={g.sy(sinD(a))} r="8" fill="var(--sin)" />
      <text x={g.right} y={g.top + 16} text-anchor="end" class="lbl sin">y = sin x</text>
      <text x={g.right} y={g.top + 36} text-anchor="end" class="lbl cos small">y = cos x</text>

      <!-- the draggable point -->
      <g class="handle">
        <circle cx={P.x} cy={P.y} r="14" fill="#fff" stroke="var(--brand)" stroke-width="4" />
      </g>
    </svg>
    {#if found !== null}<div class="banner">{tf(lang, 'unitCircle.found', { a: found })}</div>{/if}
  </div>

  <div class="lab__panel">
    <div class="card">
      <p class="big">
        θ = {Math.round(a)}°{#if rad}<span class="rad">&nbsp;= {rad} rad</span>{/if}
      </p>
      <p class="muted">
        {q === 0 ? tr('unitCircle.onAxis') : tf(lang, 'unitCircle.quadrant', { q: ['', 'I', 'II', 'III', 'IV'][q]! })}
        · {tf(lang, 'unitCircle.reference', { r: Math.round(refAngle) })}
      </p>
    </div>

    <Slider label={tr('unitCircle.angle')} value={Math.round(a)} min={0} max={359} display="{Math.round(a)}°" onchange={(v) => { stop(); setAngle(v); }} />

    <div class="row">
      <button type="button" class="button" onclick={() => (spinning ? stop() : play())}>
        {spinning ? tr('unitCircle.stop') : tr('unitCircle.spin')}
      </button>
      <Toggle label={tr('unitCircle.snap')} bind:checked={snap} onchange={(v) => v && setAngle(angle)} />
    </div>

    <div class="card values">
      <p class="eq"><span class="sin">sin θ</span> = <span class="num">{fmtVal('sin')}</span> <small>({signWord(sinD(a))})</small></p>
      <p class="eq"><span class="cos">cos θ</span> = <span class="num">{fmtVal('cos')}</span> <small>({signWord(cosD(a))})</small></p>
      <p class="eq"><span class="tan">tan θ</span> = <span class="num">{fmtVal('tan')}</span></p>
      <p class="muted">{tr('unitCircle.valuesNote')}</p>
    </div>

    <Toggle label={tr('unitCircle.showTan')} bind:checked={showTan} color="var(--tan)" />

    <div class="card">
      <h3>{tr('unitCircle.challengeTitle')}</h3>
      {#if task}
        <p class="eq">
          <span class={task.fn}>{task.fn} θ</span> = {task.value}
          <small>{tr('unitCircle.and')}</small>
          <span class={task.other}>{task.other} θ</span>
          {task.positive ? '> 0' : '< 0'}
        </p>
        {#if found !== null}
          <p class="note note--ok">{tf(lang, 'unitCircle.foundText', { a: found })}</p>
        {:else}
          <p class="muted">{tr('unitCircle.challengeHint')}</p>
        {/if}
      {:else}
        <p class="muted">{tr('unitCircle.challengeIntro')}</p>
      {/if}
      <div class="row">
        <button type="button" class="button button--secondary" onclick={newTask}>
          {task ? tr('unitCircle.nextTask') : tr('unitCircle.startTask')}
        </button>
        {#if streak > 0}<span class="score">★ {streak}</span>{/if}
      </div>
    </div>
  </div>
</div>

<style>
  svg {
    cursor: pointer;
  }

  .axis {
    stroke: var(--axis);
    stroke-width: 1.5;
  }

  .tick {
    font-size: 14px;
    fill: var(--ink-2);
  }

  .quad {
    font-size: 15px;
    font-weight: 700;
    fill: #b8b7b2;
  }

  .quad--on {
    fill: var(--brand);
  }

  .lbl {
    font-size: 18px;
    font-weight: 700;
  }

  .lbl.small {
    font-size: 15px;
  }

  .sin {
    fill: var(--sin);
  }

  .cos {
    fill: var(--cos);
  }

  .tan {
    fill: var(--tan);
  }

  .theta {
    fill: var(--brand);
  }

  .rad {
    font-size: var(--text-lg);
    color: var(--ink-2);
  }

  .values .eq {
    margin-bottom: var(--space-1);
  }
</style>
