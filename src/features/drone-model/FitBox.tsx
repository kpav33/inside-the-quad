import { type DroneSpec, mm } from '@/shared/domain/drone-spec';

import { closedExtentsMm } from './extents';

/** An invisible box the size of the closed drone, for the camera to fit to. */
export function FitBox({ spec }: { spec: DroneSpec }) {
  const { halfWidthMm, bottomMm, topMm } = closedExtentsMm(spec);
  const width = mm(halfWidthMm * 2);
  return (
    <mesh visible={false} position={[0, mm((bottomMm + topMm) / 2), 0]}>
      <boxGeometry args={[width, mm(topMm - bottomMm), width]} />
    </mesh>
  );
}
