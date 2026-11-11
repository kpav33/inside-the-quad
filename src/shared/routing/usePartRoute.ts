import { useCallback, useEffect, useSyncExternalStore } from 'react';

import type { PartId } from '@/shared/domain/parts';

import { getSnapshot, type NavigationCause, navigateTo, replacePath, subscribe } from './history';
import { OVERVIEW_PATH, parseRoute, partPath } from './routes';

export type PageRoute = { kind: 'overview' } | { kind: 'part'; part: PartId };

export interface PartRoute {
  route: PageRoute;
  /** The name of a part the address asked for but the app doesn't have; null otherwise. */
  unknownSlug: string | null;
  cause: NavigationCause;
  /** Opens a part's lesson, or the overview for null, adding one history entry. */
  navigate: (part: PartId | null) => void;
}

/** The page the address shows. An unknown address is replaced by the overview. */
export function usePartRoute(): PartRoute {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot);
  const parsed = parseRoute(snapshot.path);

  const unknown = parsed.kind === 'unknown' ? parsed.slug : null;
  // One address per page: `/parts/vtx/` becomes `/parts/vtx`, so choosing the open part again
  // finds the page already there and adds no history entry.
  const canonical = parsed.kind === 'part' ? partPath(parsed.part) : OVERVIEW_PATH;
  useEffect(() => {
    if (unknown !== null) replacePath(OVERVIEW_PATH, unknown);
    else if (snapshot.path !== canonical) replacePath(canonical);
  }, [unknown, canonical, snapshot.path]);

  const navigate = useCallback((part: PartId | null) => {
    navigateTo(part ? partPath(part) : OVERVIEW_PATH);
  }, []);

  return {
    route: parsed.kind === 'part' ? parsed : { kind: 'overview' },
    unknownSlug: unknown ?? snapshot.replacedSlug,
    cause: snapshot.cause,
    navigate,
  };
}
