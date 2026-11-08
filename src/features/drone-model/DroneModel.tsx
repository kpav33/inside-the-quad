import { useCursor } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { type ReactNode, useState } from 'react';

import { type DroneSpec, mm } from '@/shared/domain/drone-spec';
import type { PartId } from '@/shared/domain/parts';

import { motorTopMm, PROP_HUB_HEIGHT_MM } from './dimensions';
import { motorPlacements } from './layout';
import { Frame } from './parts/Frame';
import { Motor } from './parts/Motor';
import { Propeller } from './parts/Propeller';

export interface DroneModelProps {
  spec: DroneSpec;
  selectedPart: PartId | null;
  onPartClick?: (part: PartId, event: ThreeEvent<MouseEvent>) => void;
}

/** The whole drone, built from a spec. Each kind of part is one clickable group. */
export function DroneModel({ spec, selectedPart, onPartClick }: DroneModelProps) {
  const [hovered, setHovered] = useState<PartId | null>(null);
  useCursor(hovered !== null);

  const placements = motorPlacements(spec);
  const propCentreAboveArm = mm(motorTopMm(spec) + PROP_HUB_HEIGHT_MM / 2);

  const partGroup = (part: PartId, children: ReactNode) => (
    <group
      name={part}
      onClick={(event) => {
        event.stopPropagation();
        onPartClick?.(part, event);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(part);
      }}
      onPointerOut={() => {
        setHovered((current) => (current === part ? null : current));
      }}
    >
      {children}
    </group>
  );

  return (
    <group>
      {partGroup('frame', <Frame spec={spec} highlighted={selectedPart === 'frame'} />)}
      {partGroup(
        'motors',
        placements.map((p) => (
          <Motor
            key={p.number}
            spec={spec}
            position={p.position}
            highlighted={selectedPart === 'motors'}
          />
        )),
      )}
      {partGroup(
        'props',
        placements.map(({ number, position: [x, y, z], spin }) => (
          <Propeller
            key={number}
            spec={spec}
            position={[x, y + propCentreAboveArm, z]}
            spin={spin}
            highlighted={selectedPart === 'props'}
          />
        )),
      )}
    </group>
  );
}
