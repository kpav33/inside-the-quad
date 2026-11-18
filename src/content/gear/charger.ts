import { REFERENCE_5_INCH } from '@/shared/domain/drone-spec';
import { LIPO_CELL_VOLTS, packVolts } from '@/shared/domain/lipo';

import type { ChargerMode, ChargerPartId, GearLesson } from './types';

const cells = REFERENCE_5_INCH.motor.batteryCells;
const { capacityMah } = REFERENCE_5_INCH.battery;
const volts = (value: number) => `${String(value)} V`;
const full = packVolts(cells, LIPO_CELL_VOLTS.full);
const storage = packVolts(cells, LIPO_CELL_VOLTS.storage);
/** A gentle charge current: 1C, the pack's capacity in amps. */
const oneC = capacityMah / 1000;

export const chargerLesson: GearLesson<ChargerPartId> = {
  id: 'charger',
  title: 'Charger',
  whatItDoes:
    'The charger fills LiPo packs safely, keeping every cell in the pack at the same voltage.',
  howItWorks: [
    `A LiPo pack is several cells in a row; this drone’s has ${String(cells)}. Two leads plug into the charger: the main lead carries the charging current, and the balance lead has a wire to every cell, so the charger can measure each one.`,
    `Balance charging fills the pack until every cell reads ${volts(LIPO_CELL_VOLTS.full)}, and drains a little from any cell that gets ahead, so they stay level. Without it, one cell could go past ${volts(LIPO_CELL_VOLTS.full)} while the pack looked fine, and an overcharged cell can swell or catch fire.`,
    `Storage mode charges or drains each cell to ${volts(LIPO_CELL_VOLTS.storage)}. A pack left full, or empty, for days wears out faster; at storage voltage it keeps.`,
    `A good charger balances, shows each cell’s voltage, stops by itself when the pack is full, and lets you set the cell count and the current. ${String(oneC)} A, 1C for this ${String(capacityMah)} mAh pack, is a safe rate. Charge on a fireproof surface and never leave it unattended.`,
  ],
  specs: [
    {
      label: 'Cells',
      value: `${String(cells)}S`,
      meaning: `${String(cells)} cells in series. Set the charger to the same count.`,
    },
    {
      label: 'Charge',
      value: `${volts(LIPO_CELL_VOLTS.full)} · ${volts(full)}`,
      meaning: `Full: ${volts(LIPO_CELL_VOLTS.full)} a cell, ${volts(full)} for the pack. Never more.`,
    },
    {
      label: 'Storage',
      value: `${volts(LIPO_CELL_VOLTS.storage)} · ${volts(storage)}`,
      meaning: `${volts(LIPO_CELL_VOLTS.storage)} a cell, ${volts(storage)} for the pack: where a pack waits between flying days.`,
    },
    {
      label: 'Current',
      value: `${String(oneC)} A`,
      meaning: `1C: the pack’s capacity (${String(capacityMah)} mAh) in amps. A safe charging rate.`,
    },
  ],
  connections: [
    {
      text: 'It plugs into the battery’s main lead and its balance lead.',
      partId: 'battery',
    },
    { text: 'It runs from the mains, or from a separate power supply.' },
  ],
  parts: [
    { id: 'main-lead', label: 'Main lead', note: 'Carries the charging current to the pack.' },
    {
      id: 'balance-lead',
      label: 'Balance lead',
      note: 'A wire to every cell, so the charger can measure and level each one.',
    },
    { id: 'balance-port', label: 'Balance port', note: 'Where the balance lead plugs in.' },
    { id: 'screen', label: 'Screen', note: 'Shows the mode, the current and each cell’s voltage.' },
    {
      id: 'cells',
      label: 'Cells',
      note: `The pack’s ${String(cells)} cells, each with its voltage.`,
    },
  ],
};

/** What the charger does to this drone's pack in a mode. */
export function chargerSays(mode: ChargerMode): string {
  return mode === 'charge'
    ? `Charge: each cell fills to ${volts(LIPO_CELL_VOLTS.full)}, ${volts(full)} for the pack, and the balance lead keeps them level.`
    : `Storage: each cell settles at ${volts(LIPO_CELL_VOLTS.storage)}, ${volts(storage)} for the pack, ready to wait between flying days.`;
}
