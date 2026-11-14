import { type DroneSpec, INCH_MM } from '@/shared/domain/drone-spec';

import { BATTERY_PAD_MM, motorTopMm, PROP_HUB_HEIGHT_MM } from './dimensions';
import { motorPlacements } from './layout';
import { BLADE_WIDTH_MM, bladeAngle, bladeHalfHeightMm } from './propeller-geometry';
import { cameraPlates } from './front';
import { type Box, rearBay, type Vec3, xt60Box } from './rear';
import { explodedOffsets, stackLayers } from './stack';

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

/** The eight corners of a box. */
function boxCorners({ centre: [cx, cy, cz], size: [sx, sy, sz] }: Box): Vec3[] {
  return [-1, 1].flatMap((dx) =>
    [-1, 1].flatMap((dy) =>
      [-1, 1].map((dz): Vec3 => [cx + (dx * sx) / 2, cy + (dy * sy) / 2, cz + (dz * sz) / 2]),
    ),
  );
}

/**
 * Points whose hull holds the whole drone, closed and with the stack opened, in millimetres: the
 * corners of every blade tip (the props never spin), the motor bells, the frame body, camera plates
 * and battery plug, the antennas and the GPS, and the battery's
 * top corners, the lifting ones also at their lifted height. The camera is fitted to these, so the
 * drone fills the drawing without an open stack ever leaving it.
 */
export function droneOutlineMm(spec: DroneSpec): Vec3[] {
  const lift = explodedOffsets(spec, true);
  const propRadius = (spec.prop.diameterIn * INCH_MM) / 2;
  // Motor positions are in metres, measured from the arm's top.
  const motors = motorPlacements(spec).map(({ position: [x, , z] }) => [x * 1000, z * 1000]);
  // The blades sit at the hub's middle; a prop's top is its hub's top.
  const bladeY = spec.frame.armThicknessMm + motorTopMm(spec) + PROP_HUB_HEIGHT_MM / 2;
  const propY = bladeY + PROP_HUB_HEIGHT_MM / 2;
  const bladeSpread = bladeHalfHeightMm();
  // A blade group turned by `angle` about +y maps its local x axis to (cos, 0, −sin).
  const tips = motors.flatMap(([x = 0, z = 0]) =>
    Array.from({ length: spec.prop.blades }, (_, i) => bladeAngle(i, spec.prop.blades)).flatMap(
      (angle) =>
        [-1, 1].flatMap((side) =>
          [-1, 1].map((up): Vec3 => {
            const halfWidth = (side * BLADE_WIDTH_MM) / 2;
            return [
              x + propRadius * Math.cos(angle) + halfWidth * Math.sin(angle),
              bladeY + up * bladeSpread,
              z - propRadius * Math.sin(angle) + halfWidth * Math.cos(angle),
            ];
          }),
        ),
    ),
  );
  const bay = rearBay(spec);
  const antennas = [bay.vtxAntenna.tip, bay.receiverAntenna.tip, ...bay.receiverAntenna.barEnds];
  const gpsTop: Vec3 = [
    bay.gps.centre[0],
    bay.gps.centre[1] + bay.gps.size[1] / 2,
    bay.gps.centre[2],
  ];
  const { packLengthMm, packWidthMm, packHeightMm } = spec.battery;
  const batteryTop = stackLayers(spec).topPlate.topMm + BATTERY_PAD_MM + packHeightMm;
  const battery = [-1, 1].flatMap((sx) =>
    [-1, 1].map((sz): Vec3 => [(sx * packWidthMm) / 2, batteryTop, (sz * packLengthMm) / 2]),
  );
  const raise = (points: Vec3[], by: number) => points.map(([x, y, z]): Vec3 => [x, y + by, z]);
  // Each motor's round bell, from the arm's underside to its top, sampled every 45°.
  const bellRadius = spec.motor.bellDiameterMm / 2;
  const bells = motors.flatMap(([x = 0, z = 0]) =>
    Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4).flatMap((angle) =>
      [0, propY].map((y): Vec3 => [
        x + bellRadius * Math.cos(angle),
        y,
        z + bellRadius * Math.sin(angle),
      ]),
    ),
  );
  const { bodyWidthMm, bodyLengthMm } = spec.frame;
  const plateTop = stackLayers(spec).topPlate.topMm;
  const xt60 = xt60Box(spec);
  const boxes = [
    { centre: [0, plateTop / 2, 0] as Vec3, size: [bodyWidthMm, plateTop, bodyLengthMm] as Vec3 },
    ...cameraPlates(spec),
  ];
  return [
    ...tips,
    ...bells,
    ...boxes.flatMap(boxCorners),
    ...boxCorners(xt60),
    ...raise(boxCorners(xt60), lift.topPlate),
    ...antennas,
    ...raise(antennas, lift.rearBay),
    gpsTop,
    ...raise([gpsTop], lift.topPlate),
    ...battery,
    ...raise(battery, lift.topPlate),
  ];
}
