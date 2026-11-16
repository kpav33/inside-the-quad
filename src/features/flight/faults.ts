/**
 * The mistakes the what-if sheet acts out. All off is a healthy drone: the moves sheet never sets
 * any of them.
 */
export interface Faults {
  /** The radio link is gone: the sticks are ignored, then failsafe disarms the drone. */
  linkLost: boolean;
  /** Motor 2 (front right) carries a prop made for the other direction: that corner pushes down. */
  wrongProp: boolean;
  /** Cells in the battery; this drone is built for 6. */
  cells: 4 | 6;
  /** The VTX is powered with no antenna fitted: it heats until it is damaged. */
  vtxNoAntenna: boolean;
}

export const NO_FAULTS: Faults = {
  linkLost: false,
  wrongProp: false,
  cells: 6,
  vtxNoAntenna: false,
};
