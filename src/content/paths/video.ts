import { UI } from '@/content/ui';
import { REFERENCE_5_INCH } from '@/shared/domain/drone-spec';

import type { PathContent } from './types';

const { vtx } = REFERENCE_5_INCH;

export const videoPath: PathContent = {
  id: 'video',
  title: UI.paths.title.video,
  lead: 'How the live picture gets from the front of the drone to your eyes.',
  from: 'Camera',
  to: 'Your goggles',
  carries: 'The live picture',
  stops: [
    {
      name: 'Camera',
      parts: ['camera'],
      anchors: ['camera'],
      feeds: [1],
      text: 'The camera at the front turns what it sees into an analog video signal.',
    },
    {
      name: 'Flight controller',
      parts: ['fc'],
      anchors: ['fc'],
      feeds: [2],
      text: 'The video passes through the flight controller, which adds the on-screen display (OSD): battery voltage, a timer and warnings.',
    },
    {
      name: 'VTX',
      parts: ['vtx'],
      anchors: ['vtx'],
      feeds: [3],
      text: `The video transmitter turns the picture into a ${vtx.frequencyGhz} GHz radio signal on the channel and power the flight controller sets.`,
    },
    {
      name: 'VTX antenna',
      parts: ['vtx'],
      anchors: ['vtxAntenna'],
      feeds: [4],
      text: 'The antenna, out past the carbon at the back, sends the signal through the air.',
    },
    {
      name: 'Your goggles',
      end: 'goggles',
      parts: [],
      anchors: ['goggles'],
      feeds: [],
      text: 'Your goggles pick up the signal on the same channel and show the picture, about as fast as it happens.',
    },
  ],
};
