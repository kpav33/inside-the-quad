import { describe, expect, it } from 'vitest';
import { MathUtils, PerspectiveCamera, Vector3 } from 'three';

import { closedExtentsMm, droneOutlineMm } from '@/features/drone-model';
import { mm, REFERENCE_5_INCH } from '@/shared/domain/drone-spec';

import { FIT_MARGIN, FIT_VIEWS, fitDistance, type Vec3 } from './fit';
import { DEFAULT_VIEW, type View, viewToPosition } from './part-views';

const FOV_DEG = 40;
const points: Vec3[] = droneOutlineMm(REFERENCE_5_INCH).map(([x, y, z]) => [mm(x), mm(y), mm(z)]);
const closed = closedExtentsMm(REFERENCE_5_INCH);
// The closed drone's middle, as the viewer uses.
const centre: Vec3 = [0, mm((closed.bottomMm + closed.topMm) / 2), 0];

/** Each point in normalised device coordinates for a camera at `distance` along `view`. */
function project(view: View, distance: number, aspect: number): [number, number][] {
  const camera = new PerspectiveCamera(FOV_DEG, aspect, 0.001, 10);
  const [x, y, z] = viewToPosition(view, distance);
  camera.position.set(centre[0] + x, centre[1] + y, centre[2] + z);
  camera.lookAt(new Vector3(...centre));
  camera.updateMatrixWorld();
  return points.map((p) => {
    const v = new Vector3(...p).project(camera);
    return [v.x, v.y];
  });
}

describe('fitDistance', () => {
  for (const aspect of [1.6, 0.46]) {
    FIT_VIEWS.forEach((view, i) => {
      it(`fits the drone tightly in view ${i} at aspect ${aspect}`, () => {
        const distance = fitDistance(points, centre, view, aspect, FOV_DEG, FIT_MARGIN);
        const ndc = project(view, distance, aspect).flat().map(Math.abs);
        const limit = 1 - FIT_MARGIN;
        expect(Math.max(...ndc)).toBeLessThanOrEqual(limit + 1e-6);
        expect(Math.max(...ndc)).toBeGreaterThan(limit - 0.02);
      });
    });
  }

  it('brings the drone at least 12 % closer than the old cube fit on a wide canvas', () => {
    // drei Bounds: the largest side of a box around the closed drone, margin 1.08.
    const { halfWidthMm, bottomMm, topMm } = closedExtentsMm(REFERENCE_5_INCH);
    const largest = Math.max(mm(halfWidthMm * 2), mm(topMm - bottomMm));
    const old = (1.08 * largest) / (2 * Math.atan((Math.PI * FOV_DEG) / 360));
    const now = fitDistance(points, centre, DEFAULT_VIEW, 1.6, FOV_DEG, FIT_MARGIN);
    expect(now).toBeLessThanOrEqual(old * 0.88);
  });

  it('needs more distance for a narrower canvas', () => {
    const wide = fitDistance(points, centre, DEFAULT_VIEW, 1.6, FOV_DEG, FIT_MARGIN);
    const tall = fitDistance(points, centre, DEFAULT_VIEW, 0.46, FOV_DEG, FIT_MARGIN);
    expect(tall).toBeGreaterThan(wide);
    expect(MathUtils.clamp(tall, 0, 10)).toBe(tall);
  });
});
