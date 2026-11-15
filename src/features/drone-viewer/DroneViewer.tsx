import { OrbitControls } from '@react-three/drei';
import { Canvas, type ThreeEvent } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { TOUCH } from 'three';

import { DroneModel, type Leader, leaderMarkerPoints } from '@/features/drone-model';
import { SCENE_LIGHT } from '@/shared/design/tokens';
import { REFERENCE_5_INCH } from '@/shared/domain/drone-spec';
import type { PartId } from '@/shared/domain/parts';

import { FitCamera } from './FitCamera';
import { DEFAULT_CAMERA_POSITION } from './part-views';
import { PathPins, ProjectPins } from './PathPins';
import { TouchScrollPassThrough } from './TouchScrollPassThrough';
import { TurnToPart } from './TurnToPart';

export interface DroneViewerProps {
  /** Parts in the open look: the open sheet's part, or every part of a path's current stop. */
  openParts: ReadonlySet<PartId>;
  /** Parts the open sheet connects to, drawn in grey. */
  connectedParts: ReadonlySet<PartId>;
  /** Opens the frame like an exploded-view drawing. */
  exploded: boolean;
  /** The part to turn the view toward, or null to leave the view alone. */
  turnTo: PartId | null;
  /** A path drawn over the model, or null. */
  leader: Leader | null;
  onPartClick: (part: PartId, event: ThreeEvent<MouseEvent>) => void;
  /** Called with the part under the mouse, and null when the mouse leaves it. */
  onPartHover: (part: PartId | null) => void;
  /** Called when a click hits empty space instead of a part. */
  onBackgroundClick: () => void;
}

/**
 * Interactive 3D viewport for the reference drone. The canvas is hidden from assistive
 * technology: the part list next to it offers the same choices.
 */
export default function DroneViewer({
  openParts,
  connectedParts,
  exploded,
  turnTo,
  leader,
  onPartClick,
  onPartHover,
  onBackgroundClick,
}: DroneViewerProps) {
  const pins = useRef<(HTMLElement | null)[]>([]);
  const stops = leader?.stops;
  const markerPoints = useMemo(
    () => (stops ? leaderMarkerPoints(REFERENCE_5_INCH, stops) : []),
    [stops],
  );
  return (
    <div className="drone-viewer">
      <Canvas
        aria-hidden="true"
        camera={{ position: DEFAULT_CAMERA_POSITION, fov: 40, near: 0.01, far: 10 }}
        onPointerMissed={onBackgroundClick}
        // Draw only when the camera or selection changes, or while a path's dashes move.
        frameloop="demand"
      >
        {/* A bench lamp from the upper front, with a cool fill so dark parts keep their shape. */}
        <ambientLight intensity={0.55} />
        <directionalLight position={[1, 2, 1.5]} intensity={1.8} />
        <directionalLight position={[-1.5, 0.8, -1]} intensity={0.6} color={SCENE_LIGHT.fill} />
        <DroneModel
          spec={REFERENCE_5_INCH}
          openParts={openParts}
          connectedParts={connectedParts}
          exploded={exploded}
          leader={leader}
          onPartClick={onPartClick}
          onPartHover={onPartHover}
        />
        <OrbitControls
          makeDefault
          enablePan={false}
          // One finger scrolls the page (see TouchScrollPassThrough); two fingers turn and zoom.
          touches={{ TWO: TOUCH.DOLLY_ROTATE }}
        />
        {/* Fits the camera to the drone's outline, so it fills the drawing at every canvas shape;
            sets the zoom limits from that distance. */}
        <FitCamera />
        <TouchScrollPassThrough />
        <TurnToPart part={turnTo} />
        {leader && <ProjectPins points={markerPoints} pins={pins} />}
      </Canvas>
      {leader && <PathPins leader={leader} pins={pins} />}
    </div>
  );
}
