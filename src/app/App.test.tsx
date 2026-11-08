import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { App } from './App';

// WebGL is unavailable in jsdom, so the 3D viewer is replaced with a stub.
const viewerMock = vi.hoisted(() => ({ shouldThrow: false }));

vi.mock('@/features/drone-viewer/DroneViewer', () => ({
  default: function DroneViewerStub() {
    if (viewerMock.shouldThrow) {
      throw new Error('WebGL unavailable');
    }
    return <div data-testid="drone-viewer" />;
  },
}));

describe('App', () => {
  afterEach(() => {
    viewerMock.shouldThrow = false;
  });

  it('renders the app title', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Inside the Quad' })).toBeInTheDocument();
  });

  it('loads the drone viewer', async () => {
    render(<App />);
    expect(await screen.findByTestId('drone-viewer')).toBeInTheDocument();
  });

  it('keeps the page usable when the viewer fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    viewerMock.shouldThrow = true;

    render(<App />);

    expect(await screen.findByRole('alert')).toHaveTextContent('3D model couldn’t be loaded');
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
