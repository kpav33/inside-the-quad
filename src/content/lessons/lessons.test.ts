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
    DShot: /digital/i,
    'back-EMF': /voltage/i,
    UART: /serial port/i,
    BEC: /regulator/i,
    gyro: /rotat/i,
    AIO: /all-in-one/i,
    ELRS: /ExpressLRS/,
    CRSF: /serial/i,
    telemetry: /back to (your|the) radio/i,
    failsafe: /signal is lost|loses (the )?signal/i,
    latency: /delay/i,
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

  it('quotes the ESC numbers from the drone spec', () => {
    const values = specValues(LESSONS.esc);
    for (const expected of ['4-in-1', '55 A', 'DShot600', '30.5 × 30.5 mm', '1000 µF']) {
      expect(
        values.some((v) => v.includes(expected)),
        expected,
      ).toBe(true);
    }
  });

  it('quotes the flight controller numbers from the drone spec', () => {
    const values = specValues(LESSONS.fc);
    for (const expected of ['F7', 'Betaflight', '6', '5 V', '10 V', '30.5 × 30.5 mm']) {
      expect(
        values.some((v) => v.includes(expected)),
        expected,
      ).toBe(true);
    }
  });

  it('quotes the receiver numbers from the drone spec', () => {
    const values = specValues(LESSONS.receiver);
    for (const expected of ['ExpressLRS', '2.4 GHz', 'CRSF', '500 Hz', 'T dipole']) {
      expect(
        values.some((v) => v.includes(expected)),
        expected,
      ).toBe(true);
    }
  });

  it('teaches binding, telemetry, failsafe and the long-range band', () => {
    const text = lessonText(LESSONS.receiver);
    for (const term of [/bind/i, /telemetry/i, /failsafe/i, /900 MHz/]) expect(text).toMatch(term);
  });

  it('quotes the camera numbers from the drone spec', () => {
    const values = specValues(LESSONS.camera);
    for (const expected of ['micro, 19 mm', '30°', 'Analog', '28 · 21 · 19 · 14 mm']) {
      expect(
        values.some((v) => v.includes(expected)),
        expected,
      ).toBe(true);
    }
  });

  it('explains the camera tilt and how it differs from an action camera', () => {
    const text = lessonText(LESSONS.camera);
    expect(text).toMatch(/tilt/i);
    expect(text).toMatch(/action camera/);
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
  const PAIRS: [PartId, PartId][] = [
    ['battery', 'frame'],
    ['esc', 'battery'],
    ['esc', 'motors'],
    ['esc', 'frame'],
    ['fc', 'esc'],
    ['fc', 'frame'],
    ['receiver', 'fc'],
    ['receiver', 'frame'],
    ['camera', 'frame'],
  ];

  it.each(PAIRS)('links %s and %s both ways', (a, b) => {
    const linksTo = (from: PartId, to: PartId) =>
      LESSONS[from].connections.some((c) => c.partId === to);
    expect(linksTo(a, b), `${a} → ${b}`).toBe(true);
    expect(linksTo(b, a), `${b} → ${a}`).toBe(true);
  });

  it('explains how on-screen text reaches both analog and digital video', () => {
    const text = lessonText(LESSONS.fc);
    expect(text).toMatch(/analog/i);
    expect(text).toMatch(/digital video/i);
    expect(text).toMatch(/channel and power/i);
  });

  it('calls the gyro part of the IMU, not another name for it', () => {
    const text = lessonText(LESSONS.fc);
    expect(text).not.toMatch(/also called the IMU/);
    expect(text).toMatch(/IMU/);
  });

  it('describes a motor’s three wires as three phases, not three coils', () => {
    const text = lessonText(LESSONS.esc);
    expect(text).not.toMatch(/three coils/);
    expect(text).toMatch(/three phases/);
  });

  it('says DShot rejects garbled commands rather than being immune to noise', () => {
    const text = lessonText(LESSONS.esc);
    expect(text).not.toMatch(/can’t change/);
    expect(text).toMatch(/check/i);
  });

  it('says a deeply drained cell can be damaged, not that it always is', () => {
    expect(lessonText(LESSONS.battery)).not.toMatch(/or it is damaged/);
  });
});
