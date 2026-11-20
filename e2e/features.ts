/**
 * Mirrors src/shared/features.ts for the tests: a feature held back from the release is tested
 * only against a build with it on, e.g. `VITE_FEATURE_CHECKER=true pnpm test:e2e` (the variable
 * reaches both the build and the tests). Use a fresh server: a reused one keeps its old build.
 */
export const CHECKER = process.env.VITE_FEATURE_CHECKER === 'true';
