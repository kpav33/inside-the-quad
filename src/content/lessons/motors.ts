import { motorSizeCode, REFERENCE_5_INCH } from '@/shared/domain/drone-spec';

import type { Lesson } from './types';

const { motor } = REFERENCE_5_INCH;
const FULL_CELL_VOLTS = 4.2;
const fullBatteryVolts = motor.batteryCells * FULL_CELL_VOLTS;
const noLoadRpm = Math.round((motor.kv * fullBatteryVolts) / 1000) * 1000;

export const motorsLesson: Lesson = {
  partId: 'motors',
  title: 'Motors',
  whatItDoes:
    'Each of the four motors spins a propeller, turning electricity from the battery into the thrust that lifts the drone.',
  howItWorks: [
    'FPV drones use brushless motors. In the middle is the stator, a fixed ring of copper wire coils. Around it is the bell, a cup lined with magnets. The bell is fixed to the shaft and spins on bearings. Nothing rubs inside (no brushes), so the motor wears very little.',
    'The ESC (electronic speed controller) switches the coils on and off in sequence, so their magnetic pull moves around the ring. The magnets in the bell chase it, and the bell spins. Switching faster spins the motor faster.',
    `Each motor has ${motor.wires} wires going to the ESC. Swapping any two of them makes the motor spin the other way; the direction can also be reversed in software.`,
  ],
  specs: [
    {
      label: 'Size',
      value: motorSizeCode(REFERENCE_5_INCH),
      meaning: `The stator is ${motor.statorWidthMm} mm wide and ${motor.statorHeightMm} mm tall. A bigger stator gives more torque (turning force), so it can spin heavier props faster.`,
    },
    {
      label: 'KV',
      value: `${motor.kv} KV`,
      meaning: `Roughly how many RPM (turns per minute) the motor adds per volt, with no propeller on. On a full ${motor.batteryCells}S battery (${fullBatteryVolts.toFixed(1)} V) that is about ${noLoadRpm.toLocaleString('en')} RPM.`,
    },
    {
      label: 'Battery',
      value: `${motor.batteryCells}S`,
      meaning: `The battery this KV is chosen for: ${motor.batteryCells}S means ${motor.batteryCells} cells in series. Higher KV spins faster but draws more current, so it is paired with a lower-voltage battery. About 1750–1950 KV suits 6S; 4S builds use about 2400–2700 KV.`,
    },
    {
      label: 'Mount',
      value: `${motor.mountPatternMm} × ${motor.mountPatternMm} mm`,
      meaning: 'The spacing of the screw holes in the base, which must match the frame’s arms.',
    },
    {
      label: 'Shaft',
      value: motor.shaftThread,
      meaning: 'The shaft is threaded (5 mm) so a nut can hold the propeller on.',
    },
  ],
  connections: [
    {
      text: `The motor screws onto the end of a frame arm with four screws in a ${motor.mountPatternMm} × ${motor.mountPatternMm} mm pattern.`,
      partId: 'frame',
    },
    {
      text: `A propeller slides onto the ${motor.shaftThread} shaft and is held by a nut.`,
      partId: 'props',
    },
    { text: `Its ${motor.wires} wires are soldered to the ESC, which powers the coils.` },
  ],
};
