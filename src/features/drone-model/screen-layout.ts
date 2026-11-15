/** A point in normalised view coordinates (−1 to 1, y up) as canvas pixels (y down). */
export function screenPoint(
  [x, y]: readonly [number, number],
  { width, height }: { width: number; height: number },
): [number, number] {
  return [((x + 1) / 2) * width, ((1 - y) / 2) * height];
}

/** A rectangle in canvas pixels (y down). */
export interface Rect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export type ScreenPoint = [x: number, y: number];

interface Size {
  width: number;
  height: number;
}

/**
 * The room an off-drone end needs: its caps label over its numbered balloon. Generous, so a
 * longer label or larger text still clears the drone.
 */
export const END_BOX = { width: 136, height: 64 } as const;

/** Space kept between an end and the drone, and between the end and the field's edge. */
const GAP = 12;
const BALLOON_HALF = 12;

const clamp = (value: number, low: number, high: number) =>
  Math.min(Math.max(value, low), Math.max(low, high));

/**
 * Where an off-drone end's box is centred: beside the drone's projected outline, so the radio or
 * goggles never reads as a part on board. Left if there is room, then right, then above, then
 * below; failing all, the side with the most room, kept inside the field.
 */
export function placeEnd(drone: Rect, field: Size): ScreenPoint {
  const halfW = END_BOX.width / 2;
  const halfH = END_BOX.height / 2;
  const midY = clamp((drone.top + drone.bottom) / 2, halfH + GAP, field.height - halfH - GAP);
  const midX = clamp((drone.left + drone.right) / 2, halfW + GAP, field.width - halfW - GAP);
  const room = {
    left: drone.left - GAP,
    right: field.width - drone.right - GAP,
    above: drone.top - GAP,
    below: field.height - drone.bottom - GAP,
  };
  if (room.left >= END_BOX.width + GAP) return [drone.left - GAP - halfW, midY];
  if (room.right >= END_BOX.width + GAP) return [drone.right + GAP + halfW, midY];
  if (room.above >= END_BOX.height + GAP) return [midX, drone.top - GAP - halfH];
  if (room.below >= END_BOX.height + GAP) return [midX, drone.bottom + GAP + halfH];
  const inField = (x: number, y: number): ScreenPoint => [
    clamp(x, halfW + GAP, field.width - halfW - GAP),
    clamp(y, halfH + GAP, field.height - halfH - GAP),
  ];
  const widest = Math.max(room.left, room.right, room.above, room.below);
  if (widest === room.left) return inField(drone.left - halfW, midY);
  if (widest === room.right) return inField(drone.right + halfW, midY);
  if (widest === room.above) return inField(midX, drone.top - halfH);
  return inField(midX, drone.bottom + halfH);
}

/** The centre of an end's balloon, at the foot of its box under the label. */
export function endBalloon([x, y]: ScreenPoint): ScreenPoint {
  return [x, y + END_BOX.height / 2 - BALLOON_HALF];
}

/** The box an end takes up, centred on `placeEnd`'s point. */
export function endRect([x, y]: ScreenPoint): Rect {
  const halfW = END_BOX.width / 2;
  const halfH = END_BOX.height / 2;
  return { left: x - halfW, right: x + halfW, top: y - halfH, bottom: y + halfH };
}

const square = ([x, y]: ScreenPoint, size: number): Rect => ({
  left: x - size / 2,
  right: x + size / 2,
  top: y - size / 2,
  bottom: y + size / 2,
});

const overlaps = (a: Rect, b: Rect) =>
  a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

// Candidate offsets around an anchor: rings of eight directions, nearest first.
const RINGS = [1, 1.6, 2.2, 2.8, 3.6, 4.4];
const DIRECTIONS = [0, 4, 2, 6, 1, 3, 5, 7].map((i) => (i * Math.PI) / 4 - Math.PI / 2);

/**
 * Where each balloon sits so none covers another: pins in `order` (most important first) stay on
 * their anchors when free, else move to the nearest free spot around it inside the field. `avoid`
 * holds boxes already taken (the off-drone ends). Returns a centre per anchor, in anchor order.
 */
export function spreadPins(
  anchors: readonly ScreenPoint[],
  order: readonly number[],
  size: number,
  field: Size,
  avoid: readonly Rect[],
): ScreenPoint[] {
  const taken: Rect[] = [...avoid];
  const placed: ScreenPoint[] = anchors.map((a) => [a[0], a[1]]);
  const half = size / 2;
  const fits = (r: Rect) =>
    r.left >= 0 &&
    r.top >= 0 &&
    r.right <= field.width &&
    r.bottom <= field.height &&
    !taken.some((t) => overlaps(r, t));
  for (const index of order) {
    const anchor = anchors[index];
    if (!anchor) continue;
    const [ax, ay]: ScreenPoint = [
      clamp(anchor[0], half, field.width - half),
      clamp(anchor[1], half, field.height - half),
    ];
    let spot: ScreenPoint = [ax, ay];
    if (!fits(square(spot, size))) {
      search: for (const ring of RINGS) {
        for (const angle of DIRECTIONS) {
          const candidate: ScreenPoint = [
            ax + Math.cos(angle) * size * ring,
            ay + Math.sin(angle) * size * ring,
          ];
          if (fits(square(candidate, size))) {
            spot = candidate;
            break search;
          }
        }
      }
    }
    placed[index] = spot;
    taken.push(square(spot, size));
  }
  return placed;
}
