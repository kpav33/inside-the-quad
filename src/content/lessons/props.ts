import { INCH_MM, propSizeCode, REFERENCE_5_INCH } from '@/shared/domain/drone-spec';

import type { Lesson } from './types';

const { prop } = REFERENCE_5_INCH;

export const propsLesson: Lesson = {
  partId: 'props',
  title: 'Propellers',
  whatItDoes:
    'Propellers push air downward as they spin, which creates the thrust that lifts and moves the drone.',
  howItWorks: [
    'Each blade is angled, a bit like a screw thread. As it spins, it grabs air and pushes it down, and the air pushes the drone up.',
    'Two propellers spin clockwise and two spin counter-clockwise, with each diagonal pair spinning the same way. A spinning prop twists the drone in the opposite direction; with two each way, the twists cancel out and the drone doesn’t spin. Speeding up one pair on purpose is how the drone turns (yaw).',
    '"Props in" and "props out" describe which way the front propellers spin: inward towards the camera, or outward. Props in is the Betaflight default. Either works, but it must match the setting in the flight controller.',
    'A propeller on the wrong motor, or mounted upside down, pushes air the wrong way. The drone then flips over the moment it takes off, so check every prop after changing one.',
  ],
  specs: [
    {
      label: 'Size code',
      value: propSizeCode(REFERENCE_5_INCH),
      meaning: 'Diameter in inches × pitch in inches × number of blades.',
    },
    {
      label: 'Diameter',
      value: `${prop.diameterIn} in (${Math.round(prop.diameterIn * INCH_MM)} mm)`,
      meaning:
        'The width of the circle the blade tips sweep. Drones are named by it: this is a "5-inch".',
    },
    {
      label: 'Pitch',
      value: `${prop.pitchIn} in`,
      meaning:
        'How far the propeller would screw itself forward in one turn, like a screw in wood. More pitch grips more air and gives more speed, but draws more current.',
    },
    {
      label: 'Blades',
      value: String(prop.blades),
      meaning: 'More blades give more grip and thrust, but also draw more current.',
    },
  ],
  connections: [
    {
      text: 'Each propeller sits on a motor shaft, held by a nut, and spins with the motor’s bell.',
      partId: 'motors',
    },
    {
      text: 'The frame’s wheelbase decides the largest propeller that fits without the blades hitting each other.',
      partId: 'frame',
    },
  ],
};
