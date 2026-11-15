import { useFrame, useThree } from '@react-three/fiber';
import type { RefObject } from 'react';
import { Vector3 } from 'three';

import type { Leader, Vec3 } from '@/features/drone-model';

import { pinState, screenPoint } from './pins';

/** The pins' elements, one per stop, in stop order. */
export type PinElements = RefObject<(HTMLElement | null)[]>;

const projected = new Vector3();

/**
 * Inside the canvas: moves each stop's pin to where its point appears on screen, on every frame
 * the scene draws (the camera turning, a resize), so the pins stay on their parts.
 */
export function ProjectPins({ points, pins }: { points: readonly Vec3[]; pins: PinElements }) {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  useFrame(() => {
    points.forEach((point, index) => {
      const pin = pins.current[index];
      if (!pin) return;
      projected.set(...point).project(camera);
      const [x, y] = screenPoint([projected.x, projected.y], size);
      pin.style.transform = `translate(${String(x)}px, ${String(y)}px) translate(-50%, -50%)`;
    });
  });
  return null;
}

/**
 * Over the canvas: a pin per stop, its numbered balloon and, for an off-drone end, its label.
 * Hidden from assistive technology; the sheet's list of stops says the same.
 */
export function PathPins({ leader, pins }: { leader: Leader; pins: PinElements }) {
  return (
    <div className="path-pins" aria-hidden="true">
      {leader.stops.map((stop, index) => {
        const state = pinState(index, leader.step, stop.endLabel !== undefined);
        return (
          <span
            key={stop.marker}
            ref={(element) => {
              pins.current[index] = element;
            }}
            className="path-pin"
            data-state={state}
          >
            {stop.endLabel !== undefined && <span className="path-end">{stop.endLabel}</span>}
            {state !== 'ahead' && state !== 'hidden' && (
              <span className="path-marker">{stop.marker}</span>
            )}
          </span>
        );
      })}
    </div>
  );
}
