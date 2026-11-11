import { type DroneSpec, mm } from '@/shared/domain/drone-spec';

import { BATTERY_LEAD_LENGTH_MM, BATTERY_PAD_MM, XT60_MM } from '../dimensions';
import { stackLayers } from '../stack';

import { PartMaterial } from './PartMaterial';

interface BatteryProps {
  spec: DroneSpec;
  highlighted: boolean;
}

const LEAD_LENGTH_MM = BATTERY_LEAD_LENGTH_MM;
const XT60 = XT60_MM;

/** LiPo pack lying lengthwise on its pad on the top plate, with its XT60 plug at the rear. */
export function Battery({ spec, highlighted }: BatteryProps) {
  const { packLengthMm, packWidthMm, packHeightMm } = spec.battery;
  const bottom = stackLayers(spec).topPlate.topMm + BATTERY_PAD_MM;
  const centreY = bottom + packHeightMm / 2;
  const rear = packLengthMm / 2;
  const plugY = bottom + XT60.height / 2;
  const material = <PartMaterial part="battery" highlighted={highlighted} />;

  return (
    <group>
      {/* A plain box, not a rounded one: soft corners would lose their drawn outline. */}
      <mesh position={[0, mm(centreY), 0]}>
        <boxGeometry args={[mm(packWidthMm), mm(packHeightMm), mm(packLengthMm)]} />
        {material}
      </mesh>
      <mesh position={[0, mm(plugY), mm(rear + LEAD_LENGTH_MM / 2)]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[mm(2), mm(2), mm(LEAD_LENGTH_MM), 10]} />
        {material}
      </mesh>
      <mesh position={[0, mm(plugY), mm(rear + LEAD_LENGTH_MM + XT60.length / 2)]}>
        <boxGeometry args={[mm(XT60.width), mm(XT60.height), mm(XT60.length)]} />
        {material}
      </mesh>
    </group>
  );
}
