import type { PartId } from '@/shared/domain/parts';

/**
 * The drawing sheet palette. Single source of colour for CSS (mirrored in src/styles/tokens.css,
 * kept identical by tokens.test.ts) and for the three.js materials.
 */
export const COLOR = {
  /** Carbon-black page ground. */
  ground: '#121416',
  /** Slightly lifted sheet for panels and the title block. */
  sheet: '#1c1f22',
  /** Hairline rules. */
  rule: '#2a2e32',
  /** Frames and stronger rules. */
  ruleStrong: '#3a3f44',
  /** Drafting-white ink for reading text. */
  ink: '#dfe3e6',
  /** Secondary text: labels, hints, table headers. */
  muted: '#9aa3ab',
  /** Redline: selection, the current sheet and focus only. */
  accent: '#ff5b3a',
} as const;

/** 3D fills: dark ground and sheet tones, so the drawing reads as ink lines and redline is the
 * only filled colour. */
export const MODEL_COLOR: Record<PartId, string> = {
  frame: '#1c1f22',
  motors: '#202428',
  props: '#24282c',
  battery: '#22262a',
};

/** Scene lighting for the 3D drawing: a cool fill light so dark parts keep their shape. */
export const SCENE_LIGHT = {
  fill: '#b8c4d0',
} as const;

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const n = Number.parseInt(hex.slice(1), 16);
  return (
    0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
  );
}

/** WCAG 2.x contrast ratio between two #rrggbb colours. */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}
