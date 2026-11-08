import type { PartId } from '@/shared/domain/parts';

/** Base colours: placeholders until the design pass (roadmap section 02). */
export const PART_COLORS: Record<PartId, string> = {
  frame: '#2b2b2b',
  motors: '#8a8f98',
  props: '#3a7bd5',
};

export const HIGHLIGHT_EMISSIVE = '#ff8a00';

export function partEmissive(highlighted: boolean): {
  emissive: string;
  emissiveIntensity: number;
} {
  return highlighted
    ? { emissive: HIGHLIGHT_EMISSIVE, emissiveIntensity: 0.6 }
    : { emissive: '#000000', emissiveIntensity: 0 };
}
