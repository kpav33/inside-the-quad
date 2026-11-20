import { CHECK_SHEET } from '@/shared/domain/check';
import { type GearId, isGearId } from '@/shared/domain/gear';
import type { PartId } from '@/shared/domain/parts';
import { MOVES_SHEET } from '@/shared/domain/moves';
import { isPathId, type PathId } from '@/shared/domain/paths';
import { WHAT_IF_SHEET } from '@/shared/domain/what-if';
import type { NumberedSheet } from '@/shared/domain/sheets';

/** Part names as shown in the parts list and lesson titles. */
export const PART_LABELS: Record<PartId, string> = {
  frame: 'Frame',
  motors: 'Motors',
  props: 'Propellers',
  esc: 'ESC',
  fc: 'Flight controller',
  battery: 'Battery',
  strap: 'Battery strap',
  receiver: 'Receiver',
  camera: 'Camera',
  vtx: 'VTX',
  extras: 'Extras',
};

/**
 * All interface text outside the lessons. Kept here, not in components, so the app can be
 * translated (PRODUCT.md) without touching code.
 */
export const UI = {
  app: {
    title: 'Inside the Quad',
    /** The title split for the masthead, where the last part is set in the accent colour. */
    titleLead: 'Inside the',
    titleAccent: 'Quad',
    tagline: 'How an FPV drone works, part by part.',
    /** The browser tab's title while a part's lesson is open. */
    pageTitle: (part: string) => `${part} · Inside the Quad`,
    /** The masthead's sections, and its link to the intro. */
    navLabel: 'Sections',
    introLink: 'What is an FPV drone?',
    /** The masthead's link to the path sheets, which opens the control path. */
    pathsLink: 'How it works together',
    gearLink: 'The gear',
    checkLink: 'Check a build',
    /** The browser tab's title while the intro is open. */
    introTitle: 'What is an FPV drone? · Inside the Quad',
  },
  viewer: {
    loading: 'Loading the 3D drawing…',
    fallback:
      'The 3D model couldn’t be loaded. Your browser may not support WebGL, or the page needs a reload. You can still explore every part with the list.',
    dragHint: 'Drag to turn · click a part',
    touchHint: 'Two fingers to turn · tap a part',
  },
  parts: {
    /** A part-list row's name once its lesson is marked as read. */
    readName: (part: string) => `${part}, read`,
    navLabel: 'Drone parts',
    heading: 'Parts list',
    columns: { item: 'Item', part: 'Part', quantity: 'Qty' },
  },
  explorer: {
    opened: (part: string) => `${part} lesson opened`,
    pathOpened: (title: string) => `${title} opened`,
    hint: 'Select a part on the drone or in the parts list to see what it does and how it works.',
    introOpened: 'What is an FPV drone? opened',
    unknownPart: (slug: string) => `There’s no part called “${slug}”. Pick one from the list.`,
  },
  intro: {
    /** The title block's Sheet value on the intro. */
    sheet: 'Intro',
    /** How links name the intro. */
    link: 'What is an FPV drone?',
    close: 'Close intro',
  },
  overview: {
    newHere: 'New to FPV? Start here.',
    knowBasics: 'Already know the basics?',
    start: (part: string) => `Start with sheet 1: ${part}`,
    continue: (sheet: number, name: string) => `Continue with sheet ${sheet}: ${name}`,
    /** Continuing past the parts names the chapter, since its sheets are numbered afresh. */
    continueIn: (chapter: string, sheet: number, name: string) =>
      `Continue with ${chapter}, sheet ${sheet}: ${name}`,
    allRead: 'Every sheet read. Open any sheet to look something up.',
    startAgain: 'Start again from sheet 1',
    count: (
      parts: number,
      partTotal: number,
      together: number,
      togetherTotal: number,
      gear: number,
      gearTotal: number,
      build: number,
      buildTotal: number,
    ) =>
      `Parts ${parts} of ${partTotal} · How it works ${together} of ${togetherTotal} · Gear ${gear} of ${gearTotal} · Build ${build} of ${buildTotal}`,
    clear: 'Clear progress',
  },
  titleBlock: {
    label: 'Title block',
    // U+2011 non-breaking hyphen keeps "5-inch" on one line.
    overviewPart: 'Reference 5\u2011inch quad',
    overviewSheet: 'Overview',
    part: 'Part',
    sheet: 'Sheet',
    chapter: 'Chapter',
    sheetOf: (sheet: number, sheets: number) => `${sheet} of ${sheets}`,
    quantity: 'Qty',
    spec: 'Spec',
  },
  /** The real part photo on each lesson sheet. */
  photo: {
    label: 'Real part',
    gearLabel: 'Real gear',
    by: 'Photo:',
    /** Said after a cropped photo: share-alike licences carry over to the crop. */
    cropped: (shareAlike: boolean) =>
      shareAlike ? 'Cropped; shared under the same licence.' : 'Cropped.',
    /** The photo's own title, linked to its Commons page. */
    title: (title: string) => `“${title}”`,
    byAuthor: (author: string) => `by ${author}`,
    via: 'Via Wikimedia Commons.',
  },
  chapters: {
    parts: 'The parts',
    paths: 'How it works together',
    gear: 'The gear you hold and wear',
    build: 'Plan a build',
  },
  checker: {
    /** The sheet's heading, and its name wherever another sheet refers to it. */
    title: 'Check a build',
    resultsHeading: 'Results',
    partsHeading: 'Your parts',
    status: { fits: 'Fits', check: 'Check this', fails: 'Doesn’t fit' },
    /** The summary line over the results, e.g. "6 fit · 1 doesn’t · 1 to check". */
    summary: ({ fits, check, fails }: { fits: number; check: number; fails: number }) =>
      [`${fits} fit`, fails > 0 ? `${fails} doesn’t` : '', check > 0 ? `${check} to check` : '']
        .filter(Boolean)
        .join(' · '),
    lessonLink: (lesson: string) => `${lesson} lesson`,
    reset: 'Reset to this app’s drone',
    opened: 'Check a build opened',
  },
  gear: {
    /** Each gear sheet's name, as its heading and wherever another sheet refers to it. */
    title: { radio: 'Radio', goggles: 'Goggles', charger: 'Charger' } satisfies Record<
      GearId,
      string
    >,
    close: 'Close sheet',
    /** The sheet's one thing to try, over its switches. */
    tryLabel: 'Try it',
    arm: { label: 'Arm switch', off: 'Disarmed', on: 'Armed' },
    modeLabel: 'Mode switch',
    videoLabel: 'Goggles’ video',
    video: { analog: 'Analog', digital: 'Digital' },
    chargerLabel: 'Charger mode',
    chargerMode: { charge: 'Charge', storage: 'Storage' },
    /** The list of the drawing's parts; each name highlights its part. */
    partsHeading: 'On the drawing',
    partsHint: 'Point at a name to find it on the drawing.',
    /** On the goggles' screens when they can't read the drone's video. */
    noSignal: 'No signal',
    /** A link to a gear sheet from outside its chapter (the intro's devices). */
    moreIn: (name: string) => `More in ${name}`,
  },
  paths: {
    /** Each path sheet's name, as its heading and wherever another sheet refers to it. */
    title: { control: 'Control path', power: 'Power path', video: 'Video path' } satisfies Record<
      PathId,
      string
    >,
    /** The path switcher's short names. */
    short: { control: 'Control', power: 'Power', video: 'Video' } satisfies Record<PathId, string>,
    /** The switcher between the chapter's sheets: the paths and How a quad moves. */
    switcherLabel: 'How it works together',
    close: 'Close sheet',
    stopsLabel: 'Stops',
    from: 'From',
    to: 'To',
    carries: 'Carries',
    /** Before the lesson link of a stop, and of a stop with several parts. */
    lessonLabel: 'Lesson:',
    lessonsLabel: 'Lessons:',
    /** Before the intro link under an off-drone end (the radio, the goggles). */
    endMoreLabel: 'More in',
    previousStep: 'Previous step',
    nextStep: 'Next step',
    play: 'Play the path',
    stop: 'Stop',
    /** The off-drone ends, as labelled on the drawing. */
    endLabel: { radio: 'Your radio', goggles: 'Your goggles' },
    /** What a screen reader hears when the current stop changes. */
    stepAnnounce: (stop: number, total: number, name: string, text: string) =>
      `Stop ${stop} of ${total}: ${name}. ${text}`,
  },
  whatIf: {
    /** The sheet's name, as its heading and wherever another sheet refers to it. */
    title: 'What if',
    close: 'Close sheet',
    stepsLabel: 'Mistakes',
    controlsLabel: 'Step and drone controls',
    previousStep: 'Previous step',
    nextStep: 'Next step',
    tryIt: 'Try it',
    reset: 'Reset',
    /** Under the current step until its mistake is on: how to see it. */
    tryHint: 'Press Try it to see it happen.',
    batteryHint: 'Switch to 4S to feel the difference.',
    /** The battery step's switch, in place of Try it. */
    batteryLabel: 'Battery',
    cells: (cells: number) => `${String(cells)}S`,
    /** The three parts of each step's text. */
    happens: 'What happens',
    why: 'Why',
    avoid: 'How to avoid it',
    lessonLabel: 'More in',
    /** The status line over the drawing. */
    status: {
      label: 'Drone status',
      linkOk: 'Link OK',
      linkLost: 'Link lost',
      vtx: { 1: 'VTX: Warm', 2: 'VTX: Hot', 3: 'VTX: Damaged' } as const,
    },
    /** What a screen reader hears as a mistake plays out. */
    said: {
      linkLost: 'Link lost: the sticks no longer reach the drone.',
      wrongProp: 'A prop for the other direction is on motor 2.',
      battery: (cells: number) => `Battery: ${String(cells)}S.`,
      disarmed: 'The motors stopped: the drone is disarmed.',
      onGround: 'The drone is on the ground.',
      reset: 'Reset: the drone is back, level and armed.',
    },
    stepAnnounce: (step: number, total: number, name: string) =>
      `Mistake ${String(step)} of ${String(total)}: ${name}.`,
  },
  moves: {
    /** The sheet's name, as its heading and wherever another sheet refers to it. */
    title: 'How a quad moves',
    close: 'Close sheet',
    stepsLabel: 'Steps',
    previousStep: 'Previous step',
    nextStep: 'Next step',
    showMe: 'Show me',
    gust: 'Gust',
    level: 'Level',
    controlsLabel: 'Step and drone controls',
    /** Before the lesson links under a step. */
    lessonLabel: 'More in',
    /** The gyro loop step's table of what the flight controller compares. */
    compare: {
      caption: 'What the flight controller compares',
      axis: 'Axis',
      wanted: 'You ask for',
      measured: 'Gyro measures',
      rate: (degreesPerSecond: number) => `${degreesPerSecond} °/s`,
      axes: { roll: 'Roll', pitch: 'Pitch', yaw: 'Yaw' },
    },
    /** What a screen reader hears when the current step changes. */
    stepAnnounce: (step: number, total: number, name: string, text: string) =>
      `Step ${step} of ${total}: ${name}. ${text}`,
    sticks: {
      left: 'Left stick: throttle and yaw',
      right: 'Right stick: pitch and roll',
      throttle: 'Throttle',
      yaw: 'Yaw',
      pitch: 'Pitch',
      roll: 'Roll',
      /** A stick's value for assistive technology, e.g. "Roll 40 % right". */
      value: (axis: string, percent: number, way: string) => `${axis} ${percent} % ${way}`,
      throttleValue: (percent: number) => `Throttle ${percent} %`,
      centred: (axis: string) => `${axis} centred`,
      ways: {
        yaw: ['left', 'right'],
        pitch: ['back', 'forward'],
        roll: ['left', 'right'],
      },
    },
  },
  lesson: {
    close: 'Close lesson',
    /** The sheet half of a reference to another sheet ("Battery · sheet 6"), kept on one line. */
    sheetNumber: (sheet: number) => `· sheet ${sheet}`,
    footerLabel: 'Sheets',
    previous: 'Previous',
    /** The footer link out of a chapter's last sheet, into the next chapter. */
    endOf: {
      parts: 'End of the parts',
      paths: 'End of How it works together',
      gear: 'End of the gear',
      build: 'End of Plan a build',
    },
    /** A lesson opened from a path's stop: the way back to that step. */
    backToPath: (title: string, step: number) => `Back to ${title}, step ${String(step)}`,
    /** The footer link back from a chapter's first sheet into the chapter before. */
    backTo: {
      parts: 'Back to the parts',
      paths: 'Back to How it works together',
      gear: 'Back to the gear',
      build: 'Back to Plan a build',
    },
    /** A sheet named from outside its chapter, since each chapter numbers its sheets from 1. */
    sheetInChapter: (chapter: string, sheet: number, title: string) =>
      `${chapter}, sheet ${sheet}: ${title}`,
    next: 'Next',
    backToOverview: 'Back to overview',
    markRead: 'Mark as read',
    isRead: 'Read',
    questions: [
      'What does it do?',
      'How does it work?',
      'What do the numbers mean?',
      'What is it connected to?',
    ] as const,
    specColumns: { label: 'Spec', value: 'Value', meaning: 'What it means' },
  },
} as const;

/** A numbered sheet's name: the part's label, the path's title, or the moves sheet's title. */
export function sheetName(sheet: NumberedSheet): string {
  if (sheet === CHECK_SHEET) return UI.checker.title;
  if (sheet === MOVES_SHEET) return UI.moves.title;
  if (sheet === WHAT_IF_SHEET) return UI.whatIf.title;
  if (isGearId(sheet)) return UI.gear.title[sheet];
  return isPathId(sheet) ? UI.paths.title[sheet] : PART_LABELS[sheet];
}
