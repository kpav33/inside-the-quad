import { REFERENCE_5_INCH } from '@/shared/domain/drone-spec';
import { formatRangeMm, SIZE_CLASSES, type SizeClassId } from '@/shared/domain/size-classes';

export type SceneDeviceId = 'radio' | 'drone' | 'goggles';
export type SceneLinkId = 'control' | 'video';

export interface IntroSection {
  heading: string;
  paragraphs: readonly string[];
}

export interface SceneDevice {
  id: SceneDeviceId;
  label: string;
  /** What the device does in the system, in one line. */
  role: string;
  links: readonly SceneLinkId[];
}

export interface IntroContent {
  title: string;
  sections: readonly [IntroSection, IntroSection, IntroSection, IntroSection];
  scene: {
    label: string;
    devices: readonly SceneDevice[];
    links: Record<SceneLinkId, { label: string; detail: string }>;
  };
  sizes: {
    label: string;
    names: Record<SizeClassId, string>;
    columns: { size: string; prop: string; frame: string };
    reference: string;
  };
}

const { receiver, vtx, camera, frame } = REFERENCE_5_INCH;
const size = (id: SizeClassId) => {
  const found = SIZE_CLASSES.find((c) => c.id === id);
  if (!found) throw new Error(`no size class ${id}`);
  return found;
};
const whoop = size('whoop');
const five = size('5in');

/** "What is an FPV drone?": the short intro before sheet 1 (scope, Module 1). */
export const INTRO: IntroContent = {
  title: 'What is an FPV drone?',
  sections: [
    {
      heading: 'FPV vs camera drones',
      paragraphs: [
        'FPV stands for first-person view. A camera on the drone sends live video to goggles you wear, so you see what the drone sees, as if you were sitting in it.',
        'Camera drones, such as the DJI Mini or Mavic, fly themselves: let go of the sticks and they stop and hover in place. An FPV drone is flown by hand. Let go and it keeps the angle you left it at instead of holding still. That makes it harder to learn, and much more free: it can flip, roll and dive anywhere you can steer it.',
      ],
    },
    {
      heading: 'The whole system',
      paragraphs: [
        'Flying FPV takes three devices: the radio in your hands, the drone, and the goggles on your head. Between them run two wireless links.',
        `Control goes up: the radio sends your stick moves to the drone. Video comes down: the drone sends its live picture to the goggles. On the drone in this app, control uses ExpressLRS on ${receiver.frequencyGhz} GHz and the video is ${camera.signal} on ${vtx.frequencyGhz} GHz (GHz, gigahertz, names the radio frequency each link uses).`,
      ],
    },
    {
      heading: 'Sizes',
      paragraphs: [
        `FPV drones are named by the size of their propellers, in inches. A tiny whoop has props of about ${formatRangeMm(whoop.propMm)} inside protective rings and is light enough to fly indoors. A 3‑inch is small and light for tight spaces. A 5‑inch is the all-rounder. A 7‑inch carries a bigger battery to fly longer and farther.`,
        'The frame grows with the props: the motors must sit far enough apart that the props never touch.',
      ],
    },
    {
      heading: 'Why 5‑inch',
      paragraphs: [
        `A 5‑inch drone has ${formatRangeMm(five.propMm)} (5‑inch) propellers and measures about ${formatRangeMm(five.frameMm)} diagonally from motor to motor. It is the most common size for freestyle flying, so its parts are standard, easy to find, and big enough to see and handle while you build.`,
        `That is why this app uses one as its reference. The drone in the drawing is a 5‑inch (${frame.wheelbaseMm} mm motor to motor), and every number in the part sheets comes from it. Next, sheet 1 starts with its frame.`,
      ],
    },
  ],
  scene: {
    label: 'The three devices and their links',
    devices: [
      {
        id: 'radio',
        label: 'Radio',
        role: 'Sends your stick moves up to the drone.',
        links: ['control'],
      },
      {
        id: 'drone',
        label: 'Drone',
        role: 'Flies by your stick moves and sends its live video down to the goggles.',
        links: ['control', 'video'],
      },
      {
        id: 'goggles',
        label: 'Goggles',
        role: 'Show you the drone’s live video.',
        links: ['video'],
      },
    ],
    links: {
      control: { label: 'Control', detail: `ExpressLRS · ${receiver.frequencyGhz} GHz` },
      video: { label: 'Video', detail: `${camera.signal} · ${vtx.frequencyGhz} GHz` },
    },
  },
  sizes: {
    label: 'Drone sizes compared, drawn to one scale',
    names: { whoop: 'Tiny whoop', '3in': '3‑inch', '5in': '5‑inch', '7in': '7‑inch' },
    columns: { size: 'Size', prop: 'Props', frame: 'Motor to motor' },
    reference: 'Reference',
  },
};
