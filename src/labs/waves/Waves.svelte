<script lang="ts">
  /**
   * Wave maker: y = A · trig(b·x + φ) + k. Each slider changes one thing
   * about the graph: height (A), squeeze (b), slide sideways (φ), lift (k).
   * Game mode: match a target wave.
   */
  import Slider from '../../ui/Slider.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import Axes from '../../ui/Axes.svelte';
  import { makeScale, segmentsPath } from '../../ui/svg';
  import { t, tf, type Locale, type TKey } from '../../i18n';
  import type { TrigFn } from '../../math/angles';
  import { asymptotes, PARENT, period, randomTarget, sameCurve, sampleWave, shiftX, type Wave } from '../../math/waves';
  import { num } from '../../shared/format';
  import { Width } from '../../ui/width.svelte';

  let { lang }: { lang: Locale } = $props();
  const tr = (k: TKey) => t(lang, k);
  const n = (v: number, d = 2) => num(lang, v, d);

  const box = new Width();
  let sceneEl: HTMLElement | undefined = $state();
  $effect(() => (sceneEl ? box.observe(sceneEl) : undefined));
  const W = $derived(box.px < 640 ? 560 : 900);
  const H = $derived(box.px < 640 ? 400 : 520);
  const X0 = -360;
  const X1 = 360;

  let fn = $state<TrigFn>('sin');
  let A = $state(1);
  let b = $state(1);
  let phi = $state(0);
  let k = $state(0);
  let ghost = $state(true);

  const wave = $derived<Wave>({ fn, A, b, phi, k });

  // ---- game ----
  let game = $state(false);
  let level = $state<1 | 2 | 3>(1);
  let target = $state<Wave | null>(null);
  let matched = $state(false);
  let score = $state(0);

  function newTarget() {
    target = randomTarget(level);
    matched = false;
    reset(target.fn);
  }

  function reset(f: TrigFn = fn) {
    fn = f;
    A = 1;
    b = 1;
    phi = 0;
    k = 0;
  }

  function packetExample() {
    game = false;
    target = null;
    fn = 'tan';
    A = 5;
    b = 0.8;
    phi = 20;
    k = -8;
  }

  $effect(() => {
    if (!game || !target || matched) return;
    if (sameCurve(wave, target)) {
      matched = true;
      score++;
    }
  });

  // Keep the y range steady, growing only when the graph needs more room
  const yMax = $derived.by(() => {
    const need = (w: Wave) => Math.abs(w.k) + Math.abs(w.A) * (w.fn === 'tan' ? 2 : 1) + 0.5;
    const m = Math.max(4, need(wave), target && game ? need(target) : 0);
    return Math.ceil(m);
  });
  const s = $derived(makeScale([X0, X1], [-yMax, yMax], { left: 50, right: W - 16, top: 16, bottom: H - 30 }));

  const path = $derived(segmentsPath(sampleWave(wave, X0, X1), s));
  const parentPath = $derived(segmentsPath(sampleWave(PARENT[fn], X0, X1), s));
  const targetPath = $derived(target && game ? segmentsPath(sampleWave(target, X0, X1), s) : '');
  const asym = $derived(asymptotes(wave, X0, X1));

  // One period, drawn as a bracket on the midline starting at the shift
  const per = $derived(period(wave));
  const start = $derived.by(() => {
    let x = shiftX(wave);
    if (fn === 'tan') x -= per / 2; // tan's period runs asymptote to asymptote
    while (x < X0) x += per;
    while (x - per >= X0 && x > 0) x -= per;
    return x;
  });

  const color = $derived(fn === 'sin' ? 'var(--sin)' : fn === 'cos' ? 'var(--cos)' : 'var(--tan)');
  const fnOptions = [
    { value: 'sin' as const, label: 'sin', color: 'var(--sin)' },
    { value: 'cos' as const, label: 'cos', color: 'var(--cos)' },
    { value: 'tan' as const, label: 'tan', color: 'var(--tan)' },
  ];

  const sign = (v: number) => (v < 0 ? '−' : '+');
  const shiftText = $derived.by(() => {
    const sx = shiftX(wave);
    if (Math.abs(sx) < 0.05) return tr('waves.noShift');
    return tf(lang, sx < 0 ? 'waves.shiftLeft' : 'waves.shiftRight', { d: n(Math.abs(sx), 1) });
  });
</script>

