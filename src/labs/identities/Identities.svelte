<script lang="ts">
  /**
   * "Identity or impostor?": a formula is shown; decide if it is always true.
   * Then both sides are drawn as graphs. A real identity draws one curve
   * twice; an impostor's curves come apart somewhere.
   */
  import Slider from '../../ui/Slider.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import Axes from '../../ui/Axes.svelte';
  import { makeScale, segmentsPath } from '../../ui/svg';
  import { t, tf, type Locale, type TKey } from '../../i18n';
  import { IDENTITIES, type Family, type Identity } from '../../math/identities';
  import { num } from '../../shared/format';
  import { Width } from '../../ui/width.svelte';

  let { lang }: { lang: Locale } = $props();
  const tr = (k: TKey) => t(lang, k);
  const n = (v: number, d = 3) => num(lang, v, d);

  const box = new Width();
  let sceneEl: HTMLElement | undefined = $state();
  $effect(() => (sceneEl ? box.observe(sceneEl) : undefined));
  const W = $derived(box.px < 640 ? 560 : 900);
  const H = $derived(box.px < 640 ? 380 : 460);
  const s = $derived(makeScale([-360, 360], [-3, 3], { left: 44, right: W - 14, top: 14, bottom: H - 28 }));

  let mode = $state<'game' | 'explore'>('game');
  let B = $state(40);
  let x = $state(60);

  // ---- game ----
  const shuffle = <T,>(xs: readonly T[]) => {
    const a = [...xs];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j]!, a[i]!];
    }
    return a;
  };
  let order = $state<Identity[]>([...IDENTITIES]);
  let index = $state(0);
  let answer = $state<boolean | null>(null);
  let score = $state(0);
  let played = $state(0);
  // Shuffle in the browser only, so the server-rendered HTML matches the first paint
  $effect(() => {
    order = shuffle(IDENTITIES);
  });

  let chosenId = $state(IDENTITIES[0]!.id);
  const current = $derived(mode === 'game' ? order[index % order.length]! : IDENTITIES.find((i) => i.id === chosenId)!);
  const revealed = $derived(mode === 'explore' || answer !== null);
  const right = $derived(answer !== null && answer === current.real);

  function guess(isReal: boolean) {
    if (answer !== null) return;
    answer = isReal;
    played++;
    if (isReal === current.real) score++;
  }

  function nextOne() {
    answer = null;
    index++;
    if (index % order.length === 0) order = shuffle(IDENTITIES);
  }

  // ---- graphs ----
  function pathOf(f: (x: number, B: number) => number, b: number) {
    const segs: [number, number][][] = [];
    let seg: [number, number][] = [];
    for (let xx = -360; xx <= 360; xx += 1) {
      const y = f(xx, b);
      if (!Number.isFinite(y) || Math.abs(y) > 8) {
        if (seg.length > 1) segs.push(seg);
        seg = [];
        continue;
      }
      seg.push([xx, y]);
    }
    if (seg.length > 1) segs.push(seg);
    return segmentsPath(segs, s);
  }
  const lhsPath = $derived(revealed ? pathOf(current.f, B) : '');
  const rhsPath = $derived(revealed ? pathOf(current.g, B) : '');

  // A friendly counterexample for impostors
  const counter = $derived.by(() => {
    if (current.real) return null;
    for (const xx of [90, 30, 60, 45, 120, 180, 270, 15, 10]) {
      const f = current.f(xx, B);
      const g = current.g(xx, B);
      if (Math.abs(f - g) > 0.05) return { x: xx, f, g };
    }
    return null;
  });

  const fx = $derived(current.f(x, B));
  const gx = $derived(current.g(x, B));

  const families: Family[] = ['pythagoras', 'sum', 'double', 'half', 'product', 'symmetry'];
</script>

