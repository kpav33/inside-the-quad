import type { DroneSpec } from '@/shared/domain/drone-spec';

import {
  BATTERY_LEAD_LENGTH_MM,
  BATTERY_PAD_MM,
  STANDOFF_INSET_MM,
  STANDOFF_RADIUS_MM,
  XT60_MM,
} from './dimensions';
import { motorPlacements } from './layout';
import { stackLayers } from './stack';

/** A point in frame coordinates, in millimetres: x right, y up from the frame's bottom, z rear. */
export type Vec3 = [x: number, y: number, z: number];

/** An axis-aligned box, in millimetres. */
export interface Box {
  centre: Vec3;
  size: Vec3;
}

/** True when two boxes share space; boxes that only touch do not overlap. */
export function boxesOverlap(a: Box, b: Box): boolean {
  return a.centre.every(
    (value, i) => Math.abs(value - (b.centre[i] ?? 0)) < ((a.size[i] ?? 0) + (b.size[i] ?? 0)) / 2,
  );
}

/** The ESC board with its components, where it sits when the stack is closed. */
export function escBox(spec: DroneSpec): Box {
  const { bottomMm, topMm } = stackLayers(spec).esc;
  const board = spec.esc.boardSizeMm;
  return { centre: [0, (bottomMm + topMm) / 2, 0], size: [board, topMm - bottomMm, board] };
}

/** The four standoffs between the plates. */
export function standoffBoxes(spec: DroneSpec): Record<string, Box> {
  const { bodyWidthMm, bodyLengthMm, armThicknessMm, standoffHeightMm } = spec.frame;
  const x = bodyWidthMm / 2 - STANDOFF_INSET_MM;
  const z = bodyLengthMm / 2 - STANDOFF_INSET_MM;
  const d = STANDOFF_RADIUS_MM * 2;
  const box = (sx: number, sz: number): Box => ({
    centre: [sx * x, armThicknessMm + standoffHeightMm / 2, sz * z],
    size: [d, standoffHeightMm, d],
  });
  return {
    'standoff front left': box(-1, -1),
    'standoff front right': box(1, -1),
    'standoff rear left': box(-1, 1),
    'standoff rear right': box(1, 1),
  };
}

/** The battery's XT60 plug, hanging behind the pack. */
export function xt60Box(spec: DroneSpec): Box {
  const bottom = stackLayers(spec).topPlate.topMm + BATTERY_PAD_MM;
  return {
    centre: [
      0,
      bottom + XT60_MM.height / 2,
      spec.battery.packLengthMm / 2 + BATTERY_LEAD_LENGTH_MM + XT60_MM.length / 2,
    ],
    size: [XT60_MM.width, XT60_MM.height, XT60_MM.length],
  };
}

const VTX_SIZE: Vec3 = [20, 4, 20];
const RECEIVER_SIZE: Vec3 = [12, 3, 18];
const CAPACITOR = { radius: 5, length: 16, x: 8 } as const;
const VTX_ANTENNA = { lengthMm: 45, angleDeg: 30 } as const;
// Zip-tied to the rear-right arm, off the carbon body and clear of the prop.
const RECEIVER_ANTENNA = { alongArmMm: 32, stemMm: 20, angleDeg: 45, barHalfMm: 12 } as const;
const GPS_SIZE: Vec3 = [20, 7, 20];
// A tall mast keeps the GPS above the battery, with a clear view of the sky (and of the viewer).
const GPS_POST = { x: -14, heightMm: 36, widthMm: 4 } as const;

/** A straight antenna from `start` up and back at `angleDeg`. */
function rearwardTip(start: Vec3, lengthMm: number, angleDeg: number): Vec3 {
  const angle = (angleDeg * Math.PI) / 180;
  return [start[0], start[1] + lengthMm * Math.sin(angle), start[2] + lengthMm * Math.cos(angle)];
}

/**
 * Where the parts at the back of the frame sit, in millimetres. The VTX lies on the bottom plate
 * under the ESC's rear edge with the receiver on top of it; the ESC's capacitor sits beside them;
 * both antennas leave the back; the GPS stands on a post at the rear of the top plate.
 */
export function rearBay(spec: DroneSpec) {
  const { armThicknessMm, bodyLengthMm } = spec.frame;
  const layers = stackLayers(spec);
  const board = spec.esc.boardSizeMm;

  const vtx: Box = { centre: [-8, armThicknessMm + VTX_SIZE[1] / 2, 28], size: VTX_SIZE };
  const vtxTop = vtx.centre[1] + VTX_SIZE[1] / 2;
  const receiver: Box = {
    centre: [-7, vtxTop + 1 + RECEIVER_SIZE[1] / 2, 30],
    size: RECEIVER_SIZE,
  };
  const capacitor: Box = {
    centre: [
      CAPACITOR.x,
      layers.esc.bottomMm + CAPACITOR.radius,
      board / 2 + 4 + CAPACITOR.length / 2,
    ],
    size: [CAPACITOR.radius * 2, CAPACITOR.radius * 2, CAPACITOR.length],
  };

  const vtxAntennaStart: Vec3 = [vtx.centre[0], vtx.centre[1], vtx.centre[2] + VTX_SIZE[2] / 2];
  const rearRight = motorPlacements(spec).find((p) => p.corner === 'rear-right');
  const [ax, , az] = rearRight?.position ?? [1, 0, 1];
  const armLength = Math.hypot(ax, az);
  const receiverAntennaStart: Vec3 = [
    (ax / armLength) * RECEIVER_ANTENNA.alongArmMm,
    armThicknessMm,
    (az / armLength) * RECEIVER_ANTENNA.alongArmMm,
  ];
  const receiverTip = rearwardTip(
    receiverAntennaStart,
    RECEIVER_ANTENNA.stemMm,
    RECEIVER_ANTENNA.angleDeg,
  );
  // The T's cross bar runs square to the stem, in the same upright plane.
  const bar = (RECEIVER_ANTENNA.angleDeg * Math.PI) / 180;
  const barOffset: Vec3 = [
    0,
    RECEIVER_ANTENNA.barHalfMm * Math.cos(bar),
    -RECEIVER_ANTENNA.barHalfMm * Math.sin(bar),
  ];

  const plateTop = layers.topPlate.topMm;
  const postZ = bodyLengthMm / 2 - 3;
  const gpsPost: Box = {
    centre: [GPS_POST.x, plateTop + GPS_POST.heightMm / 2, postZ],
    size: [GPS_POST.widthMm, GPS_POST.heightMm, GPS_POST.widthMm],
  };
  const gps: Box = {
    centre: [-8, plateTop + GPS_POST.heightMm + GPS_SIZE[1] / 2, postZ + 8],
    size: GPS_SIZE,
  };

  return {
    vtx,
    receiver,
    capacitor,
    vtxAntenna: {
      start: vtxAntennaStart,
      tip: rearwardTip(vtxAntennaStart, VTX_ANTENNA.lengthMm, VTX_ANTENNA.angleDeg),
    },
    receiverAntenna: {
      start: receiverAntennaStart,
      tip: receiverTip,
      barEnds: [
        [receiverTip[0], receiverTip[1] + barOffset[1], receiverTip[2] + barOffset[2]],
        [receiverTip[0], receiverTip[1] - barOffset[1], receiverTip[2] - barOffset[2]],
      ] as [Vec3, Vec3],
    },
    gpsPost,
    gps,
  };
}
