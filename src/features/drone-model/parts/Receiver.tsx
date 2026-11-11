import { type DroneSpec, mm } from '@/shared/domain/drone-spec';

import { rearBay } from '../rear';

import { PartMaterial } from './PartMaterial';
import { Rod } from './Rod';

interface ReceiverProps {
  spec: DroneSpec;
  highlighted: boolean;
}

const ANTENNA_RADIUS_MM = 1;

/** ExpressLRS receiver: a small board on the VTX, with its T antenna on a rear standoff. */
export function Receiver({ spec, highlighted }: ReceiverProps) {
  const { receiver, receiverAntenna } = rearBay(spec);
  const [x, y, z] = receiver.centre;
  const [width, height, depth] = receiver.size;
  const material = <PartMaterial part="receiver" highlighted={highlighted} />;
  const [barA, barB] = receiverAntenna.barEnds;

  return (
    <group>
      <mesh position={[mm(x), mm(y), mm(z)]}>
        <boxGeometry args={[mm(width), mm(height), mm(depth)]} />
        {material}
      </mesh>
      <Rod from={receiverAntenna.start} to={receiverAntenna.tip} radiusMm={ANTENNA_RADIUS_MM}>
        {material}
      </Rod>
      <Rod from={barA} to={barB} radiusMm={ANTENNA_RADIUS_MM}>
        {material}
      </Rod>
    </group>
  );
}
