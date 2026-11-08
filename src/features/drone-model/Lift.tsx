import { useFrame, useThree } from '@react-three/fiber';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import type { Group } from 'three';

import { mm } from '@/shared/domain/drone-spec';

import { stepLift } from './stack';

// A long pause between demand-driven frames must not turn into one big jump.
const MAX_FRAME_S = 1 / 30;

interface LiftProps {
  /** How far to raise the children, in millimetres. Changes are eased, not jumped. */
  liftMm: number;
  children: ReactNode;
}

/** Raises its children by `liftMm`, easing between values; used for the exploded stack. */
export function Lift({ liftMm, children }: LiftProps) {
  const group = useRef<Group>(null);
  const current = useRef(liftMm);
  // Placed once at mount; after that only the frame loop moves the group.
  const [startY] = useState(() => mm(liftMm));
  const invalidate = useThree((state) => state.invalidate);
  const reduceMotion = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  // The scene only draws on demand, so ask for a frame whenever the target changes.
  useEffect(() => {
    invalidate();
  }, [liftMm, invalidate]);

  useFrame((_, delta) => {
    if (!group.current) return;
    const step = stepLift(current.current, liftMm, Math.min(delta, MAX_FRAME_S), reduceMotion);
    current.current = step.value;
    group.current.position.y = mm(step.value);
    if (!step.settled) invalidate();
  });

  return (
    <group ref={group} position-y={startY}>
      {children}
    </group>
  );
}
