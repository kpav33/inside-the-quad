import { useEffect, useState } from 'react';

/**
 * Whether an element can be seen: at least partly inside the viewport, on a page that isn't hidden
 * (another tab, a minimised window). Animations use it to stop while nobody can see them, which
 * saves a phone's processor and battery. Where IntersectionObserver is missing, it counts as seen.
 */
export function useOnScreen(element: Element | null): boolean {
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(() => document.visibilityState !== 'hidden');

  useEffect(() => {
    if (!element || typeof IntersectionObserver !== 'function') return;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries.at(-1);
      if (entry) setInView(entry.isIntersecting);
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [element]);

  useEffect(() => {
    const onChange = () => {
      setPageVisible(document.visibilityState !== 'hidden');
    };
    document.addEventListener('visibilitychange', onChange);
    return () => {
      document.removeEventListener('visibilitychange', onChange);
    };
  }, []);

  return inView && pageVisible;
}
