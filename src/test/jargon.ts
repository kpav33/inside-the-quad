import { expect } from 'vitest';

/** Terms beginners can't be expected to know; any text that uses one must explain it. */
export const JARGON: Record<string, RegExp> = {
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
  mW: /milliwatt/i,
  RHCP: /right-hand/i,
  OSD: /on-screen/i,
  'GPS Rescue': /fl(y|ies) (back|home)/i,
};

export function expectJargonExplained(text: string): void {
  for (const [term, explanation] of Object.entries(JARGON)) {
    if (text.includes(term)) expect(text, `${term} is unexplained`).toMatch(explanation);
  }
}
