import { type DroneSpec, mm } from '@/shared/domain/drone-spec';

/** Rotation direction as seen from above the drone. */
export type SpinDirection = 'cw' | 'ccw';

export interface MotorPlacement {
  /** Betaflight motor number. */
  number: 1 | 2 | 3 | 4;
  corner: 'rear-right' | 'front-right' | 'rear-left' | 'front-left';
  /** Scene position in metres; y is the top of the arm. The drone's front is −z, right is +x. */
  position: [x: number, y: number, z: number];
  spin: SpinDirection;
}

/**
 * Motor positions and spin directions for a Quad X frame, in Betaflight's default order and
 * "props in" directions (front props spin inward, towards the camera).
 */
export function motorPlacements(spec: DroneSpec): MotorPlacement[] {
  const offset = mm(spec.frame.wheelbaseMm) / 2 / Math.SQRT2;
  const y = mm(spec.frame.armThicknessMm);

  return [
    { number: 1, corner: 'rear-right', position: [offset, y, offset], spin: 'cw' },
    { number: 2, corner: 'front-right', position: [offset, y, -offset], spin: 'ccw' },
    { number: 3, corner: 'rear-left', position: [-offset, y, offset], spin: 'ccw' },
    { number: 4, corner: 'front-left', position: [-offset, y, -offset], spin: 'cw' },
  ];
}
