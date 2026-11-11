import { REFERENCE_5_INCH } from '@/shared/domain/drone-spec';

import type { Lesson } from './types';

const { receiver } = REFERENCE_5_INCH;

export const receiverLesson: Lesson = {
  partId: 'receiver',
  title: 'Receiver',
  whatItDoes:
    'The receiver picks up the stick commands from the radio in your hands and passes them on to the flight controller.',
  howItWorks: [
    `Your radio (the transmitter in your hands) sends your stick positions through the air, and the receiver on the drone picks them up. The current standard is ${receiver.system} (ELRS), an open-source system on ${receiver.frequencyGhz} GHz, with a 900 MHz version for long range. It is fast: the reference drone gets ${receiver.packetRateHz} updates a second.`,
    'Before first use, the receiver is bound (paired) to your radio, so it only listens to yours. Binding is done once, usually with a shared bind phrase.',
    `It talks to the flight controller (the drone’s brain) over one of its UARTs (serial ports), using a protocol called ${receiver.protocol}.`,
    'The link works both ways. Telemetry sends information back to your radio, such as battery voltage and signal quality, so you can read it on the radio’s screen or hear a warning.',
    'If the signal is lost, the flight controller goes into failsafe: on a normal freestyle drone the motors stop and it drops, so it can’t fly away. With a GPS fitted, it can fly back home instead (GPS Rescue).',
    'Antenna placement matters: carbon fibre blocks radio signals and motors make electrical noise, so the antenna is mounted out at the back, away from both.',
  ],
  specs: [
    {
      label: 'System',
      value: receiver.system,
      meaning: 'The radio control system. Your radio and the receiver must use the same one.',
    },
    {
      label: 'Frequency',
      value: `${receiver.frequencyGhz} GHz`,
      meaning:
        'The radio frequency. 2.4 GHz is the common choice; 900 MHz versions reach further but need bigger antennas.',
    },
    {
      label: 'Protocol',
      value: receiver.protocol,
      meaning:
        'The serial language the receiver uses to pass your stick commands to the flight controller.',
    },
    {
      label: 'Packet rate',
      value: `${receiver.packetRateHz} Hz`,
      meaning: `${receiver.packetRateHz} stick updates a second. Higher rates feel more direct; lower rates reach further.`,
    },
    {
      label: 'Antenna',
      value: receiver.antenna,
      meaning: 'A small T-shaped antenna. Its two arms form the dipole that catches the signal.',
    },
  ],
  connections: [
    {
      text: 'Its signal wires go to one of the flight controller’s UARTs, and it takes 5 V power from the flight controller.',
      partId: 'fc',
    },
    {
      text: 'It is mounted at the back of the frame, with its antenna out past the carbon.',
      partId: 'frame',
    },
    { text: 'It talks over the air to the radio in your hands.' },
  ],
};
