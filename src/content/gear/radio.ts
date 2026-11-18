import { REFERENCE_5_INCH } from '@/shared/domain/drone-spec';

import type { GearLesson, RadioModeId, RadioPartId } from './types';

const { receiver } = REFERENCE_5_INCH;

export const radioLesson: GearLesson<RadioPartId> = {
  id: 'radio',
  title: 'Radio',
  whatItDoes:
    'The radio (transmitter) in your hands turns the movements of your thumbs into commands and sends them to the drone.',
  howItWorks: [
    'It has two sticks, called gimbals. In mode 2, the layout most pilots use, the left stick is throttle and yaw: up and down sets the throttle, left and right turns the nose. The right stick is pitch and roll: up and down tips the drone forward and back, left and right rolls it. The throttle stays where you leave it; the other directions spring back to the middle.',
    'Switches on top do the rest. The arm switch starts the motors: until you arm, they won’t spin whatever the sticks do, so a bumped stick can’t start the props. The mode switch picks the flight mode. In acro, the stick sets how fast the drone turns, and it holds whatever angle it reaches. In angle mode, the stick sets how far it tilts, and it levels itself when you let go. Most FPV pilots learn acro.',
    `Inside is a ${receiver.system} (ELRS) module that sends your stick and switch positions on ${receiver.frequencyGhz} GHz to the receiver on the drone. The two are bound once, so the receiver only listens to your radio. Telemetry comes back the other way: battery voltage and signal quality, shown on the radio’s screen.`,
    'Most radios run EdgeTX, free open-source software. In it you set up a model for each drone: which switch arms, which picks the mode, and the warnings you want to hear.',
  ],
  specs: [
    {
      label: 'Stick mode',
      value: 'Mode 2',
      meaning:
        'Left stick: throttle and yaw. Right stick: pitch and roll. The usual layout; the other modes swap the sticks around.',
    },
    {
      label: 'Link',
      value: `${receiver.system} · ${String(receiver.frequencyGhz)} GHz`,
      meaning:
        'The radio control system and its frequency. The drone’s receiver must use the same.',
    },
    {
      label: 'Firmware',
      value: 'EdgeTX',
      meaning: 'The software on the radio, where you set up each drone’s switches and warnings.',
    },
  ],
  connections: [
    {
      text: 'It talks over the air to the receiver on the drone, which is bound to it.',
      partId: 'receiver',
    },
    {
      text: 'The flight controller reads the arm and mode switches and turns your stick moves into motor speeds.',
      partId: 'fc',
    },
  ],
  parts: [
    {
      id: 'antenna',
      label: 'Antenna',
      note: 'Sends the control signal. It reaches furthest from its side, not its tip.',
    },
    {
      id: 'left-stick',
      label: 'Left stick',
      note: 'Throttle (up and down) and yaw (left and right).',
    },
    {
      id: 'right-stick',
      label: 'Right stick',
      note: 'Pitch (up and down) and roll (left and right).',
    },
    { id: 'arm-switch', label: 'Arm switch', note: 'Starts and stops the motors.' },
    { id: 'mode-switch', label: 'Mode switch', note: 'Picks the flight mode: acro or angle.' },
    { id: 'screen', label: 'Screen', note: 'Shows the model, and telemetry from the drone.' },
  ],
};

/** The mode switch's positions, acro first. */
export const RADIO_MODES: readonly { id: RadioModeId; label: string }[] = [
  { id: 'acro', label: 'Acro' },
  { id: 'angle', label: 'Angle' },
];

/** What the drone would do with the switches set so. */
export function radioSays(armed: boolean, mode: RadioModeId): string {
  if (!armed) return 'Disarmed: the motors won’t spin, whatever the sticks do.';
  return mode === 'acro'
    ? 'Armed, acro: the props spin. The sticks set how fast the drone turns, and it holds its angle when you let go.'
    : 'Armed, angle: the props spin. The sticks set how far the drone tilts, and it levels itself when you let go.';
}
