import { lazy } from 'react';

// The viewer pulls in three.js, so it is split into its own chunk and loaded on demand.
export const DroneViewer = lazy(() => import('./DroneViewer'));
