import { useCallback, useEffect, useState } from 'react';

/** Where this browser remembers that the intro is read. Versioned, like the parts key. */
export const INTRO_READ_KEY = 'inside-the-quad.intro-read.v1';

// Storage can throw (private windows, blocked site data). The flag then lives only in memory.
function load(): boolean {
  try {
    return window.localStorage.getItem(INTRO_READ_KEY) === '1';
  } catch {
    return false;
  }
}

function save(read: boolean) {
  try {
    if (read) window.localStorage.setItem(INTRO_READ_KEY, '1');
    else window.localStorage.removeItem(INTRO_READ_KEY);
  } catch {
    // Not saved; the in-memory state still works for this visit.
  }
}

export interface IntroRead {
  read: boolean;
  /** Marks the intro read, or unread if it already was. */
  toggle: () => void;
  clear: () => void;
}

/** Whether the learner has marked the intro as read, kept in this browser only. */
export function useIntroRead(): IntroRead {
  const [read, setRead] = useState(load);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === INTRO_READ_KEY || event.key === null) setRead(load());
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const toggle = useCallback(() => {
    setRead((current) => {
      save(!current);
      return !current;
    });
  }, []);

  const clear = useCallback(() => {
    save(false);
    setRead(false);
  }, []);

  return { read, toggle, clear };
}
