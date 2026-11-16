import { useCallback, useEffect, useState } from 'react';

import { createFlight, type Flight } from '@/features/flight';
import type { SteppedSheet } from '@/shared/domain/sheets';

export interface FlightSheet {
  /** The drone while the sheet is open; null otherwise. */
  flight: Flight | null;
  /** The current step, from 0, kept inside the sheet's steps. */
  step: number;
  goTo: (step: number) => void;
}

/**
 * A flight sheet's drone and step (the moves and what-if sheets). Each sheet gets its own drone
 * while it is open, dropped when it closes, so nothing done on one reaches the other. The step
 * lives in the address (from 1); one past the end is replaced by the last.
 */
export function useFlightSheet(
  sheet: SteppedSheet,
  open: boolean,
  addressStep: number,
  stepCount: number,
  replaceStep: (sheet: SteppedSheet, step: number) => void,
): FlightSheet {
  const [flight, setFlight] = useState<Flight | null>(null);
  useEffect(() => {
    if (!open) return;
    const next = createFlight();
    setFlight(next);
    return () => {
      next.dispose();
      setFlight(null);
    };
  }, [open]);

  const last = stepCount - 1;
  const step = Math.min(Math.max(addressStep, 0), last);
  useEffect(() => {
    if (open && addressStep !== step) replaceStep(sheet, step + 1);
  }, [sheet, open, addressStep, step, replaceStep]);

  const goTo = useCallback(
    (next: number) => {
      replaceStep(sheet, Math.min(Math.max(next, 0), last) + 1);
    },
    [sheet, last, replaceStep],
  );
  return { flight, step, goTo };
}
