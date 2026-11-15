import { Line } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';

import { COLOR, MODEL_LOOK } from '@/shared/design/tokens';
import type { DroneSpec } from '@/shared/domain/drone-spec';
import { usePrefersReducedMotion } from '@/shared/ui/usePrefersReducedMotion';

import { dashOffset, LEADER_DASH_M } from './leader-motion';
import { type Leader, type LeaderStop, outlineScene, stopPoints } from './leader-points';
import { leaderSegments } from './path-anchors';
import type { Vec3 } from './rear';
import { endOnScreen, unprojectAt } from './screen-project';

const LINE_WIDTH = 1.6;
// Drawn over the model, like a leader on a drawing: never hidden behind a part.
const OVER_MODEL = 10;

/** One line of the leader; `end` names the side that is an off-drone end, if either is. */
interface Segment {
  points: [Vec3, Vec3];
  end?: 'from' | 'to';
}

/** The lines out of one stop to every stop it feeds. */
function outOf(spec: DroneSpec, stops: readonly LeaderStop[], index: number): Segment[] {
  const stop = stops[index];
  if (!stop) return [];
  const from = stopPoints(spec, stop);
  return stop.feeds.flatMap((fed) => {
    const target = stops[fed];
    if (!target) return [];
    const end =
      stop.endLabel !== undefined ? 'from' : target.endLabel !== undefined ? 'to' : undefined;
    return leaderSegments(from, stopPoints(spec, target)).map((points): Segment =>
      end ? { points, end } : { points },
    );
  });
}

/** The parts of drei's line this component drives each frame. */
interface LineHandle {
  material: { dashOffset: number };
  geometry: { setPositions: (positions: number[]) => void };
  computeLineDistances: () => void;
}

/**
 * One line of the leader. A dashed line's dashes run toward its end unless motion is reduced. A
 * line to an off-drone end follows that end, which sits beside the drone on screen whatever the
 * view (see `endOnScreen`).
 */
function LeaderLine({
  segment,
  outline,
  dashed,
}: {
  segment: Segment;
  outline: readonly Vec3[];
  dashed: boolean;
}) {
  const line = useRef<LineHandle | null>(null);
  const invalidate = useThree((state) => state.invalidate);
  const reduceMotion = usePrefersReducedMotion();
  const { points, end } = segment;
  useFrame(({ clock, camera, size }) => {
    const current = line.current;
    if (!current) return;
    if (end) {
      const onDrone = end === 'from' ? points[1] : points[0];
      const endPoint = unprojectAt(
        endOnScreen(outline, camera, size).balloon,
        onDrone,
        camera,
        size,
      );
      const [a, b] = end === 'from' ? [endPoint, onDrone] : [onDrone, endPoint];
      current.geometry.setPositions([...a, ...b]);
      if (dashed) current.computeLineDistances();
    }
    if (dashed) {
      current.material.dashOffset = dashOffset(clock.elapsedTime, reduceMotion);
      // The canvas draws on demand: keep asking for frames while the dashes move.
      if (!reduceMotion) invalidate();
    }
  });
  return (
    <Line
      ref={line as never}
      points={points}
      color={COLOR.accent}
      lineWidth={LINE_WIDTH}
      dashed={dashed}
      dashSize={LEADER_DASH_M}
      gapSize={LEADER_DASH_M}
      transparent={!dashed}
      opacity={dashed ? 1 : MODEL_LOOK.leaderPassedOpacity}
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
  const outline = useMemo(() => outlineScene(spec), [spec]);
  const passed = useMemo(
    () => stops.slice(0, step).flatMap((_, index) => outOf(spec, stops, index)),
    [spec, stops, step],
  );
  const current = useMemo(() => outOf(spec, stops, step), [spec, stops, step]);

  return (
    <group>
      {passed.map((segment, index) => (
        <LeaderLine
          key={`passed-${String(index)}`}
          segment={segment}
          outline={outline}
          dashed={false}
        />
      ))}
      {current.map((segment, index) => (
        <LeaderLine
          key={`current-${String(step)}-${String(index)}`}
          segment={segment}
          outline={outline}
          dashed
        />
      ))}
    </group>
  );
}
