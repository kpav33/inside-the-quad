import type { Plugin } from 'vite';

export interface Notice {
  name: string;
  version: string;
  license: string;
  text: string;
}

export function packageRoot(id: string): string | null;
export function collectNotices(
  ids: readonly string[],
  fs: { read: (path: string) => string; exists: (path: string) => boolean },
): Notice[];
export function formatNotices(notices: readonly Notice[]): string;
export function thirdPartyNotices(): Plugin;
