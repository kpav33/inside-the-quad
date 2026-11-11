import { useCursor } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { type ReactNode, useState } from 'react';

import { type DroneSpec, mm } from '@/shared/domain/drone-spec';
import { isInsidePart, type PartId } from '@/shared/domain/parts';

import { motorTopMm, PROP_HUB_HEIGHT_MM } from './dimensions';
import { motorPlacements } from './layout';
import { Lift } from './Lift';
import { Battery } from './parts/Battery';
import { Esc } from './parts/Esc';
import { Fc } from './parts/Fc';
import { Frame } from './parts/Frame';
import { Motor } from './parts/Motor';
import { Propeller } from './parts/Propeller';
import { explodedOffsets } from './stack';

export interface DroneModelProps {
  spec: DroneSpec;
  selectedPart: PartId | null;
  onPartClick?: (part: PartId, event: ThreeEvent<MouseEvent>) => void;
}

/**
 * The whole drone, built from a spec. Each kind of part is one clickable group. Selecting a board
 * in the stack opens the stack like an exploded-view drawing.
 */
export function DroneModel({ spec, selectedPart, onPartClick }: DroneModelProps) {
  const [hovered, setHovered] = useState<PartId | null>(null);
  useCursor(hovered !== null);

  const placements = motorPlacements(spec);
  const lift = explodedOffsets(spec, isInsidePart(selectedPart));
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
      {partGroup(
        'frame',
        <Frame spec={spec} highlighted={selectedPart === 'frame'} topPlateLiftMm={lift.topPlate} />,
      )}
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
      {partGroup(
        'esc',
        <Lift liftMm={lift.esc}>
          <Esc spec={spec} highlighted={selectedPart === 'esc'} />
        </Lift>,
      )}
      {partGroup(
        'fc',
        <Lift liftMm={lift.fc}>
          <Fc spec={spec} highlighted={selectedPart === 'fc'} />
        </Lift>,
      )}
      {partGroup(
        'battery',
        <Lift liftMm={lift.topPlate}>
          <Battery spec={spec} highlighted={selectedPart === 'battery'} />
        </Lift>,
      )}
    </group>
  );
}
