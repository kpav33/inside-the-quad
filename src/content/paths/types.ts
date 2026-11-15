import type { PartId } from '@/shared/domain/parts';
import type { AnchorId, PathId } from '@/shared/domain/paths';

/** One stop on a path: what reaches it, and what it does with it. */
export interface PathStop {
  /** The stop's name in the list, e.g. "Flight controller". */
  name: string;
  /** Parts lit at this step, each linked to its lesson; empty for an off-drone end. */
  parts: readonly PartId[];
  /** An off-drone end (the radio or goggles); its name links to the intro sheet. */
  end?: 'radio' | 'goggles';
  /** Where the path's leader touches this stop on the drawing. */
  anchors: readonly AnchorId[];
  /** The stops (by index) this one feeds; empty at the path's end or a branch end. */
  feeds: readonly number[];
  /** What reaches this stop and what it does with it, in one or two plain sentences. */
  text: string;
}

/** A path through the drone: a numbered walk from where something starts to where it ends. */
export interface PathContent {
  id: PathId;
  title: string;
  /** One line under the heading: what the path shows. */
  lead: string;
  stops: readonly PathStop[];
}
