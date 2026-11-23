/**
 * The live width of an element, for scenes that switch to a taller layout
 * on phones. Starts "wide" so the server-rendered page matches desktops.
 */
export class Width {
  px = $state(1200);

  observe(el: Element): () => void {
    const ro = new ResizeObserver(([entry]) => {
      if (entry) this.px = entry.contentRect.width;
    });
    ro.observe(el);
    return () => ro.disconnect();
  }
}
