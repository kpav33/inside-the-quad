import type { ReactNode } from 'react';

import { isPlainLeftClick, navigateTo } from './history';
import { type Page, pagePath } from './routes';

export interface PartLinkProps {
  /** The page to open: the intro, a part's lesson, or null for the overview. */
  to: Page;
  id?: string | undefined;
  className?: string | undefined;
  /** Called on a click the app handles, just before it navigates. */
  onFollow?: ((to: Page) => void) | undefined;
  children: ReactNode;
}

/** A real link to a page: handled in the app on a plain click, by the browser otherwise. */
export function PartLink({ to, id, className, onFollow, children }: PartLinkProps) {
  const href = pagePath(to);
  return (
    <a
      id={id}
      href={href}
      className={className}
      onClick={(event) => {
        if (!isPlainLeftClick(event)) return;
        event.preventDefault();
        onFollow?.(to);
        navigateTo(href);
      }}
    >
      {children}
    </a>
  );
}