<div class="lab lab--sticky">
  <div class="lab__scene" bind:this={sceneEl}>
    <svg viewBox="0 0 {W} {H}" role="img" aria-label={tr('waves.sceneLabel')}>
      <defs>
        <clipPath id="plot-clip"><rect x={s.left} y={s.top} width={s.right - s.left} height={s.bottom - s.top} /></clipPath>
      </defs>
      <Axes {s} xStep={90} yStep={1} />
      <g clip-path="url(#plot-clip)">
        {#each asym as x (x)}
          <line x1={s.sx(x)} x2={s.sx(x)} y1={s.top} y2={s.bottom} stroke="var(--tan)" stroke-width="1.5" stroke-dasharray="6 6" />
        {/each}
        {#if Math.abs(k) > 0}
          <line x1={s.left} x2={s.right} y1={s.sy(k)} y2={s.sy(k)} stroke={color} stroke-width="1.5" stroke-dasharray="3 6" />
        {/if}
        {#if ghost}
          <path d={parentPath} fill="none" stroke="#9a9993" stroke-width="2" stroke-dasharray="6 5" />
        {/if}
        {#if targetPath}
          <path d={targetPath} fill="none" stroke="var(--target)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" opacity="0.45" />
        {/if}
        <path d={path} fill="none" stroke={color} stroke-width="4" stroke-linejoin="round" />
      </g>
      <!-- period bracket -->
      {#if s.sx(start + per) <= s.right + 1 && per >= 30}
        <!-- under the lowest point of sin/cos; under the midline for tan -->
        {@const y = Math.min(s.bottom - 26, s.sy(k - (fn === 'tan' ? 0 : Math.abs(A))) + (fn === 'tan' ? 60 : 22))}
        <g class="period">
          <line x1={s.sx(start)} x2={s.sx(start + per)} y1={y} y2={y} />
          <line x1={s.sx(start)} x2={s.sx(start)} y1={y - 7} y2={y + 7} />
          <line x1={s.sx(start + per)} x2={s.sx(start + per)} y1={y - 7} y2={y + 7} />
          <text x={(s.sx(start) + s.sx(start + per)) / 2} y={y + 20} text-anchor="middle"
            >{tf(lang, 'waves.periodLabel', { p: n(per, 1) })}</text
          >
        </g>
      {/if}
    </svg>
    {#if matched}<div class="banner">{tr('waves.matched')}</div>{/if}
  </div>

  <div class="lab__panel">
    <div class="card formula">
      <p class="eq">
        y = <span class="A">{n(A, 2)}</span> · <span style:color={color}>{fn}</span>(<span class="b">{n(b, 2)}</span>x
        <span class="phi">{sign(phi)} {n(Math.abs(phi), 0)}°</span>)
        <span class="k">{sign(k)} {n(Math.abs(k), 1)}</span>
      </p>
      {#if game && target}
        <p class="muted"><span class="target">━</span> {tr('waves.targetLegend')}</p>
      {/if}
    </div>

    <Segmented label={tr('waves.function')} bind:value={fn} options={fnOptions} onchange={() => (matched = false)} />

    <Slider label={tr('waves.A')} bind:value={A} min={-5} max={5} step={0.5} display={n(A, 1)} color="#b0237e" />
    <Slider label={tr('waves.b')} bind:value={b} min={0.25} max={4} step={0.05} display={n(b, 2)} color="#0a8a4a" />
    <Slider label={tr('waves.phi')} bind:value={phi} min={-180} max={180} step={5} display="{n(phi, 0)}°" color="#c26a00" />
    <Slider label={tr('waves.k')} bind:value={k} min={-8} max={8} step={0.5} display={n(k, 1)} color="#6a3fc8" />

    <div class="card facts">
      <p><strong>{tr('waves.amplitude')}:</strong> <span class="num">{fn === 'tan' ? tr('waves.noAmplitude') : n(Math.abs(A), 1)}</span>{#if A < 0} · {tr('waves.flipped')}{/if}</p>
      <p><strong>{tr('waves.period')}:</strong> <span class="num">{fn === 'tan' ? '180°' : '360°'} ÷ {n(b, 2)} = {n(per, 1)}°</span></p>
      <p><strong>{tr('waves.shift')}:</strong> {shiftText}</p>
      <p><strong>{tr('waves.lift')}:</strong> {Math.abs(k) < 0.01 ? tr('waves.noLift') : tf(lang, k > 0 ? 'waves.up' : 'waves.down', { d: n(Math.abs(k), 1) })}</p>
    </div>

    <div class="row">
      <Toggle label={tr('waves.ghost')} bind:checked={ghost} color="#8d8c87" />
      <button type="button" class="button button--secondary button--small" onclick={() => reset()}>{tr('ui.reset')}</button>
    </div>

    <div class="card">
      <h3>{tr('waves.gameTitle')}</h3>
      {#if game}
        <Segmented
          label={tr('waves.level')}
          bind:value={level}
          options={[
            { value: 1, label: tr('waves.level1') },
            { value: 2, label: tr('waves.level2') },
            { value: 3, label: tr('waves.level3') },
          ]}
          onchange={newTarget}
        />
        <p class="muted">{matched ? tr('waves.matchedText') : tr('waves.gameHint')}</p>
        <div class="row">
          <button type="button" class="button" onclick={newTarget}>{tr('waves.newTarget')}</button>
          <button type="button" class="button button--secondary" onclick={() => { game = false; target = null; matched = false; }}>{tr('waves.stopGame')}</button>
          {#if score > 0}<span class="score">★ {score}</span>{/if}
        </div>
      {:else}
        <p class="muted">{tr('waves.gameIntro')}</p>
        <div class="row">
          <button type="button" class="button" onclick={() => { game = true; newTarget(); }}>{tr('waves.startGame')}</button>
          <button type="button" class="button button--secondary" onclick={packetExample}>{tr('waves.packetExample')}</button>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .formula .eq {
    font-size: var(--text-xl);
  }

  .A {
    color: #b0237e;
  }

  .b {
    color: #0a8a4a;
  }

  .phi {
    color: #c26a00;
  }

  .k {
    color: #6a3fc8;
  }

  .facts p {
    margin-bottom: var(--space-1);
  }

  .period line {
    stroke: var(--ink);
    stroke-width: 2;
  }

  .period text {
    font-size: 15px;
    font-weight: 700;
    fill: var(--ink);
  }
</style>
