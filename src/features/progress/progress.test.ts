import { describe, expect, it } from 'vitest';

import { PART_IDS } from '@/shared/domain/parts';
import { NUMBERED_SHEETS } from '@/shared/domain/sheets';

import {
  firstUnread,
  parseReadSheets,
  type ReadableSheet,
  serializeReadSheets,
  startState,
} from './progress';

const set = (...sheets: ReadableSheet[]) => new Set<ReadableSheet>(sheets);

describe('parseReadSheets', () => {
  it.each([null, 'nope', '{}', '[1]', '"vtx"'])('reads %j as nothing read', (raw) => {
    expect(parseReadSheets(raw).size).toBe(0);
  });

  it('keeps parts and paths, and drops anything else', () => {
    expect(parseReadSheets('["frame","power","nope",3]')).toEqual(set('frame', 'power'));
  });

  it('keeps how a quad moves', () => {
    expect(parseReadSheets('["moves","fc"]')).toEqual(set('moves', 'fc'));
  });

  it('reads progress stored before the paths existed', () => {
    expect(parseReadSheets('["frame"]')).toEqual(set('frame'));
  });

  it('drops unknown ids and duplicates', () => {
    expect([...parseReadSheets('["vtx","x","vtx"]')]).toEqual(['vtx']);
  });
});

describe('serializeReadSheets', () => {
  it('writes the sheets in sheet order', () => {
    expect(serializeReadSheets(set('video', 'vtx', 'frame'))).toBe('["frame","vtx","video"]');
  });

  it('round-trips through parseReadSheets', () => {
    expect(parseReadSheets(serializeReadSheets(set('esc', 'camera')))).toEqual(
      set('esc', 'camera'),
    );
  });
});

describe('where to start', () => {
  it('starts at sheet 1 when nothing is read', () => {
    expect(firstUnread(set())).toBe('frame');
    expect(startState(set(), true)).toEqual({ kind: 'start' });
  });

  it('continues at the next sheet after the frame', () => {
    expect(startState(set('frame'), true)).toEqual({ kind: 'continue', sheet: 'motors' });
  });

  it('continues at the first unread sheet, not after the last read one', () => {
    expect(startState(set('vtx'), true)).toEqual({ kind: 'continue', sheet: 'frame' });
  });

  it('continues into the paths once every part is read', () => {
    expect(firstUnread(set(...PART_IDS))).toBe('control');
    expect(startState(set(...PART_IDS), true)).toEqual({ kind: 'continue', sheet: 'control' });
  });

  it('is done when every sheet is read', () => {
    expect(firstUnread(set(...NUMBERED_SHEETS))).toBeNull();
    expect(startState(set(...NUMBERED_SHEETS), true)).toEqual({ kind: 'done' });
  });
});

describe('where to start, with the intro', () => {
  it('offers the intro to a visitor who has read nothing', () => {
    expect(startState(set(), false)).toEqual({ kind: 'intro' });
  });

  it('offers sheet 1 once the intro is read', () => {
    expect(startState(set(), true)).toEqual({ kind: 'start' });
  });

  it('continues with the parts once any part is read, intro or not', () => {
    expect(startState(set('frame'), false)).toEqual({ kind: 'continue', sheet: 'motors' });
  });

  it('is done when every sheet is read, intro or not', () => {
    expect(startState(set(...NUMBERED_SHEETS), false)).toEqual({ kind: 'done' });
  });
});
