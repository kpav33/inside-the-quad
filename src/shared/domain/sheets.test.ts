import { describe, expect, it } from 'vitest';

import { PART_IDS } from './parts';
import { MOVES_SHEET } from './moves';
import { PATH_IDS } from './paths';
import {
  chapterCount,
  chapterOf,
  NUMBERED_SHEETS,
  SHEET_IDS,
  sheetNeighbours,
  sheetNumber,
} from './sheets';

describe('sheets', () => {
  it('puts the intro before the parts, in teaching order', () => {
    expect(SHEET_IDS).toEqual(['intro', ...PART_IDS, ...PATH_IDS, MOVES_SHEET]);
    expect(new Set(SHEET_IDS).size).toBe(SHEET_IDS.length);
    expect((PART_IDS as readonly string[]).includes('intro')).toBe(false);
  });

  it('gives the intro no previous sheet and sheet 1 after it', () => {
    expect(sheetNeighbours('intro')).toEqual({ previous: null, next: 'frame' });
  });

  it('leads back from sheet 1 to the intro', () => {
    expect(sheetNeighbours('frame').previous).toBe('intro');
  });

  it('runs on from the last part into the control path', () => {
    expect(sheetNeighbours('extras')).toEqual({ previous: 'vtx', next: 'control' });
  });

  it('runs on from the video path into how a quad moves, which ends the set', () => {
    expect(sheetNeighbours('video')).toEqual({ previous: 'power', next: 'moves' });
    expect(sheetNeighbours('moves')).toEqual({ previous: 'video', next: null });
  });

  it('reads the parts, then the paths and how a quad moves', () => {
    expect(NUMBERED_SHEETS).toHaveLength(15);
  });

  it('splits the set into two chapters, each numbered from 1', () => {
    expect(chapterOf('frame')).toBe('parts');
    expect(chapterOf('control')).toBe('paths');
    expect(sheetNumber('frame')).toBe(1);
    expect(sheetNumber('extras')).toBe(11);
    expect(sheetNumber('control')).toBe(1);
    expect(sheetNumber('video')).toBe(3);
    expect(chapterCount('extras')).toBe(11);
    expect(chapterCount('power')).toBe(4);
    expect(chapterOf('moves')).toBe('paths');
    expect(sheetNumber('moves')).toBe(4);
    expect(chapterCount('moves')).toBe(4);
  });
});
