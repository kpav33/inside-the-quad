import { useFrame } from '@react-three/fiber';
import type { RefObject } from 'react';

import {
  endOnScreen,
  type Leader,
  project,
  type Rect,
  type ScreenPoint,
  spreadPins,
  type Vec3,
} from '@/features/drone-model';

import { pinState } from './pins';

/** The elements of one stop's pin: the pin itself and its tail back to its anchor. */
export interface PinElement {
  pin: HTMLElement | null;
  tail: HTMLElement | null;
}

/** The pins' elements, one per stop, in stop order. */
export type PinElements = RefObject<PinElement[]>;

/** A balloon's size on screen when it can't be measured yet (1.5rem). */
const BALLOON_PX = 24;
// A tail is drawn only when the balloon has moved off its anchor by more than this.
const TAIL_MIN_PX = 2;

const place = (element: HTMLElement, [x, y]: ScreenPoint) => {
  element.style.transform = `translate(${String(x)}px, ${String(y)}px) translate(-50%, -50%)`;
};

/** A hairline from the balloon back to the point it marks, when the balloon had to move. */
const drawTail = (tail: HTMLElement | null, [ax, ay]: ScreenPoint, [bx, by]: ScreenPoint) => {
  if (!tail) return;
  const length = Math.hypot(bx - ax, by - ay);
  tail.hidden = length < TAIL_MIN_PX;
  const angle = Math.atan2(by - ay, bx - ax);
  tail.style.width = `${String(length)}px`;
  tail.style.transform = `translate(${String(ax)}px, ${String(ay)}px) rotate(${String(angle)}rad)`;
};

/**
 * Inside the canvas: lays out the pins on every frame the scene draws (the camera turning, a
 * resize). The off-drone ends go beside the drone's outline; every other balloon sits on its stop,
 * or, where it would cover another, at the nearest free spot with a tail back to the stop. The
 * current stop is placed first, then the stops passed, most recent first.
 */
export function ProjectPins({
  leader,
  points,
  outline,
  pins,
}: {
  leader: Leader;
  points: readonly Vec3[];
  outline: readonly Vec3[];
  pins: PinElements;
}) {
  useFrame(({ camera, size }) => {
    const ends = leader.stops.map((stop) => stop.endLabel !== undefined);
    const end = ends.some(Boolean) ? endOnScreen(outline, camera, size) : null;
    const avoid: Rect[] = end ? [end.box] : [];
    const anchors = points.map((point, index): ScreenPoint =>
      ends[index] && end ? end.balloon : project(point, camera, size),
    );
    const order = leader.stops
      .map((_, index) => index)
      .filter((index) => !ends[index] && pinState(index, leader.step, false) !== 'hidden')
      .sort((a, b) => (a === leader.step ? -1 : b === leader.step ? 1 : b - a));
    const size0 = pins.current.find((p) => p.pin)?.pin?.offsetWidth ?? BALLOON_PX;
    const spots = spreadPins(anchors, order, size0 || BALLOON_PX, size, avoid);
    anchors.forEach((anchor, index) => {
      const element = pins.current[index];
      if (!element?.pin) return;
      const spot = ends[index] ? anchor : (spots[index] ?? anchor);
      place(element.pin, spot);
      drawTail(element.tail, anchor, spot);
    });
  });
  return null;
}

/**
 * Over the canvas: a pin per stop, its numbered balloon and, for an off-drone end, its label above
 * it (an end not yet reached shows its balloon in the muted ring). Hidden from assistive technology; the sheet's list of stops says the same.
 */
export function PathPins({ leader, pins }: { leader: Leader; pins: PinElements }) {
  return (
    <div className="path-pins" aria-hidden="true">
      {leader.stops.map((stop, index) => {
        const state = pinState(index, leader.step, stop.endLabel !== undefined);
        const slot = () => (pins.current[index] ??= { pin: null, tail: null });
        const isEnd = stop.endLabel !== undefined;
        return (
          <span key={stop.marker}>
            <span
              className="path-pin-tail"
              data-state={state}
              hidden
              ref={(tail) => {
                slot().tail = tail;
              }}
            />
            <span
              ref={(pin) => {
                slot().pin = pin;
              }}
              className="path-pin"
              data-state={state}
            >
              {isEnd && <span className="path-end">{stop.endLabel}</span>}
              {state !== 'hidden' && <span className="path-marker">{stop.marker}</span>}
            </span>
          </span>
        );
      })}
    </div>
  );
}
