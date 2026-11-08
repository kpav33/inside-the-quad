import { type DroneSpec, INCH_MM, mm } from '@/shared/domain/drone-spec';

import { PROP_HUB_HEIGHT_MM } from '../dimensions';
import type { SpinDirection } from '../layout';
import { bladeTwist } from '../propeller-geometry';

import { PartMaterial } from './PartMaterial';

interface PropellerProps {
  spec: DroneSpec;
  /** Centre of the hub. */
  position: [number, number, number];
  spin: SpinDirection;
  highlighted: boolean;
}

const HUB_RADIUS_MM = 7;
const BLADE_WIDTH_MM = 12;
const BLADE_THICKNESS_MM = 1.5;

/** Hub plus evenly spaced blades, angled so each prop pushes air down in its spin direction. */
export function Propeller({ spec, position, spin, highlighted }: PropellerProps) {
  const hubRadius = mm(HUB_RADIUS_MM);
  const bladeLength = mm((spec.prop.diameterIn * INCH_MM) / 2) - hubRadius;
  const twist = bladeTwist(spin);
  const material = <PartMaterial part="props" highlighted={highlighted} />;

  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[hubRadius, hubRadius, mm(PROP_HUB_HEIGHT_MM), 24]} />
        {material}
      </mesh>
      {Array.from({ length: spec.prop.blades }, (_, i) => (
        <group key={i} rotation={[0, (i * 2 * Math.PI) / spec.prop.blades, 0]}>
          <mesh position={[hubRadius + bladeLength / 2, 0, 0]} rotation={[twist, 0, 0]}>
            <boxGeometry args={[bladeLength, mm(BLADE_THICKNESS_MM), mm(BLADE_WIDTH_MM)]} />
            {material}
          </mesh>
        </group>
      ))}
    </group>
  );
}
