import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ErrorBoundary } from './ErrorBoundary';

function Broken(): never {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  it('renders children when nothing throws', () => {
    render(
      <ErrorBoundary fallback={<p>fallback</p>}>
        <p>content</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('renders the fallback and reports the error when a child throws', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const onError = vi.fn();

    render(
      <ErrorBoundary fallback={<p>fallback</p>} onError={onError}>
        <Broken />
      </ErrorBoundary>,
    );

    expect(screen.getByText('fallback')).toBeInTheDocument();
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'boom' }),
      expect.anything(),
    );
  });
});
