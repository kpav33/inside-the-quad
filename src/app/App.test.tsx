import { render, screen } from '@testing-library/react';

import { App } from './App';

// WebGL is unavailable in jsdom, so the 3D viewer is replaced with a stub.
vi.mock('@/features/drone-viewer/DroneViewer', () => ({
  default: () => <div data-testid="drone-viewer" />,
}));

describe('App', () => {
  it('renders the app title', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Inside the Quad' })).toBeInTheDocument();
  });

  it('loads the drone viewer', async () => {
    render(<App />);
    expect(await screen.findByTestId('drone-viewer')).toBeInTheDocument();
  });
});
