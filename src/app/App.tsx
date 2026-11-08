import { lazy, Suspense } from 'react';

// The 3D viewer pulls in three.js, so it is split into its own chunk.
const DroneViewer = lazy(() => import('@/features/drone-viewer/DroneViewer'));

export function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Inside the Quad</h1>
        <p>How an FPV drone works, part by part.</p>
      </header>
      <main className="app-main">
        <Suspense fallback={<p role="status">Loading 3D model…</p>}>
          <DroneViewer />
        </Suspense>
      </main>
    </div>
  );
}
