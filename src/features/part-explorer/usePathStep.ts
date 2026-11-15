import { useCallback, useEffect, useState } from 'react';

import type { PathId } from '@/shared/domain/paths';

/** How long "Play the path" stays on each stop. */
export const PLAY_INTERVAL_MS = 3500;

export interface PathStep {
  /** The current stop, from 0. */
  step: number;
  goTo: (step: number) => void;
  next: () => void;
  previous: () => void;
  playing: boolean;
  /** Walks the path one stop at a time to its end; from the last stop it starts over. */
  play: () => void;
  stop: () => void;
}

/**
 * The current stop on the open path, and playing through it. Any step by hand stops play; a new
 * path (or the sheet closing) starts again at stop 1, not playing, so no step from one path is
 * ever used on another.
 */
export function usePathStep(path: PathId | null, stopCount: number): PathStep {
  const [state, setState] = useState({ path, step: 0, playing: false });
  // A different path from the one the state belongs to starts fresh, in the same render.
  const current = state.path === path ? state : { path, step: 0, playing: false };
  if (current !== state) setState(current);

  const last = Math.max(stopCount - 1, 0);
  const clamp = useCallback((step: number) => Math.min(Math.max(step, 0), last), [last]);

  const goTo = useCallback(
    (step: number) => {
      setState((s) => ({ ...s, step: clamp(step), playing: false }));
    },
    [clamp],
  );
  const next = useCallback(() => {
    setState((s) => ({ ...s, step: clamp(s.step + 1), playing: false }));
  }, [clamp]);
  const previous = useCallback(() => {
    setState((s) => ({ ...s, step: clamp(s.step - 1), playing: false }));
  }, [clamp]);
  const play = useCallback(() => {
    setState((s) => ({ ...s, step: s.step >= last ? 0 : s.step, playing: last > 0 }));
  }, [last]);
  const stop = useCallback(() => {
    setState((s) => ({ ...s, playing: false }));
  }, []);

  const { playing, step } = current;
  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      setState((s) => {
        const following = clamp(s.step + 1);
        return { ...s, step: following, playing: following < last };
      });
    }, PLAY_INTERVAL_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [playing, step, clamp, last]);

  return { step, goTo, next, previous, playing, play, stop };
}
