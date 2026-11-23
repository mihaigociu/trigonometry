<script lang="ts">
  /**
   * The packet's picture proof of the angle-sum formulas, one step at a time:
   *   sin(A+B) = sin A·cos B + cos A·sin B
   *   cos(A+B) = cos A·cos B − sin A·sin B
   */
  import Slider from '../../ui/Slider.svelte';
  import { arcPath, type Pt } from '../../ui/svg';
  import { t, tf, type Locale, type TKey } from '../../i18n';
  import { cosD, sinD } from '../../math/angles';
  import { angleSumFigure } from '../../math/angleSum';
  import { num } from '../../shared/format';

  let { lang }: { lang: Locale } = $props();
  const tr = (k: TKey) => t(lang, k);
  const n = (v: number, d = 3) => num(lang, v, d, true);

  const W = 720;
  const H = 540;
  const O0 = { x: 60, y: 460 };
  const L = 400;
  const X = (p: Pt) => ({ x: O0.x + p.x * L, y: O0.y - p.y * L });

  let A = $state(30);
  let B = $state(25);
  let step = $state(1);
  const STEPS = 5;

  const F = $derived(angleSumFigure(A, B));
  const P = $derived(X(F.P));
  const Q = $derived(X(F.Q));
  const Qx = $derived(X(F.Qx));
  const Px = $derived(X(F.Px));
  const K = $derived(X(F.corner));
  const ray = $derived(X({ x: 1.12 * cosD(A), y: 1.12 * sinD(A) }));

  const clampB = () => {
    if (A + B > 85) B = 85 - A;
  };
  const clampA = () => {
    if (A + B > 85) A = 85 - B;
  };

  const C = {
    sum: 'var(--sin)',
    cosSum: 'var(--cos)',
    sAcB: '#7b3fc8',
    cAsB: '#e07800',
    cAcB: '#4f9be8',
    sAsB: '#0a8a4a',
  };

  // Right-angle marker at Q (between Q→O and Q→P)
  const rightMark = $derived.by(() => {
    const s = 14;
    const u = { x: -cosD(A), y: sinD(A) }; // towards O, screen coords
    const v = { x: -sinD(A), y: -cosD(A) }; // towards P
    return `${Q.x + u.x * s},${Q.y + u.y * s} ${Q.x + (u.x + v.x) * s},${Q.y + (u.y + v.y) * s} ${Q.x + v.x * s},${Q.y + v.y * s}`;
  });

  const captions: TKey[] = ['angleSum.step1', 'angleSum.step2', 'angleSum.step3', 'angleSum.step4', 'angleSum.step5'];
</script>

