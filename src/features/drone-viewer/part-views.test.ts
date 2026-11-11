import { describe, expect, it } from 'vitest';

import { partView, stepView, viewFromPosition, viewToPosition } from './part-views';

describe('part views', () => {
  it('faces the camera from the front and the rear parts from behind', () => {
    // In front: the view direction has a negative z (front) component.
    expect(Math.cos(partView('camera')?.azimuthRad ?? 0)).toBeLessThan(0);
    for (const part of ['vtx', 'receiver', 'extras'] as const) {
      const view = partView(part);
      expect(view, part).not.toBeNull();
      // Behind the drone: the view direction has a positive z (rear) component.
      expect(Math.cos(view?.azimuthRad ?? Math.PI), part).toBeGreaterThan(0);
    }
  });

  it('leaves the view alone for the other parts and for no selection', () => {
    for (const part of [
      'frame',
      'motors',
      'props',
      'esc',
      'fc',
      'battery',
      'strap',
      null,
    ] as const) {
      expect(partView(part), String(part)).toBeNull();
    }
  });

  it('turns a position into a view and back', () => {
    const position: [number, number, number] = [0.22, 0.18, -0.28];
    const back = viewToPosition(viewFromPosition(position), Math.hypot(...position));
    back.forEach((value, i) => {
      expect(value).toBeCloseTo(position[i] ?? NaN, 10);
    });
  });
});

describe('stepView', () => {
  const from = { azimuthRad: 3, elevationRad: 0.4 };
  const to = { azimuthRad: -3, elevationRad: 0.8 };

  it('jumps straight there with reduced motion', () => {
    expect(stepView(from, to, 1 / 60, true)).toEqual({ view: to, settled: true });
  });

  it('turns the short way round and settles', () => {
    let view = from;
    let steps = 0;
    for (; steps < 120; steps++) {
      const next = stepView(view, to, 1 / 60, false);
      // From 3 rad to −3 rad the short way is through π, so the azimuth first grows.
      if (steps === 0) expect(next.view.azimuthRad).toBeGreaterThan(from.azimuthRad);
      view = next.view;
      if (next.settled) break;
    }
    expect(steps).toBeLessThan(120);
    expect(Math.cos(view.azimuthRad - to.azimuthRad)).toBeCloseTo(1, 6);
    expect(view.elevationRad).toBeCloseTo(to.elevationRad, 6);
  });
});
