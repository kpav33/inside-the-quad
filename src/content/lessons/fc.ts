import { REFERENCE_5_INCH } from '@/shared/domain/drone-spec';

import type { Lesson } from './types';

const { fc, frame } = REFERENCE_5_INCH;
const mount = `${frame.stackMountMm} × ${frame.stackMountMm} mm`;
const becVolts = fc.becVolts.map((v) => `${v} V`).join(' and ');

export const fcLesson: Lesson = {
  partId: 'fc',
  title: 'Flight controller',
  whatItDoes:
    'The flight controller is the drone’s brain: it reads your stick commands and its own sensors thousands of times a second and decides how fast each motor should spin.',
  howItWorks: [
    'Your radio sends stick commands to the receiver, which passes them to the flight controller. At the same time the gyro, a tiny sensor that is part of the IMU (inertial measurement unit), measures how fast the drone is rotating in each direction: roll, pitch and yaw.',
    'Thousands of times a second, the flight controller compares what you asked for with what the gyro measures, and works out how fast each motor must spin to close the gap. It sends those speeds to the ESC (electronic speed controller). This loop is what keeps the drone stable, which makes the gyro the most important sensor on board.',
    `The processor is named by its chip generation: F4, F7 or H7, where newer chips have more processing headroom. It runs firmware, the software on the board. ${fc.firmware} is the standard for freestyle and racing; INAV and ArduPilot are used for GPS and autonomous flying.`,
    `Other parts plug into its UARTs (serial ports): the receiver, the video transmitter and a GPS. It also has BECs, small voltage regulators that turn the battery voltage into the ${becVolts} the receiver, camera and video transmitter need.`,
    'It sits on top of the ESC on rubber grommets. This soft mounting keeps motor vibration away from the gyro, which would otherwise read the shaking as movement.',
    'On small drones the flight controller and ESC are often combined on one board, called an AIO (all-in-one) board.',
  ],
  specs: [
    {
      label: 'Processor',
      value: fc.processor,
      meaning:
        'The chip generation. F4, F7 and H7 are successive generations; newer ones have more processing headroom.',
    },
    {
      label: 'Firmware',
      value: fc.firmware,
      meaning: 'The software it runs, which you set up from a computer over USB.',
    },
    {
      label: 'UARTs',
      value: String(fc.uarts),
      meaning:
        'Serial ports for connecting other parts. The receiver, the video transmitter and a GPS each need one.',
    },
    {
      label: 'BEC',
      value: becVolts,
      meaning:
        'Output voltages of the onboard regulators, which power the smaller electronics so they don’t need the full battery voltage.',
    },
    {
      label: 'Mount',
      value: mount,
      meaning:
        'The spacing of the four mounting holes: the same as the ESC under it and the frame’s stack mount.',
    },
  ],
  connections: [
    {
      text: 'It sits on top of the ESC, sends it the motor speeds as a digital DShot signal and takes its power from it.',
      partId: 'esc',
    },
    {
      text: `It mounts on the frame’s ${mount} stack holes, on rubber grommets.`,
      partId: 'frame',
    },
    {
      text: 'The receiver plugs into one of its UARTs and passes on your stick commands.',
      partId: 'receiver',
    },
    {
      text: 'The video transmitter plugs into another UART, so the flight controller can set its channel and power.',
      partId: 'vtx',
    },
    {
      text: 'It adds on-screen text (battery voltage, timer) to your video. With analog video, the camera’s signal passes through the flight controller on its way to the video transmitter; digital video systems get the text over that UART instead.',
    },
  ],
};
