/** Small helpers for the SVG scenes: coordinate scales and dragging. */

export interface Pt {
  x: number;
  y: number;
}

/** Linear map from maths coordinates to SVG coordinates (y grows upward). */
export interface Scale {
  sx: (x: number) => number;
  sy: (y: number) => number;
  ix: (px: number) => number;
  iy: (py: number) => number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  /** Plot box in SVG units. */
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export function makeScale(
  [x0, x1]: [number, number],
  [y0, y1]: [number, number],
  { left, right, top, bottom }: { left: number; right: number; top: number; bottom: number },
): Scale {
  const kx = (right - left) / (x1 - x0);
  const ky = (bottom - top) / (y1 - y0);
  return {
    sx: (x) => left + (x - x0) * kx,
    sy: (y) => bottom - (y - y0) * ky,
    ix: (px) => x0 + (px - left) / kx,
    iy: (py) => y0 + (bottom - py) / ky,
    x0,
    x1,
    y0,
    y1,
    left,
    right,
    top,
    bottom,
  };
}

/** Pointer position in the SVG's own coordinates (viewBox units). */
export function svgPoint(svg: SVGSVGElement, e: { clientX: number; clientY: number }): Pt {
  const m = svg.getScreenCTM();
  if (!m) return { x: 0, y: 0 };
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
  return { x: p.x, y: p.y };
}

/**
 * Start dragging from a pointerdown: calls `onmove` with SVG coordinates
 * until the pointer is released. Works the same for mouse, touch and pen.
 */
export function startDrag(
  e: PointerEvent,
  svg: SVGSVGElement,
  onmove: (p: Pt) => void,
  onend?: () => void,
): void {
  if (e.button !== 0) return;
  e.preventDefault();
  const target = e.currentTarget as Element;
  target.setPointerCapture?.(e.pointerId);
  const move = (ev: Event) => onmove(svgPoint(svg, ev as PointerEvent));
  const up = () => {
    target.removeEventListener('pointermove', move);
    target.removeEventListener('pointerup', up);
    target.removeEventListener('pointercancel', up);
    onend?.();
  };
  target.addEventListener('pointermove', move);
  target.addEventListener('pointerup', up);
  target.addEventListener('pointercancel', up);
  onmove(svgPoint(svg, e));
}

/** Arrow keys → a step, for moving handles with the keyboard. */
export function arrowStep(e: KeyboardEvent, step = 1): Pt | null {
  const s = e.shiftKey ? step * 5 : step;
  switch (e.key) {
    case 'ArrowLeft':
      return { x: -s, y: 0 };
    case 'ArrowRight':
      return { x: s, y: 0 };
    case 'ArrowUp':
      return { x: 0, y: s };
    case 'ArrowDown':
      return { x: 0, y: -s };
    default:
      return null;
  }
}

/** SVG path for an angle arc of radius r at centre c, from angle a0 to a1 (degrees, maths direction). */
export function arcPath(c: Pt, r: number, a0: number, a1: number): string {
  const rad = Math.PI / 180;
  const p0 = { x: c.x + r * Math.cos(a0 * rad), y: c.y - r * Math.sin(a0 * rad) };
  const p1 = { x: c.x + r * Math.cos(a1 * rad), y: c.y - r * Math.sin(a1 * rad) };
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  const sweep = a1 > a0 ? 0 : 1;
  return `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${large} ${sweep} ${p1.x} ${p1.y}`;
}

/** Polyline segments → one SVG path string. Clamps huge values (tan) so paths stay sane. */
export function segmentsPath(segs: [number, number][][], s: Scale, clamp = 1e4): string {
  return segs
    .map((seg) =>
      seg
        .map(([x, y], i) => {
          const py = Math.max(-clamp, Math.min(clamp, s.sy(y)));
          return `${i === 0 ? 'M' : 'L'}${s.sx(x).toFixed(1)} ${py.toFixed(1)}`;
        })
        .join(''),
    )
    .join('');
}
