import { REFERENCE_5_INCH, vtxChannelCount } from '@/shared/domain/drone-spec';

import type { GearLesson, GogglesPartId, VideoSystem } from './types';

const { camera, vtx } = REFERENCE_5_INCH;
const channels = vtxChannelCount(REFERENCE_5_INCH);

export const gogglesLesson: GearLesson<GogglesPartId> = {
  id: 'goggles',
  title: 'Goggles',
  whatItDoes:
    'Goggles show you the drone’s live video right in front of your eyes, so you fly as if you were sitting in it.',
  howItWorks: [
    'Inside is a video receiver, tuned to the same channel as the drone’s VTX (video transmitter), and a small screen for each eye, with lenses that let your eyes focus on them up close.',
    `Analog goggles pick up ${camera.signal} video on ${String(vtx.frequencyGhz)} GHz. The drone in this app sends ${camera.signal} video, so analog goggles show its picture. It arrives with almost no delay, but it is fuzzy, and it breaks up into static at the edge of range.`,
    'Digital systems send a sharp HD picture, coded in their own way. Each one only talks to its own matched VTX and camera, so analog goggles can’t show it, and digital goggles only show analog video if they have an analog receiver built in. Goggles and drone must use the same system.',
    `The antennas must match the VTX’s too: this drone’s is ${vtx.antennaPolarization}. Many goggles carry two, one that hears all round and one aimed forward that reaches further.`,
  ],
  specs: [
    {
      label: 'Video',
      value: camera.signal === 'analog' ? 'Analog' : 'Digital',
      meaning: 'The kind of video. It must match the drone’s VTX.',
    },
    {
      label: 'Frequency',
      value: `${String(vtx.frequencyGhz)} GHz`,
      meaning: 'The radio band the video comes on, the same as the VTX’s.',
    },
    {
      label: 'Channels',
      value: String(channels),
      meaning:
        'Pick the same channel as the drone’s VTX. Pilots flying together each use their own.',
    },
    {
      label: 'Antenna',
      value: vtx.antennaPolarization,
      meaning:
        'The direction the radio wave twists. It must match the VTX’s antenna, or the picture gets much weaker.',
    },
  ],
  connections: [
    {
      text: 'Its video receiver picks up the VTX’s signal, on the same channel.',
      partId: 'vtx',
    },
    {
      text: 'What you see is the camera’s picture, with the flight controller’s on-screen text on top.',
      partId: 'camera',
    },
  ],
  parts: [
    { id: 'screens', label: 'Screens', note: 'One small screen for each eye, behind a lens.' },
    {
      id: 'video-receiver',
      label: 'Video receiver',
      note: 'Picks up the drone’s video, tuned to the VTX’s channel.',
    },
    { id: 'antennas', label: 'Antennas', note: 'Catch the video signal; they match the VTX’s.' },
    { id: 'strap', label: 'Strap', note: 'Holds the goggles to your face.' },
  ],
};

/** What the goggles show from this drone, by the kind of video they receive. */
export function gogglesSays(system: VideoSystem): string {
  return system === 'analog'
    ? `Analog goggles: the picture comes through. They match this drone’s ${camera.signal} VTX.`
    : `Digital goggles: no signal. They can’t read this drone’s ${camera.signal} video: the two systems send pictures differently.`;
}
