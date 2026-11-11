import { type DroneSpec, mm } from '@/shared/domain/drone-spec';

import { motorPlacements } from '../layout';
import { Lift } from '../Lift';
import { type Box, rearBay } from '../rear';

import { PartMaterial } from './PartMaterial';

interface ExtrasProps {
  spec: DroneSpec;
  highlighted: boolean;
  /** The GPS stands on the top plate, so it lifts with it. */
  topPlateLiftMm: number;
}

const BUZZER = { radius: 4.5, height: 6, distanceMm: 35 } as const;
const LED_STRIP = { fromMm: 55, toMm: 80, width: 5, height: 1.5 } as const;
const LED_MM = 3;

/** GPS on a post at the rear, a buzzer on the rear-left arm and an LED strip on each rear arm. */
export function Extras({ spec, highlighted, topPlateLiftMm }: ExtrasProps) {
  const { gps, gpsPost } = rearBay(spec);
  const arm = spec.frame.armThicknessMm;
  const material = <PartMaterial part="extras" highlighted={highlighted} />;
  const box = ({ centre: [x, y, z], size: [w, h, d] }: Box) => (
    <mesh position={[mm(x), mm(y), mm(z)]}>
      <boxGeometry args={[mm(w), mm(h), mm(d)]} />
      {material}
    </mesh>
  );
  const rearArms = motorPlacements(spec).filter((p) => p.corner.startsWith('rear'));
  // Direction of each rear arm from the centre, in the horizontal plane.
  const along = ([x, , z]: [number, number, number]) => {
    const length = Math.hypot(x, z);
    return [x / length, z / length] as const;
  };
  const leftArm = rearArms.find((p) => p.corner === 'rear-left');
  const [bx, bz] = leftArm ? along(leftArm.position) : [0, 0];
  const ledsPerStrip = Math.round(spec.extras.ledCount / rearArms.length);
  const stripLength = LED_STRIP.toMm - LED_STRIP.fromMm;
  const stripMiddle = (LED_STRIP.fromMm + LED_STRIP.toMm) / 2;

  return (
    <group>
      <Lift liftMm={topPlateLiftMm}>
        {box(gpsPost)}
        {box(gps)}
      </Lift>
      <mesh
        position={[
          mm(bx * BUZZER.distanceMm),
          mm(arm + BUZZER.height / 2),
          mm(bz * BUZZER.distanceMm),
        ]}
      >
        <cylinderGeometry args={[mm(BUZZER.radius), mm(BUZZER.radius), mm(BUZZER.height), 16]} />
        {material}
      </mesh>
      {rearArms.map(({ number, position }) => {
        const [dx, dz] = along(position);
        const angle = Math.atan2(-dz, dx);
        return (
          <group
            key={number}
            position={[mm(dx * stripMiddle), mm(arm + LED_STRIP.height / 2), mm(dz * stripMiddle)]}
            rotation={[0, angle, 0]}
          >
            <mesh>
              <boxGeometry args={[mm(stripLength), mm(LED_STRIP.height), mm(LED_STRIP.width)]} />
              {material}
            </mesh>
            {Array.from({ length: ledsPerStrip }, (_, i) => (
              <mesh
                key={i}
                position={[
                  mm(-stripLength / 2 + (stripLength / ledsPerStrip) * (i + 0.5)),
                  mm(LED_STRIP.height / 2 + LED_MM / 4),
                  0,
                ]}
              >
                <boxGeometry args={[mm(LED_MM), mm(LED_MM / 2), mm(LED_MM)]} />
                {material}
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
}
