import type { PartId } from '@/shared/domain/parts';

import { LESSONS } from './lessons';

/**
 * The parts a part's lesson says it connects to ("What is it connected to?"), each once and
 * without the part itself. The 3D drawing keeps these drawn when the part's sheet is open.
 */
export function connectedParts(part: PartId): ReadonlySet<PartId> {
  const parts = new Set<PartId>();
  for (const { partId } of LESSONS[part].connections) {
    if (partId !== undefined && partId !== part) parts.add(partId);
  }
  return parts;
}
