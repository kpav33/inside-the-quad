import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DEMOS, runDemo, stopDemo } from './demos';
import { NO_FAULTS } from './faults';
import { CENTRED } from './model';
import { createFlight } from './store';

describe('createFlight', () => {
  it('starts level, at hover, with the sticks centred', () => {
    const flight = createFlight();
    expect(flight.sticks).toEqual(CENTRED);
    expect(flight.state.attitude).toEqual([0, 0, 0, 1]);
    expect(flight.settled()).toBe(true);
  });

  it('wakes the drawing when the sticks move, a gust hits or it levels', () => {
    const flight = createFlight();
    const wake = vi.fn();
    flight.onWake(wake);
    flight.setSticks({ roll: 0.5 }, 'user');
    flight.gust();
    flight.level();
    expect(wake).toHaveBeenCalledTimes(3);
  });

  it('clamps the sticks', () => {
    const flight = createFlight();
    flight.setSticks({ roll: 3, throttle: -1 }, 'user');
    expect(flight.sticks.roll).toBe(1);
    expect(flight.sticks.throttle).toBe(0);
  });

  it('tells subscribers after each step', () => {
    const flight = createFlight();
    const listener = vi.fn();
    const off = flight.subscribe(listener);
    flight.setSticks({ roll: 1 }, 'user');
    flight.advance(0.1);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(flight.state.rate.roll).toBeGreaterThan(0);
    expect(flight.settled()).toBe(false);
    off();
    flight.advance(0.1);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('reports only the user’s input as the user’s', () => {
    const flight = createFlight();
    const user = vi.fn();
    flight.onUserInput(user);
    flight.setSticks({ roll: 1 }, 'demo');
    expect(user).not.toHaveBeenCalled();
    flight.setSticks({ roll: 0 }, 'user');
    expect(user).toHaveBeenCalledTimes(1);
  });

  it('ignores everything once disposed', () => {
    const flight = createFlight();
    const wake = vi.fn();
    flight.onWake(wake);
    flight.dispose();
    flight.setSticks({ roll: 1 }, 'user');
    flight.gust();
    expect(wake).not.toHaveBeenCalled();
    expect(flight.sticks.roll).toBe(0);
  });
});

describe('faults in the store', () => {
  it('reads back faults and wakes the drawing', () => {
    const flight = createFlight();
    const wake = vi.fn();
    flight.onWake(wake);
    expect(flight.faults).toEqual(NO_FAULTS);
    flight.setFaults({ cells: 4 });
    expect(flight.faults.cells).toBe(4);
    expect(wake).toHaveBeenCalledTimes(1);
  });

  it('acts on the faults as it advances', () => {
    const flight = createFlight();
    flight.setFaults({ linkLost: true });
    for (let i = 0; i < 30; i++) flight.advance(0.05);
    expect(flight.state.armed).toBe(false);
  });

  it('resets from anything: level, armed, no faults, a cool VTX, sticks centred', () => {
    const flight = createFlight();
    flight.setSticks({ roll: 1, throttle: 0.9 }, 'user');
    flight.setFaults({ linkLost: true, vtxNoAntenna: true, cells: 4 });
    for (let i = 0; i < 400; i++) flight.advance(0.1);
    expect(flight.state.onGround).toBe(true);
    expect(flight.state.vtxLevel).toBe(3);
    const wake = vi.fn();
    flight.onWake(wake);
    flight.reset();
    expect(flight.faults).toEqual(NO_FAULTS);
    expect(flight.sticks).toEqual(CENTRED);
    expect(flight.state).toMatchObject({
      attitude: [0, 0, 0, 1],
      armed: true,
      onGround: false,
      vtxLevel: 0,
      height: 0,
    });
    expect(wake).toHaveBeenCalled();
  });

  it('ignores faults once disposed', () => {
    const flight = createFlight();
    flight.dispose();
    flight.setFaults({ cells: 4 });
    expect(flight.faults.cells).toBe(6);
  });
});

describe('runDemo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('has a demo for every step', () => {
    expect(Object.keys(DEMOS)).toEqual(['throttle', 'roll', 'pitch', 'yaw', 'gyro']);
  });

  it('rolls right, then back left, and ends centred', () => {
    const flight = createFlight();
    runDemo(flight, 'roll');
    vi.advanceTimersByTime(0);
    expect(flight.sticks.roll).toBe(1);
    vi.advanceTimersByTime(1400);
    expect(flight.sticks.roll).toBeLessThan(0);
    vi.advanceTimersByTime(5000);
    expect(flight.sticks).toEqual(CENTRED);
  });

  it('opens the throttle and brings it back to hover', () => {
    const flight = createFlight();
    runDemo(flight, 'throttle');
    vi.advanceTimersByTime(0);
    expect(flight.sticks.throttle).toBeGreaterThan(0.7);
    vi.advanceTimersByTime(5000);
    expect(flight.sticks.throttle).toBe(CENTRED.throttle);
  });

  it('knocks the drone on the gyro loop step', () => {
    const flight = createFlight();
    runDemo(flight, 'gyro');
    vi.advanceTimersByTime(5000);
    expect(flight.state.rate.roll).not.toBe(0);
  });

  it('stops when the user takes a stick', () => {
    const flight = createFlight();
    runDemo(flight, 'roll');
    vi.advanceTimersByTime(0);
    flight.setSticks({ roll: 0 }, 'user');
    vi.advanceTimersByTime(5000);
    expect(flight.sticks.roll).toBe(0);
  });

  it('stops when cancelled, and when another demo starts', () => {
    const flight = createFlight();
    const cancel = runDemo(flight, 'yaw');
    cancel();
    vi.advanceTimersByTime(5000);
    expect(flight.sticks.yaw).toBe(0);
    runDemo(flight, 'roll');
    runDemo(flight, 'throttle');
    vi.advanceTimersByTime(0);
    expect(flight.sticks.roll).toBe(0);
  });

  it('leaves no timer behind when the flight is disposed', () => {
    const flight = createFlight();
    runDemo(flight, 'pitch');
    flight.dispose();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('lets go of the demo’s stick when the user takes the other stick', () => {
    const flight = createFlight();
    runDemo(flight, 'yaw');
    vi.advanceTimersByTime(0);
    expect(flight.sticks.yaw).toBe(1);
    flight.setSticks({ roll: 0.5 }, 'user');
    expect(flight.sticks.yaw).toBe(0);
    expect(flight.sticks.roll).toBe(0.5);
  });

  it('lets go of the demo’s stick when cancelled or replaced mid-way', () => {
    const flight = createFlight();
    const cancel = runDemo(flight, 'yaw');
    vi.advanceTimersByTime(0);
    cancel();
    expect(flight.sticks.yaw).toBe(0);
    runDemo(flight, 'roll');
    vi.advanceTimersByTime(0);
    runDemo(flight, 'gyro');
    expect(flight.sticks.roll).toBe(0);
    runDemo(flight, 'throttle');
    vi.advanceTimersByTime(0);
    stopDemo(flight);
    expect(flight.sticks.throttle).toBe(CENTRED.throttle);
  });

  it('leaves the user’s own throttle alone when a demo stops', () => {
    const flight = createFlight();
    flight.setSticks({ throttle: 0.8 }, 'user');
    runDemo(flight, 'roll');
    vi.advanceTimersByTime(0);
    stopDemo(flight);
    expect(flight.sticks.throttle).toBeCloseTo(0.8);
    expect(flight.sticks.roll).toBe(0);
  });
});
