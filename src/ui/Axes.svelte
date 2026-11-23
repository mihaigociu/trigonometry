<script lang="ts">
  /**
   * Grid, axes and tick labels for a graph with x in degrees. The curves are
   * drawn by the parent using the same Scale.
   */
  import type { Scale } from './svg';

  interface Props {
    s: Scale;
    /** Degrees between x labels. */
    xStep?: number;
    yStep?: number;
    xLabel?: (x: number) => string;
    yLabel?: (y: number) => string;
  }

  let { s, xStep = 90, yStep = 1, xLabel = (x) => `${x}°`.replace('-', '−'), yLabel = (y) => String(y).replace('-', '−') }: Props =
    $props();

  const ticks = (a: number, b: number, step: number) => {
    const out: number[] = [];
    for (let v = Math.ceil(a / step) * step; v <= b + 1e-9; v += step) out.push(Math.round(v * 1e6) / 1e6);
    return out;
  };
  const xs = $derived(ticks(s.x0, s.x1, xStep));
  // Keep about 10 y labels however tall the range gets
  const yStepNice = $derived.by(() => {
    let st = yStep;
    while ((s.y1 - s.y0) / st > 12) st *= 2;
    return st;
  });
  const ys = $derived(ticks(s.y0, s.y1, yStepNice));
  const zeroY = $derived(s.sy(Math.min(Math.max(0, s.y0), s.y1)));
  const zeroX = $derived(s.sx(Math.min(Math.max(0, s.x0), s.x1)));
</script>

<g class="axes" aria-hidden="true">
  {#each xs as x (x)}
    <line x1={s.sx(x)} x2={s.sx(x)} y1={s.top} y2={s.bottom} class="grid" />
    {#if x !== 0}
      <text x={s.sx(x)} y={zeroY + 18} text-anchor="middle">{xLabel(x)}</text>
    {/if}
  {/each}
  {#each ys as y (y)}
    <line x1={s.left} x2={s.right} y1={s.sy(y)} y2={s.sy(y)} class="grid" />
    {#if y !== 0}
      <text x={zeroX - 6} y={s.sy(y) + 5} text-anchor="end">{yLabel(y)}</text>
    {/if}
  {/each}
  <line x1={s.left} x2={s.right} y1={zeroY} y2={zeroY} class="axis" />
  <line x1={zeroX} x2={zeroX} y1={s.top} y2={s.bottom} class="axis" />
  <text x={s.right - 4} y={zeroY - 8} text-anchor="end" class="name">x</text>
  <text x={zeroX + 8} y={s.top + 14} class="name">y</text>
</g>

<style>
  .grid {
    stroke: var(--grid);
    stroke-width: 1;
  }

  .axis {
    stroke: var(--axis);
    stroke-width: 1.5;
  }

  text {
    font-size: 13px;
    fill: var(--ink-2);
  }

  .name {
    font-style: italic;
    font-size: 16px;
    fill: var(--ink);
  }
</style>
