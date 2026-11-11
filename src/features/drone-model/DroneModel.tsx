import { useCursor } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { type ReactNode, useState } from 'react';

import { type DroneSpec, mm } from '@/shared/domain/drone-spec';
import { isInsidePart, type PartId } from '@/shared/domain/parts';

import { motorTopMm, PROP_HUB_HEIGHT_MM } from './dimensions';
import { motorPlacements } from './layout';
import { Lift } from './Lift';
import { Battery } from './parts/Battery';
import { Camera } from './parts/Camera';
import { Esc } from './parts/Esc';
import { Extras } from './parts/Extras';
import { Fc } from './parts/Fc';
import { Frame } from './parts/Frame';
import { Motor } from './parts/Motor';
import { Propeller } from './parts/Propeller';
import { Receiver } from './parts/Receiver';
import { Strap } from './parts/Strap';
import { Vtx } from './parts/Vtx';
import { explodedOffsets } from './stack';

export interface DroneModelProps {
  spec: DroneSpec;
  selectedPart: PartId | null;
  onPartClick?: (part: PartId, event: ThreeEvent<MouseEvent>) => void;
}

/**
 * The whole drone, built from a spec. Each kind of part is one clickable group. Selecting a board
 * under the top plate opens the frame like an exploded-view drawing.
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
        'receiver',
        <Receiver
          spec={spec}
          highlighted={selectedPart === 'receiver'}
          rearBayLiftMm={lift.rearBay}
        />,
      )}
      {partGroup(
        'vtx',
        <Lift liftMm={lift.rearBay}>
          <Vtx spec={spec} highlighted={selectedPart === 'vtx'} />
        </Lift>,
      )}
      {partGroup('camera', <Camera spec={spec} highlighted={selectedPart === 'camera'} />)}
      {partGroup(
        'strap',
        <Lift liftMm={lift.topPlate}>
          <Strap spec={spec} highlighted={selectedPart === 'strap'} />
        </Lift>,
      )}
      {partGroup(
        'extras',
        <Extras
          spec={spec}
          highlighted={selectedPart === 'extras'}
          topPlateLiftMm={lift.topPlate}
        />,
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
