import { type RefObject, useEffect, useRef } from 'react';

import { usePrefersReducedMotion } from '@/shared/ui/usePrefersReducedMotion';

/**
 * When the step changes on the same sheet (a step button, Play, a click on the drawing), brings the
 * new step into view if it isn't, clear of the step controls pinned above it. Opening a sheet (a new
 * `sheet`) doesn't scroll: its heading takes focus.
 */
export function useStepScroll(
  list: RefObject<HTMLElement | null>,
  controls: RefObject<HTMLElement | null>,
  sheet: string,
  step: number,
): void {
  const reduceMotion = usePrefersReducedMotion();
  const shown = useRef({ sheet, step });
  useEffect(() => {
    const before = shown.current;
    shown.current = { sheet, step };
    if (before.sheet !== sheet || before.step === step) return;
    const current = list.current?.querySelector<HTMLElement>('[aria-current="step"]');
    // Not every environment can scroll an element into view (jsdom can't).
    if (typeof current?.scrollIntoView !== 'function') return;
    // Leave room for the step controls pinned above the steps, so the step isn't tucked under them.
    // When the controls aren't pinned (a phone's moves sheet), the stylesheet's own scroll margin
    // keeps the step clear of the drawing pinned there.
    const bar = controls.current;
    const style = bar ? getComputedStyle(bar) : null;
    if (bar && style?.position === 'sticky') {
      const pinned = (parseFloat(style.top) || 0) + bar.offsetHeight;
      current.style.scrollMarginTop = `${String(pinned + 8)}px`;
    } else {
      current.style.removeProperty('scroll-margin-top');
    }
    current.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [list, controls, sheet, step, reduceMotion]);
}
