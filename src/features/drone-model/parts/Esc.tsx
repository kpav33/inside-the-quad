import { type DroneSpec, mm } from '@/shared/domain/drone-spec';

import { ESC_HEIGHT_MM, stackLayers } from '../stack';

import { PartMaterial } from './PartMaterial';

interface EscProps {
  spec: DroneSpec;
  highlighted: boolean;
}

const PCB_MM = 1.6;
const PART_HEIGHT_MM = ESC_HEIGHT_MM - PCB_MM;
const CAP_RADIUS_MM = 5;
const CAP_LENGTH_MM = 16;
const LEAD_RADIUS_MM = 0.8;

/** 4-in-1 ESC: a square board with one block of power switches per motor, plus the capacitor
 * on two leads at the rear. */
export function Esc({ spec, highlighted }: EscProps) {
  const board = spec.esc.boardSizeMm;
  const bottom = stackLayers(spec).esc.bottomMm;
  const material = <PartMaterial part="esc" highlighted={highlighted} />;
  // One block of power switches near each corner, one for each motor.
  const corner = board / 2 - 7;
  const capZ = board / 2 + 4 + CAP_LENGTH_MM / 2;
  const capY = bottom + CAP_RADIUS_MM;

  return (
    <group>
      <mesh position={[0, mm(bottom + PCB_MM / 2), 0]}>
        <boxGeometry args={[mm(board), mm(PCB_MM), mm(board)]} />
        {material}
      </mesh>
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh
            key={`${sx}:${sz}`}
            position={[mm(sx * corner), mm(bottom + PCB_MM + PART_HEIGHT_MM / 2), mm(sz * corner)]}
          >
            <boxGeometry args={[mm(9), mm(PART_HEIGHT_MM), mm(6)]} />
            {material}
          </mesh>
        )),
      )}
      <mesh position={[0, mm(bottom + PCB_MM + 0.75), 0]}>
        <boxGeometry args={[mm(7), mm(1.5), mm(7)]} />
        {material}
      </mesh>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[mm(side * 2.5), mm(capY), mm(board / 2 + 2)]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[mm(LEAD_RADIUS_MM), mm(LEAD_RADIUS_MM), mm(4), 8]} />
          {material}
        </mesh>
      ))}
      <mesh position={[0, mm(capY), mm(capZ)]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[mm(CAP_RADIUS_MM), mm(CAP_RADIUS_MM), mm(CAP_LENGTH_MM), 20]} />
        {material}
      </mesh>
    </group>
  );
}
