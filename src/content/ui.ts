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
    /** Continuing into the paths names their chapter, since its sheets are numbered afresh. */
    continuePaths: (sheet: number, name: string) =>
      `Continue with How it works together, sheet ${sheet}: ${name}`,
    allRead: 'Every sheet read. Open any sheet to look something up.',
    startAgain: 'Start again from sheet 1',
    count: (parts: number, partTotal: number, together: number, togetherTotal: number) =>
      `Parts ${parts} of ${partTotal} · How it works ${together} of ${togetherTotal}`,
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
    by: 'Photo:',
    /** Said after a cropped photo: share-alike licences carry over to the crop. */
    cropped: (shareAlike: boolean) =>
      shareAlike ? 'Cropped; shared under the same licence.' : 'Cropped.',
    /** The photo's own title, linked to its Commons page. */
    title: (title: string) => `“${title}”`,
    byAuthor: (author: string) => `by ${author}`,
    via: 'Via Wikimedia Commons.',
  },
  chapters: { parts: 'The parts', paths: 'How it works together' },
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
    /** The footer link out of the last part, into the paths chapter. */
    endOfParts: 'End of the parts',
    /** A lesson opened from a path's stop: the way back to that step. */
    backToPath: (title: string, step: number) => `Back to ${title}, step ${String(step)}`,
    /** The footer link back from the first path into the parts chapter. */
    backToParts: 'Back to the parts',
    /** A path named from outside its chapter. */
    pathInChapter: (sheet: number, title: string) =>
      `How it works together, sheet ${sheet}: ${title}`,
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
  if (sheet === MOVES_SHEET) return UI.moves.title;
  if (sheet === WHAT_IF_SHEET) return UI.whatIf.title;
  return isPathId(sheet) ? UI.paths.title[sheet] : PART_LABELS[sheet];
}
