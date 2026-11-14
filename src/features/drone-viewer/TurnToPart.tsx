import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { MathUtils, type Vector3 } from 'three';

import type { PartId } from '@/shared/domain/parts';
import { usePrefersReducedMotion } from '@/shared/ui/usePrefersReducedMotion';

import { useDroneFit } from './useDroneFit';
import { partView, stepView, type View, viewFromPosition, viewToPosition } from './part-views';

// A long pause between demand-driven frames must not turn into one big jump.
const MAX_FRAME_S = 1 / 30;
// The zoom eases at the same pace as the turn, and settles within a tenth of a millimetre.
const ZOOM_LAMBDA = 7.5;
const SETTLE_DISTANCE = 0.0001;

/** The parts of OrbitControls this component uses. */
interface Controls {
  target: Vector3;
  update: () => void;
  addEventListener: (type: 'start', listener: () => void) => void;
  removeEventListener: (type: 'start', listener: () => void) => void;
}

/**
 * Turns the drone so the selected part can be seen, for the parts the starting view hides (see
 * `partView`). The turn eases to that view's fitted distance, so the drone fills the drawing from
 * there too, and stops as soon as the user starts dragging.
 */
export function TurnToPart({ part }: { part: PartId | null }) {
  const controls = useThree((state) => state.controls) as unknown as Controls | null;
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);
  const goal = useRef<View | null>(null);
  const reduceMotion = usePrefersReducedMotion();
  const fit = useDroneFit();

  useEffect(() => {
    goal.current = partView(part);
    invalidate();
  }, [part, invalidate]);

  // The user's own drag wins over an unfinished turn.
  useEffect(() => {
    if (!controls) return;
    const cancel = () => {
      goal.current = null;
    };
    controls.addEventListener('start', cancel);
    return () => {
      controls.removeEventListener('start', cancel);
    };
  }, [controls]);

  useFrame((_, delta) => {
    const target = goal.current;
    if (!target || !controls) return;
    const centre = controls.target;
    const offset = camera.position.clone().sub(centre);
    const step = stepView(
      viewFromPosition([offset.x, offset.y, offset.z]),
      target,
      Math.min(delta, MAX_FRAME_S),
      reduceMotion,
    );
    const goalDistance = fit.distanceFor(target);
    const distance = reduceMotion
      ? goalDistance
      : MathUtils.damp(offset.length(), goalDistance, ZOOM_LAMBDA, Math.min(delta, MAX_FRAME_S));
    const zoomSettled = Math.abs(distance - goalDistance) < SETTLE_DISTANCE;
    const [x, y, z] = viewToPosition(step.view, zoomSettled ? goalDistance : distance);
    camera.position.set(centre.x + x, centre.y + y, centre.z + z);
    controls.update();
    if (step.settled && zoomSettled) goal.current = null;
    else invalidate();
  });

  return null;
}
