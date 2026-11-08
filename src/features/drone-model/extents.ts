import { type DroneSpec, INCH_MM } from '@/shared/domain/drone-spec';

import { motorTopMm, PROP_HUB_HEIGHT_MM } from './dimensions';
import { stackLayers } from './stack';

/**
 * The space the closed drone fills, in millimetres: square around the centre out to the prop
 * tips (as full discs, whatever their angle), from the bottom of the frame up to the highest part.
 * The camera is fitted to this, not to the live model, so opening the stack never reframes it.
 */
export function closedExtentsMm(spec: DroneSpec): {
  halfWidthMm: number;
  bottomMm: number;
  topMm: number;
} {
  const motorOffset = spec.frame.wheelbaseMm / 2 / Math.SQRT2;
  const propRadius = (spec.prop.diameterIn * INCH_MM) / 2;
  const batteryTop = stackLayers(spec).topPlate.topMm + spec.battery.packHeightMm;
  const propTop = motorTopMm(spec) + PROP_HUB_HEIGHT_MM;
  return {
    halfWidthMm: motorOffset + propRadius,
    bottomMm: 0,
    topMm: Math.max(batteryTop, propTop),
  };
}
