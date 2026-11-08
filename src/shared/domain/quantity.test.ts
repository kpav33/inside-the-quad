import { describe, expect, it } from 'vitest';

import { REFERENCE_5_INCH } from './drone-spec';
import { partQuantity } from './quantity';

describe('partQuantity', () => {
  it('counts one frame and a motor and prop per arm', () => {
    expect(partQuantity('frame', REFERENCE_5_INCH)).toBe(1);
    expect(partQuantity('motors', REFERENCE_5_INCH)).toBe(4);
    expect(partQuantity('props', REFERENCE_5_INCH)).toBe(4);
  });

  it('counts one battery and one 4-in-1 ESC', () => {
    expect(partQuantity('esc', REFERENCE_5_INCH)).toBe(1);
    expect(partQuantity('battery', REFERENCE_5_INCH)).toBe(1);
  });
});
