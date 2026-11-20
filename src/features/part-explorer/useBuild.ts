import { useCallback, useState } from 'react';

import { type Build, REFERENCE_BUILD } from '@/shared/domain/build-check';
import { buildSearch, parseBuild, replaceSearch, useSearch } from '@/shared/routing';

export interface BuildSheet {
  build: Build;
  set: (change: Partial<Build>) => void;
  reset: () => void;
}

/**
 * The build on the Check a build sheet, kept in the address so a reload or a shared link keeps
 * it. Changes replace the address (Back leaves the sheet, it doesn't undo picks). A KV that isn't
 * entered stays empty on the sheet but is left out of the address.
 */
export function useBuild(open = true): BuildSheet {
  const search = useSearch();
  // The address at which the KV was cleared; the KV reads as not entered while it is unchanged.
  const [kvClearedAt, setKvClearedAt] = useState<string | null>(null);
  // Leaving the sheet forgets a cleared KV: the sheet opens again on what the address says.
  if (!open && kvClearedAt !== null) setKvClearedAt(null);
  const parsed = parseBuild(search);
  const build = kvClearedAt === search ? { ...parsed, kv: null } : parsed;

  const set = useCallback(
    (change: Partial<Build>) => {
      const next = { ...build, ...change };
      const nextSearch = buildSearch(next);
      setKvClearedAt(next.kv === null ? nextSearch : null);
      replaceSearch(nextSearch);
    },
    [build],
  );
  const reset = useCallback(() => {
    setKvClearedAt(null);
    replaceSearch(buildSearch(REFERENCE_BUILD));
  }, []);

  return { build, set, reset };
}
