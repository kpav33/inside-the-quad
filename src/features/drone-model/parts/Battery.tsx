import { type DroneSpec, mm } from '@/shared/domain/drone-spec';

import { stackLayers } from '../stack';

import { PartMaterial } from './PartMaterial';

interface BatteryProps {
  spec: DroneSpec;
  highlighted: boolean;
}

const LEAD_LENGTH_MM = 12;
const XT60 = { width: 16, height: 8, length: 15 } as const;

/** LiPo pack lying lengthwise on the top plate, with its XT60 plug at the rear. */
export function Battery({ spec, highlighted }: BatteryProps) {
  const { packLengthMm, packWidthMm, packHeightMm } = spec.battery;
  const bottom = stackLayers(spec).topPlate.topMm;
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
