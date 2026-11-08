import { COLOR, MODEL_COLOR } from '@/shared/design/tokens';
import type { PartId } from '@/shared/domain/parts';

/**
 * How a part is drawn: drafting-white ink lines over a dark fill, like a drawing on carbon black.
 * The selected part is filled with redline, the same accent the parts list uses for the selected
 * row, with dark edges so its shape still reads.
 */
export function partAppearance(
  part: PartId,
  highlighted: boolean,
): { color: string; edgeColor: string } {
  return highlighted
    ? { color: COLOR.accent, edgeColor: COLOR.ground }
    : { color: MODEL_COLOR[part], edgeColor: COLOR.ink };
}
