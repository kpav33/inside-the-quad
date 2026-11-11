import { REFERENCE_5_INCH, vtxChannelCount } from '@/shared/domain/drone-spec';

import type { Lesson } from './types';

const { vtx } = REFERENCE_5_INCH;
const channels = vtxChannelCount(REFERENCE_5_INCH);
const levels = vtx.powerLevelsMw.join(', ');
const polarization = vtx.antennaPolarization === 'RHCP' ? 'right-hand' : 'left-hand';

export const vtxLesson: Lesson = {
  partId: 'vtx',
  title: 'VTX',
  whatItDoes:
    'The VTX (video transmitter) sends the camera’s live picture over the air to your goggles.',
  howItWorks: [
    `It takes the video signal from the camera and broadcasts it on ${vtx.frequencyGhz} GHz. Your goggles have a matching video receiver, tuned to the same channel.`,
    `The band is split into channels: this VTX offers ${vtx.bands} bands of ${vtx.channelsPerBand} channels, ${channels} in all. Pilots flying at the same time each need their own channel, or they ruin each other’s video.`,
    `Power is measured in mW (milliwatts). More power reaches further, but it also makes more heat and more interference for others. This VTX can send at ${levels} mW and is set to ${vtx.powerSettingMw} mW. The legal limit depends on the country: in much of the EU it is 25 mW.`,
    'With analog video, the flight controller (the drone’s brain) adds the OSD (on-screen display: battery voltage, a timer) to the camera’s picture before it reaches the VTX. Analog is cheap and has the shortest delay, but the picture is fuzzy and breaks up into static at the edge of range.',
    'Digital systems (for example DJI, Walksnail, HDZero or OpenIPC) send a sharp HD picture instead. They cost more, the camera and VTX come as a matched set, and the goggles must use the same system.',
    `The antenna matters too. Its polarization, the direction the radio wave twists, must match the goggles’ antenna: this one is ${vtx.antennaPolarization} (${polarization} circular polarization). Never power a VTX without its antenna attached: with nowhere for the power to go, it can overheat and burn out within seconds.`,
  ],
  specs: [
    {
      label: 'Band',
      value: `${vtx.frequencyGhz} GHz`,
      meaning: 'The radio band analog FPV video uses.',
    },
    {
      label: 'Channels',
      value: `${channels} (${vtx.bands} × ${vtx.channelsPerBand})`,
      meaning: 'Bands × channels per band. Pilots flying together each pick a different channel.',
    },
    {
      label: 'Power',
      value: `${vtx.powerSettingMw} mW`,
      meaning: `The power setting in use; it offers ${levels} mW. Legal limits vary by country: in much of the EU, 25 mW is the limit.`,
    },
    {
      label: 'Mount',
      value: `${vtx.mountMm} × ${vtx.mountMm} mm`,
      meaning: 'The spacing of its mounting holes, a common size for small boards.',
    },
    {
      label: 'Antenna',
      value: vtx.antennaPolarization,
      meaning: `${polarization[0]?.toUpperCase()}${polarization.slice(1)} circular polarization. The goggles’ antenna must match, or the picture gets much weaker.`,
    },
  ],
  connections: [
    {
      text: 'It plugs into a UART (serial port) on the flight controller, which sets its channel and power and passes on the camera’s video with the on-screen text added.',
      partId: 'fc',
    },
    {
      text: 'The camera’s video arrives here and is sent out through the antenna.',
      partId: 'camera',
    },
    {
      text: 'It sits at the back of the frame, with its antenna out past the carbon.',
      partId: 'frame',
    },
    { text: 'Your goggles pick up its signal.' },
  ],
};
