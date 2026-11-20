/** How the address last changed: the page loaded with it, the app pushed it, or Back/Forward. */
export type NavigationCause = 'load' | 'push' | 'pop';

export interface HistorySnapshot {
  path: string;
  /** The query string, `?…` or `''`; only Check a build keeps its state there. */
  search: string;
  cause: NavigationCause;
  /** A path the app replaced because it didn't know it, kept until the next navigation. */
  replacedSlug: string | null;
}

const listeners = new Set<() => void>();
let snapshot: HistorySnapshot | null = null;

function update(next: HistorySnapshot) {
  snapshot = next;
  listeners.forEach((listener) => {
    listener();
  });
}

const onPopState = () => {
  update({
    path: window.location.pathname,
    search: window.location.search,
    cause: 'pop',
    replacedSlug: null,
  });
};

/** Subscribes to the app's own navigations and to Back/Forward. */
export function subscribe(listener: () => void): () => void {
  if (listeners.size === 0) window.addEventListener('popstate', onPopState);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener('popstate', onPopState);
  };
}

/** The current address. The same object until something changes, as useSyncExternalStore needs. */
export function getSnapshot(): HistorySnapshot {
  const { pathname: path, search } = window.location;
  // The address can change without this module (the first read, or a test resetting it).
  if (snapshot?.path !== path || snapshot.search !== search) {
    snapshot = { path, search, cause: 'load', replacedSlug: null };
  }
  return snapshot;
}

/** Pushes a history entry for `path`, unless the page is already there. */
export function navigateTo(path: string): void {
  if (window.location.pathname === path) return;
  window.history.pushState(null, '', path);
  update({ path, search: '', cause: 'push', replacedSlug: null });
}

/**
 * Replaces the current address without a new history entry: an unknown address (remembering its
 * slug for the notice) or another spelling of a known one. `search` is the query to keep.
 */
export function replacePath(path: string, replacedSlug: string | null = null, search = ''): void {
  const { cause } = getSnapshot();
  window.history.replaceState(null, '', path + search);
  update({ path, search, cause, replacedSlug });
}

/** Replaces the query string on the current page, adding no history entry. */
export function replaceSearch(search: string): void {
  if (window.location.search === search) return;
  const { path, cause, replacedSlug } = getSnapshot();
  window.history.replaceState(null, '', path + search);
  update({ path, search, cause, replacedSlug });
}

/** True for a click the app should handle; modified and non-primary clicks belong to the browser. */
export function isPlainLeftClick(event: {
  button: number;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}): boolean {
  return event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey;
}
