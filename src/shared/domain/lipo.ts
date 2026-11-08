/** Standard voltages of one lithium polymer (LiPo) cell, in volts. */
export const LIPO_CELL_VOLTS = {
  /** The voltage printed on the label: 3.7 V per cell. */
  nominal: 3.7,
  /** Fully charged. */
  full: 4.2,
  /** Where cells are kept when not flying for a few days. */
  storage: 3.8,
  /** Roughly empty while flying: time to land. */
  emptyUnderLoad: 3.5,
  /** Never let a cell rest below this. */
  minResting: 3.3,
} as const;

/** Voltage of a pack of `cells` in series at `perCell` volts each, rounded to 0.1 V. */
export function packVolts(cells: number, perCell: number): number {
  return Math.round(cells * perCell * 10) / 10;
}
