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
  },
  viewer: {
    loading: 'Loading the 3D drawing…',
    fallback:
      'The 3D model couldn’t be loaded. Your browser may not support WebGL, or the page needs a reload. You can still explore every part with the list.',
    dragHint: 'Drag to turn · click a part',
    touchHint: 'Two fingers to turn · tap a part',
  },
  parts: {
    navLabel: 'Drone parts',
    heading: 'Parts list',
    columns: { item: 'Item', part: 'Part', quantity: 'Qty' },
  },
  explorer: {
    opened: (part: string) => `${part} lesson opened`,
    hint: 'Select a part on the drone or in the parts list to see what it does and how it works.',
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
  lesson: {
    close: 'Close lesson',
    questions: [
      'What does it do?',
      'How does it work?',
      'What do the numbers mean?',
      'What is it connected to?',
    ] as const,
    specColumns: { label: 'Spec', value: 'Value', meaning: 'What it means' },
  },
} as const;
