import { useState } from 'react';

import { type GearState, initialGearState } from '@/features/gear';
import type { GearId } from '@/shared/domain/gear';

interface Sheet {
  gear: GearId | null;
  state: GearState | null;
  highlight: string | null;
}

const fresh = (gear: GearId | null): Sheet => ({
  gear,
  state: gear ? initialGearState(gear) : null,
  highlight: null,
});

export interface GearSheet {
  /** The open gear sheet's switches, or null off a gear sheet. */
  state: GearState | null;
  setState: (state: GearState) => void;
  /** The part drawn in redline, or null. */
  highlight: string | null;
  setHighlight: (part: string | null) => void;
}

/**
 * The open gear sheet's switches and highlighted part. Each time a gear sheet opens, it starts
 * afresh: nothing carries over from the last visit or from another sheet.
 */
export function useGearSheet(gear: GearId | null): GearSheet {
  const [sheet, setSheet] = useState(() => fresh(gear));
  // Another sheet opened: start it afresh (set while rendering, so the old state never shows).
  if (sheet.gear !== gear) setSheet(fresh(gear));
  const current = sheet.gear === gear ? sheet : fresh(gear);
  return {
    state: current.state,
    setState: (state) => {
      setSheet((s) => ({ ...s, state }));
    },
    highlight: current.highlight,
    setHighlight: (highlight) => {
      setSheet((s) => ({ ...s, highlight }));
    },
  };
}
