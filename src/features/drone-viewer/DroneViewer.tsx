import { OrbitControls } from '@react-three/drei';
import { Canvas, type ThreeEvent } from '@react-three/fiber';
import { TOUCH } from 'three';

import { DroneModel } from '@/features/drone-model';
import { SCENE_LIGHT } from '@/shared/design/tokens';
import { REFERENCE_5_INCH } from '@/shared/domain/drone-spec';
import type { PartId } from '@/shared/domain/parts';

import { FitCamera } from './FitCamera';
import { DEFAULT_CAMERA_POSITION } from './part-views';
import { TouchScrollPassThrough } from './TouchScrollPassThrough';
import { TurnToPart } from './TurnToPart';

export interface DroneViewerProps {
  selectedPart: PartId | null;
  /** Parts the open part connects to, from its lesson. */
  connectedParts: ReadonlySet<PartId>;
  onPartClick: (part: PartId, event: ThreeEvent<MouseEvent>) => void;
  /** Called when a click hits empty space instead of a part. */
  onBackgroundClick: () => void;
}

/**
 * Interactive 3D viewport for the reference drone. The canvas is hidden from assistive
 * technology: the part list next to it offers the same choices.
 */
export default function DroneViewer({
  selectedPart,
  connectedParts,
  onPartClick,
  onBackgroundClick,
}: DroneViewerProps) {
  return (
    <div className="drone-viewer">
      <Canvas
        aria-hidden="true"
        camera={{ position: DEFAULT_CAMERA_POSITION, fov: 40, near: 0.01, far: 10 }}
        onPointerMissed={onBackgroundClick}
        // Nothing moves on its own, so draw only when the camera or selection changes.
        frameloop="demand"
      >
        {/* A bench lamp from the upper front, with a cool fill so dark parts keep their shape. */}
        <ambientLight intensity={0.55} />
        <directionalLight position={[1, 2, 1.5]} intensity={1.8} />
        <directionalLight position={[-1.5, 0.8, -1]} intensity={0.6} color={SCENE_LIGHT.fill} />
        <DroneModel
          spec={REFERENCE_5_INCH}
          selectedPart={selectedPart}
          connectedParts={connectedParts}
          onPartClick={onPartClick}
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
        <TurnToPart part={selectedPart} />
      </Canvas>
    </div>
  );
}
