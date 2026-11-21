import { type RefObject, useEffect, useState } from 'react';

/** The share of the window the pinned step controls may take before they stop being pinned. */
export const MAX_PINNED_SHARE = 0.25;

/** True when controls of this height may stay pinned in a window this tall. */
export function mayPin(controlsHeight: number, windowHeight: number): boolean {
  return controlsHeight <= windowHeight * MAX_PINNED_SHARE;
}

/**
 * Whether the step controls may stay pinned at the top of the sheet. With large text on a small
 * screen they grow to several rows; pinned, they would cover the very links a keyboard user tabs to
 * (WCAG 2.4.11), so past a quarter of the window they scroll with the sheet instead.
 */
export function usePinnedWhileShort(controls: RefObject<HTMLElement | null>): boolean {
  const [pinned, setPinned] = useState(true);
  useEffect(() => {
    const bar = controls.current;
    if (!bar) return;
    const measure = () => {
      setPinned(mayPin(bar.offsetHeight, window.innerHeight));
    };
    measure();
    window.addEventListener('resize', measure);
    // The bar grows when its buttons wrap, e.g. when the text size changes.
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null;
    observer?.observe(bar);
    return () => {
      window.removeEventListener('resize', measure);
      observer?.disconnect();
    };
  }, [controls]);
  return pinned;
}
