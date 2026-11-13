import { describe, expect, it } from 'vitest';

import { expectJargonExplained } from '@/test/jargon';

import { INTRO } from './intro';

function introText(): string {
  const { sections, scene, sizes } = INTRO;
  return [
    INTRO.title,
    ...sections.flatMap((s) => [s.heading, ...s.paragraphs]),
    scene.label,
    ...scene.devices.flatMap((d) => [d.label, d.role]),
    ...Object.values(scene.links).flatMap((l) => [l.label, l.detail]),
    sizes.label,
    ...Object.values(sizes.names),
  ].join(' ');
}

describe('intro', () => {
  it('covers the four Module 1 topics in order', () => {
    expect(INTRO.sections.map((s) => s.heading)).toEqual([
      'FPV vs camera drones',
      'The whole system',
      'Sizes',
      'Why 5‑inch',
    ]);
  });

  it('spells out what FPV stands for', () => {
    expect(introText()).toMatch(/first-person view/i);
  });

  it('explains the jargon it uses', () => {
    expectJargonExplained(introText());
  });

  it('names camera-drone brands only as examples', () => {
    for (const sentence of introText().split(/(?<=\.)\s/)) {
      if (sentence.includes('DJI')) expect(sentence).toMatch(/for example|such as/i);
    }
  });

  it('quotes both wireless links from the reference drone', () => {
    expect(INTRO.scene.links.control.detail).toContain('ExpressLRS');
    expect(INTRO.scene.links.control.detail).toContain('2.4 GHz');
    expect(INTRO.scene.links.video.detail).toContain('5.8 GHz');
    expect(INTRO.scene.links.video.detail).toContain('analog');
  });

  it('puts the drone on both links and each other device on one', () => {
    const links = Object.fromEntries(INTRO.scene.devices.map((d) => [d.id, d.links]));
    expect(links).toEqual({ radio: ['control'], drone: ['control', 'video'], goggles: ['video'] });
  });

  it('quotes the size ranges in millimetres from the size data', () => {
    const text = INTRO.sections[2].paragraphs.join(' ');
    expect(text).toContain('31–40 mm');
    expect(INTRO.sections[3].paragraphs.join(' ')).toContain('225 mm');
  });
});
