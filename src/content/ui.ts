import type { PartId } from '@/shared/domain/parts';
import { isPathId, type PathId } from '@/shared/domain/paths';
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
    allRead: (total: number) => `All ${total} sheets read. Open any sheet to look something up.`,
    startAgain: 'Start again from sheet 1',
    count: (read: number, total: number) => `${read} of ${total} read`,
    clear: 'Clear progress',
  },
  titleBlock: {
    label: 'Title block',
    // U+2011 non-breaking hyphen keeps "5-inch" on one line.
    overviewPart: 'Reference 5\u2011inch quad',
    overviewSheet: 'Overview',
    part: 'Part',
    sheet: 'Sheet',
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
  paths: {
    /** Each path sheet's name, as its heading and wherever another sheet refers to it. */
    title: { control: 'Control path', power: 'Power path', video: 'Video path' } satisfies Record<
      PathId,
      string
    >,
    /** The path switcher's short names. */
    short: { control: 'Control', power: 'Power', video: 'Video' } satisfies Record<PathId, string>,
    switcherLabel: 'Paths',
    close: 'Close sheet',
    stopsLabel: 'Stops',
    /** Before the lesson links of a stop with several parts. */
    lessonsLabel: 'Lessons:',
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
  lesson: {
    close: 'Close lesson',
    /** The sheet half of a reference to another sheet ("Battery · sheet 6"), kept on one line. */
    sheetNumber: (sheet: number) => `· sheet ${sheet}`,
    footerLabel: 'Sheets',
    previous: 'Previous',
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

/** A numbered sheet's name: the part's label or the path's title. */
export function sheetName(sheet: NumberedSheet): string {
  return isPathId(sheet) ? UI.paths.title[sheet] : PART_LABELS[sheet];
}
