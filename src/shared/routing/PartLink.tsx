import type { ReactNode } from 'react';

import type { PartId } from '@/shared/domain/parts';

import { isPlainLeftClick, navigateTo } from './history';
import { OVERVIEW_PATH, partPath } from './routes';

export interface PartLinkProps {
  /** The part whose lesson to open, or null for the overview. */
  to: PartId | null;
  className?: string;
  children: ReactNode;
}

/** A real link to a part's lesson: handled in the app on a plain click, by the browser otherwise. */
export function PartLink({ to, className, children }: PartLinkProps) {
  const href = to ? partPath(to) : OVERVIEW_PATH;
  return (
    <a
      href={href}
      className={className}
      onClick={(event) => {
        if (!isPlainLeftClick(event)) return;
        event.preventDefault();
        navigateTo(href);
      }}
    >
      {children}
    </a>
  );
}