<div class="lab lab--sticky">
  <div class="lab__scene" bind:this={sceneEl}>
    <div class="claim" aria-live="polite">
      <span class="sin">{current.lhs}</span>
      <span class="eqsign">{revealed ? (current.real ? '=' : '≠') : '=?'}</span>
      <span class="cos">{current.rhs}</span>
    </div>
    <svg viewBox="0 0 {W} {H}" role="img" aria-label={tr('identities.sceneLabel')}>
      <defs>
        <clipPath id="id-clip"><rect x={s.left} y={s.top} width={s.right - s.left} height={s.bottom - s.top} /></clipPath>
      </defs>
      <Axes {s} xStep={90} yStep={1} />
      {#if revealed}
        <g clip-path="url(#id-clip)">
          <path d={lhsPath} fill="none" stroke="var(--sin)" stroke-width="8" opacity="0.55" stroke-linejoin="round" />
          <path d={rhsPath} fill="none" stroke="var(--cos)" stroke-width="3" stroke-dasharray="9 6" />
          <line x1={s.sx(x)} x2={s.sx(x)} y1={s.top} y2={s.bottom} stroke="var(--ink-2)" stroke-width="1.5" />
          {#if Number.isFinite(fx) && Math.abs(fx) < 3}<circle cx={s.sx(x)} cy={s.sy(fx)} r="8" fill="var(--sin)" />{/if}
          {#if Number.isFinite(gx) && Math.abs(gx) < 3}<circle cx={s.sx(x)} cy={s.sy(gx)} r="5" fill="var(--cos)" />{/if}
        </g>
      {:else}
        <rect x={W / 2 - 200} y={H / 2 - 50} width="400" height="64" rx="14" fill="#fff" stroke="var(--border)" />
        <text x={W / 2} y={H / 2 - 10} text-anchor="middle" class="hidden">{tr('identities.guessFirst')}</text>
      {/if}
    </svg>
  </div>

  <div class="lab__panel">
    <Segmented
      label={tr('ui.mode')}
      bind:value={mode}
      options={[
        { value: 'game', label: tr('identities.modeGame') },
        { value: 'explore', label: tr('identities.modeExplore') },
      ]}
    />

    {#if mode === 'game'}
      <div class="card">
        <h3>{tr('identities.question')}</h3>
        {#if answer === null}
          <div class="row">
            <button type="button" class="button yes" onclick={() => guess(true)}>✓ {tr('identities.always')}</button>
            <button type="button" class="button no" onclick={() => guess(false)}>✗ {tr('identities.impostor')}</button>
          </div>
        {:else}
          <p class={right ? 'note note--ok' : 'note note--warn'}>
            <strong>{right ? tr('identities.right') : tr('identities.wrong')}</strong>
            {current.real ? tr('identities.isReal') : tr('identities.isFake')}
          </p>
          {#if counter}
            <p>{tf(lang, 'identities.counter', { x: counter.x, f: n(counter.f), g: n(counter.g) })}</p>
          {/if}
          <button type="button" class="button" onclick={nextOne}>{tr('ui.next')} →</button>
        {/if}
        {#if played > 0}<p class="score">{tf(lang, 'identities.score', { s: score, n: played })}</p>{/if}
      </div>
    {:else}
      <label class="pick">
        <span>{tr('identities.pick')}</span>
        <select bind:value={chosenId}>
          {#each families as fam (fam)}
            <optgroup label={tr(`identities.family_${fam}` as TKey)}>
              {#each IDENTITIES.filter((i) => i.family === fam) as i (i.id)}
                <option value={i.id}>{i.lhs} = {i.rhs}{i.real ? '' : ' ✗'}</option>
              {/each}
            </optgroup>
          {/each}
        </select>
      </label>
      <p class="muted">{tr('identities.exploreText')}</p>
    {/if}

    {#if revealed}
      <Slider label={tr('identities.x')} bind:value={x} min={-360} max={360} step={5} display="{x}°" color="var(--ink-2)" />
      {#if current.usesB}
        <Slider label={tr('identities.B')} bind:value={B} min={0} max={180} step={5} display="{B}°" color="#c26a00" />
      {/if}
      <div class="card">
        <p class="num"><span class="sin">{tr('identities.left')}</span> {current.lhs} = <strong>{n(fx)}</strong></p>
        <p class="num"><span class="cos">{tr('identities.rightSide')}</span> {current.rhs} = <strong>{n(gx)}</strong></p>
        <p class="muted">{tr('identities.legend')}</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .claim {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: baseline;
    gap: var(--space-2) var(--space-4);
    padding: var(--space-4) var(--space-4) 0;
    font-size: var(--text-xl);
    font-weight: 700;
    text-align: center;
  }

  .eqsign {
    color: var(--ink-2);
  }

  .hidden {
    font-size: 22px;
    fill: var(--ink-muted);
  }

  .yes,
  .no {
    flex: 1;
    padding-inline: var(--space-3);
    white-space: nowrap;
  }

  .yes {
    background: var(--ok);
  }

  .no {
    background: #c82828;
  }

  .pick {
    display: grid;
    gap: var(--space-1);
    font-weight: 700;
  }

  .score {
    margin-top: var(--space-2) !important;
  }
</style>
