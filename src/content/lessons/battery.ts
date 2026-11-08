import { REFERENCE_5_INCH } from '@/shared/domain/drone-spec';
import { LIPO_CELL_VOLTS, packVolts } from '@/shared/domain/lipo';

import type { Lesson } from './types';

const { battery, motor } = REFERENCE_5_INCH;
const cells = motor.batteryCells;
const volts = (value: number) => `${value.toFixed(1)} V`;
const labelAmps = Math.round((battery.cRating * battery.capacityMah) / 1000);

export const batteryLesson: Lesson = {
  partId: 'battery',
  title: 'Battery',
  whatItDoes:
    'The battery stores the energy for the whole drone and powers every part while it flies.',
  howItWorks: [
    `FPV drones use LiPo (lithium polymer) batteries, which deliver a lot of current from a small, light pack. A pack is made of cells. Each cell is ${volts(LIPO_CELL_VOLTS.nominal)} nominal (the voltage printed on the label) and ${volts(LIPO_CELL_VOLTS.full)} when fully charged.`,
    `The cells are connected in series, which adds their voltages together. "${cells}S" means ${cells} cells in series: ${volts(packVolts(cells, LIPO_CELL_VOLTS.nominal))} nominal and ${volts(packVolts(cells, LIPO_CELL_VOLTS.full))} when full. The motors are chosen for this voltage, so a ${cells}S drone needs a ${cells}S battery.`,
    `The voltage falls as the pack empties, so it tells you how much is left. At about ${volts(LIPO_CELL_VOLTS.emptyUnderLoad)} per cell while flying, the pack is nearly empty and it is time to land. A resting cell should never drop below about ${volts(LIPO_CELL_VOLTS.minResting)}, or it can be damaged.`,
    'The voltage also sags (drops for a moment) when you push the throttle hard, because the pack can’t deliver a huge current without losing some voltage. It recovers when you ease off. Old or cold packs sag more.',
    `LiPos hold a lot of energy and can catch fire if damaged. Retire a pack that is puffed (swollen) or dented. Charge on a fireproof surface and never leave it charging unattended. If you won’t fly for a few days, bring it to storage voltage, ${volts(LIPO_CELL_VOLTS.storage)} per cell, which keeps the cells healthy.`,
  ],
  specs: [
    {
      label: 'Cells',
      value: `${cells}S`,
      meaning: `${cells} cells in series: ${volts(packVolts(cells, LIPO_CELL_VOLTS.nominal))} nominal, ${volts(packVolts(cells, LIPO_CELL_VOLTS.full))} full. It must match the voltage the drone is built for.`,
    },
    {
      label: 'Capacity',
      value: `${battery.capacityMah} mAh`,
      meaning:
        'How much charge the pack holds, in milliamp-hours. More capacity means longer flights but a heavier pack.',
    },
    {
      label: 'C rating',
      value: `${battery.cRating}C`,
      meaning: `How fast the pack can deliver current: the C rating times the capacity. On paper ${battery.cRating}C × ${battery.capacityMah / 1000} Ah = ${labelAmps} A, but labels are often exaggerated, so use it only to compare packs roughly.`,
    },
    {
      label: 'Connector',
      value: battery.connector,
      meaning:
        'The main power plug, made for the high current the motors draw. A second, thinner balance lead has a wire to every cell, so the charger can keep the cells equal.',
    },
    {
      label: 'Per cell',
      value: `${LIPO_CELL_VOLTS.full} · ${LIPO_CELL_VOLTS.storage} · ${LIPO_CELL_VOLTS.emptyUnderLoad} V`,
      meaning: `Full ${volts(LIPO_CELL_VOLTS.full)}, storage ${volts(LIPO_CELL_VOLTS.storage)}, land at about ${volts(LIPO_CELL_VOLTS.emptyUnderLoad)} while flying, and never below ${volts(LIPO_CELL_VOLTS.minResting)} at rest.`,
    },
  ],
  connections: [
    {
      text: `Its ${battery.connector} plug connects to the lead of the ESC (electronic speed controller), which passes power on to the motors and the rest of the drone.`,
      partId: 'esc',
    },
    {
      text: 'It sits on the frame’s top plate, held down by a strap on a grippy pad.',
      partId: 'frame',
    },
    { text: 'The balance lead plugs into the charger; it is only used for charging.' },
  ],
};
