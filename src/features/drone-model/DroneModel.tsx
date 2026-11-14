import { useCursor } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { type ReactNode, useRef, useState } from 'react';

import { type DroneSpec, mm } from '@/shared/domain/drone-spec';
import { isInsidePart, type PartId } from '@/shared/domain/parts';

import { motorTopMm, PROP_HUB_HEIGHT_MM } from './dimensions';
import { motorPlacements } from './layout';
import { Lift } from './Lift';
import { partLook } from './materials';
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
import { SpinArcs } from './SpinArcs';
import { explodedOffsets } from './stack';

export interface DroneModelProps {
  spec: DroneSpec;
  selectedPart: PartId | null;
  /** Parts the open part connects to: drawn in grey while everything else fades. */
  connectedParts: ReadonlySet<PartId>;
  onPartClick?: (part: PartId, event: ThreeEvent<MouseEvent>) => void;
  /** Called with the part under a mouse pointer, and null when it leaves (never for touch). */
  onPartHover?: (part: PartId | null) => void;
}

/**
 * The whole drone, built from a spec. Each kind of part is one clickable group. Selecting a board
 * under the top plate opens the frame like an exploded-view drawing.
 */
export function DroneModel({
  spec,
  selectedPart,
  connectedParts,
  onPartClick,
  onPartHover,
}: DroneModelProps) {
  const [hovered, setHovered] = useState<PartId | null>(null);
  useCursor(hovered !== null);
  // The latest hovered part, read by pointer handlers that may run before a re-render. Hover is
  // reported only as the pointer moves, so a new sheet never gets an old hover replayed.
  const hoveredNow = useRef<PartId | null>(null);
  const hover = (part: PartId | null) => {
    hoveredNow.current = part;
    setHovered(part);
    onPartHover?.(part);
  };

  const look = (part: PartId) => partLook(part, selectedPart, connectedParts);
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
        // A tap's pointer is not a hover; it would leave the row lit after the finger lifts.
        if (event.pointerType === 'mouse') hover(part);
      }}
      onPointerOut={() => {
        if (hoveredNow.current === part) hover(null);
      }}
    >
      {children}
    </group>
  );

  return (
    <group>
      {/* The Propellers sheet shows which way each prop spins. Not clickable: raycasts pass. */}
      {selectedPart === 'props' && <SpinArcs spec={spec} />}
      {partGroup(
        'frame',
        <Frame spec={spec} look={look('frame')} topPlateLiftMm={lift.topPlate} />,
      )}
      {partGroup(
        'motors',
        placements.map((p) => (
          <Motor key={p.number} spec={spec} position={p.position} look={look('motors')} />
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
            look={look('props')}
          />
        )),
      )}
      {partGroup(
        'esc',
        <Lift liftMm={lift.esc}>
          <Esc spec={spec} look={look('esc')} />
        </Lift>,
      )}
      {partGroup(
        'fc',
        <Lift liftMm={lift.fc}>
          <Fc spec={spec} look={look('fc')} />
        </Lift>,
      )}
      {partGroup(
        'receiver',
        <Receiver spec={spec} look={look('receiver')} rearBayLiftMm={lift.rearBay} />,
      )}
      {partGroup(
        'vtx',
        <Lift liftMm={lift.rearBay}>
          <Vtx spec={spec} look={look('vtx')} />
        </Lift>,
      )}
      {partGroup('camera', <Camera spec={spec} look={look('camera')} />)}
      {partGroup(
        'strap',
        <Lift liftMm={lift.topPlate}>
          <Strap spec={spec} look={look('strap')} />
        </Lift>,
      )}
      {partGroup(
        'extras',
        <Extras spec={spec} look={look('extras')} topPlateLiftMm={lift.topPlate} />,
      )}
      {partGroup(
        'battery',
        <Lift liftMm={lift.topPlate}>
          <Battery spec={spec} look={look('battery')} />
        </Lift>,
      )}
    </group>
  );
}
