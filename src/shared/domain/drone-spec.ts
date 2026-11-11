/** FPV camera widths by size class, in millimetres. The camera must fit the frame. */
export const CAMERA_SIZE_CLASS_MM = { full: 28, mini: 21, micro: 19, nano: 14 } as const;
export type CameraSizeClass = keyof typeof CAMERA_SIZE_CLASS_MM;

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
    /** Number of motors (one per arm); a Quad X has four. */
    count: number;
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
  esc: {
    /** Four ESCs on one board, under the flight controller. */
    layout: '4-in-1';
    /** Continuous current each motor output can handle. */
    currentPerMotorA: number;
    /** Digital signal from the flight controller. */
    protocol: string;
    /** Board width (square). */
    boardSizeMm: number;
    /** Capacitor on the battery pads: capacitance and voltage rating. */
    capacitorUf: number;
    capacitorV: number;
  };
  fc: {
    /** Processor generation, e.g. "F7". */
    processor: string;
    firmware: string;
    /** Serial ports for the receiver, VTX, GPS and so on. */
    uarts: number;
    /** Output voltages of the onboard regulators (BECs). */
    becVolts: number[];
    /** Board width (square). */
    boardSizeMm: number;
  };
  battery: {
    capacityMah: number;
    /** Discharge rating printed on the label. */
    cRating: number;
    connector: string;
    packLengthMm: number;
    packWidthMm: number;
    packHeightMm: number;
  };
  receiver: {
    /** Radio control system, e.g. "ExpressLRS". */
    system: string;
    frequencyGhz: number;
    /** Serial protocol to the flight controller. */
    protocol: string;
    /** Stick updates per second. */
    packetRateHz: number;
    antenna: string;
  };
  camera: {
    sizeClass: CameraSizeClass;
    /** Body width; equals the size class's width. */
    widthMm: number;
    /** How far the camera is tilted up from level. */
    tiltDeg: number;
    signal: 'analog' | 'digital';
  };
  vtx: {
    frequencyGhz: number;
    bands: number;
    channelsPerBand: number;
    /** Output power settings it offers. */
    powerLevelsMw: number[];
    /** The setting in use; one of `powerLevelsMw`. */
    powerSettingMw: number;
    /** Mounting hole spacing (square). */
    mountMm: number;
    antennaPolarization: 'RHCP' | 'LHCP';
  };
  strap: {
    widthMm: number;
    lengthMm: number;
  };
  extras: {
    /** Satellite systems the GPS module uses. */
    gpsSystems: string[];
    buzzerVolts: number;
    ledVolts: number;
    ledCount: number;
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
    count: 4,
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
  esc: {
    layout: '4-in-1',
    currentPerMotorA: 55,
    protocol: 'DShot600',
    boardSizeMm: 41,
    capacitorUf: 1000,
    capacitorV: 35,
  },
  fc: {
    processor: 'F7',
    firmware: 'Betaflight',
    uarts: 6,
    becVolts: [5, 10],
    boardSizeMm: 36,
  },
  battery: {
    capacityMah: 1100,
    cRating: 100,
    connector: 'XT60',
    packLengthMm: 75,
    packWidthMm: 35,
    packHeightMm: 38,
  },
  receiver: {
    system: 'ExpressLRS',
    frequencyGhz: 2.4,
    protocol: 'CRSF',
    packetRateHz: 500,
    antenna: 'T dipole',
  },
  camera: {
    sizeClass: 'micro',
    widthMm: 19,
    tiltDeg: 30,
    signal: 'analog',
  },
  vtx: {
    frequencyGhz: 5.8,
    bands: 6,
    channelsPerBand: 8,
    powerLevelsMw: [25, 200, 400, 800],
    powerSettingMw: 25,
    mountMm: 20,
    antennaPolarization: 'RHCP',
  },
  strap: {
    widthMm: 20,
    lengthMm: 250,
  },
  extras: {
    gpsSystems: ['GPS', 'Galileo', 'GLONASS', 'BeiDou'],
    buzzerVolts: 5,
    ledVolts: 5,
    ledCount: 8,
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

/** Number of VTX channels: bands × channels per band. */
export function vtxChannelCount(spec: DroneSpec): number {
  return spec.vtx.bands * spec.vtx.channelsPerBand;
}
