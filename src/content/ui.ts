import type { PartId } from '@/shared/domain/parts';

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
    continue: (sheet: number, part: string) => `Continue with sheet ${sheet}: ${part}`,
    allRead: (total: number) => `All ${total} parts read. Open any sheet to look something up.`,
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
    source: 'Wikimedia Commons',
    via: 'Source:',
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
