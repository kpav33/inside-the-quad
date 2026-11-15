import { UI } from '@/content/ui';
import { REFERENCE_5_INCH } from '@/shared/domain/drone-spec';

import type { PathContent } from './types';

const { receiver, esc } = REFERENCE_5_INCH;

export const controlPath: PathContent = {
  id: 'control',
  title: UI.paths.title.control,
  lead: 'How moving a stick becomes a change in motor speed, many times a second.',
  from: 'Your radio',
  to: 'Propellers',
  carries: 'Stick commands',
  stops: [
    {
      name: 'Your radio',
      end: 'radio',
      parts: [],
      anchors: ['radio'],
      feeds: [1],
      text: `The radio in your hands reads where your sticks are and sends them through the air, ${receiver.packetRateHz} times a second.`,
    },
    {
      name: 'Receiver',
      parts: ['receiver'],
      anchors: ['receiverAntenna', 'receiver'],
      feeds: [2],
      text: `Its antenna catches the radio’s packets, and the receiver passes the stick positions on to the flight controller over a UART (${receiver.protocol}).`,
    },
    {
      name: 'Flight controller',
      parts: ['fc'],
      anchors: ['fc'],
      feeds: [3],
      text: 'It compares what you asked for with what its gyro measures, and works out how fast each of the four motors should spin to get there.',
    },
    {
      name: 'ESC',
      parts: ['esc'],
      anchors: ['esc'],
      feeds: [4],
      text: `It receives the four motor speeds as a digital ${esc.protocol} signal and switches battery power through each motor’s coils to match.`,
    },
    {
      name: 'Motors',
      parts: ['motors'],
      anchors: ['motors'],
      feeds: [5],
      text: 'Each motor speeds up or slows down as its ESC tells it.',
    },
    {
      name: 'Propellers',
      parts: ['props'],
      anchors: ['props'],
      feeds: [],
      text: 'More speed means more thrust at that corner. Different thrust at the four corners tilts or turns the drone, and that is how it moves.',
    },
  ],
};
