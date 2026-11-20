/**
 * Features that are built but held back from the release. Each is off unless its environment
 * variable is `true` when the app is built (or the tests run): `VITE_FEATURE_CHECKER=true pnpm
 * build`. Off, the app is exactly as it was before the feature: no links, no sheet, and its
 * address is unknown.
 */
export const FEATURES = {
  /** Check a build (section 07): the Plan a build chapter at `/check`. */
  checker: import.meta.env.VITE_FEATURE_CHECKER === 'true',
} as const;
