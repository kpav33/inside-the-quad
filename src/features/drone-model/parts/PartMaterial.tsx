import { Edges } from '@react-three/drei';

import type { PartId } from '@/shared/domain/parts';

import { partAppearance, type PartLook } from '../materials';

interface PartMaterialProps {
  part: PartId;
  look: PartLook;
}

/** Material plus drafting edges for one mesh; render it inside the mesh. */
export function PartMaterial({ part, look }: PartMaterialProps) {
  const { color, edgeColor, opacity } = partAppearance(part, look);
  const faded = opacity < 1;
  return (
    <>
      {/* A faded part writes no depth, so the open part behind it is never hidden. Raycasts ignore
          opacity, so faded parts stay clickable. */}
      <meshStandardMaterial
        color={color}
        roughness={1}
        metalness={0}
        transparent={faded}
        opacity={opacity}
        depthWrite={!faded}
      />
      <Edges threshold={20} color={edgeColor} />
    </>
  );
}
