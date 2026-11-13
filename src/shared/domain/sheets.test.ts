import { describe, expect, it } from 'vitest';

import { PART_IDS } from './parts';
import { SHEET_IDS, sheetNeighbours } from './sheets';

describe('sheets', () => {
  it('puts the intro before the parts, in teaching order', () => {
    expect(SHEET_IDS).toEqual(['intro', ...PART_IDS]);
    expect(new Set(SHEET_IDS).size).toBe(SHEET_IDS.length);
    expect((PART_IDS as readonly string[]).includes('intro')).toBe(false);
  });

  it('gives the intro no previous sheet and sheet 1 after it', () => {
    expect(sheetNeighbours('intro')).toEqual({ previous: null, next: 'frame' });
  });

  it('leads back from sheet 1 to the intro', () => {
    expect(sheetNeighbours('frame').previous).toBe('intro');
  });

  it('ends after the last part', () => {
    expect(sheetNeighbours('extras')).toEqual({ previous: 'vtx', next: null });
  });
});
