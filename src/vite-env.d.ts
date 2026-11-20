/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** `true` turns Check a build on (see src/shared/features.ts). */
  readonly VITE_FEATURE_CHECKER?: string;
}
