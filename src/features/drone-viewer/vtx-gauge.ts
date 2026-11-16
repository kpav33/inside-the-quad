/** Which of the VTX heat gauge's three segments are lit for a heat level (0 none … 3 damaged). */
export function vtxGaugeSegments(level: number): [boolean, boolean, boolean] {
  return [level >= 1, level >= 2, level >= 3];
}

/** How the what-if sheet frames the drone with room to fall, in scene metres from the hover centre. */
export interface GroundFit {
  /** The middle the camera looks at: halfway down the fall. */
  centreY: number;
  /** A sphere about that middle holding the drone at hover and on the ground. */
  radius: number;
  /** Where the ground line is drawn: under the drone's bottom when it rests at `ground`. */
  lineY: number;
  /** Half the ground line's length: as long as the sphere allows at that height. */
  lineHalf: number;
}

/**
 * The frame for a drone that may fall `ground` metres (negative) below where it hovers: a sphere
 * that holds the drone's own sphere (`radius`) both at hover and on the ground, and a ground line
 * under the drone's bottom (`bottom` below its centre) spanning the width of that sphere.
 */
export function groundFit(radius: number, ground: number, bottom: number): GroundFit {
  const centreY = ground / 2;
  const fitRadius = radius + Math.abs(ground) / 2;
  const lineY = ground - bottom;
  const lineHalf = Math.sqrt(Math.max(fitRadius ** 2 - (lineY - centreY) ** 2, 0));
  return { centreY, radius: fitRadius, lineY, lineHalf };
}
