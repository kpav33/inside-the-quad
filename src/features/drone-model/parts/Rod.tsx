import type { ReactNode } from 'react';

import { mm } from '@/shared/domain/drone-spec';

import type { Vec3 } from '../rear';

interface RodProps {
  from: Vec3;
  to: Vec3;
  radiusMm: number;
  children: ReactNode;
}

/**
 * A thin cylinder from one point to another in a plane of constant x (antenna stalks), in
 * millimetres. Children are the material.
 */
export function Rod({ from, to, radiusMm, children }: RodProps) {
  const dy = to[1] - from[1];
  const dz = to[2] - from[2];
  const length = Math.hypot(dy, dz);
  // A cylinder runs along y; tip it towards +z by the angle between y and the rod.
  const tilt = Math.atan2(dz, dy);
  return (
    <mesh
      position={[mm(from[0]), mm((from[1] + to[1]) / 2), mm((from[2] + to[2]) / 2)]}
      rotation={[tilt, 0, 0]}
    >
      <cylinderGeometry args={[mm(radiusMm), mm(radiusMm), mm(length), 8]} />
      {children}
    </mesh>
  );
}
