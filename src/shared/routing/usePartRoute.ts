import { useCallback, useEffect, useSyncExternalStore } from 'react';

import type { PartId } from '@/shared/domain/parts';
import type { PathId } from '@/shared/domain/paths';

import { getSnapshot, type NavigationCause, navigateTo, replacePath, subscribe } from './history';
import { OVERVIEW_PATH, type Page, pagePath, parseRoute, partPath, pathSheetPath } from './routes';

export type PageRoute =
  | { kind: 'overview' }
  | { kind: 'intro' }
  | { kind: 'part'; part: PartId }
  | { kind: 'path'; path: PathId; step: number };

export interface PartRoute {
  route: PageRoute;
  /** The name of a part the address asked for but the app doesn't have; null otherwise. */
  unknownSlug: string | null;
  cause: NavigationCause;
  /** Opens a sheet, or the overview for null, adding one history entry. */
  navigate: (page: Page) => void;
  /** Moves a path sheet to a step (from 1) in place, adding no history entry. */
  replaceStep: (path: PathId, step: number) => void;
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
  const replaceStep = useCallback((path: PathId, step: number) => {
    const next = pathSheetPath(path, step);
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
