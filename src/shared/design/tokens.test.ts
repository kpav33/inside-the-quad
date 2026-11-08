import { describe, expect, it } from 'vitest';

import { PART_IDS } from '@/shared/domain/parts';

import indexHtml from '../../../index.html?raw';
import tokensCss from '../../styles/tokens.css?raw';

import { COLOR, contrastRatio, MODEL_COLOR } from './tokens';

const kebab = (key: string) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

describe('contrastRatio', () => {
  it('measures black on white as 21:1', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
  });

  it('is symmetric', () => {
    expect(contrastRatio('#ff5b3a', '#121416')).toBeCloseTo(
      contrastRatio('#121416', '#ff5b3a'),
      10,
    );
  });
});

describe('colour tokens', () => {
  it.each(['ground', 'sheet'] as const)('keeps text readable on %s (WCAG AA 4.5:1)', (bg) => {
    expect(contrastRatio(COLOR.ink, COLOR[bg])).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(COLOR.muted, COLOR[bg])).toBeGreaterThanOrEqual(4.5);
  });

  it.each(['ground', 'sheet'] as const)('keeps the accent visible on %s (3:1)', (bg) => {
    expect(contrastRatio(COLOR.accent, COLOR[bg])).toBeGreaterThanOrEqual(3);
  });

  it('keeps muted text a clear step below ink', () => {
    expect(contrastRatio(COLOR.ink, COLOR.ground)).toBeGreaterThan(
      contrastRatio(COLOR.muted, COLOR.ground) + 3,
    );
  });

  it('mirrors every colour into tokens.css', () => {
    for (const [key, value] of Object.entries(COLOR)) {
      expect(tokensCss).toContain(`--color-${kebab(key)}: ${value};`);
    }
  });

  it('gives every part a 3D base colour', () => {
    for (const id of PART_IDS) expect(MODEL_COLOR[id]).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('uses the ground colour for the browser theme colour', () => {
    expect(indexHtml).toContain(`<meta name="theme-color" content="${COLOR.ground}" />`);
  });
});
