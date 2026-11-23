<script lang="ts">
  /**
   * Right triangle lab: SOH-CAH-TOA. Drag the top corner; the ratios only
   * depend on the angle, never on the size. Second mode: how tall is the tower?
   */
  import Slider from '../../ui/Slider.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import { arcPath, arrowStep, startDrag, type Pt } from '../../ui/svg';
  import { t, tf, type Locale, type TKey } from '../../i18n';
  import { cosD, sinD, tanD, toDeg } from '../../math/angles';
  import { closeEnough, towerProblem, type TowerProblem } from '../../math/problems';
  import { deg, num } from '../../shared/format';

  let { lang }: { lang: Locale } = $props();
  const tr = (k: TKey) => t(lang, k);
  const n = (v: number, d = 2) => num(lang, v, d);

  // ---- Explore mode ----
  const W = 640;
  const H = 440;
  const O = { x: 70, y: 380 }; // corner with the angle θ
  const UNIT = 48; // SVG units per length unit
  const MAX_HYP = 7;

  let mode = $state<'explore' | 'tower'>('explore');
  let angle = $state(37);
  let hyp = $state(6);

  const adj = $derived(hyp * cosD(angle));
  const opp = $derived(hyp * sinD(angle));
  const P = $derived({ x: O.x + adj * UNIT, y: O.y - opp * UNIT }); // top corner
  const R = $derived({ x: P.x, y: O.y }); // right-angle corner

  // Remember the ratios before a size change to show "they didn't change!"
  let sizeNoteFor = $state<number | null>(null);

  let svg: SVGSVGElement | undefined = $state();

  function setFromPoint(p: Pt) {
    const dx = Math.max(0.6, (p.x - O.x) / UNIT);
    const dy = Math.max(0.4, (O.y - p.y) / UNIT);
    const a = Math.min(80, Math.max(8, toDeg(Math.atan2(dy, dx))));
    const h = Math.min(MAX_HYP, Math.max(2, Math.hypot(dx, dy)));
    angle = Math.round(a);
    hyp = Math.round(h * 10) / 10;
    sizeNoteFor = null;
  }

  function onKey(e: KeyboardEvent) {
    const step = arrowStep(e, 0.2);
    if (!step) return;
    e.preventDefault();
    setFromPoint({ x: P.x + step.x * UNIT, y: P.y - step.y * UNIT });
  }

  // Side label positions
  const mid = (a: Pt, b: Pt) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  // Hypotenuse label: just above the side, written along it
  const hypLabel = $derived.by(() => {
    const m = mid(O, P);
    const len = Math.hypot(P.x - O.x, P.y - O.y);
    return { x: m.x + ((P.y - O.y) / len) * 14, y: m.y - ((P.x - O.x) / len) * 14 };
  });

  // ---- Tower mode ----
  let problem = $state<TowerProblem>(towerProblem());
  let guess = $state<number | null>(null);
  let verdict = $state<'none' | 'right' | 'wrong'>('none');
  let solved = $state(0);

  function newTower() {
    problem = towerProblem();
    guess = null;
    verdict = 'none';
  }

  function checkTower() {
    if (guess === null || !Number.isFinite(guess)) return;
    verdict = closeEnough(guess, problem.height) ? 'right' : 'wrong';
    if (verdict === 'right') solved++;
  }

  // Tower scene: fit distance and height into the picture
  const tower = $derived.by(() => {
    const ground = 380;
    const eye = { x: 90, y: ground };
    const k = Math.min(440 / problem.distance, 300 / problem.height);
    const base = { x: eye.x + problem.distance * k, y: ground };
    const top = { x: base.x, y: ground - problem.height * k };
    return { ground, eye, base, top, k };
  });
</script>

