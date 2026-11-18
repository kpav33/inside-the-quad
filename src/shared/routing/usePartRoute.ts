import { useCallback, useEffect, useSyncExternalStore } from 'react';

import type { GearId } from '@/shared/domain/gear';
import type { PartId } from '@/shared/domain/parts';
import type { PathId } from '@/shared/domain/paths';
import type { SteppedSheet } from '@/shared/domain/sheets';

import { getSnapshot, type NavigationCause, navigateTo, replacePath, subscribe } from './history';
import { OVERVIEW_PATH, type Page, pagePath, parseRoute, partPath, steppedPath } from './routes';

export type PageRoute =
  | { kind: 'overview' }
  | { kind: 'intro' }
  | { kind: 'part'; part: PartId }
  | { kind: 'path'; path: PathId; step: number }
  | { kind: 'moves'; step: number }
  | { kind: 'what-if'; step: number }
  | { kind: 'gear'; gear: GearId };

export interface PartRoute {
  route: PageRoute;
  /** The name of a part the address asked for but the app doesn't have; null otherwise. */
  unknownSlug: string | null;
  cause: NavigationCause;
  /** Opens a sheet, or the overview for null, adding one history entry. */
  navigate: (page: Page) => void;
  /** Moves a stepped sheet (a path, or how a quad moves) to a step (from 1) in place, adding no
   * history entry. */
  replaceStep: (sheet: SteppedSheet, step: number) => void;
}

/** The page the address shows. An unknown address is replaced by the overview. */
export function usePartRoute(): PartRoute {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot);
  const parsed = parseRoute(snapshot.path);

  const unknown = parsed.kind === 'unknown' ? parsed.slug : null;
  // One address per page: `/parts/vtx/` becomes `/parts/vtx`, so choosing the open part again
  // finds the page already there and adds no history entry.
  const canonical =
    parsed.kind === 'part'
      ? partPath(parsed.part)
      : parsed.kind === 'path'
        ? pagePath(parsed.path, parsed.step)
        : parsed.kind === 'moves' || parsed.kind === 'what-if'
          ? pagePath(parsed.kind, parsed.step)
          : parsed.kind === 'gear'
            ? pagePath(parsed.gear)
            : parsed.kind === 'intro'
              ? pagePath('intro')
              : OVERVIEW_PATH;
  useEffect(() => {
    if (unknown !== null) replacePath(OVERVIEW_PATH, unknown);
    else if (snapshot.path !== canonical) replacePath(canonical);
  }, [unknown, canonical, snapshot.path]);

  const navigate = useCallback((page: Page) => {
    navigateTo(pagePath(page));
  }, []);
  const replaceStep = useCallback((sheet: SteppedSheet, step: number) => {
    const next = steppedPath(sheet, step);
    if (window.location.pathname !== next) replacePath(next);
  }, []);

  return {
    route: parsed.kind === 'unknown' ? { kind: 'overview' } : parsed,
    unknownSlug: unknown ?? snapshot.replacedSlug,
    cause: snapshot.cause,
    navigate,
    replaceStep,
  };
}
