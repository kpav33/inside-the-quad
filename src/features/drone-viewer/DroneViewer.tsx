import { Bounds, OrbitControls } from '@react-three/drei';
import { Canvas, type ThreeEvent } from '@react-three/fiber';

import { DroneModel } from '@/features/drone-model';
import { REFERENCE_5_INCH } from '@/shared/domain/drone-spec';
import type { PartId } from '@/shared/domain/parts';

export interface DroneViewerProps {
  selectedPart: PartId | null;
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
  onPartClick,
  onBackgroundClick,
}: DroneViewerProps) {
  return (
    <div className="drone-viewer">
      <Canvas
        aria-hidden="true"
        camera={{ position: [0.22, 0.18, 0.28], fov: 40, near: 0.01, far: 10 }}
        onPointerMissed={onBackgroundClick}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[1, 2, 1]} intensity={1.4} />
        <directionalLight position={[-1, 1, -1]} intensity={0.4} />
        {/* Fits the camera to the drone on load and on resize, so no viewport crops it. */}
        <Bounds fit observe margin={1.3}>
          <DroneModel
            spec={REFERENCE_5_INCH}
            selectedPart={selectedPart}
            onPartClick={onPartClick}
          />
        </Bounds>
        <OrbitControls makeDefault enablePan={false} minDistance={0.15} maxDistance={0.8} />
      </Canvas>
    </div>
  );
}
