import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';

/**
 * three's OrbitControls sets `touch-action: none` on its element when it connects, which turns
 * every vertical swipe over the drone into a rotation and traps phone users. Restoring `pan-y`
 * lets the browser scroll the page with one finger; the controls only rotate with two fingers.
 */
export function TouchScrollPassThrough() {
  const controls = useThree((state) => state.controls) as { domElement?: HTMLElement } | null;

  useEffect(() => {
    const element = controls?.domElement;
    // Writing to the controls' DOM element is the point of this effect, not a state mutation.
    // eslint-disable-next-line react-hooks/immutability
    if (element) element.style.touchAction = 'pan-y';
  }, [controls]);

  return null;
}
