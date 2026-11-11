import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
  // Routing reads the address, so each test starts on the overview.
  window.history.replaceState(null, '', '/');
});
