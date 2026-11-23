<script lang="ts">
  /** Home-page animation: a point goes round a circle and its height draws a sine wave. */
  import { onMount } from 'svelte';

  let { label }: { label: string } = $props();

  let angle = $state(30);
  let raf = 0;
  let last = 0;

  onMount(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      angle = (angle + 60 * dt) % 360;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  });

  const C = { x: 95, y: 130 };
  const R = 80;
  const gx = (d: number) => 210 + d * 0.62;
  const rad = (d: number) => (d * Math.PI) / 180;
  const P = $derived({ x: C.x + R * Math.cos(rad(angle)), y: C.y - R * Math.sin(rad(angle)) });
  const trace = $derived.by(() => {
    let d = '';
    for (let x = 0; x <= angle; x += 3) d += `${x === 0 ? 'M' : 'L'}${gx(x).toFixed(1)} ${(C.y - R * Math.sin(rad(x))).toFixed(1)}`;
    return d;
  });
</script>

<svg viewBox="0 0 440 260" role="img" aria-label={label}>
  <line x1="5" x2="435" y1={C.y} y2={C.y} stroke="#cfcdc7" stroke-width="1.5" />
  <circle cx={C.x} cy={C.y} r={R} fill="#fff" stroke="#b9b7b0" stroke-width="2" />
  <line x1={C.x} y1={C.y} x2={P.x} y2={C.y} stroke="#1e64c8" stroke-width="6" stroke-linecap="round" />
  <line x1={P.x} y1={C.y} x2={P.x} y2={P.y} stroke="#d42a45" stroke-width="6" stroke-linecap="round" />
  <line x1={C.x} y1={C.y} x2={P.x} y2={P.y} stroke="#2b2b2b" stroke-width="3" />
  <line x1={P.x} y1={P.y} x2={gx(angle)} y2={P.y} stroke="#d42a45" stroke-width="1.5" stroke-dasharray="4 5" />
  <path d={trace} fill="none" stroke="#d42a45" stroke-width="5" stroke-linecap="round" />
  <circle cx={gx(angle)} cy={P.y} r="7" fill="#d42a45" />
  <circle cx={P.x} cy={P.y} r="9" fill="#fff" stroke="#6a3fc8" stroke-width="4" />
</svg>

<style>
  svg {
    width: 100%;
    height: 100%;
  }
</style>
