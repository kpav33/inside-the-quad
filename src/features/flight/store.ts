import { IDLE } from './mixer';
import {
  CENTRED,
  type FlightState,
  gust,
  initialFlight,
  isSettled,
  level,
  stepFlight,
  type StickInput,
} from './model';

/** Who moved a stick: the user, or a step's demo. */
export type StickSource = 'user' | 'demo';

/**
 * The drone on the moves sheet, shared by the sticks (which write it), the drawing (which advances
 * and draws it every frame) and the sheet (which reads it). Plain TypeScript, so the first page
 * load never pulls in three.js.
 */
export interface Flight {
  readonly state: FlightState;
  /** The slowest a motor turns (0–1), for drawing speeds against. */
  readonly idle: number;
  readonly sticks: StickInput;
  setSticks(sticks: Partial<StickInput>, by: StickSource): void;
  /** Puts back to centre (throttle to hover) every stick a demo moved last, leaving the user's. */
  releaseDemo(): void;
  gust(): void;
  level(): void;
  /** Called by the drawing each frame. */
  advance(dtS: number): void;
  /** Nothing left to move, so the drawing can stop asking for frames. */
  settled(): boolean;
  /** Called when something starts to move; the drawing registers its frame request here. */
  onWake(listener: () => void): () => void;
  /** Called after each step. */
  subscribe(listener: () => void): () => void;
  /** Called whenever the user (not a demo) moves a stick. */
  onUserInput(listener: () => void): () => void;
  /** Called once when the flight is disposed. */
  onDispose(listener: () => void): () => void;
  /** The sheet is closing: drop listeners, stop demos, ignore any further input. */
  dispose(): void;
}

const clamp = (value: number, low: number, high: number) => Math.min(Math.max(value, low), high);

function listeners() {
  const set = new Set<() => void>();
  return {
    add: (listener: () => void) => {
      set.add(listener);
      return () => {
        set.delete(listener);
      };
    },
    call: () => {
      for (const listener of [...set]) listener();
    },
    clear: () => {
      set.clear();
    },
  };
}

export function createFlight(): Flight {
  let state = initialFlight();
  let sticks: StickInput = CENTRED;
  let gusts = 0;
  /** Who moved each stick last, so a stopped demo lets go of its sticks and only its sticks. */
  const movedBy: Partial<Record<keyof StickInput, StickSource>> = {};
  let disposed = false;
  const wake = listeners();
  const stepped = listeners();
  const user = listeners();
  const disposal = listeners();

  function set(change: Partial<StickInput>, by: StickSource) {
    if (disposed) return;
    const next = { ...sticks, ...change };
    sticks = {
      throttle: clamp(next.throttle, 0, 1),
      yaw: clamp(next.yaw, -1, 1),
      pitch: clamp(next.pitch, -1, 1),
      roll: clamp(next.roll, -1, 1),
    };
    for (const axis of Object.keys(change) as (keyof StickInput)[]) movedBy[axis] = by;
    if (by === 'user') user.call();
    wake.call();
  }

  return {
    idle: IDLE,
    get state() {
      return state;
    },
    get sticks() {
      return sticks;
    },
    setSticks: set,
    releaseDemo() {
      const release: Partial<StickInput> = {};
      for (const axis of Object.keys(movedBy) as (keyof StickInput)[]) {
        if (movedBy[axis] === 'demo' && sticks[axis] !== CENTRED[axis])
          release[axis] = CENTRED[axis];
      }
      if (Object.keys(release).length > 0) set(release, 'demo');
    },
    gust() {
      if (disposed) return;
      state = gust(state, gusts);
      gusts += 1;
      wake.call();
    },
    level() {
      if (disposed) return;
      state = level(state);
      wake.call();
    },
    advance(dtS) {
      if (disposed) return;
      state = stepFlight(state, sticks, dtS);
      stepped.call();
    },
    settled() {
      return isSettled(state, sticks);
    },
    onWake: wake.add,
    subscribe: stepped.add,
    onUserInput: user.add,
    onDispose: disposal.add,
    dispose() {
      if (disposed) return;
      disposed = true;
      disposal.call();
      for (const set of [wake, stepped, user, disposal]) set.clear();
    },
  };
}
