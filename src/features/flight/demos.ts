import type { MoveStepId } from '@/shared/domain/moves';

import { HOVER_THROTTLE, type StickInput } from './model';
import type { Flight } from './store';

/** One moment of a demo: sticks to set, or a gust. */
export interface DemoKey {
  atMs: number;
  sticks?: Partial<StickInput>;
  gust?: true;
}

/** Push one way, then back the other way, so the drone ends about where it started. */
const there = (stick: keyof StickInput, holdMs: number): readonly DemoKey[] => [
  { atMs: 0, sticks: { [stick]: 1 } },
  { atMs: holdMs, sticks: { [stick]: 0 } },
  { atMs: holdMs + 600, sticks: { [stick]: -1 } },
  { atMs: 2 * holdMs + 600, sticks: { [stick]: 0 } },
];

/** Each step's short demo: what the sticks do when the step opens, or on "Show me". */
export const DEMOS: Record<MoveStepId, readonly DemoKey[]> = {
  throttle: [
    { atMs: 0, sticks: { throttle: 0.85 } },
    { atMs: 1500, sticks: { throttle: 0.2 } },
    { atMs: 2700, sticks: { throttle: HOVER_THROTTLE } },
  ],
  roll: there('roll', 700),
  pitch: there('pitch', 700),
  yaw: there('yaw', 1200),
  gyro: [{ atMs: 300, gust: true }],
};

const running = new WeakMap<Flight, () => void>();

/**
 * Plays a step's demo on the flight. Taking a stick, starting another demo or disposing the flight
 * stops it. Returns a function that stops it.
 */
export function runDemo(
  flight: Flight,
  step: MoveStepId,
  schedule: (run: () => void, ms: number) => ReturnType<typeof setTimeout> = setTimeout,
): () => void {
  running.get(flight)?.();
  const timers: ReturnType<typeof setTimeout>[] = [];
  const offs: (() => void)[] = [];
  const cancel = () => {
    for (const timer of timers) clearTimeout(timer);
    for (const off of offs) off();
    if (running.get(flight) === cancel) running.delete(flight);
  };
  for (const key of DEMOS[step]) {
    timers.push(
      schedule(() => {
        if (key.sticks) flight.setSticks(key.sticks, 'demo');
        if (key.gust) flight.gust();
      }, key.atMs),
    );
  }
  offs.push(flight.onUserInput(cancel), flight.onDispose(cancel));
  running.set(flight, cancel);
  return cancel;
}
