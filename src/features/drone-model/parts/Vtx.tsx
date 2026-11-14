import { type DroneSpec, mm } from '@/shared/domain/drone-spec';

import { rearBay } from '../rear';

import type { PartLook } from '../materials';

import { PartMaterial } from './PartMaterial';
import { Rod } from './Rod';

interface VtxProps {
  spec: DroneSpec;
  look: PartLook;
}

const PCB_MM = 1.2;
const ANTENNA_RADIUS_MM = 1.2;
const ANTENNA_HEAD = { radius: 7, thickness: 3 } as const;

/** Analog VTX: a small board under a shield, with its antenna leaving the back of the frame. */
export function Vtx({ spec, look }: VtxProps) {
  const { vtx, vtxAntenna } = rearBay(spec);
  const [x, y, z] = vtx.centre;
  const [width, height, depth] = vtx.size;
  const bottom = y - height / 2;
  const material = <PartMaterial part="vtx" look={look} />;
  const [tx, ty, tz] = vtxAntenna.tip;

  return (
    <group>
      <mesh position={[mm(x), mm(bottom + PCB_MM / 2), mm(z)]}>
        <boxGeometry args={[mm(width), mm(PCB_MM), mm(depth)]} />
        {material}
      </mesh>
      <mesh position={[mm(x), mm(bottom + PCB_MM + (height - PCB_MM) / 2), mm(z)]}>
        <boxGeometry args={[mm(width - 6), mm(height - PCB_MM), mm(depth - 6)]} />
        {material}
      </mesh>
      <Rod from={vtxAntenna.start} to={vtxAntenna.tip} radiusMm={ANTENNA_RADIUS_MM}>
        {material}
      </Rod>
      {/* The antenna head: a round "lollipop" facing up and back. */}
      <mesh position={[mm(tx), mm(ty), mm(tz)]} rotation={[Math.PI / 3, 0, 0]}>
        <cylinderGeometry
          args={[mm(ANTENNA_HEAD.radius), mm(ANTENNA_HEAD.radius), mm(ANTENNA_HEAD.thickness), 20]}
        />
        {material}
      </mesh>
    </group>
  );
}
