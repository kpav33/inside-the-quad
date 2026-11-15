import { Line } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';

import { COLOR, MODEL_LOOK } from '@/shared/design/tokens';
import type { DroneSpec } from '@/shared/domain/drone-spec';
import { usePrefersReducedMotion } from '@/shared/ui/usePrefersReducedMotion';

import { dashOffset, LEADER_DASH_M } from './leader-motion';
import { type Leader, type LeaderStop, stopPoints } from './leader-points';
import { leaderSegments } from './path-anchors';
import type { Vec3 } from './rear';

const LINE_WIDTH = 1.6;
// Drawn over the model, like a leader on a drawing: never hidden behind a part.
const OVER_MODEL = 10;

type Segment = [Vec3, Vec3];

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
 * The numbered balloons are drawn by the viewer over the canvas (see `leaderMarkerPoints`).
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
    </group>
  );
}
