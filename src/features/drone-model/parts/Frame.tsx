import { type DroneSpec, mm } from '@/shared/domain/drone-spec';

import { STANDOFF_INSET_MM, STANDOFF_RADIUS_MM } from '../dimensions';
import { cameraPlates } from '../front';
import { motorPlacements } from '../layout';
import { Lift } from '../Lift';

import { PartMaterial } from './PartMaterial';

interface FrameProps {
  spec: DroneSpec;
  highlighted: boolean;
  /** How far the top plate is lifted for the exploded stack, in millimetres. */
  topPlateLiftMm: number;
}

/** Bottom plate with four arms, standoffs and a top plate. */
export function Frame({ spec, highlighted, topPlateLiftMm }: FrameProps) {
  const { frame, motor } = spec;
  const armThickness = mm(frame.armThicknessMm);
  // Arms run from the centre to just past the motor, so the whole motor base sits on carbon.
  const armLength = mm(frame.wheelbaseMm) / 2 + mm(motor.bellDiameterMm) / 2;
  const standoffHeight = mm(frame.standoffHeightMm);
  const standoffX = mm(frame.bodyWidthMm / 2 - STANDOFF_INSET_MM);
  const standoffZ = mm(frame.bodyLengthMm / 2 - STANDOFF_INSET_MM);
  const material = <PartMaterial part="frame" highlighted={highlighted} />;

  return (
    <group>
      {motorPlacements(spec).map(({ number, position: [x, , z] }) => {
        const angle = Math.atan2(-z, x);
        return (
          <mesh
            key={number}
            position={[
              (Math.cos(angle) * armLength) / 2,
              armThickness / 2,
              (-Math.sin(angle) * armLength) / 2,
            ]}
            rotation={[0, angle, 0]}
          >
            <boxGeometry args={[armLength, armThickness, mm(frame.armWidthMm)]} />
            {material}
          </mesh>
        );
      })}

      <mesh position={[0, armThickness / 2, 0]}>
        <boxGeometry args={[mm(frame.bodyWidthMm), armThickness, mm(frame.bodyLengthMm)]} />
        {material}
      </mesh>

      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh
            key={`${sx}:${sz}`}
            position={[sx * standoffX, armThickness + standoffHeight / 2, sz * standoffZ]}
          >
            <cylinderGeometry
              args={[mm(STANDOFF_RADIUS_MM), mm(STANDOFF_RADIUS_MM), standoffHeight, 12]}
            />
            {material}
          </mesh>
        )),
      )}

      {/* The camera side plates at the front. */}
      {cameraPlates(spec).map(({ centre: [x, y, z], size: [w, h, d] }) => (
        <mesh key={x} position={[mm(x), mm(y), mm(z)]}>
          <boxGeometry args={[mm(w), mm(h), mm(d)]} />
          {material}
        </mesh>
      ))}

      <Lift liftMm={topPlateLiftMm}>
        <mesh position={[0, armThickness + standoffHeight + mm(frame.topPlateThicknessMm) / 2, 0]}>
          <boxGeometry
            args={[mm(frame.bodyWidthMm), mm(frame.topPlateThicknessMm), mm(frame.bodyLengthMm)]}
          />
          {material}
        </mesh>
      </Lift>
    </group>
  );
}
