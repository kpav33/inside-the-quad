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
 * Stepping through the open path and playing it. The step itself lives outside (in the address):
 * this hook reads `step` and asks for changes with `onStep`, clamped to the path's stops. Any step
 * by hand stops play, and so does another path opening.
 */
export function usePathStep(
  path: PathId | null,
  stopCount: number,
  step: number,
  onStep: (step: number) => void,
): PathStep {
  const [playing, setPlaying] = useState<{ path: PathId | null; on: boolean }>({
    path,
    on: false,
  });
  // Play belongs to the path it started on; another path opens stopped.
  const isPlaying = playing.on && playing.path === path;

  const last = Math.max(stopCount - 1, 0);
  const clamp = useCallback((value: number) => Math.min(Math.max(value, 0), last), [last]);

  const goTo = useCallback(
    (value: number) => {
      setPlaying({ path, on: false });
      onStep(clamp(value));
    },
    [clamp, onStep, path],
  );
  const next = useCallback(() => {
    goTo(step + 1);
  }, [goTo, step]);
  const previous = useCallback(() => {
    goTo(step - 1);
  }, [goTo, step]);
  const play = useCallback(() => {
    if (last === 0) return;
    if (step >= last) onStep(0);
    setPlaying({ path, on: true });
  }, [last, onStep, path, step]);
  const stop = useCallback(() => {
    setPlaying({ path, on: false });
  }, [path]);

  useEffect(() => {
    if (!isPlaying) return;
    if (step >= last) {
      setPlaying({ path, on: false });
      return;
    }
    const timer = window.setTimeout(() => {
      onStep(clamp(step + 1));
    }, PLAY_INTERVAL_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [isPlaying, step, last, clamp, onStep, path]);

  return { step, goTo, next, previous, playing: isPlaying, play, stop };
}
