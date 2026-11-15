import { Html, Line } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';

import { COLOR, MODEL_LOOK } from '@/shared/design/tokens';
import { type DroneSpec, mm } from '@/shared/domain/drone-spec';
import type { AnchorId } from '@/shared/domain/paths';
import { usePrefersReducedMotion } from '@/shared/ui/usePrefersReducedMotion';

import { dashOffset, LEADER_DASH_M } from './leader-motion';
import { anchorPoints, leaderSegments } from './path-anchors';
import type { Vec3 } from './rear';
import { explodedOffsets } from './stack';

/** One stop of a path as the drawing needs it. */
export interface LeaderStop {
  anchors: readonly AnchorId[];
  /** Indexes of the stops this one feeds. */
  feeds: readonly number[];
  /** The number drawn at the stop, matching the list on the sheet. */
  marker: number;
  /** The label of an off-drone end ("Your radio"); left out for a stop on the drone. */
  endLabel?: string;
}

/** A path on the drawing, at its current step (0-based). */
export interface Leader {
  stops: readonly LeaderStop[];
  step: number;
}

const LINE_WIDTH = 1.6;
// Drawn over the model, like a leader on a drawing: never hidden behind a part.
const OVER_MODEL = 10;

type Segment = [Vec3, Vec3];

const toScene = ([x, y, z]: Vec3): Vec3 => [mm(x), mm(y), mm(z)];

/** The scene points of a stop: every anchor's points, in metres. */
function stopPoints(spec: DroneSpec, stop: LeaderStop): Vec3[] {
  // Every path passes a board under the top plate, so the frame is always open on a path sheet.
  const lift = explodedOffsets(spec, true);
  return stop.anchors.flatMap((anchor) => anchorPoints(spec, anchor, lift)).map(toScene);
}

/** The lines out of one stop to every stop it feeds. */
function outOf(spec: DroneSpec, stops: readonly LeaderStop[], index: number): Segment[] {
  const stop = stops[index];
  if (!stop) return [];
  const from = stopPoints(spec, stop);
  return stop.feeds.flatMap((fed) => {
    const target = stops[fed];
    return target ? leaderSegments(from, stopPoints(spec, target)) : [];
  });
}

/** Where a stop's number sits: at its first point. */
function markerPoint(spec: DroneSpec, stop: LeaderStop): Vec3 | undefined {
  return stopPoints(spec, stop)[0];
}

/** A dashed line whose dashes run toward its end, unless motion is reduced. */
function FlowingLine({ points }: { points: Segment }) {
  const line = useRef<{ material: { dashOffset: number } } | null>(null);
  const invalidate = useThree((state) => state.invalidate);
  const reduceMotion = usePrefersReducedMotion();
  useFrame(({ clock }) => {
    if (!line.current) return;
    line.current.material.dashOffset = dashOffset(clock.elapsedTime, reduceMotion);
    // The canvas draws on demand: keep asking for frames while the dashes move.
    if (!reduceMotion) invalidate();
  });
  return (
    <Line
      ref={line as never}
      points={points}
      color={COLOR.accent}
      lineWidth={LINE_WIDTH}
      dashed
      dashSize={LEADER_DASH_M}
      gapSize={LEADER_DASH_M}
      depthTest={false}
      renderOrder={OVER_MODEL}
    />
  );
}

/**
 * A path drawn on the model as a redline leader: the stretches already passed solid and faint,
 * the stretch out of the current stop dashed and flowing to every stop it feeds, nothing ahead.
 * Each stop up to the current one carries its number; the off-drone ends carry their labels.
 */
export function PathLeader({ spec, leader }: { spec: DroneSpec; leader: Leader }) {
  const { stops, step } = leader;
  const passed = useMemo(
    () => stops.slice(0, step).flatMap((_, index) => outOf(spec, stops, index)),
    [spec, stops, step],
  );
  const current = useMemo(() => outOf(spec, stops, step), [spec, stops, step]);

  return (
    <group>
      {passed.map((points, index) => (
        <Line
          key={`passed-${String(index)}`}
          points={points}
          color={COLOR.accent}
          lineWidth={LINE_WIDTH}
          transparent
          opacity={MODEL_LOOK.leaderPassedOpacity}
          depthTest={false}
          renderOrder={OVER_MODEL}
        />
      ))}
      {current.map((points, index) => (
        <FlowingLine key={`current-${String(step)}-${String(index)}`} points={points} />
      ))}
      {stops.map((stop, index) => {
        const at = markerPoint(spec, stop);
        if (!at) return null;
        const shown = index <= step || stop.endLabel !== undefined;
        if (!shown) return null;
        const state = index === step ? 'current' : index < step ? 'passed' : 'ahead';
        return (
          <Html key={stop.marker} position={at} center zIndexRange={[20, 10]}>
            <span className="path-pin" data-state={state} aria-hidden="true">
              {stop.endLabel !== undefined && <span className="path-end">{stop.endLabel}</span>}
              {index <= step && <span className="path-marker">{stop.marker}</span>}
            </span>
          </Html>
        );
      })}
    </group>
  );
}
