/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** `true` turns Check a build on (see src/shared/features.ts). */
  readonly VITE_FEATURE_CHECKER?: string;
  /** The site's address, for link previews; read at build time (scripts/share-tags.mjs). */
  readonly VITE_SITE_URL?: string;
}
