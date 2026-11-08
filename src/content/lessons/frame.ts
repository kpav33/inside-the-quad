import { REFERENCE_5_INCH } from '@/shared/domain/drone-spec';

import type { Lesson } from './types';

const { frame, motor } = REFERENCE_5_INCH;

export const frameLesson: Lesson = {
  partId: 'frame',
  title: 'Frame',
  whatItDoes:
    'The frame is the skeleton of the drone: it holds every other part in place and takes the hits when you crash.',
  howItWorks: [
    'A frame is a few flat pieces bolted together. The bottom plate and the four arms carry the motors and take most of the force in a crash. A thinner top plate sits above them on standoffs (small metal posts), and the electronics sit protected in the gap between the plates.',
    'Frames are cut from carbon fibre, a material that is very stiff, light and strong. Carbon fibre also conducts electricity, so wires must never rub against its edges: if the insulation wears through, the wire can short against the frame.',
    'Frames come in a few shapes. In a true X the four motors sit at the corners of a square. A stretched X is longer front to back, and a squashed X is wider than it is long. A "deadcat" frame moves the front arms out to the sides so the propellers stay out of the camera’s view.',
    'Every part has its usual place. In the middle sits the stack: the flight controller (the drone’s brain) on top of the ESC (electronic speed controller, which powers the motors). The camera goes at the front, the video transmitter and radio receiver at the back, and the battery is strapped on top.',
  ],
  specs: [
    {
      label: 'Wheelbase',
      value: `${frame.wheelbaseMm} mm`,
      meaning:
        'The diagonal distance from one motor shaft to the opposite one. It sets the largest propeller that fits; 5-inch frames are around 220–230 mm.',
    },
    {
      label: 'Stack mounting',
      value: `${frame.stackMountMm} × ${frame.stackMountMm} mm`,
      meaning:
        'The spacing of the four holes the flight controller and ESC screw onto. Other common sizes are 25.5 × 25.5 mm and 20 × 20 mm. Boards only fit if their holes match the frame.',
    },
    {
      label: 'Motor mount',
      value: `${motor.mountPatternMm} × ${motor.mountPatternMm} mm`,
      meaning:
        'The hole pattern at the end of each arm. It has to match the screw holes on the bottom of the motor.',
    },
    {
      label: 'Arm thickness',
      value: `${frame.armThicknessMm} mm`,
      meaning: 'Thicker arms survive crashes better but add weight.',
    },
  ],
  connections: [
    {
      text: `The four motors screw onto the ends of the arms, using the ${motor.mountPatternMm} × ${motor.mountPatternMm} mm hole pattern.`,
      partId: 'motors',
    },
    {
      text: 'The ESC mounts in the middle on the stack holes, on soft rubber grommets.',
      partId: 'esc',
    },
    { text: 'The flight controller mounts on top of the ESC, on the same holes.', partId: 'fc' },
    { text: 'The camera mounts at the front, between two side plates.' },
    { text: 'The battery sits on the top plate, held down by a strap.', partId: 'battery' },
  ],
};
