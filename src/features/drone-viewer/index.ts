import { lazy } from 'react';

// The viewer pulls in three.js, so it lives in its own chunk. The download starts as soon as this
// module loads, in parallel with React rendering the page, instead of after the first render.
const viewerModule = import('./DroneViewer');

export const DroneViewer = lazy(() => viewerModule);
