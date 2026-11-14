import { type DroneSpec, mm } from '@/shared/domain/drone-spec';

import { rearBay } from '../rear';
import { ESC_HEIGHT_MM, stackLayers } from '../stack';

import type { PartLook } from '../materials';

import { PartMaterial } from './PartMaterial';

interface EscProps {
  spec: DroneSpec;
  look: PartLook;
}

const PCB_MM = 1.6;
const PART_HEIGHT_MM = ESC_HEIGHT_MM - PCB_MM;
const LEAD_RADIUS_MM = 0.8;

/** 4-in-1 ESC: a square board with one block of power switches per motor, plus the capacitor
 * on two leads at the rear. */
export function Esc({ spec, look }: EscProps) {
  const board = spec.esc.boardSizeMm;
  const bottom = stackLayers(spec).esc.bottomMm;
  const material = <PartMaterial part="esc" look={look} />;
  // One block of power switches near each corner, one for each motor.
  const corner = board / 2 - 7;
  // The capacitor sits at the rear, beside the VTX (see rear.ts).
  const { centre: cap, size: capSize } = rearBay(spec).capacitor;
  const capRadius = capSize[0] / 2;

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
          position={[mm(cap[0] + side * 2.5), mm(cap[1]), mm(board / 2 + 2)]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[mm(LEAD_RADIUS_MM), mm(LEAD_RADIUS_MM), mm(4), 8]} />
          {material}
        </mesh>
      ))}
      <mesh position={[mm(cap[0]), mm(cap[1]), mm(cap[2])]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[mm(capRadius), mm(capRadius), mm(capSize[2]), 20]} />
        {material}
      </mesh>
    </group>
  );
}
