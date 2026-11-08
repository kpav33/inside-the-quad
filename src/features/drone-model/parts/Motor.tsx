import { type DroneSpec, mm } from '@/shared/domain/drone-spec';

import { MOTOR_BASE_HEIGHT_MM } from '../dimensions';

import { PartMaterial } from './PartMaterial';

interface MotorProps {
  spec: DroneSpec;
  /** Centre of the motor base, on top of the arm. */
  position: [number, number, number];
  highlighted: boolean;
}

const SHAFT_RADIUS_MM = 2.5;
const SHAFT_HEIGHT_MM = 10;

/** Base, bell (the spinning outer cup) and shaft. */
export function Motor({ spec, position, highlighted }: MotorProps) {
  const radius = mm(spec.motor.bellDiameterMm) / 2;
  const base = mm(MOTOR_BASE_HEIGHT_MM);
  const bell = mm(spec.motor.bellHeightMm);
  const shaft = mm(SHAFT_HEIGHT_MM);
  const material = <PartMaterial part="motors" highlighted={highlighted} />;

  return (
    <group position={position}>
      <mesh position={[0, base / 2, 0]}>
        <cylinderGeometry args={[radius * 0.9, radius * 0.9, base, 24]} />
        {material}
      </mesh>
      <mesh position={[0, base + bell / 2, 0]}>
        <cylinderGeometry args={[radius, radius, bell, 32]} />
        {material}
      </mesh>
      <mesh position={[0, base + bell + shaft / 2, 0]}>
        <cylinderGeometry args={[mm(SHAFT_RADIUS_MM), mm(SHAFT_RADIUS_MM), shaft, 12]} />
        {material}
      </mesh>
    </group>
  );
}
