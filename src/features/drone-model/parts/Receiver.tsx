import { type DroneSpec, mm } from '@/shared/domain/drone-spec';

import { Lift } from '../Lift';
import { rearBay } from '../rear';

import type { PartLook } from '../materials';

import { PartMaterial } from './PartMaterial';
import { Rod } from './Rod';

interface ReceiverProps {
  spec: DroneSpec;
  look: PartLook;
  /** The board lifts with the rear bay when the frame opens; the antenna stays on its arm. */
  rearBayLiftMm: number;
}

const ANTENNA_RADIUS_MM = 1;

/** ExpressLRS receiver: a small board on the VTX, with its T antenna zip-tied to a rear arm. */
export function Receiver({ spec, look, rearBayLiftMm }: ReceiverProps) {
  const { receiver, receiverAntenna } = rearBay(spec);
  const [x, y, z] = receiver.centre;
  const [width, height, depth] = receiver.size;
  const material = <PartMaterial part="receiver" look={look} />;
  const [barA, barB] = receiverAntenna.barEnds;

  return (
    <group>
      <Lift liftMm={rearBayLiftMm}>
        <mesh position={[mm(x), mm(y), mm(z)]}>
          <boxGeometry args={[mm(width), mm(height), mm(depth)]} />
          {material}
        </mesh>
      </Lift>
      <Rod from={receiverAntenna.start} to={receiverAntenna.tip} radiusMm={ANTENNA_RADIUS_MM}>
        {material}
      </Rod>
      <Rod from={barA} to={barB} radiusMm={ANTENNA_RADIUS_MM}>
        {material}
      </Rod>
    </group>
  );
}
