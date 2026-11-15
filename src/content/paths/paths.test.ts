import { describe, expect, it } from 'vitest';

import { connectedParts } from '@/content/lessons';
import { PATH_IDS } from '@/shared/domain/paths';

import { PATHS, pathParts } from './index';

const names = (path: (typeof PATH_IDS)[number]) => PATHS[path].stops.map((stop) => stop.name);

describe('path content', () => {
  it('walks the control path from your radio to the propellers', () => {
    expect(names('control')).toEqual([
      'Your radio',
      'Receiver',
      'Flight controller',
      'ESC',
      'Motors',
      'Propellers',
    ]);
  });

  it('walks the power path from the battery to the small electronics', () => {
    expect(names('power')).toEqual([
      'Battery',
      'XT60 plug and capacitor',
      'ESC',
      'Motors',
      'Flight controller’s regulators',
      'Receiver, camera and VTX',
    ]);
  });

  it('walks the video path from the camera to your goggles', () => {
    expect(names('video')).toEqual([
      'Camera',
      'Flight controller',
      'VTX',
      'VTX antenna',
      'Your goggles',
    ]);
  });

  it('feeds the motors and the flight controller from the ESC at once', () => {
    const [, , esc, motors] = PATHS.power.stops;
    expect(esc?.feeds).toEqual([3, 4]);
    expect(motors?.feeds).toEqual([]);
  });

  it.each(PATH_IDS)('only ever feeds a later stop on the %s path', (path) => {
    const { stops } = PATHS[path];
    stops.forEach((stop, index) => {
      for (const fed of stop.feeds) {
        expect(fed).toBeGreaterThan(index);
        expect(fed).toBeLessThan(stops.length);
      }
    });
  });

  it.each(PATH_IDS)('leaves no stop on the %s path a dead end but its ends', (path) => {
    const { stops } = PATHS[path];
    stops.forEach((stop, index) => {
      const isLast = index === stops.length - 1;
      const isBranchEnd = path === 'power' && stop.name === 'Motors';
      expect(stop.feeds.length > 0).toBe(!isLast && !isBranchEnd);
    });
  });

  it('draws the radio and goggles as off-drone ends with no parts', () => {
    const ends = PATH_IDS.flatMap((path) => PATHS[path].stops.filter((stop) => stop.end));
    expect(ends.map((stop) => stop.end)).toEqual(['radio', 'goggles']);
    for (const end of ends) expect(end.parts).toEqual([]);
  });

  it.each(PATH_IDS)('gives every on-drone stop on the %s path a part and text', (path) => {
    const { lead, stops } = PATHS[path];
    expect(lead.trim()).not.toBe('');
    for (const stop of stops) {
      expect(stop.text.trim()).not.toBe('');
      expect(stop.anchors.length).toBeGreaterThan(0);
      if (!stop.end) expect(stop.parts.length).toBeGreaterThan(0);
    }
  });

  it.each(PATH_IDS)('agrees with the part lessons on the %s path', (path) => {
    const { stops } = PATHS[path];
    for (const from of stops) {
      for (const index of from.feeds) {
        const to = stops[index];
        if (!to || from.end || to.end) continue;
        const linked = from.parts.some((a) =>
          to.parts.some((b) => a === b || connectedParts(a).has(b) || connectedParts(b).has(a)),
        );
        expect(linked, `${from.name} → ${to.name}`).toBe(true);
      }
    }
  });

  it('lists the parts a path passes', () => {
    expect(pathParts('video')).toEqual(new Set(['camera', 'fc', 'vtx']));
  });
});
