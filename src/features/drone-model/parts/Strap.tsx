import { type DroneSpec, mm } from '@/shared/domain/drone-spec';

import { BATTERY_PAD_MM } from '../dimensions';
import { stackLayers } from '../stack';

import { PartMaterial } from './PartMaterial';

interface StrapProps {
  spec: DroneSpec;
  highlighted: boolean;
}

const BAND_MM = 1.5;
const PAD_INSET_MM = 5;

/** The grippy pad under the battery and the strap wrapped around the battery and top plate. */
export function Strap({ spec, highlighted }: StrapProps) {
  const { topPlate } = stackLayers(spec);
  const { packWidthMm, packHeightMm, packLengthMm } = spec.battery;
  const width = spec.strap.widthMm;
  const batteryTop = topPlate.topMm + BATTERY_PAD_MM + packHeightMm;
  const sideX = Math.max(spec.frame.bodyWidthMm, packWidthMm) / 2 + BAND_MM / 2;
  const bottom = topPlate.bottomMm - BAND_MM;
  const top = batteryTop + BAND_MM;
  const material = <PartMaterial part="strap" highlighted={highlighted} />;

  return (
    <group>
      <mesh position={[0, mm(topPlate.topMm + BATTERY_PAD_MM / 2), 0]}>
        <boxGeometry
          args={[mm(packWidthMm), mm(BATTERY_PAD_MM), mm(packLengthMm - PAD_INSET_MM * 2)]}
        />
        {material}
      </mesh>
      {/* The band: over the battery, under the top plate, and down both sides. */}
      {[top - BAND_MM / 2, bottom + BAND_MM / 2].map((y) => (
        <mesh key={y} position={[0, mm(y), 0]}>
          <boxGeometry args={[mm(sideX * 2 + BAND_MM), mm(BAND_MM), mm(width)]} />
          {material}
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[mm(side * sideX), mm((top + bottom) / 2), 0]}>
          <boxGeometry args={[mm(BAND_MM), mm(top - bottom), mm(width)]} />
          {material}
        </mesh>
      ))}
    </group>
  );
}
