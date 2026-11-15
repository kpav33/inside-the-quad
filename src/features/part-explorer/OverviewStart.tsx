import { useEffect, useRef } from 'react';

import { sheetName, UI } from '@/content/ui';
import { type ReadableSheet, startState } from '@/features/progress';
import type { PartId } from '@/shared/domain/parts';
import { NUMBERED_SHEETS, sheetNumber } from '@/shared/domain/sheets';
import { type Page, PartLink } from '@/shared/routing';
import { ArrowIcon } from '@/shared/ui/icons';

import { OVERVIEW_FOCUS_ID } from './ids';

export interface OverviewStartProps {
  read: ReadonlySet<ReadableSheet>;
  introRead: boolean;
  /** Called before a link here opens its sheet. */
  onFollowLink: (page: Page) => void;
  /** Clears the parts read and the intro flag. */
  onClear: () => void;
}

const FIRST: PartId = 'frame';

/**
 * Where to start on the overview: the intro for a newcomer, then sheet 1, the first unread sheet,
 * or all done. The intro stays one link away in every state.
 */
export function OverviewStart({ read, introRead, onFollowLink, onClear }: OverviewStartProps) {
  const state = startState(read, introRead);

  // Clearing removes the Clear button, so focus moves to the start link instead of the page.
  const refocus = useRef(false);
  useEffect(() => {
    if (!refocus.current) return;
    refocus.current = false;
    document.getElementById(OVERVIEW_FOCUS_ID)?.focus();
  }, [read, introRead]);

  const t = UI.overview;
  const startSheet1 = t.start(sheetName(FIRST));

  if (state.kind === 'intro') {
    return (
      <div className="overview-start">
        <p className="part-explorer-hint">{UI.explorer.hint}</p>
        <p className="overview-new">{t.newHere}</p>
        <PartLink
          id={OVERVIEW_FOCUS_ID}
          to="intro"
          className="button-outline overview-start-link"
          onFollow={onFollowLink}
        >
          {UI.intro.link}
          <ArrowIcon />
        </PartLink>
        <p className="overview-basics">
          {t.knowBasics}{' '}
          <PartLink to={FIRST} className="lesson-link" onFollow={onFollowLink}>
            {startSheet1}
          </PartLink>
        </p>
      </div>
    );
  }

  const target = state.kind === 'continue' ? state.sheet : FIRST;
  const label =
    state.kind === 'start'
      ? startSheet1
      : state.kind === 'continue'
        ? t.continue(sheetNumber(target), sheetName(target))
        : t.startAgain;

  return (
    <div className="overview-start">
      <p className="part-explorer-hint">
        {state.kind === 'done' ? t.allRead(NUMBERED_SHEETS.length) : UI.explorer.hint}
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
      <p className="overview-progress">
        {read.size > 0 && <span>{t.count(read.size, NUMBERED_SHEETS.length)}</span>}
        <PartLink to="intro" className="overview-quiet-link" onFollow={onFollowLink}>
          {UI.intro.link}
        </PartLink>
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
    </div>
  );
}
