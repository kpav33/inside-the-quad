import { describe, expect, it } from 'vitest';

import {
  CAMERA_SIZE_CLASS_MM,
  mm,
  motorSizeCode,
  propSizeCode,
  REFERENCE_5_INCH,
  vtxChannelCount,
} from './drone-spec';
import { LIPO_CELL_VOLTS, packVolts } from './lipo';

describe('drone spec', () => {
  it('converts millimetres to metres', () => {
    expect(mm(1000)).toBe(1);
    expect(mm(225)).toBeCloseTo(0.225, 10);
  });

  it('describes the reference prop with its size code', () => {
    expect(propSizeCode(REFERENCE_5_INCH)).toBe('5 × 4.3 × 3');
  });

  it('describes the reference motor with its stator size code', () => {
    expect(motorSizeCode(REFERENCE_5_INCH)).toBe('2207');
  });

  it('matches the reference drone values from the product scope', () => {
    expect(REFERENCE_5_INCH.frame.wheelbaseMm).toBe(225);
    expect(REFERENCE_5_INCH.frame.stackMountMm).toBe(30.5);
    expect(REFERENCE_5_INCH.motor.kv).toBe(1950);
    expect(REFERENCE_5_INCH.motor.batteryCells).toBe(6);
    expect(REFERENCE_5_INCH.motor.mountPatternMm).toBe(16);
    expect(REFERENCE_5_INCH.motor.shaftThread).toBe('M5');
    expect(REFERENCE_5_INCH.motor.wires).toBe(3);
  });

  it('matches the reference ESC, flight controller and battery from the product scope', () => {
    const { esc, fc, battery } = REFERENCE_5_INCH;
    expect(esc).toMatchObject({ layout: '4-in-1', currentPerMotorA: 55, protocol: 'DShot600' });
    expect(fc).toMatchObject({
      processor: 'F7',
      firmware: 'Betaflight',
      uarts: 6,
      becVolts: [5, 10],
    });
    expect(battery).toMatchObject({ capacityMah: 1100, cRating: 100, connector: 'XT60' });
  });

  it('rates the capacitor above a full battery', () => {
    const { esc, motor } = REFERENCE_5_INCH;
    expect(esc.capacitorV).toBeGreaterThan(packVolts(motor.batteryCells, LIPO_CELL_VOLTS.full));
  });

  it('makes the stack boards wider than their mounting holes', () => {
    const { esc, fc, frame } = REFERENCE_5_INCH;
    expect(esc.boardSizeMm).toBeGreaterThanOrEqual(frame.stackMountMm + 4);
    expect(fc.boardSizeMm).toBeGreaterThanOrEqual(frame.stackMountMm + 4);
  });

  it('fits the battery pack on the top plate', () => {
    const { battery, frame } = REFERENCE_5_INCH;
    expect(battery.packLengthMm).toBeLessThanOrEqual(frame.bodyLengthMm);
    expect(battery.packWidthMm).toBeLessThanOrEqual(frame.bodyWidthMm);
  });

  it('matches the reference receiver, camera, VTX, strap and extras', () => {
    const { receiver, camera, vtx, strap, extras } = REFERENCE_5_INCH;
    expect(receiver).toMatchObject({
      system: 'ExpressLRS',
      frequencyGhz: 2.4,
      protocol: 'CRSF',
      packetRateHz: 500,
      antenna: 'T dipole',
    });
    expect(camera).toMatchObject({
      sizeClass: 'micro',
      widthMm: 19,
      tiltDeg: 30,
      signal: 'analog',
    });
    expect(vtx).toMatchObject({
      frequencyGhz: 5.8,
      bands: 6,
      channelsPerBand: 8,
      powerLevelsMw: [25, 200, 400, 800],
      powerSettingMw: 25,
      mountMm: 20,
      antennaPolarization: 'RHCP',
    });
    expect(strap).toEqual({ widthMm: 20, lengthMm: 250 });
    expect(extras).toEqual({
      gpsSystems: ['GPS', 'Galileo', 'GLONASS', 'BeiDou'],
      buzzerVolts: 5,
      ledVolts: 5,
      ledCount: 8,
    });
  });

  it('sets the VTX to one of its power levels', () => {
    const { vtx } = REFERENCE_5_INCH;
    expect(vtx.powerLevelsMw).toContain(vtx.powerSettingMw);
  });

  it('gives the camera the width of its size class', () => {
    const { camera } = REFERENCE_5_INCH;
    expect(camera.widthMm).toBe(CAMERA_SIZE_CLASS_MM[camera.sizeClass]);
    expect(CAMERA_SIZE_CLASS_MM).toEqual({ full: 28, mini: 21, micro: 19, nano: 14 });
  });

  it('counts the VTX channels as bands × channels per band', () => {
    expect(vtxChannelCount(REFERENCE_5_INCH)).toBe(48);
  });
});
