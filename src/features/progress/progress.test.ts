import { describe, expect, it } from 'vitest';

import { PART_IDS, type PartId } from '@/shared/domain/parts';

import { firstUnread, parseReadParts, serializeReadParts, startState } from './progress';

const set = (...parts: PartId[]) => new Set<PartId>(parts);

describe('parseReadParts', () => {
  it.each([null, 'nope', '{}', '[1]', '"vtx"'])('reads %j as nothing read', (raw) => {
    expect(parseReadParts(raw).size).toBe(0);
  });

  it('drops unknown ids and duplicates', () => {
    expect([...parseReadParts('["vtx","x","vtx"]')]).toEqual(['vtx']);
  });
});

describe('serializeReadParts', () => {
  it('writes the parts in sheet order', () => {
    expect(serializeReadParts(set('vtx', 'frame'))).toBe('["frame","vtx"]');
  });

  it('round-trips through parseReadParts', () => {
    expect(parseReadParts(serializeReadParts(set('esc', 'camera')))).toEqual(set('esc', 'camera'));
  });
});

describe('where to start', () => {
  it('starts at sheet 1 when nothing is read', () => {
    expect(firstUnread(set())).toBe('frame');
    expect(startState(set())).toEqual({ kind: 'start' });
  });

  it('continues at the next sheet after the frame', () => {
    expect(startState(set('frame'))).toEqual({ kind: 'continue', part: 'motors' });
  });

  it('continues at the first unread sheet, not after the last read one', () => {
    expect(startState(set('vtx'))).toEqual({ kind: 'continue', part: 'frame' });
  });

  it('is done when every part is read', () => {
    expect(firstUnread(set(...PART_IDS))).toBeNull();
    expect(startState(set(...PART_IDS))).toEqual({ kind: 'done' });
  });
});