<div class="lab">
  <div class="lab__scene">
    {#if mode === 'explore'}
      <svg bind:this={svg} viewBox="0 0 {W} {H}" role="img" aria-label={tf(lang, 'ratios.sceneLabel', { a: angle })}>
        <!-- triangle fill -->
        <polygon points="{O.x},{O.y} {R.x},{R.y} {P.x},{P.y}" fill="#f6f2fd" />
        <!-- sides -->
        <line x1={O.x} y1={O.y} x2={R.x} y2={R.y} stroke="var(--cos)" stroke-width="6" stroke-linecap="round" />
        <line x1={R.x} y1={R.y} x2={P.x} y2={P.y} stroke="var(--sin)" stroke-width="6" stroke-linecap="round" />
        <line x1={O.x} y1={O.y} x2={P.x} y2={P.y} stroke="var(--hyp)" stroke-width="5" stroke-linecap="round" />
        <!-- right angle mark -->
        <polyline
          points="{R.x - 18},{R.y} {R.x - 18},{R.y - 18} {R.x},{R.y - 18}"
          fill="none"
          stroke="var(--ink-2)"
          stroke-width="2"
        />
        <!-- angle -->
        <path d={arcPath(O, 46, 0, angle)} fill="none" stroke="var(--brand)" stroke-width="3" />
        <text x={O.x + 54} y={O.y - 12} class="angle">θ = {angle}°</text>

        <!-- labels -->
        <text x={mid(O, R).x} y={O.y + 32} text-anchor="middle" class="side cos"
          >{tr('ratios.adjacent')} = {n(adj, 1)}</text
        >
        <text x={R.x + 12} y={mid(R, P).y} class="side sin">{tr('ratios.opposite')}</text>
        <text x={R.x + 12} y={mid(R, P).y + 22} class="side sin">= {n(opp, 1)}</text>
        <text
          x={hypLabel.x}
          y={hypLabel.y}
          text-anchor="middle"
          class="side hyp"
          transform="rotate({-angle} {hypLabel.x} {hypLabel.y})">{tr('ratios.hypotenuse')} = {n(hyp, 1)}</text
        >

        <!-- draggable top corner -->
        <g
          class="handle"
          role="slider"
          tabindex="0"
          aria-label={tr('ratios.dragCorner')}
          aria-valuenow={angle}
          aria-valuetext={tf(lang, 'ratios.sceneLabel', { a: angle })}
          onpointerdown={(e) => svg && startDrag(e, svg, setFromPoint)}
          onkeydown={onKey}
        >
          <circle cx={P.x} cy={P.y} r="16" fill="#fff" stroke="var(--brand)" stroke-width="4" />
          <circle cx={P.x} cy={P.y} r="30" fill="transparent" />
        </g>
        <text x={P.x} y={P.y - 26} text-anchor="middle" class="hint">{tr('ratios.dragMe')}</text>
      </svg>
    {:else}
      {@const T = tower}
      <svg viewBox="0 0 {W} {H}" role="img" aria-label={tr('ratios.towerSceneLabel')}>
        <rect x="0" y="0" width={W} height={T.ground} fill="#eaf4ff" />
        <rect x="0" y={T.ground} width={W} height={H - T.ground} fill="#cfe8c4" />
        <!-- tower -->
        <rect x={T.base.x - 12} y={T.top.y} width="24" height={T.ground - T.top.y} fill="#9b8f80" />
        <polygon points="{T.base.x - 18},{T.top.y} {T.base.x + 18},{T.top.y} {T.base.x},{T.top.y - 22}" fill="#c0392b" />
        <!-- kid -->
        <circle cx={T.eye.x - 18} cy={T.ground - 36} r="9" fill="#444" />
        <line x1={T.eye.x - 18} y1={T.ground - 27} x2={T.eye.x - 18} y2={T.ground - 8} stroke="#444" stroke-width="4" />
        <!-- line of sight + triangle -->
        <line x1={T.eye.x} y1={T.ground} x2={T.top.x} y2={T.top.y} stroke="var(--hyp)" stroke-width="3" stroke-dasharray="8 6" />
        <line x1={T.eye.x} y1={T.ground} x2={T.base.x} y2={T.ground} stroke="var(--cos)" stroke-width="5" />
        <line x1={T.base.x + 20} y1={T.ground} x2={T.top.x + 20} y2={T.top.y} stroke="var(--sin)" stroke-width="5" />
        <path d={arcPath(T.eye, 50, 0, problem.angle)} fill="none" stroke="var(--brand)" stroke-width="3" />
        <text x={T.eye.x + 58} y={T.ground - 10} class="angle">{problem.angle}°</text>
        <text x={(T.eye.x + T.base.x) / 2} y={T.ground + 30} text-anchor="middle" class="side cos"
          >{n(problem.distance, 0)} m</text
        >
        <text x={T.base.x + 30} y={(T.ground + T.top.y) / 2} class="side sin"
          >{verdict === 'right' ? `${n(problem.height, 1)} m` : '? m'}</text
        >
      </svg>
      {#if verdict === 'right'}<div class="banner">{tr('ratios.towerRight')}</div>{/if}
    {/if}
  </div>

  <div class="lab__panel">
    <Segmented
      label={tr('ui.mode')}
      bind:value={mode}
      options={[
        { value: 'explore', label: tr('ratios.modeExplore') },
        { value: 'tower', label: tr('ratios.modeTower') },
      ]}
    />

    {#if mode === 'explore'}
      <Slider label={tr('ratios.angle')} bind:value={angle} min={8} max={80} display="{angle}°" onchange={() => (sizeNoteFor = null)} />
      <Slider
        label={tr('ratios.size')}
        bind:value={hyp}
        min={2}
        max={MAX_HYP}
        step={0.1}
        display={n(hyp, 1)}
        color="var(--hyp)"
        onchange={() => (sizeNoteFor = angle)}
      />

      <div class="card ratios">
        <p class="eq">
          <span class="sin">sin θ</span> = <small>{tr('ratios.oppShort')}/{tr('ratios.hypShort')}</small> =
          <span class="num">{n(opp, 1)} / {n(hyp, 1)}</span> = <span class="sin num">{n(sinD(angle), 3)}</span>
        </p>
        <p class="eq">
          <span class="cos">cos θ</span> = <small>{tr('ratios.adjShort')}/{tr('ratios.hypShort')}</small> =
          <span class="num">{n(adj, 1)} / {n(hyp, 1)}</span> = <span class="cos num">{n(cosD(angle), 3)}</span>
        </p>
        <p class="eq">
          <span class="tan">tan θ</span> = <small>{tr('ratios.oppShort')}/{tr('ratios.adjShort')}</small> =
          <span class="num">{n(opp, 1)} / {n(adj, 1)}</span> = <span class="tan num">{n(tanD(angle), 3)}</span>
        </p>
      </div>

      {#if sizeNoteFor === angle}
        <p class="note note--ok">{tr('ratios.sizeNote')}</p>
      {:else}
        <p class="note">{tr('ratios.mnemonic')}</p>
      {/if}

      <div class="card">
        <h3>{tr('ratios.pythTitle')}</h3>
        <p class="num">
          {n(opp, 1)}² + {n(adj, 1)}² = {n(opp * opp + adj * adj, 1)} = {n(hyp, 1)}²
        </p>
        <p class="num">
          <span class="sin">sin²θ</span> + <span class="cos">cos²θ</span> = {n(sinD(angle) ** 2, 3)} + {n(
            cosD(angle) ** 2,
            3,
          )} = <strong>1</strong>
        </p>
        <p class="muted">{tr('ratios.pythText')}</p>
      </div>
    {:else}
      <div class="card">
        <h3>{tr('ratios.towerTitle')}</h3>
        <p>{tf(lang, 'ratios.towerText', { d: n(problem.distance, 0), a: problem.angle })}</p>
        <p class="muted">{tf(lang, 'ratios.towerTable', { a: problem.angle, t: n(tanD(problem.angle), 4) })}</p>
        <form
          class="row"
          onsubmit={(e) => {
            e.preventDefault();
            checkTower();
          }}
        >
          <label class="row">
            <span>{tr('ratios.height')} =</span>
            <input type="number" step="any" inputmode="decimal" bind:value={guess} oninput={() => (verdict = 'none')} />
            <span>m</span>
          </label>
          <button class="button" type="submit" disabled={guess === null}>{tr('ui.check')}</button>
        </form>
      </div>
      {#if verdict === 'right'}
        <p class="note note--ok">
          {tf(lang, 'ratios.towerExplain', { d: n(problem.distance, 0), a: problem.angle, h: n(problem.height, 2) })}
        </p>
      {:else if verdict === 'wrong'}
        <p class="note note--warn">{tr('ratios.towerWrong')}</p>
      {/if}
      <div class="row">
        <button class="button button--secondary" type="button" onclick={newTower}>{tr('ratios.newTower')}</button>
        {#if solved > 0}<span class="score">★ {solved}</span>{/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .angle {
    font-size: 20px;
    font-weight: 700;
    fill: var(--brand);
  }

  .side {
    font-size: 19px;
    font-weight: 700;
  }

  .side.sin {
    fill: var(--sin);
  }

  .side.cos {
    fill: var(--cos);
  }

  .side.hyp {
    fill: var(--hyp);
  }

  .hint {
    font-size: 14px;
    fill: var(--ink-muted);
  }

  .ratios .eq {
    margin-bottom: var(--space-2);
  }
</style>
