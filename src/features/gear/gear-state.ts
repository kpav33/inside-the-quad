import type { ChargerMode, RadioModeId, VideoSystem } from '@/content/gear';
import type { GearId } from '@/shared/domain/gear';
import { LIPO_CELL_VOLTS, packVolts } from '@/shared/domain/lipo';

/** What the open gear sheet's controls are set to. */
export type GearState =
  | { gear: 'radio'; armed: boolean; mode: RadioModeId }
  | { gear: 'goggles'; system: VideoSystem }
  | { gear: 'charger'; mode: ChargerMode };

/** Each sheet as it opens: the radio disarmed in acro, analog goggles, the charger charging. */
export function initialGearState(gear: GearId): GearState {
  switch (gear) {
    case 'radio':
      return { gear, armed: false, mode: 'acro' };
    case 'goggles':
      return { gear, system: 'analog' };
    case 'charger':
      return { gear, mode: 'charge' };
  }
}

/** A cell's voltage, and the pack's, at the end of a charger mode. */
export function chargerCells(
  mode: ChargerMode,
  cells: number,
): { cellVolts: number; packVolts: number } {
  const cellVolts = mode === 'charge' ? LIPO_CELL_VOLTS.full : LIPO_CELL_VOLTS.storage;
  return { cellVolts, packVolts: packVolts(cells, cellVolts) };
}

/** How full a cell bar is drawn, from 0 at the lowest safe resting voltage to 1 when full. */
export function cellFill(volts: number): number {
  const { minResting, full } = LIPO_CELL_VOLTS;
  return Math.min(Math.max((volts - minResting) / (full - minResting), 0), 1);
}
