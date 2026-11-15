import { useCallback, useEffect, useState } from 'react';

import {
  parseReadSheets,
  READ_PARTS_KEY,
  type ReadableSheet,
  serializeReadSheets,
} from './progress';

// Storage can throw (private windows, blocked site data). Progress then lives only in memory.
function load(): ReadonlySet<ReadableSheet> {
  try {
    return parseReadSheets(window.localStorage.getItem(READ_PARTS_KEY));
  } catch {
    return new Set();
  }
}

function save(read: ReadonlySet<ReadableSheet>) {
  try {
    window.localStorage.setItem(READ_PARTS_KEY, serializeReadSheets(read));
  } catch {
    // Not saved; the in-memory state still works for this visit.
  }
}

export interface ReadParts {
  read: ReadonlySet<ReadableSheet>;
  /** Marks a sheet read, or unread if it already was. */
  toggle: (sheet: ReadableSheet) => void;
  clear: () => void;
}

/** The part and path sheets the learner has marked as read, kept in this browser only. */
export function useReadParts(): ReadParts {
  const [read, setRead] = useState(load);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === READ_PARTS_KEY || event.key === null) setRead(load());
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const toggle = useCallback((sheet: ReadableSheet) => {
    setRead((current) => {
      const next = new Set(current);
      if (!next.delete(sheet)) next.add(sheet);
      save(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    const next = new Set<ReadableSheet>();
    save(next);
    setRead(next);
  }, []);

  return { read, toggle, clear };
}
