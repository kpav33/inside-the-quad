import { useEffect, useRef } from 'react';

import { PART_LABELS, UI } from '@/content/ui';
import { startState } from '@/features/progress';
import { PART_IDS, type PartId } from '@/shared/domain/parts';
import { PartLink } from '@/shared/routing';
import { ArrowIcon } from '@/shared/ui/icons';

import { OVERVIEW_FOCUS_ID } from './ids';

export interface OverviewStartProps {
  read: ReadonlySet<PartId>;
  /** Called before the start link opens its sheet. */
  onFollowLink: (part: PartId | null) => void;
  onClear: () => void;
}

const FIRST: PartId = 'frame';

/** Where to start on the overview: sheet 1, the first unread sheet, or all done. */
export function OverviewStart({ read, onFollowLink, onClear }: OverviewStartProps) {
  const state = startState(read);

  // Clearing removes the Clear button, so focus moves to the start link instead of the page.
  const refocus = useRef(false);
  useEffect(() => {
    if (!refocus.current) return;
    refocus.current = false;
    document.getElementById(OVERVIEW_FOCUS_ID)?.focus();
  }, [read]);

  const t = UI.overview;
  const target = state.kind === 'continue' ? state.part : FIRST;
  const label =
    state.kind === 'start'
      ? t.start(PART_LABELS[FIRST])
      : state.kind === 'continue'
        ? t.continue(PART_IDS.indexOf(target) + 1, PART_LABELS[target])
        : t.startAgain;

  return (
    <div className="overview-start">
      <p className="part-explorer-hint">
        {state.kind === 'done' ? t.allRead(PART_IDS.length) : UI.explorer.hint}
      </p>
      <PartLink
        id={OVERVIEW_FOCUS_ID}
        to={target}
        className="button-outline overview-start-link"
        onFollow={onFollowLink}
      >
        {label}
        <ArrowIcon />
      </PartLink>
      {read.size > 0 && (
        <p className="overview-progress">
          <span>{t.count(read.size, PART_IDS.length)}</span>
          <button
            type="button"
            className="overview-clear"
            onClick={() => {
              refocus.current = true;
              onClear();
            }}
          >
            {t.clear}
          </button>
        </p>
      )}
    </div>
  );
}
