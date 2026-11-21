/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { thirdPartyNotices } from './scripts/third-party-notices.mjs';

export default defineConfig({
  // The notices file ships the bundled packages' and fonts' licences (release review I2).
  plugins: [react(), thirdPartyNotices()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  // The analytics e2e reaches the preview under a name that isn't local (e2e/analytics.spec.ts).
  preview: { allowedHosts: ['itq.test'] },
  build: {
    // three.js alone is ~900 kB minified. It lives in the lazily loaded viewer
    // chunk, so the initial page stays small; keep the warning for anything else.
    chunkSizeWarningLimit: 1000,
  },
  test: {
    environment: 'jsdom',
    restoreMocks: true,
    setupFiles: ['./src/test/setup.ts'],
    // Features held back from the release are on in tests; checker-off.test.tsx covers them off.
    env: { VITE_FEATURE_CHECKER: 'true' },
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.mjs'],
    // Only tokens.css is processed, so its test can read the raw file.
    css: { include: [/tokens\.css/] },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/main.tsx', 'src/vite-env.d.ts'],
    },
  },
});
