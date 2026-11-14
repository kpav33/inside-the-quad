/** The licences a part photo may use: free ones only, so the app may later take donations. */
export const LICENCES = [
  'CC BY 3.0',
  'CC BY 4.0',
  'CC BY-SA 3.0',
  'CC BY-SA 4.0',
  'CC0',
  'Public domain',
] as const;
export type Licence = (typeof LICENCES)[number];

export interface PhotoCredit {
  author: string;
  licence: Licence;
  /** The licence's deed; public domain has none. */
  licenceUrl?: string;
  /** The photo's page on Wikimedia Commons. */
  sourceUrl: string;
  /** Cropped photos are adaptations, shared under the same licence. */
  cropped: boolean;
}

/** A real photo of one kind of part, shown on its lesson sheet. */
export interface PartPhoto {
  /** About 640 px wide. */
  src: string;
  /** About 1280 px wide (or the largest the source allowed). */
  srcLarge: string;
  width: number;
  height: number;
  /** What is in the picture, for screen readers. */
  alt: string;
  /** Shown under the photo; always starts "One example: ". */
  caption: string;
  credit: PhotoCredit;
}
