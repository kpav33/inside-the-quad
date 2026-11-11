import { type DroneSpec, INCH_MM } from '@/shared/domain/drone-spec';

import { BATTERY_PAD_MM, motorTopMm, PROP_HUB_HEIGHT_MM } from './dimensions';
import { rearBay } from './rear';
import { stackLayers } from './stack';

/**
 * The space the closed drone fills, in millimetres: square around the centre out to the prop
 * tips (as full discs, whatever their angle) and antennas, from the bottom of the frame up to the
 * highest part.
 * The camera is fitted to this, not to the live model, so opening the stack never reframes it.
 */
export function closedExtentsMm(spec: DroneSpec): {
  halfWidthMm: number;
  bottomMm: number;
  topMm: number;
} {
  const motorOffset = spec.frame.wheelbaseMm / 2 / Math.SQRT2;
  const propRadius = (spec.prop.diameterIn * INCH_MM) / 2;
  const batteryTop = stackLayers(spec).topPlate.topMm + BATTERY_PAD_MM + spec.battery.packHeightMm;
  const propTop = motorTopMm(spec) + PROP_HUB_HEIGHT_MM;
  const bay = rearBay(spec);
  const antennaPoints = [
    bay.vtxAntenna.tip,
    bay.receiverAntenna.tip,
    ...bay.receiverAntenna.barEnds,
  ];
  const gpsTop = bay.gps.centre[1] + bay.gps.size[1] / 2;
  return {
    halfWidthMm: Math.max(
      motorOffset + propRadius,
      ...antennaPoints.flatMap(([x, , z]) => [Math.abs(x), Math.abs(z)]),
    ),
    bottomMm: 0,
    topMm: Math.max(batteryTop, propTop, gpsTop, ...antennaPoints.map(([, y]) => y)),
  };
}
