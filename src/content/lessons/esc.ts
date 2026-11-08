import { REFERENCE_5_INCH } from '@/shared/domain/drone-spec';
import { LIPO_CELL_VOLTS, packVolts } from '@/shared/domain/lipo';

import type { Lesson } from './types';

const { esc, frame, motor, battery } = REFERENCE_5_INCH;
const mount = `${frame.stackMountMm} × ${frame.stackMountMm} mm`;
const protocolKbps = Number(esc.protocol.replace(/\D/g, ''));
const fullBatteryVolts = packVolts(motor.batteryCells, LIPO_CELL_VOLTS.full);

export const escLesson: Lesson = {
  partId: 'esc',
  title: 'ESC',
  whatItDoes:
    'The ESC (electronic speed controller) turns the flight controller’s speed commands into the strong, rapidly switched power that spins each motor.',
  howItWorks: [
    'The flight controller (the drone’s brain) decides how fast each motor should spin and sends a small signal such as "motor 3 at 40 %". The ESC turns that into high-current, three-phase power: it switches each motor’s three coils on and off in turn, thousands of times a second, at the speed the command asks for.',
    `On a 5-inch drone the four ESCs are usually built onto one board, a ${esc.layout} ESC. It sits under the flight controller in the "stack", on the same ${mount} mounting holes.`,
    'The ESC has its own small processor running its own firmware (the software on the chip), such as BLHeli_S, Bluejay or AM32. It is sensorless: the motor has no position sensors. Instead the ESC measures the voltage the spinning magnets create in the coil that is switched off at that moment (back-EMF), which tells it where the bell is, so it knows when to switch the next coil.',
    `The flight controller talks to the ESC in DShot, a digital signal: each command is sent as a number, so electrical noise can’t change the motor speed. The number after "DShot" is the signal speed; ${esc.protocol} sends ${protocolKbps} thousand bits per second.`,
    `The battery plugs in here first. A capacitor (${esc.capacitorUf} µF) sits across the battery pads and soaks up the voltage spikes the switching creates, which protects all the electronics on the drone.`,
  ],
  specs: [
    {
      label: 'Type',
      value: esc.layout,
      meaning:
        'Four ESCs on one board, one per motor. Separate ESCs on each arm also exist but are rare on 5-inch drones today.',
    },
    {
      label: 'Current',
      value: `${esc.currentPerMotorA} A per motor`,
      meaning:
        'The current each motor output can handle continuously. If it is too low for the motors and props, the ESC overheats and can burn out.',
    },
    {
      label: 'Protocol',
      value: esc.protocol,
      meaning: `The digital signal from the flight controller, sent at ${protocolKbps} thousand bits per second.`,
    },
    {
      label: 'Mount',
      value: mount,
      meaning:
        'The spacing of the four mounting holes. It must match the frame’s stack mount and the flight controller.',
    },
    {
      label: 'Capacitor',
      value: `${esc.capacitorUf} µF, ${esc.capacitorV} V`,
      meaning: `How much charge it can soak up, and the highest voltage it is rated for. The rating must be above a full battery (${fullBatteryVolts.toFixed(1)} V on ${motor.batteryCells}S), with room to spare for spikes.`,
    },
  ],
  connections: [
    {
      text: `The battery’s ${battery.connector} plug connects to the ESC’s power lead, where the capacitor sits.`,
      partId: 'battery',
    },
    {
      text: `Each motor’s ${motor.wires} wires are soldered to one of its four outputs.`,
      partId: 'motors',
    },
    {
      text: 'The flight controller sits on top of it, sends it the DShot commands and takes its power from it.',
      partId: 'fc',
    },
    {
      text: `It mounts on the frame’s ${mount} stack holes, on soft rubber grommets.`,
      partId: 'frame',
    },
  ],
};
