import type { PartId } from '@/shared/domain/parts';
import type { PathId } from '@/shared/domain/paths';

import { controlPath } from './control';
import { powerPath } from './power';
import type { PathContent } from './types';
import { videoPath } from './video';

export type { PathContent, PathStop } from './types';

export const PATHS: Record<PathId, PathContent> = {
  control: controlPath,
  power: powerPath,
  video: videoPath,
};

/**
 * The stop a part on the drawing stands for on a path (from 0): the stop with that part alone,
 * else the first stop with it; null when the path doesn't pass it.
 */
export function stopForPart(path: PathId, part: PartId): number | null {
  const { stops } = PATHS[path];
  const alone = stops.findIndex((stop) => stop.parts.length === 1 && stop.parts[0] === part);
  if (alone !== -1) return alone;
  const first = stops.findIndex((stop) => stop.parts.includes(part));
  return first === -1 ? null : first;
}

/** Every part a path passes, at any stop. */
export function pathParts(path: PathId): ReadonlySet<PartId> {
  return new Set(PATHS[path].stops.flatMap((stop) => stop.parts));
}
