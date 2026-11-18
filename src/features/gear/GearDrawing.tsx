import { ChargerDrawing } from './ChargerDrawing';
import type { GearState } from './gear-state';
import { GogglesDrawing } from './GogglesDrawing';
import { RadioDrawing } from './RadioDrawing';

export interface GearDrawingProps {
  state: GearState;
  /** The part to draw in redline, or null. */
  highlight: string | null;
  onHighlight: (part: string | null) => void;
}

/**
 * The open gear sheet's drawing, in the drawing field where the 3D drone is on other sheets: a flat
 * front view with each part named. Hidden from assistive technology: the sheet says it all in
 * words, and its list of parts highlights them from the keyboard.
 */
export function GearDrawing({ state, highlight, onHighlight }: GearDrawingProps) {
  const shared = { highlight, onHighlight };
  return (
    <svg
      className="gear-drawing"
      data-gear={state.gear}
      viewBox="0 0 400 300"
      aria-hidden="true"
      focusable="false"
    >
      {state.gear === 'radio' ? (
        <RadioDrawing state={state} {...shared} />
      ) : state.gear === 'goggles' ? (
        <GogglesDrawing state={state} {...shared} />
      ) : (
        <ChargerDrawing state={state} {...shared} />
      )}
    </svg>
  );
}
