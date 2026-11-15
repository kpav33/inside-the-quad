import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

import { COLOR } from '@/shared/design/tokens';
import { type DroneSpec, INCH_MM, mm } from '@/shared/domain/drone-spec';

import { motorTopMm, PROP_HUB_HEIGHT_MM } from './dimensions';
import { motorPlacements } from './layout';
import { arcSweep } from './motor-arc';
import { arrowHead, spinArcPoints } from './spin-arc';

/** Inside the blade tips, as on the Propellers sheet. */
const RADIUS_SHARE = 0.72;
const SEGMENTS = 24;
const ARROW_MM = 9;
const LIFT_ABOVE_HUB_MM = 2;

/** The parts of drei's line this component drives each frame. */
interface LineHandle {
  geometry: { setPositions: (positions: number[]) => void };
}

/**
 * Over each prop, an arrow in its spin direction whose length is its motor's speed: short at idle,
 * most of a turn at full speed. Updated each frame from `readSpeeds` (motors 1–4); still otherwise.
 */
export function MotorArcs({
  spec,
  readSpeeds,
  idle,
}: {
  spec: DroneSpec;
  readSpeeds: () => readonly number[];
  idle: number;
}) {
  const radius = mm(((spec.prop.diameterIn * INCH_MM) / 2) * RADIUS_SHARE);
  const above = mm(motorTopMm(spec) + PROP_HUB_HEIGHT_MM + LIFT_ABOVE_HUB_MM);
  const placements = motorPlacements(spec);
  const arcs = useRef<(LineHandle | null)[]>([]);
  const heads = useRef<(LineHandle | null)[]>([]);

  const shape = (index: number, speed: number) => {
    const placement = placements[index];
    if (!placement) return null;
    const {
      position: [x, y, z],
      spin,
    } = placement;
    const sweep = arcSweep(speed, idle);
    const outward = Math.atan2(z, x);
    const start = outward - ((spin === 'cw' ? 1 : -1) * sweep) / 2;
    const arc = spinArcPoints(spin, radius, start, sweep, SEGMENTS);
    const head = arrowHead(arc, mm(ARROW_MM));
    const at = (points: readonly [number, number][]) =>
      points.flatMap(([px, pz]) => [x + px, y + above, z + pz]);
    return { arc: at(arc), head: at(head) };
  };

  useFrame(() => {
    readSpeeds().forEach((speed, index) => {
      const lines = shape(index, speed);
      if (!lines) return;
      arcs.current[index]?.geometry.setPositions(lines.arc);
      heads.current[index]?.geometry.setPositions(lines.head);
    });
  });

  const triples = (flat: number[]) =>
    Array.from({ length: flat.length / 3 }, (_, i): [number, number, number] => [
      flat[i * 3] ?? 0,
      flat[i * 3 + 1] ?? 0,
      flat[i * 3 + 2] ?? 0,
    ]);

  return (
    <group>
      {placements.map(({ number }, index) => {
        const lines = shape(index, readSpeeds()[index] ?? idle);
        if (!lines) return null;
        return (
          <group key={number}>
            <Line
              ref={(line) => {
                arcs.current[index] = line;
              }}
              points={triples(lines.arc)}
              color={COLOR.ink}
              lineWidth={1.5}
            />
            <Line
              ref={(line) => {
                heads.current[index] = line;
              }}
              points={triples(lines.head)}
              color={COLOR.ink}
              lineWidth={1.5}
            />
          </group>
        );
      })}
    </group>
  );
}
