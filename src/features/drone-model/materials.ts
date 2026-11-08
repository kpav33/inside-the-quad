import { COLOR, MODEL_COLOR } from '@/shared/design/tokens';
import type { PartId } from '@/shared/domain/parts';

/**
 * How a part is drawn. Parts carry drafting edges like a technical drawing; the selected part is
 * filled and edged in redline, the same accent the parts list uses for the selected row.
 */
export function partAppearance(
  part: PartId,
  highlighted: boolean,
): { color: string; edgeColor: string } {
  return highlighted
    ? { color: COLOR.accent, edgeColor: COLOR.accent }
    : { color: MODEL_COLOR[part], edgeColor: COLOR.muted };
}
