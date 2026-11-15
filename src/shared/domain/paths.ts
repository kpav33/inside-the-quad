/** The paths through the drone, as sheets after the parts: control, power, then video. */
export const PATH_IDS = ['control', 'power', 'video'] as const;

export type PathId = (typeof PATH_IDS)[number];

export function isPathId(value: unknown): value is PathId {
  return (PATH_IDS as readonly unknown[]).includes(value);
}

/**
 * Where a path's leader touches the drawing: a piece of a part, or an off-drone end (the radio
 * and goggles, which the model does not draw).
 */
export type AnchorId =
  | 'radio'
  | 'receiverAntenna'
  | 'receiver'
  | 'fc'
  | 'esc'
  | 'capacitor'
  | 'xt60'
  | 'battery'
  | 'motors'
  | 'props'
  | 'camera'
  | 'vtx'
  | 'vtxAntenna'
  | 'goggles';
