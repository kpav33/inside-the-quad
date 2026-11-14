import { COLOR, MODEL_COLOR, MODEL_LOOK } from '@/shared/design/tokens';
import type { PartId } from '@/shared/domain/parts';

/**
 * How a part is drawn for the sheet that is open: the open part itself, a part it connects to, a
 * part unrelated to it, or (no sheet open) the plain drawing.
 */
export type PartLook = 'open' | 'connected' | 'faded' | 'normal';

export function partLook(
  part: PartId,
  open: PartId | null,
  connected: ReadonlySet<PartId>,
): PartLook {
  if (open === null) return 'normal';
  if (part === open) return 'open';
  return connected.has(part) ? 'connected' : 'faded';
}

/**
 * The plain drawing is drafting-white ink lines over a dark fill, like a drawing on carbon black.
 * The open part is filled with redline, the same accent the parts list uses for the selected row,
 * with dark edges so its shape still reads. Connected parts keep a lighter grey fill; the rest
 * fade to faint lines so the open part and its connections stand out.
 */
export function partAppearance(
  part: PartId,
  look: PartLook,
): { color: string; edgeColor: string; opacity: number } {
  switch (look) {
    case 'open':
      return { color: COLOR.accent, edgeColor: COLOR.ground, opacity: 1 };
    case 'connected':
      return { color: MODEL_LOOK.connected, edgeColor: COLOR.ink, opacity: 1 };
    case 'faded':
      return { color: COLOR.ground, edgeColor: COLOR.ruleStrong, opacity: MODEL_LOOK.fadedOpacity };
    case 'normal':
      return { color: MODEL_COLOR[part], edgeColor: COLOR.ink, opacity: 1 };
  }
}
