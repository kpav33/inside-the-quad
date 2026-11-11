import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import type { Vector3 } from 'three';

import type { PartId } from '@/shared/domain/parts';

import { partView, stepView, type View, viewFromPosition, viewToPosition } from './part-views';

// A long pause between demand-driven frames must not turn into one big jump.
const MAX_FRAME_S = 1 / 30;

/** The parts of OrbitControls this component uses. */
interface Controls {
  target: Vector3;
  update: () => void;
  addEventListener: (type: 'start', listener: () => void) => void;
  removeEventListener: (type: 'start', listener: () => void) => void;
}

/**
 * Turns the drone so the selected part can be seen, for the parts the starting view hides (see
 * `partView`). The turn keeps the zoom, eases, and stops as soon as the user starts dragging.
 */
export function TurnToPart({ part }: { part: PartId | null }) {
  const controls = useThree((state) => state.controls) as unknown as Controls | null;
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);
  const goal = useRef<View | null>(null);
  const reduceMotion = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

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
    const [x, y, z] = viewToPosition(step.view, offset.length());
    camera.position.set(centre.x + x, centre.y + y, centre.z + z);
    controls.update();
    if (step.settled) goal.current = null;
    else invalidate();
  });

  return null;
}
