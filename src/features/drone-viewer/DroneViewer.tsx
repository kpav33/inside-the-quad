import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

/**
 * Interactive 3D viewport for the reference drone.
 *
 * Placeholder scene: proves the 3D stack renders. The procedural drone model
 * replaces the box (see docs/decisions/0002-procedural-3d-model.md).
 */
export default function DroneViewer() {
  return (
    <div className="drone-viewer" aria-label="3D view of an FPV drone" role="img">
      <Canvas camera={{ position: [3, 2, 3], fov: 45 }} data-testid="drone-canvas">
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <mesh>
          <boxGeometry args={[1, 0.2, 1]} />
          <meshStandardMaterial color="#444" />
        </mesh>
        <OrbitControls makeDefault enablePan={false} />
      </Canvas>
    </div>
  );
}
