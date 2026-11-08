import { Edges } from '@react-three/drei';

import type { PartId } from '@/shared/domain/parts';

import { partAppearance } from '../materials';

interface PartMaterialProps {
  part: PartId;
  highlighted: boolean;
}

/** Material plus drafting edges for one mesh; render it inside the mesh. */
export function PartMaterial({ part, highlighted }: PartMaterialProps) {
  const { color, edgeColor } = partAppearance(part, highlighted);
  return (
    <>
      <meshStandardMaterial
        color={color}
        roughness={part === 'frame' ? 0.75 : 0.5}
        metalness={part === 'motors' && !highlighted ? 0.5 : 0.05}
      />
      <Edges threshold={20} color={edgeColor} />
    </>
  );
}
