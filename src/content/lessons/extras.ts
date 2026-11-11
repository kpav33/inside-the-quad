import { REFERENCE_5_INCH } from '@/shared/domain/drone-spec';

import type { Lesson } from './types';

const { extras } = REFERENCE_5_INCH;
const systems = extras.gpsSystems.join(', ');
const systemsInWords = `${extras.gpsSystems.slice(0, -1).join(', ')} and ${extras.gpsSystems.at(-1) ?? ''}`;

export const extrasLesson: Lesson = {
  partId: 'extras',
  title: 'Extras',
  whatItDoes:
    'The extras are small add-ons: a GPS that knows where the drone is, a buzzer that helps you find it after a crash, and LEDs that make it easier to see.',
  howItWorks: [
    `The GPS module listens to satellites from several systems (${systems}) and works out the drone’s position, speed and height. It shows speed and distance in your goggles and enables GPS Rescue: if the radio signal is lost, the drone can fly back home on its own instead of dropping.`,
    'GPS Rescue only works once the GPS has found enough satellites, which can take a minute or two after power-up, so wait before taking off if you rely on it.',
    'The buzzer is a tiny beeper. After a crash in long grass, you switch it on from your radio, or it starts by itself when the drone loses the radio signal, and you follow the sound. Some buzzers have their own small battery, so they keep beeping even if the main battery was thrown off.',
    `The LEDs are addressable: the flight controller (the drone’s brain) sets each one’s colour, so they can show a colour per pilot, flash a warning or just look good. They make the drone easier to see against the sky. This drone has ${extras.ledCount} of them, in two strips on the rear arms.`,
  ],
  specs: [
    {
      label: 'GPS',
      value: `${extras.gpsSystems.length} systems`,
      meaning: `It listens to ${systemsInWords} satellites. Using more systems finds a position faster.`,
    },
    {
      label: 'Buzzer',
      value: `${extras.buzzerVolts} V`,
      meaning: 'It runs from the flight controller’s 5 V pad.',
    },
    {
      label: 'LEDs',
      value: `${extras.ledCount} × ${extras.ledVolts} V`,
      meaning: `${extras.ledCount} addressable LEDs, powered from the flight controller’s 5 V pad.`,
    },
  ],
  connections: [
    {
      text: 'The GPS plugs into a spare UART (serial port) on the flight controller.',
      partId: 'fc',
    },
    {
      text: 'The buzzer and LEDs connect to their own pads on the flight controller, which switches them.',
      partId: 'fc',
    },
    {
      text: 'The GPS sits on a small mount at the back of the frame; the buzzer and LEDs sit on the rear arms.',
      partId: 'frame',
    },
  ],
};
