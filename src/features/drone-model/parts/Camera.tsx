import { type DroneSpec, mm } from '@/shared/domain/drone-spec';

import { CAMERA_BODY_DEPTH_MM, cameraPlacement } from '../front';

import { PartMaterial } from './PartMaterial';

interface CameraProps {
  spec: DroneSpec;
  highlighted: boolean;
}

const BODY_DEPTH_MM = CAMERA_BODY_DEPTH_MM;
const LENS_RADIUS_MM = 6;
const LENS_LENGTH_MM = 7;

/** Micro FPV camera: a square body with its lens, tilted up between the camera plates. */
export function Camera({ spec, highlighted }: CameraProps) {
  const width = spec.camera.widthMm;
  const { centre, tiltRad } = cameraPlacement(spec);
  const material = <PartMaterial part="camera" highlighted={highlighted} />;

  return (
    <group position={[mm(centre[0]), mm(centre[1]), mm(centre[2])]} rotation={[tiltRad, 0, 0]}>
      <mesh>
        <boxGeometry args={[mm(width), mm(width), mm(BODY_DEPTH_MM)]} />
        {material}
      </mesh>
      <mesh
        position={[0, 0, mm(-BODY_DEPTH_MM / 2 - LENS_LENGTH_MM / 2)]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry args={[mm(LENS_RADIUS_MM), mm(LENS_RADIUS_MM), mm(LENS_LENGTH_MM), 20]} />
        {material}
      </mesh>
    </group>
  );
}
