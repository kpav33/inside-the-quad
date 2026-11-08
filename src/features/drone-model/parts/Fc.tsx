import { type DroneSpec, mm } from '@/shared/domain/drone-spec';

import { FC_HEIGHT_MM, stackLayers } from '../stack';

import { PartMaterial } from './PartMaterial';

interface FcProps {
  spec: DroneSpec;
  highlighted: boolean;
}

const PCB_MM = 1.6;
const GROMMET_RADIUS_MM = 2.6;

/** Flight controller: a square board with the processor and gyro, soft-mounted on four rubber
 * grommets at the stack holes. */
export function Fc({ spec, highlighted }: FcProps) {
  const board = spec.fc.boardSizeMm;
  const bottom = stackLayers(spec).fc.bottomMm;
  const hole = spec.frame.stackMountMm / 2;
  const material = <PartMaterial part="fc" highlighted={highlighted} />;
  const top = bottom + PCB_MM;

  return (
    <group>
      <mesh position={[0, mm(bottom + PCB_MM / 2), 0]}>
        <boxGeometry args={[mm(board), mm(PCB_MM), mm(board)]} />
        {material}
      </mesh>
      {/* Processor in the middle, gyro beside it. */}
      <mesh position={[0, mm(top + 0.7), 0]}>
        <boxGeometry args={[mm(10), mm(1.4), mm(10)]} />
        {material}
      </mesh>
      <mesh position={[mm(9), mm(top + 0.5), mm(-6)]}>
        <boxGeometry args={[mm(4), mm(1), mm(4)]} />
        {material}
      </mesh>
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh
            key={`${sx}:${sz}`}
            position={[mm(sx * hole), mm(bottom + FC_HEIGHT_MM / 2), mm(sz * hole)]}
          >
            <cylinderGeometry
              args={[mm(GROMMET_RADIUS_MM), mm(GROMMET_RADIUS_MM), mm(FC_HEIGHT_MM), 12]}
            />
            {material}
          </mesh>
        )),
      )}
    </group>
  );
}
