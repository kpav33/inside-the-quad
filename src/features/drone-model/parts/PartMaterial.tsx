import type { PartId } from '@/shared/domain/parts';

import { PART_COLORS, partEmissive } from '../materials';

interface PartMaterialProps {
  part: PartId;
  highlighted: boolean;
}

export function PartMaterial({ part, highlighted }: PartMaterialProps) {
  return (
    <meshStandardMaterial
      color={PART_COLORS[part]}
      roughness={0.6}
      metalness={part === 'motors' ? 0.6 : 0.1}
      {...partEmissive(highlighted)}
    />
  );
}
