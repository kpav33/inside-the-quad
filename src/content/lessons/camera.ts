import { CAMERA_SIZE_CLASS_MM, REFERENCE_5_INCH } from '@/shared/domain/drone-spec';

import type { Lesson } from './types';

const { camera } = REFERENCE_5_INCH;
const signal = camera.signal === 'analog' ? 'Analog' : 'Digital';
const { full, mini, micro, nano } = CAMERA_SIZE_CLASS_MM;

export const cameraLesson: Lesson = {
  partId: 'camera',
  title: 'Camera',
  whatItDoes: 'The FPV camera captures the live view you see in your goggles while you fly.',
  howItWorks: [
    'It films what is in front of the drone, and the video transmitter beams that picture to your goggles. For flying, latency (the delay between something happening and you seeing it) matters more than a sharp picture: a fraction of a second of delay can be the difference between a gap and a crash.',
    `FPV cameras come in standard widths: full (${full} mm), mini (${mini} mm), micro (${micro} mm) and nano (${nano} mm). The frame’s camera plates are made for one width, so the camera must match.`,
    `It is tilted up, here by ${camera.tiltDeg}°. When the drone flies fast it leans forward, so a level camera would stare at the ground; tilting it up lets you see where you are going. Faster flying calls for more tilt, usually somewhere between 25° and 45°.`,
    'This reference drone uses analog video: the camera sends a standard video signal, and the flight controller (the drone’s brain) adds on-screen text to it on its way to the video transmitter. Digital systems come with their own matched camera instead.',
    'It is not the same as an HD action camera (a GoPro or similar) that some pilots mount on top to record good-looking footage. The FPV camera is for flying; the action camera is for keeping.',
  ],
  specs: [
    {
      label: 'Size',
      value: `${camera.sizeClass}, ${camera.widthMm} mm`,
      meaning: 'The size class and its width. It must fit between the frame’s camera plates.',
    },
    {
      label: 'Sizes',
      value: `${full} · ${mini} · ${micro} · ${nano} mm`,
      meaning: 'The four standard widths: full, mini, micro and nano.',
    },
    {
      label: 'Tilt',
      value: `${camera.tiltDeg}°`,
      meaning: 'How far it points up from level. More tilt suits faster flying.',
    },
    {
      label: 'Signal',
      value: signal,
      meaning: 'The kind of video it sends out. It must match the video transmitter.',
    },
  ],
  connections: [
    {
      text: 'It sits at the front of the frame, between the two camera side plates.',
      partId: 'frame',
    },
    {
      text: 'Its video passes through the flight controller, which adds the on-screen text and powers the camera with 5 V.',
      partId: 'fc',
    },
    { text: 'From there the video goes on to the video transmitter (VTX).', partId: 'vtx' },
  ],
};
