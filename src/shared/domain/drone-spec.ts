/**
 * Physical description of a drone. The 3D model and the lesson numbers both read from it, so the
 * two can't drift apart. Lengths are in millimetres, like the specs printed on real parts.
 */
export interface DroneSpec {
  name: string;
  frame: {
    /** Diagonal distance between motor shafts. */
    wheelbaseMm: number;
    /** Hole spacing of the flight controller / ESC stack mount (square). */
    stackMountMm: number;
    armWidthMm: number;
    armThicknessMm: number;
    bodyLengthMm: number;
    bodyWidthMm: number;
    topPlateThicknessMm: number;
    standoffHeightMm: number;
  };
  motor: {
    statorWidthMm: number;
    statorHeightMm: number;
    kv: number;
    /** Battery size the KV is chosen for ("6S" = 6 cells in series). */
    batteryCells: number;
    /** Screw hole spacing on the motor base (square). */
    mountPatternMm: number;
    shaftThread: string;
    bellDiameterMm: number;
    bellHeightMm: number;
    wires: number;
  };
  prop: {
    diameterIn: number;
    pitchIn: number;
    blades: number;
  };
}

/** The reference 5" freestyle quad from docs/product/scope.md. */
export const REFERENCE_5_INCH: DroneSpec = {
  name: 'Reference 5" freestyle quad',
  frame: {
    wheelbaseMm: 225,
    stackMountMm: 30.5,
    armWidthMm: 13,
    armThicknessMm: 5,
    bodyLengthMm: 90,
    bodyWidthMm: 40,
    topPlateThicknessMm: 2,
    standoffHeightMm: 25,
  },
  motor: {
    statorWidthMm: 22,
    statorHeightMm: 7,
    kv: 1950,
    batteryCells: 6,
    mountPatternMm: 16,
    shaftThread: 'M5',
    bellDiameterMm: 27.5,
    bellHeightMm: 13,
    wires: 3,
  },
  prop: {
    diameterIn: 5,
    pitchIn: 4.3,
    blades: 3,
  },
};

export const INCH_MM = 25.4;

/** Converts millimetres to scene units (metres). */
export function mm(value: number): number {
  return value / 1000;
}

/** Prop size as printed on the packet: diameter × pitch × blades, e.g. "5 × 4.3 × 3". */
export function propSizeCode(spec: DroneSpec): string {
  const { diameterIn, pitchIn, blades } = spec.prop;
  return `${diameterIn} × ${pitchIn} × ${blades}`;
}

/** Motor size code: stator width and height in mm, two digits each, e.g. "2207". */
export function motorSizeCode(spec: DroneSpec): string {
  const twoDigits = (value: number) => String(Math.round(value)).padStart(2, '0');
  return twoDigits(spec.motor.statorWidthMm) + twoDigits(spec.motor.statorHeightMm);
}
