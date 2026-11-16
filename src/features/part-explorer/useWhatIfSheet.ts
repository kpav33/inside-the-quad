import { useEffect } from 'react';

import { WHAT_IF_STEP_IDS } from '@/shared/domain/what-if';
import type { SteppedSheet } from '@/shared/domain/sheets';

import { type FlightSheet, useFlightSheet } from './useFlightSheet';

/**
 * The what-if sheet's drone and step. Each mistake belongs to its step: opening another one
 * starts over with a healthy drone (the flight is dropped altogether when the sheet closes).
 */
export function useWhatIfSheet(
  open: boolean,
  addressStep: number,
  replaceStep: (sheet: SteppedSheet, step: number) => void,
): FlightSheet {
  const sheet = useFlightSheet('what-if', open, addressStep, WHAT_IF_STEP_IDS.length, replaceStep);
  const { flight, step } = sheet;
  useEffect(() => {
    return () => {
      flight?.reset();
    };
  }, [flight, step]);
  return sheet;
}
