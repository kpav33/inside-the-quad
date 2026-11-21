import { lazy } from 'react';

// The viewer pulls in three.js, so it lives in its own chunk, downloaded the first time a sheet
// draws the drone. A gear sheet draws its gear flat, so opening one directly never downloads it.
// A failed download reaches the viewer's error boundary, which shows the fallback.
export const DroneViewer = lazy(() => import('./DroneViewer'));
