import { useCallback, useEffect, useRef } from 'react';

import { type Flight, runDemo, stopDemo } from '@/features/flight';
import { MOVE_STEP_IDS } from '@/shared/domain/moves';
import type { SteppedSheet } from '@/shared/domain/sheets';
import { usePrefersReducedMotion } from '@/shared/ui/usePrefersReducedMotion';

import { useFlightSheet } from './useFlightSheet';

export interface MovesSheet {
  /** The drone while the sheet is open; null otherwise. */
  flight: Flight | null;
  /** The current step, from 0, kept inside the sheet's steps. */
  step: number;
  goTo: (step: number) => void;
  /** Plays the current step's demo again, motion reduced or not. */
  showMe: () => void;
}

/**
 * The moves sheet's drone and step. The drone exists while the sheet is open and is dropped when
 * it closes; the step lives in the address (from 1). Opening a step plays its demo, unless motion
 * is reduced, when "Show me" plays it.
 */
export function useMovesSheet(
  open: boolean,
  addressStep: number,
  replaceStep: (sheet: SteppedSheet, step: number) => void,
): MovesSheet {
  const { flight, step, goTo } = useFlightSheet(
    'moves',
    open,
    addressStep,
    MOVE_STEP_IDS.length,
    replaceStep,
  );

  // Read at the moment a step opens; switching reduced motion on mid-demo doesn't replay anything.
  const reduceMotion = usePrefersReducedMotion();
  const reduced = useRef(reduceMotion);
  reduced.current = reduceMotion;
  const stepId = MOVE_STEP_IDS[step];
  // Each step owns whatever demo plays on it, opened automatically or by Show me: leaving the
  // step stops it.
  useEffect(() => {
    if (!flight || !stepId) return;
    if (!reduced.current) runDemo(flight, stepId);
    return () => {
      stopDemo(flight);
    };
  }, [flight, stepId]);
  // Asking for reduced motion mid-demo stops it at once; asking for motion again starts nothing.
  useEffect(() => {
    if (reduceMotion && flight) stopDemo(flight);
  }, [reduceMotion, flight]);

  const showMe = useCallback(() => {
    if (flight && stepId) runDemo(flight, stepId);
  }, [flight, stepId]);

  return { flight, step, goTo, showMe };
}
