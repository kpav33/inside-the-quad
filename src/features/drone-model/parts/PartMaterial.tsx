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
      <meshStandardMaterial color={color} roughness={1} metalness={0} />
      <Edges threshold={20} color={edgeColor} />
    </>
  );
}
