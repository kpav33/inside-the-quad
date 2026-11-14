import { describe, expect, it } from 'vitest';

import { COLOR, contrastRatio, MODEL_COLOR, MODEL_LOOK } from '@/shared/design/tokens';
import { PART_IDS, type PartId } from '@/shared/domain/parts';

import { partAppearance, partLook } from './materials';

const NONE: ReadonlySet<PartId> = new Set();

describe('partLook', () => {
  it('draws every part normally when no sheet is open', () => {
    for (const id of PART_IDS) expect(partLook(id, null, NONE)).toBe('normal');
  });

  it('marks the open part, its connected parts and fades the rest', () => {
    const connected = new Set<PartId>(['battery', 'motors']);
    expect(partLook('esc', 'esc', connected)).toBe('open');
    expect(partLook('battery', 'esc', connected)).toBe('connected');
    expect(partLook('motors', 'esc', connected)).toBe('connected');
    expect(partLook('camera', 'esc', connected)).toBe('faded');
  });

  it('keeps the open part open even if the connected set names it', () => {
    expect(partLook('esc', 'esc', new Set<PartId>(['esc']))).toBe('open');
  });
});

describe('partAppearance', () => {
  it.each(PART_IDS.map((id) => [id]))('draws %s as ink linework over a dark fill', (id) => {
    expect(partAppearance(id, 'normal')).toEqual({
      color: MODEL_COLOR[id],
      edgeColor: COLOR.ink,
      opacity: 1,
    });
  });

  it.each(PART_IDS.map((id) => [id]))('fills an open %s with redline', (id) => {
    expect(partAppearance(id, 'open')).toEqual({
      color: COLOR.accent,
      edgeColor: COLOR.ground,
      opacity: 1,
    });
  });

  it('draws connected parts in a lighter grey with ink edges', () => {
    expect(partAppearance('battery', 'connected')).toEqual({
      color: MODEL_LOOK.connected,
      edgeColor: COLOR.ink,
      opacity: 1,
    });
  });

  it('fades unrelated parts to faint lines', () => {
    const faded = partAppearance('camera', 'faded');
    expect(faded.color).toBe(COLOR.ground);
    expect(faded.edgeColor).toBe(COLOR.ruleStrong);
    expect(faded.opacity).toBe(MODEL_LOOK.fadedOpacity);
    expect(faded.opacity).toBeLessThan(1);
  });

  it('keeps the drawn lines readable on the ground', () => {
    expect(contrastRatio(COLOR.ink, COLOR.ground)).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps part fills in the dark ground and sheet tones, so redline is the only colour', () => {
    for (const id of PART_IDS) {
      expect(contrastRatio(MODEL_COLOR[id], COLOR.ground), id).toBeLessThan(1.6);
    }
  });

  it('makes the connected grey lighter than every part fill, but still a dark tone', () => {
    const connected = contrastRatio(MODEL_LOOK.connected, COLOR.ground);
    for (const id of PART_IDS) {
      expect(connected, id).toBeGreaterThan(contrastRatio(MODEL_COLOR[id], COLOR.ground));
    }
    expect(connected).toBeLessThan(3);
  });
});
