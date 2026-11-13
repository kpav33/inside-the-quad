import { describe, expect, it } from 'vitest';

import { motorSizeCode, propSizeCode, REFERENCE_5_INCH } from '@/shared/domain/drone-spec';
import { LIPO_CELL_VOLTS, packVolts } from '@/shared/domain/lipo';
import { PART_IDS, type PartId } from '@/shared/domain/parts';
import { expectJargonExplained } from '@/test/jargon';

import { PART_LABELS } from '../ui';

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

  it.each(allLessons.map((l) => [l.partId, l] as const))(
    '%s explains the jargon it uses',
    (_id, lesson) => {
      expectJargonExplained(lessonText(lesson));
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
    for (const expected of ['micro, 19 mm', '30°', 'Analog']) {
      expect(
        values.some((v) => v.includes(expected)),
        expected,
      ).toBe(true);
    }
  });

  it('lists every camera width in the size row', () => {
    const size = LESSONS.camera.specs.find((row) => row.label === 'Size');
    for (const width of ['28 mm', '21 mm', '19 mm', '14 mm'])
      expect(size?.meaning).toContain(width);
  });

  it('explains the camera tilt and how it differs from an action camera', () => {
    const text = lessonText(LESSONS.camera);
    expect(text).toMatch(/tilt/i);
    expect(text).toMatch(/action camera/);
  });

  it('quotes the VTX numbers from the drone spec', () => {
    const values = specValues(LESSONS.vtx);
    for (const expected of ['5.8 GHz', '48', '25 mW', '20 × 20 mm', 'RHCP']) {
      expect(
        values.some((v) => v.includes(expected)),
        expected,
      ).toBe(true);
    }
  });

  it('teaches channels, analog and digital, and never running without an antenna', () => {
    const text = lessonText(LESSONS.vtx);
    for (const term of [/never .*without its antenna/i, /analog/i, /digital/i, /channel/i]) {
      expect(text).toMatch(term);
    }
  });

  it('says power limits vary by country, with the EU as the example', () => {
    const power = LESSONS.vtx.specs.find((row) => row.value.includes('mW'));
    expect(power?.meaning).toMatch(/vary by country/);
    expect(power?.meaning).toMatch(/EU/);
  });

  it('quotes the strap size from the drone spec', () => {
    expect(specValues(LESSONS.strap).some((v) => v.includes('20 × 250 mm'))).toBe(true);
  });

  it('explains that a lost battery means a crash', () => {
    expect(lessonText(LESSONS.strap)).toMatch(/crash/i);
  });

  it('quotes the extras from the drone spec', () => {
    const values = specValues(LESSONS.extras);
    for (const expected of ['4 systems', '5 V', '8 × 5 V']) {
      expect(
        values.some((v) => v.includes(expected)),
        expected,
      ).toBe(true);
    }
  });

  // Mentions that are not connections: the FC reads the battery's voltage, and the battery's power
  // reaches the motors through the ESC.
  const INCIDENTAL: Partial<Record<PartId, PartId[]>> = { fc: ['battery'], battery: ['motors'] };

  it('names the GPS satellite systems', () => {
    const gps = LESSONS.extras.specs.find((row) => row.label === 'GPS');
    expect(gps?.meaning).toContain('GPS, Galileo, GLONASS and BeiDou');
  });

  it.each(allLessons.map((l) => [l.partId, l] as const))(
    '%s links every part its connections name',
    (_id, lesson) => {
      const text = lesson.connections.map((c) => c.text).join(' ');
      for (const part of PART_IDS) {
        if (part === lesson.partId || INCIDENTAL[lesson.partId]?.includes(part)) continue;
        const named = new RegExp(`\\b${PART_LABELS[part]}\\b`, 'i').test(text);
        if (!named) continue;
        const linked = lesson.connections.some((c) => c.partId === part);
        expect(linked, `${lesson.partId} names ${part} without linking it`).toBe(true);
      }
    },
  );

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
    ['vtx', 'fc'],
    ['vtx', 'camera'],
    ['vtx', 'frame'],
    ['strap', 'battery'],
    ['strap', 'frame'],
    ['extras', 'fc'],
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

  it('says the buzzer starts when the signal is lost, not when power is lost', () => {
    const text = lessonText(LESSONS.extras);
    expect(text).not.toMatch(/loses power/);
    expect(text).toMatch(/loses (the radio )?signal/);
  });

  it('labels radio frequencies as Frequency, not Band', () => {
    for (const lesson of [LESSONS.vtx, LESSONS.receiver]) {
      const labels = lesson.specs.map((row) => row.label);
      expect(labels, lesson.partId).toContain('Frequency');
      expect(labels, lesson.partId).not.toContain('Band');
    }
  });

  it('keeps signal, power and video wires apart in the connections', () => {
    const receiver = LESSONS.receiver.connections.map((c) => c.text).join(' ');
    expect(receiver).not.toMatch(/UARTs?, which also powers/);
    const vtx = LESSONS.vtx.connections.map((c) => c.text).join(' ');
    expect(vtx).toMatch(/video wire/);
  });
});
