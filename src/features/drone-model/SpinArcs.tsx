import { Line } from '@react-three/drei';

import { COLOR } from '@/shared/design/tokens';
import { type DroneSpec, INCH_MM, mm } from '@/shared/domain/drone-spec';

import { motorTopMm, PROP_HUB_HEIGHT_MM } from './dimensions';
import { motorPlacements } from './layout';
import { arrowHead, spinArcPoints } from './spin-arc';

/** Inside the blade tips, so the arcs never reach past the outline the camera is fitted to. */
const RADIUS_SHARE = 0.72;
const SWEEP_RAD = (110 * Math.PI) / 180;
const SEGMENTS = 24;
const ARROW_MM = 9;
const LIFT_ABOVE_HUB_MM = 2;

/**
 * A drawn arrow over each prop showing which way it spins (props in: the front props turn towards
 * the camera). Centred on the side of the prop away from the body, where it stays in view.
 */
export function SpinArcs({ spec }: { spec: DroneSpec }) {
  const radius = mm(((spec.prop.diameterIn * INCH_MM) / 2) * RADIUS_SHARE);
  const above = mm(motorTopMm(spec) + PROP_HUB_HEIGHT_MM + LIFT_ABOVE_HUB_MM);
  return (
    <group>
      {motorPlacements(spec).map(({ number, position: [x, y, z], spin }) => {
        const outward = Math.atan2(z, x);
        const start = outward - ((spin === 'cw' ? 1 : -1) * SWEEP_RAD) / 2;
        const arc = spinArcPoints(spin, radius, start, SWEEP_RAD, SEGMENTS);
        const head = arrowHead(arc, mm(ARROW_MM));
        const at = (points: readonly [number, number][]) =>
          points.map(([px, pz]): [number, number, number] => [x + px, y + above, z + pz]);
        return (
          <group key={number}>
            <Line points={at(arc)} color={COLOR.ink} lineWidth={1.5} />
            <Line points={at(head)} color={COLOR.ink} lineWidth={1.5} />
          </group>
        );
      })}
    </group>
  );
}
