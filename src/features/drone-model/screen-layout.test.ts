import { describe, expect, it } from 'vitest';

import { END_BOX, endBalloon, placeEnd, type Rect, spreadPins } from './screen-layout';

const field = { width: 600, height: 400 };
const overlaps = (a: Rect, b: Rect) =>
  a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
const inside = (r: Rect) =>
  r.left >= 0 && r.top >= 0 && r.right <= field.width && r.bottom <= field.height;
const boxAt = ([x, y]: [number, number], w: number, h: number): Rect => ({
  left: x - w / 2,
  right: x + w / 2,
  top: y - h / 2,
  bottom: y + h / 2,
});

describe('placeEnd', () => {
  it('puts the end to the left of the drone when there is room', () => {
    const drone = { left: 250, right: 450, top: 100, bottom: 300 };
    const centre = placeEnd(drone, field);
    const box = boxAt(centre, END_BOX.width, END_BOX.height);
    expect(box.right).toBeLessThanOrEqual(drone.left);
    expect(inside(box)).toBe(true);
  });

  it('goes right when the left is too narrow', () => {
    const drone = { left: 60, right: 380, top: 100, bottom: 300 };
    const box = boxAt(placeEnd(drone, field), END_BOX.width, END_BOX.height);
    expect(box.left).toBeGreaterThanOrEqual(drone.right);
    expect(inside(box)).toBe(true);
  });

  it('goes above when neither side has room', () => {
    const drone = { left: 20, right: 580, top: 150, bottom: 380 };
    const box = boxAt(placeEnd(drone, field), END_BOX.width, END_BOX.height);
    expect(box.bottom).toBeLessThanOrEqual(drone.top);
    expect(inside(box)).toBe(true);
  });

  it('stays inside the field even when the drone fills it', () => {
    const drone = { left: 0, right: 600, top: 0, bottom: 400 };
    expect(inside(boxAt(placeEnd(drone, field), END_BOX.width, END_BOX.height))).toBe(true);
  });

  it('puts the balloon at the foot of the end box, under its label', () => {
    const [x, y] = endBalloon([100, 100]);
    expect(x).toBe(100);
    expect(y).toBeGreaterThan(100);
    expect(y).toBeLessThan(100 + END_BOX.height / 2);
  });
});

describe('spreadPins', () => {
  const size = 24;

  it('leaves a lone pin on its anchor', () => {
    expect(spreadPins([[300, 200]], [0], size, field, [])).toEqual([[300, 200]]);
  });

  it('keeps the first pin in priority on its anchor and moves the other clear of it', () => {
    const placed = spreadPins(
      [
        [300, 200],
        [302, 201],
      ],
      [1, 0],
      size,
      field,
      [],
    );
    expect(placed[1]).toEqual([302, 201]);
    const [a, b] = placed.map((p) => boxAt(p, size, size));
    if (!a || !b) throw new Error('missing pins');
    expect(overlaps(a, b)).toBe(false);
    expect(inside(a)).toBe(true);
  });

  it('keeps every pin of a crowded stop readable and in the field', () => {
    const anchors: [number, number][] = Array.from({ length: 6 }, (_, i) => [20 + i, 20]);
    const boxes = spreadPins(anchors, [5, 4, 3, 2, 1, 0], size, field, []).map((p) =>
      boxAt(p, size, size),
    );
    boxes.forEach((a, i) => {
      expect(inside(a)).toBe(true);
      boxes.slice(i + 1).forEach((b) => {
        expect(overlaps(a, b)).toBe(false);
      });
    });
  });

  it('keeps pins off the boxes it is told to avoid', () => {
    const avoid: Rect = { left: 280, right: 320, top: 180, bottom: 220 };
    const [p] = spreadPins([[300, 200]], [0], size, field, [avoid]);
    if (!p) throw new Error('missing pin');
    expect(overlaps(boxAt(p, size, size), avoid)).toBe(false);
  });
});
