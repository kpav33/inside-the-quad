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

/** Every part a path passes, at any stop. */
export function pathParts(path: PathId): ReadonlySet<PartId> {
  return new Set(PATHS[path].stops.flatMap((stop) => stop.parts));
}
