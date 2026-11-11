import { useCallback, useEffect, useState } from 'react';

import type { PartId } from '@/shared/domain/parts';

import { parseReadParts, READ_PARTS_KEY, serializeReadParts } from './progress';

// Storage can throw (private windows, blocked site data). Progress then lives only in memory.
function load(): ReadonlySet<PartId> {
  try {
    return parseReadParts(window.localStorage.getItem(READ_PARTS_KEY));
  } catch {
    return new Set();
  }
}

function save(read: ReadonlySet<PartId>) {
  try {
    window.localStorage.setItem(READ_PARTS_KEY, serializeReadParts(read));
  } catch {
    // Not saved; the in-memory state still works for this visit.
  }
}

export interface ReadParts {
  read: ReadonlySet<PartId>;
  /** Marks a part read, or unread if it already was. */
  toggle: (part: PartId) => void;
  clear: () => void;
}

/** The parts the learner has marked as read, kept in this browser only. */
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

  const toggle = useCallback((part: PartId) => {
    setRead((current) => {
      const next = new Set(current);
      if (!next.delete(part)) next.add(part);
      save(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    const next = new Set<PartId>();
    save(next);
    setRead(next);
  }, []);

  return { read, toggle, clear };
}
