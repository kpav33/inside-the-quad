import { describe, expect, it } from 'vitest';

import { REFERENCE_5_INCH } from '@/shared/domain/drone-spec';
import { GEAR_IDS } from '@/shared/domain/gear';
import { LIPO_CELL_VOLTS, packVolts } from '@/shared/domain/lipo';

import { chargerSays, GEAR, type GearLesson, gogglesSays, RADIO_MODES, radioSays } from './index';

const PART_IDS = {
  radio: ['antenna', 'left-stick', 'right-stick', 'arm-switch', 'mode-switch', 'screen'],
  goggles: ['screens', 'video-receiver', 'antennas', 'strap'],
  charger: ['main-lead', 'balance-lead', 'balance-port', 'screen', 'cells'],
};

/** Every piece of copy a lesson and the toggles carry, as one string. */
function allText(lesson: GearLesson): string {
  return [
    lesson.title,
    lesson.whatItDoes,
    ...lesson.howItWorks,
    ...lesson.specs.flatMap((s) => [s.label, s.value, s.meaning]),
    ...lesson.connections.map((c) => c.text),
    ...lesson.parts.flatMap((p) => [p.label, p.note]),
  ].join(' ');
}

const togglesText = [
  ...RADIO_MODES.flatMap((mode) => [
    mode.label,
    radioSays(false, mode.id),
    radioSays(true, mode.id),
  ]),
  gogglesSays('analog'),
  gogglesSays('digital'),
  chargerSays('charge'),
  chargerSays('storage'),
].join(' ');

describe('gear copy', () => {
  it.each(GEAR_IDS)('%s answers the four questions and names its drawn parts', (id) => {
    const lesson = GEAR[id];
    expect(lesson.id).toBe(id);
    expect(lesson.title).not.toBe('');
    expect(lesson.whatItDoes).not.toBe('');
    expect(lesson.howItWorks.length).toBeGreaterThanOrEqual(2);
    expect(lesson.specs.length).toBeGreaterThanOrEqual(2);
    expect(lesson.connections.length).toBeGreaterThanOrEqual(1);
    expect(lesson.parts.map((part) => part.id)).toEqual(PART_IDS[id]);
  });

  it('links each piece of gear to the part sheets it works with', () => {
    const linked = (id: (typeof GEAR_IDS)[number]) =>
      GEAR[id].connections.flatMap((c) => (c.partId ? [c.partId] : []));
    expect(linked('radio')).toContain('receiver');
    expect(linked('goggles')).toEqual(expect.arrayContaining(['vtx', 'camera']));
    expect(linked('charger')).toContain('battery');
  });

  it('describes the radio as mode 2 with ExpressLRS and EdgeTX', () => {
    const text = allText(GEAR.radio);
    expect(text).toMatch(/mode 2/i);
    expect(text).toMatch(/left stick[^.]*throttle[^.]*yaw/i);
    expect(text).toMatch(/right stick[^.]*pitch[^.]*roll/i);
    expect(text).toContain('ExpressLRS');
    expect(text).toContain(`${String(REFERENCE_5_INCH.receiver.frequencyGhz)} GHz`);
    expect(text).toContain('EdgeTX');
  });

  it('offers acro first among the flight modes, and says what arming does', () => {
    expect(RADIO_MODES[0]?.id).toBe('acro');
    expect(RADIO_MODES.length).toBeGreaterThanOrEqual(2);
    expect(radioSays(false, 'acro')).toMatch(/disarmed/i);
    expect(radioSays(true, 'acro')).toMatch(/armed/i);
    expect(radioSays(true, 'acro')).not.toBe(radioSays(true, RADIO_MODES[1]?.id ?? 'acro'));
  });

  it('matches the goggles to this drone’s analog video', () => {
    const text = allText(GEAR.goggles);
    expect(text.toLowerCase()).toContain(REFERENCE_5_INCH.camera.signal);
    expect(text).toContain(`${String(REFERENCE_5_INCH.vtx.frequencyGhz)} GHz`);
    expect(gogglesSays('digital')).toMatch(/no signal/i);
  });

  it('gives the charger’s pack and cell voltages from the spec', () => {
    const cells = REFERENCE_5_INCH.motor.batteryCells;
    const full = packVolts(cells, LIPO_CELL_VOLTS.full);
    const storage = packVolts(cells, LIPO_CELL_VOLTS.storage);
    expect(full).toBe(25.2);
    expect(storage).toBe(22.8);
    expect(chargerSays('charge')).toContain(`${String(full)} V`);
    expect(chargerSays('charge')).toContain(`${String(LIPO_CELL_VOLTS.full)} V`);
    expect(chargerSays('storage')).toContain(`${String(storage)} V`);
    expect(chargerSays('storage')).toContain(`${String(LIPO_CELL_VOLTS.storage)} V`);
  });

  it('names no brands and no prices', () => {
    const text = [...GEAR_IDS.map((id) => allText(GEAR[id])), togglesText].join(' ');
    expect(text).not.toMatch(/DJI|Walksnail|HDZero|Radiomaster|TBS|Fat ?Shark|\$|€/i);
  });
});
