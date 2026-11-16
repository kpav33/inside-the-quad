import { Line } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { type RefObject, useEffect } from 'react';
import { type Group, Quaternion, Vector3 } from 'three';

import { closedAnchorPoint, motorPlacements, project, type Rect } from '@/features/drone-model';
import type { Flight } from '@/features/flight';
import { COLOR } from '@/shared/design/tokens';
import { REFERENCE_5_INCH } from '@/shared/domain/drone-spec';

import { motorPinState, placeMotorPin } from './motor-pins';
import { groundFit, vtxGaugeSegments } from './vtx-gauge';
import { DRONE_BOTTOM, DRONE_CENTRE, DRONE_RADIUS } from './useDroneFit';

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
const VTX = closedAnchorPoint(REFERENCE_5_INCH, 'vtx');
/** Motor 2 (front right): the one the what-if sheet's wrong prop goes on. */
const WRONG_PROP_MOTOR = 1;
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
  gauge,
  avoid,
}: {
  flight: Flight;
  pose: RefObject<Group | null>;
  pins: RefObject<MotorPinElement[]>;
  /** The VTX heat gauge over the canvas, if it is there. */
  gauge: () => HTMLElement | null;
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
      element.pin.dataset.fault = String(flight.faults.wrongProp && index === WRONG_PROP_MOTOR);
      if (element.speed) {
        element.speed.textContent = `${String(Math.round((state.motors[index] ?? 0) * 100))} %`;
      }
    });

    // The VTX heat gauge, over the VTX while it runs without its antenna.
    const vtxGauge = gauge();
    if (vtxGauge && VTX) {
      const showing = flight.faults.vtxNoAntenna || state.vtxLevel > 0;
      vtxGauge.hidden = !showing;
      if (showing) {
        scratch
          .set(...VTX)
          .sub(centre)
          .applyQuaternion(attitude)
          .add(centre);
        scratch.y += state.height;
        const [x, y] = project([scratch.x, scratch.y, scratch.z], camera, size);
        vtxGauge.style.transform = `translate(${String(x)}px, ${String(y)}px) translate(-50%, -150%)`;
        vtxGauge.dataset.level = String(state.vtxLevel);
        const segments = vtxGauge.querySelectorAll<HTMLElement>('.vtx-gauge-segment');
        vtxGaugeSegments(state.vtxLevel).forEach((on, i) => {
          const segment = segments[i];
          if (segment) segment.dataset.on = String(on);
        });
      }
    }

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

/** Over the canvas: the VTX heat gauge, three segments filling as it heats. Words are on the sheet. */
export function VtxGauge() {
  return (
    <span className="vtx-gauge" aria-hidden="true" hidden>
      {[0, 1, 2].map((i) => (
        <span key={i} className="vtx-gauge-segment" />
      ))}
    </span>
  );
}

/**
 * The ground on the what-if sheet: a hairline square on the floor under the drone, drawn in
 * perspective like a datum plane, where it comes to rest after a fall. `ground` is how far below
 * hover the drone rests (metres, < 0). The square fits inside the framed sphere.
 */
export function GroundLine({ ground }: { ground: number }) {
  const fit = groundFit(DRONE_RADIUS, ground, DRONE_BOTTOM);
  const y = DRONE_CENTRE[1] + fit.lineY;
  const half = fit.lineHalf / Math.SQRT2;
  return (
    <Line
      points={[
        [-half, y, -half],
        [half, y, -half],
        [half, y, half],
        [-half, y, half],
        [-half, y, -half],
      ]}
      color={COLOR.ruleStrong}
      lineWidth={1}
    />
  );
}