<div class="lab">
  <div class="lab__scene">
    <svg viewBox="0 0 {W} {H}" role="img" aria-label={tf(lang, 'angleSum.sceneLabel', { step, a: A, b: B })}>
      <!-- axes and the quarter circle -->
      <line x1={O0.x - 20} x2={O0.x + L + 40} y1={O0.y} y2={O0.y} class="axis" />
      <line x1={O0.x} x2={O0.x} y1={O0.y + 20} y2={O0.y - L - 40} class="axis" />
      <path d={arcPath(O0, L, 0, 90)} fill="none" stroke="var(--axis)" stroke-width="1.5" stroke-dasharray="4 6" />
      <text x={O0.x - 14} y={O0.y + 22} class="pt">O</text>

      <!-- Step 1: radius 1 at A+B, with sin and cos of A+B -->
      <g class:faded={step > 1 && step < 5}>
        <line x1={P.x} y1={P.y} x2={Px.x} y2={Px.y} stroke={C.sum} stroke-width={step === 1 ? 6 : 3} stroke-linecap="round" />
        <line x1={O0.x} y1={O0.y} x2={Px.x} y2={Px.y} stroke={C.cosSum} stroke-width={step === 1 ? 6 : 3} stroke-linecap="round" />
        {#if step === 1}
          <text x={P.x - 10} y={(P.y + Px.y) / 2} text-anchor="end" class="lbl" fill={C.sum}>sin(A+B)</text>
          <text x={(O0.x + Px.x) / 2} y={O0.y + 26} text-anchor="middle" class="lbl" fill={C.cosSum}>cos(A+B)</text>
        {/if}
      </g>
      <line x1={O0.x} y1={O0.y} x2={P.x} y2={P.y} stroke="var(--hyp)" stroke-width="4" stroke-linecap="round" />
      {#if step === 1}
        <text x={(O0.x + P.x) / 2 - 12} y={(O0.y + P.y) / 2 - 6} text-anchor="end" class="lbl">1</text>
        <path d={arcPath(O0, 60, 0, A + B)} fill="none" stroke="var(--brand)" stroke-width="3" />
        <text x={O0.x + 70 * cosD((A + B) / 2)} y={O0.y - 70 * sinD((A + B) / 2) + 6} class="lbl" fill="var(--brand)">A+B</text>
      {/if}
      <circle cx={P.x} cy={P.y} r="6" fill="var(--hyp)" />
      <text x={P.x + 10} y={P.y - 10} class="pt">P</text>

      <!-- Step 2: the line at angle A and the right triangle O-Q-P -->
      {#if step >= 2}
        <line x1={O0.x} y1={O0.y} x2={ray.x} y2={ray.y} stroke="#999" stroke-width="2" stroke-dasharray="8 6" />
        <line x1={O0.x} y1={O0.y} x2={Q.x} y2={Q.y} stroke="#333" stroke-width="4" stroke-linecap="round" />
        <line x1={Q.x} y1={Q.y} x2={P.x} y2={P.y} stroke="#333" stroke-width="4" stroke-linecap="round" />
        <polyline points={rightMark} fill="none" stroke="#333" stroke-width="2" />
        <path d={arcPath(O0, 70, 0, A)} fill="none" stroke="#c42a7a" stroke-width="3" />
        <path d={arcPath(O0, 95, A, A + B)} fill="none" stroke="#0a7a8a" stroke-width="3" />
        <text x={O0.x + 80 * cosD(A / 2)} y={O0.y - 80 * sinD(A / 2) + 6} class="lbl" fill="#c42a7a">A</text>
        <text x={O0.x + 108 * cosD(A + B / 2)} y={O0.y - 108 * sinD(A + B / 2) + 6} class="lbl" fill="#0a7a8a">B</text>
        <circle cx={Q.x} cy={Q.y} r="5" fill="#333" />
        <text x={Q.x + 10} y={Q.y + 20} class="pt">Q</text>
        {#if step === 2}
          {@const mOQ = { x: (O0.x + Q.x) / 2 + 22 * sinD(A), y: (O0.y + Q.y) / 2 + 22 * cosD(A) + 6 }}
          {@const mQP = { x: (Q.x + P.x) / 2 + 14 * cosD(A), y: (Q.y + P.y) / 2 - 14 * sinD(A) }}
          <text x={mOQ.x} y={mOQ.y} class="lbl" text-anchor="start">cos B</text>
          <text x={mQP.x} y={mQP.y} class="lbl" text-anchor="start">sin B</text>
        {/if}
      {/if}

      <!-- Step 3: under OQ: Q's height and Q's distance -->
      {#if step >= 3}
        <line x1={Q.x} y1={Q.y} x2={Qx.x} y2={Qx.y} stroke={C.sAcB} stroke-width="6" stroke-linecap="round" />
        <line x1={O0.x} y1={O0.y + 2} x2={Qx.x} y2={Qx.y + 2} stroke={C.cAcB} stroke-width="6" stroke-linecap="round" />
        {#if step === 3}
          <text x={Q.x + 12} y={(Q.y + Qx.y) / 2} class="lbl" fill={C.sAcB}>cos B · sin A</text>
          <text x={(O0.x + Qx.x) / 2} y={O0.y + 28} text-anchor="middle" class="lbl" fill={C.cAcB}>cos B · cos A</text>
          <text x={(O0.x + Q.x) / 2 - 8} y={(O0.y + Q.y) / 2 - 8} text-anchor="end" class="lbl small">cos B</text>
        {/if}
      {/if}

      <!-- Step 4: the small triangle at P, whose top angle is A again -->
      {#if step >= 4}
        <line x1={P.x} y1={P.y} x2={K.x} y2={K.y} stroke={C.cAsB} stroke-width="6" stroke-linecap="round" />
        <line x1={K.x} y1={K.y} x2={Q.x} y2={Q.y} stroke={C.sAsB} stroke-width="6" stroke-linecap="round" />
        <path d={arcPath(P, 34, -90, A - 90)} fill="none" stroke="#c42a7a" stroke-width="3" />
        <text x={P.x + 40 * cosD(A / 2 - 90) + 2} y={P.y - 40 * sinD(A / 2 - 90) + 10} class="lbl small" fill="#c42a7a">A</text>
        {#if step === 4}
          <text x={P.x - 12} y={(P.y + K.y) / 2 + 6} text-anchor="end" class="lbl" fill={C.cAsB}>sin B · cos A</text>
          <text x={(K.x + Q.x) / 2} y={K.y - 12} text-anchor="middle" class="lbl small" fill={C.sAsB}>sin B · sin A</text>
          <text x={(Q.x + P.x) / 2 + 14} y={(Q.y + P.y) / 2} class="lbl small">sin B</text>
        {/if}
      {/if}

      <!-- Step 5: stack the pieces next to sin(A+B) and under cos(A+B) -->
      {#if step === 5}
        {@const bx = 600}
        <line x1={bx} x2={bx} y1={O0.y} y2={P.y} stroke={C.sum} stroke-width="14" />
        <line x1={bx + 26} x2={bx + 26} y1={O0.y} y2={Q.y} stroke={C.sAcB} stroke-width="14" />
        <line x1={bx + 26} x2={bx + 26} y1={Q.y} y2={P.y} stroke={C.cAsB} stroke-width="14" />
        <line x1={P.x} x2={bx + 40} y1={P.y} y2={P.y} stroke="#bbb" stroke-dasharray="3 5" />
        <line x1={Q.x} x2={bx + 40} y1={Q.y} y2={Q.y} stroke="#bbb" stroke-dasharray="3 5" />
        <text x={bx + 13} y={P.y - 12} text-anchor="middle" class="lbl small">=</text>
        <!-- cos(A+B) = cos A cos B − sin A sin B, drawn under the axis -->
        <line x1={O0.x} x2={Px.x} y1={O0.y + 34} y2={O0.y + 34} stroke={C.cosSum} stroke-width="10" />
        <line x1={O0.x} x2={Qx.x} y1={O0.y + 54} y2={O0.y + 54} stroke={C.cAcB} stroke-width="10" />
        <line x1={Px.x} x2={Qx.x} y1={O0.y + 54} y2={O0.y + 54} stroke={C.sAsB} stroke-width="10" stroke-dasharray="4 3" />
      {/if}
    </svg>
  </div>

  <div class="lab__panel">
    <div class="card">
      <p class="muted">{tf(lang, 'angleSum.stepOf', { n: step, total: STEPS })}</p>
      <h3>{tr(`angleSum.title${step}` as TKey)}</h3>
      <p>{tr(captions[step - 1]!)}</p>
    </div>
    <div class="row">
      <button type="button" class="button button--secondary" disabled={step === 1} onclick={() => step--}>← {tr('ui.back')}</button>
      <button type="button" class="button" disabled={step === STEPS} onclick={() => step++}>{tr('ui.next')} →</button>
    </div>

    <Slider label={tr('angleSum.angleA')} bind:value={A} min={5} max={80} display="{A}°" color="#c42a7a" onchange={clampB} />
    <Slider label={tr('angleSum.angleB')} bind:value={B} min={5} max={80} display="{B}°" color="#0a7a8a" onchange={clampA} />

    <div class="card">
      {#if step < 5}
        <p class="eq num"><span class="sin">sin(A+B)</span> = sin {A + B}° = {n(sinD(A + B))}</p>
        <p class="eq num"><span class="cos">cos(A+B)</span> = cos {A + B}° = {n(cosD(A + B))}</p>
        {#if step >= 3}<p class="num"><span style:color={C.sAcB}>cos B·sin A</span> = {n(F.parts.sinAcosB)} · <span style:color={C.cAcB}>cos B·cos A</span> = {n(F.parts.cosAcosB)}</p>{/if}
        {#if step >= 4}<p class="num"><span style:color={C.cAsB}>sin B·cos A</span> = {n(F.parts.cosAsinB)} · <span style:color={C.sAsB}>sin B·sin A</span> = {n(F.parts.sinAsinB)}</p>{/if}
      {:else}
        <p class="eq">
          <span class="sin">sin(A+B)</span> = <span style:color={C.sAcB}>sin A·cos B</span> + <span style:color={C.cAsB}>cos A·sin B</span>
        </p>
        <p class="num">{n(sinD(A + B))} = {n(F.parts.sinAcosB)} + {n(F.parts.cosAsinB)}</p>
        <p class="eq">
          <span class="cos">cos(A+B)</span> = <span style:color={C.cAcB}>cos A·cos B</span> − <span style:color={C.sAsB}>sin A·sin B</span>
        </p>
        <p class="num">{n(cosD(A + B))} = {n(F.parts.cosAcosB)} − {n(F.parts.sinAsinB)}</p>
        <p class="note note--ok">{tr('angleSum.done')}</p>
      {/if}
    </div>
  </div>
</div>

<style>
  .axis {
    stroke: var(--axis);
    stroke-width: 1.5;
  }

  .pt {
    font-size: 18px;
    font-weight: 700;
    fill: var(--ink);
  }

  .lbl {
    font-size: 19px;
    font-weight: 700;
  }

  .lbl.small {
    font-size: 15px;
  }

  .faded {
    opacity: 0.25;
  }

  .eq {
    margin-bottom: var(--space-1);
  }
</style>
