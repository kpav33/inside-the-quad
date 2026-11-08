import { Suspense } from 'react';

import { DroneViewer } from '@/features/drone-viewer';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';

const viewerFallback = (
  <p role="alert">
    The 3D model couldn’t be loaded. Your browser may not support WebGL, or the page needs a reload.
  </p>
);

export function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Inside the Quad</h1>
        <p>How an FPV drone works, part by part.</p>
      </header>
      <main className="app-main">
        <ErrorBoundary fallback={viewerFallback}>
          <Suspense fallback={<p role="status">Loading 3D model…</p>}>
            <DroneViewer />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}
