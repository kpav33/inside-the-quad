import { describe, expect, it } from 'vitest';

import { motorSizeCode, propSizeCode, REFERENCE_5_INCH } from '@/shared/domain/drone-spec';
import { LIPO_CELL_VOLTS, packVolts } from '@/shared/domain/lipo';
import { PART_IDS, type PartId } from '@/shared/domain/parts';

import { LESSONS } from './index';
import type { Lesson } from './types';

const allLessons: Lesson[] = PART_IDS.map((id) => LESSONS[id]);

function lessonText(lesson: Lesson): string {
  return [
    lesson.whatItDoes,
    ...lesson.howItWorks,
    ...lesson.specs.flatMap((row) => [row.label, row.value, row.meaning]),
    ...lesson.connections.map((c) => c.text),
  ].join(' ');
}

function specValues(lesson: Lesson): string[] {
  return lesson.specs.map((row) => row.value);
}

describe('lessons', () => {
  it('has one lesson per part, keyed by its part id', () => {
    for (const id of PART_IDS) {
      expect(LESSONS[id].partId).toBe(id);
    }
  });

  it.each(allLessons.map((l) => [l.partId, l] as const))(
    '%s answers all four questions',
    (_id, lesson) => {
      expect(lesson.title.trim()).not.toBe('');

      // "What does it do?" is a single sentence.
      expect(lesson.whatItDoes.trim()).toMatch(/\.$/);
      expect(lesson.whatItDoes.trim().slice(0, -1)).not.toContain('. ');

      expect(lesson.howItWorks.length).toBeGreaterThanOrEqual(1);
      for (const paragraph of lesson.howItWorks) expect(paragraph.trim()).not.toBe('');

      expect(lesson.specs.length).toBeGreaterThanOrEqual(2);
      for (const row of lesson.specs) {
        expect(row.label.trim()).not.toBe('');
        expect(row.value.trim()).not.toBe('');
        expect(row.meaning.trim()).not.toBe('');
      }

      expect(lesson.connections.length).toBeGreaterThanOrEqual(1);
    },
  );

  it('only links connections to other known parts', () => {
    for (const lesson of allLessons) {
      for (const connection of lesson.connections) {
        if (connection.partId === undefined) continue;
        expect(PART_IDS).toContain(connection.partId);
        expect(connection.partId).not.toBe(lesson.partId);
      }
    }
  });

  it('quotes the motor numbers from the drone spec', () => {
    const values = specValues(LESSONS.motors);
    expect(values.some((v) => v.includes(motorSizeCode(REFERENCE_5_INCH)))).toBe(true);
    expect(values.some((v) => v.includes('1950'))).toBe(true);
  });

  it('quotes the prop size code from the drone spec', () => {
    const values = specValues(LESSONS.props);
    expect(values.some((v) => v.includes(propSizeCode(REFERENCE_5_INCH)))).toBe(true);
  });

  it('quotes the frame wheelbase and stack mount from the drone spec', () => {
    const values = specValues(LESSONS.frame);
    expect(values.some((v) => v.includes('225'))).toBe(true);
    expect(values.some((v) => v.includes('30.5 × 30.5'))).toBe(true);
  });

  // Beginners can't be expected to know these; any lesson that uses one must explain it.
  const JARGON: Record<string, RegExp> = {
    ESC: /electronic speed controller/i,
    'flight controller': /drone’s brain/i,
    Betaflight: /software/i,
    LiPo: /lithium polymer/i,
    mAh: /milliamp/i,
  };

  it.each(allLessons.map((l) => [l.partId, l] as const))(
    '%s explains the jargon it uses',
    (_id, lesson) => {
      const text = lessonText(lesson);
      for (const [term, explanation] of Object.entries(JARGON)) {
        if (text.includes(term)) expect(text, `${term} is unexplained`).toMatch(explanation);
      }
    },
  );

  it('credits the propellers, not the motors, with making thrust', () => {
    expect(LESSONS.motors.whatItDoes).not.toMatch(/into the thrust/);
  });

  it('quotes the battery numbers from the drone spec', () => {
    const values = specValues(LESSONS.battery);
    for (const expected of ['6S', '1100 mAh', '100C', 'XT60']) {
      expect(
        values.some((v) => v.includes(expected)),
        expected,
      ).toBe(true);
    }
  });

  it('computes the battery voltages from the cell count', () => {
    const cells = REFERENCE_5_INCH.motor.batteryCells;
    const text = lessonText(LESSONS.battery);
    expect(text).toContain(`${packVolts(cells, LIPO_CELL_VOLTS.nominal).toFixed(1)} V`);
    expect(text).toContain(`${packVolts(cells, LIPO_CELL_VOLTS.full).toFixed(1)} V`);
    expect(text).toContain(`${LIPO_CELL_VOLTS.storage.toFixed(1)} V`);
  });

  it('teaches battery safety', () => {
    const text = lessonText(LESSONS.battery);
    expect(text).toMatch(/puff/i);
    expect(text).toMatch(/unattended/i);
    expect(text).toMatch(/storage/i);
  });

  // Parts that are physically connected link to each other from both lessons.
  const PAIRS: [PartId, PartId][] = [['battery', 'frame']];

  it.each(PAIRS)('links %s and %s both ways', (a, b) => {
    const linksTo = (from: PartId, to: PartId) =>
      LESSONS[from].connections.some((c) => c.partId === to);
    expect(linksTo(a, b), `${a} → ${b}`).toBe(true);
    expect(linksTo(b, a), `${b} → ${a}`).toBe(true);
  });
});
