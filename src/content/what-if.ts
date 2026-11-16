import { REFERENCE_5_INCH } from '@/shared/domain/drone-spec';
import { LIPO_CELL_VOLTS, packVolts } from '@/shared/domain/lipo';
import type { PartId } from '@/shared/domain/parts';
import type { WhatIfStepId } from '@/shared/domain/what-if';

/** One mistake on the what-if sheet: what happens, why, and how to avoid it. */
export interface WhatIfStep {
  name: string;
  happens: string;
  why: string;
  avoid: string;
  /** Lessons that say more, linked quietly under the text. */
  lessons: readonly PartId[];
}

export interface WhatIfContent {
  title: string;
  lead: string;
  facts: readonly { label: string; value: string }[];
  steps: Record<WhatIfStepId, WhatIfStep>;
}

const cells = REFERENCE_5_INCH.motor.batteryCells;
const volts = (n: number) => `${String(packVolts(n, LIPO_CELL_VOLTS.nominal))} V`;

/**
 * Four common mistakes, acted out on the drawing. Every claim agrees with the receiver, props,
 * battery, motors, ESC and VTX lessons; numbers come from the reference spec.
 */
export const WHAT_IF: WhatIfContent = {
  title: 'What if',
  lead: 'Four common mistakes, and what each does to the drone. Press Try it (on the battery step, switch to 4S), fly with the sticks, then Reset.',
  facts: [
    { label: 'Battery', value: `${String(cells)}S` },
    { label: 'Props', value: 'In' },
    { label: 'Mistakes', value: '4' },
  ],
  steps: {
    failsafe: {
      name: 'Link lost: failsafe',
      happens:
        'The radio link drops. From then on the sticks do nothing. For about a second the flight controller uses safe values instead (sticks centred, throttle down), then it disarms: the motors stop and the drone falls.',
      why: 'Stopping the motors is on purpose: a drone without signal must not fly away. When the link comes back the drone does not restart; it has to be re-armed. With GPS set up, GPS Rescue can fly it home instead.',
      avoid:
        'Range-check before flying, mount the receiver antenna away from carbon and wires, and stay within range.',
      lessons: ['receiver', 'fc'],
    },
    prop: {
      name: 'Prop on backwards',
      happens:
        'Motor 2, front right, gets a prop made for the other direction. The motor still spins its usual way, but the blades are angled the other way, so that corner pushes air up instead of down. The corner drops, and the drone tips over towards it and falls.',
      why: 'The flight controller sees the corner drop and speeds that motor up, which only pushes harder the wrong way. It runs out of motor to fix it. A real drone usually flips or tumbles at takeoff (Betaflight’s runaway protection may disarm it first).',
      avoid:
        'After changing a prop, check its direction and which motor it is on, every time. This drone runs props in.',
      lessons: ['props', 'motors'],
    },
    battery: {
      name: 'Wrong battery',
      happens: `This drone is built for ${String(cells)}S (${volts(cells)}). On a 4S pack (${volts(4)}) the motors' top speed drops to about two-thirds, so there is less to steer with: the drone gets up to speed more slowly and full stick may not reach full rate. The readouts show speed as a share of the ${String(cells)}S top speed.`,
      why: `Motor speed follows voltage, and the motors' KV is chosen for the battery. 4S on a ${String(cells)}S build flies, just weakly. The reverse is the risky mistake: ${String(cells)}S on a drone built for 4S spins the motors faster and draws much more current than they are made for, and can exceed what the ESC and flight controller are rated for, so parts can overheat or burn.`,
      avoid:
        'Check the cell count printed on the pack against what the drone is built for before plugging in.',
      lessons: ['battery', 'motors', 'esc'],
    },
    vtx: {
      name: 'VTX without antenna',
      happens:
        'Nothing moves, but the VTX runs with nowhere to send its power. Its heat climbs from warm to hot, and then it is damaged.',
      why: 'A VTX sends its power out through the antenna. With no antenna the power reflects back into its own amplifier, which heats and stresses it and can damage it, sometimes within seconds. Some VTXs protect themselves; don’t rely on it. Cooling down doesn’t undo damage.',
      avoid: 'Fit the antenna before plugging in a battery, every time.',
      lessons: ['vtx'],
    },
  },
};
