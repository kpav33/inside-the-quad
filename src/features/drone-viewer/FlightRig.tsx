import { useFrame, useThree } from '@react-three/fiber';
import { type RefObject, useEffect } from 'react';
import { type Group, Quaternion, Vector3 } from 'three';

import { motorPlacements, project, type Rect } from '@/features/drone-model';
import type { Flight } from '@/features/flight';
import { REFERENCE_5_INCH } from '@/shared/domain/drone-spec';

import { motorPinState, placeMotorPin } from './motor-pins';
import { DRONE_CENTRE } from './useDroneFit';

/** The elements of one motor's balloon. */
export interface MotorPinElement {
  pin: HTMLElement | null;
  speed: HTMLElement | null;
}

/** A balloon's size before it can be measured. */
const PIN_BOX = { width: 64, height: 24 };
/** On waking from rest, the first frame's time step is kept short, so the drone never jumps. */
const MAX_FRAME_S = 1 / 30;

const MOTORS = motorPlacements(REFERENCE_5_INCH);
const centre = new Vector3(...DRONE_CENTRE);
const attitude = new Quaternion();
const scratch = new Vector3();

/**
 * Inside the canvas on the moves sheet: each frame, advances the flight, turns and lifts the drone
 * about its middle, and places the motor balloons. Keeps asking for frames until nothing moves.
 */
export function FlightRig({
  flight,
  pose,
  pins,
  avoid,
}: {
  flight: Flight;
  pose: RefObject<Group | null>;
  pins: RefObject<MotorPinElement[]>;
  /** Boxes on the canvas the balloons keep clear of (the sticks), in canvas pixels. */
  avoid: () => Rect[];
}) {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    invalidate();
    return flight.onWake(() => {
      invalidate();
    });
  }, [flight, invalidate]);

  useFrame(({ camera, size }, delta) => {
    flight.advance(Math.min(delta, MAX_FRAME_S));
    const { state } = flight;
    attitude.set(...state.attitude);
    const group = pose.current;
    if (group) {
      group.quaternion.copy(attitude);
      group.position.set(0, state.height, 0);
    }

    const middle = project([centre.x, centre.y + state.height, centre.z], camera, size);
    const boxes = avoid();
    MOTORS.forEach(({ position }, index) => {
      const element = pins.current[index];
      if (!element?.pin) return;
      scratch
        .set(...position)
        .sub(centre)
        .applyQuaternion(attitude)
        .add(centre);
      scratch.y += state.height;
      const motor = project([scratch.x, scratch.y, scratch.z], camera, size);
      const box = {
        width: element.pin.offsetWidth || PIN_BOX.width,
        height: element.pin.offsetHeight || PIN_BOX.height,
      };
      const [x, y] = placeMotorPin(motor, middle, box, size, boxes);
      // Later balloons keep clear of this one too.
      boxes.push({
        left: x - box.width / 2,
        right: x + box.width / 2,
        top: y - box.height / 2,
        bottom: y + box.height / 2,
      });
      element.pin.style.transform = `translate(${String(x)}px, ${String(y)}px) translate(-50%, -50%)`;
      element.pin.dataset.state = motorPinState(state.motors, index);
      if (element.speed) {
        element.speed.textContent = `${String(Math.round((state.motors[index] ?? 0) * 100))} %`;
      }
    });

    if (!flight.settled()) invalidate();
  });
  return null;
}

/** Over the canvas: one balloon per motor, its number and speed. The sheet says the same in words. */
export function MotorPins({ pins }: { pins: RefObject<MotorPinElement[]> }) {
  return (
    <div className="motor-pins" aria-hidden="true">
      {MOTORS.map(({ number }, index) => {
        const slot = () => (pins.current[index] ??= { pin: null, speed: null });
        return (
          <span
            key={number}
            className="motor-pin"
            data-state="even"
            ref={(pin) => {
              slot().pin = pin;
            }}
          >
            <span className="motor-pin-number">{number}</span>
            <span
              className="motor-pin-speed"
              ref={(speed) => {
                slot().speed = speed;
              }}
            />
          </span>
        );
      })}
    </div>
  );
}
