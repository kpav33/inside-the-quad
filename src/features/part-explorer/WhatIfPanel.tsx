import { useRef, useSyncExternalStore } from 'react';

import { PART_LABELS, UI } from '@/content/ui';
import { WHAT_IF } from '@/content/what-if';
import { type Faults, type Flight, NO_FAULTS } from '@/features/flight';
import { chapterCount, sheetNumber } from '@/shared/domain/sheets';
import { WHAT_IF_SHEET, WHAT_IF_STEP_IDS, type WhatIfStepId } from '@/shared/domain/what-if';
import { type Page, PartLink } from '@/shared/routing';

import { ChapterSwitcher } from './ChapterSwitcher';
import { LESSON_PANEL_ID, WHAT_IF_TITLE_ID } from './ids';
import { SheetFooter } from './SheetFooter';
import { TitleBlock } from './TitleBlock';
import { useStepScroll } from './useStepScroll';

export interface WhatIfPanelProps {
  /** The drone on the drawing, or null while it is being set up. */
  flight: Flight | null;
  /** The current step, from 0. */
  step: number;
  read: boolean;
  onStep: (step: number) => void;
  onClose: () => void;
  onToggleRead: () => void;
  /** Called before a link in the sheet opens another sheet (null: the overview). */
  onFollowLink?: (page: Page) => void;
}

const t = UI.whatIf;

/** What Try it turns on, per step; the battery step has its own switch instead. */
const TRY: Record<Exclude<WhatIfStepId, 'battery'>, Partial<Faults>> = {
  failsafe: { linkLost: true },
  prop: { wrongProp: true },
  vtx: { vtxNoAntenna: true },
};

/** The flight's faults, re-read whenever the flight wakes (Try it, the battery switch, Reset). */
function useFaults(flight: Flight | null): Faults {
  return useSyncExternalStore(
    (listener) => (flight ? flight.onWake(listener) : () => undefined),
    () => flight?.faults ?? NO_FAULTS,
  );
}

/**
 * The what-if sheet: title block, the chapter switcher, the step controls (Try it, or the battery
 * switch; Reset), the four mistakes with the current one marked, then the way on. The drawing
 * beside it acts the current mistake out while the sticks stay live.
 */
export function WhatIfPanel({
  flight,
  step,
  read,
  onStep,
  onClose,
  onToggleRead,
  onFollowLink,
}: WhatIfPanelProps) {
  const list = useRef<HTMLOListElement>(null);
  const controls = useRef<HTMLDivElement>(null);
  useStepScroll(list, controls, WHAT_IF_SHEET, step);
  const faults = useFaults(flight);
  const last = WHAT_IF_STEP_IDS.length - 1;
  const currentId = WHAT_IF_STEP_IDS[step];
  const current = currentId ? WHAT_IF.steps[currentId] : undefined;
  const tried = currentId && currentId !== 'battery' ? TRY[currentId] : null;
  const triedOn = tried
    ? (Object.keys(tried) as (keyof Faults)[]).every((key) => faults[key] === tried[key])
    : false;

  return (
    <section id={LESSON_PANEL_ID} className="lesson-panel" aria-labelledby={WHAT_IF_TITLE_ID}>
      <header className="lesson-panel-header">
        <h2 id={WHAT_IF_TITLE_ID} tabIndex={-1}>
          {WHAT_IF.title}
        </h2>
        <button type="button" className="button-outline" onClick={onClose}>
          {t.close}
        </button>
      </header>

      <TitleBlock
        chapter={UI.chapters.paths}
        sheet={UI.titleBlock.sheetOf(sheetNumber(WHAT_IF_SHEET), chapterCount(WHAT_IF_SHEET))}
        specs={WHAT_IF.facts.map((fact) => ({ ...fact, wraps: true }))}
      />

      <ChapterSwitcher open={WHAT_IF_SHEET} onFollowLink={onFollowLink} />

      <p className="lesson-lead path-lead">{WHAT_IF.lead}</p>

      <div ref={controls} className="path-controls" role="group" aria-label={t.controlsLabel}>
        <button
          type="button"
          className="button-outline"
          disabled={step === 0}
          onClick={() => {
            onStep(step - 1);
          }}
        >
          {t.previousStep}
        </button>
        <button
          type="button"
          className="button-outline"
          disabled={step === last}
          onClick={() => {
            onStep(step + 1);
          }}
        >
          {t.nextStep}
        </button>
        {tried ? (
          <button
            type="button"
            className="button-outline"
            disabled={triedOn}
            onClick={() => flight?.setFaults(tried)}
          >
            {t.tryIt}
          </button>
        ) : (
          <div className="battery-switch" role="group" aria-label={t.batteryLabel}>
            {([6, 4] as const).map((cells) => (
              <button
                key={cells}
                type="button"
                className="battery-switch-option"
                aria-pressed={faults.cells === cells}
                onClick={() => flight?.setFaults({ cells })}
              >
                {t.cells(cells)}
              </button>
            ))}
          </div>
        )}
        <button type="button" className="button-outline" onClick={() => flight?.reset()}>
          {t.reset}
        </button>
      </div>

      <ol ref={list} className="path-stops" aria-label={t.stepsLabel}>
        {WHAT_IF_STEP_IDS.map((id, index) => {
          const item = WHAT_IF.steps[id];
          return (
            <li
              key={id}
              className="path-stop"
              aria-current={index === step ? 'step' : undefined}
              data-state={index === step ? 'current' : index < step ? 'passed' : 'ahead'}
            >
              <span className="path-stop-number" aria-hidden="true">
                {index + 1}
              </span>
              <div className="path-stop-body">
                <button
                  type="button"
                  className="path-stop-name"
                  onClick={() => {
                    onStep(index);
                  }}
                >
                  {item.name}
                </button>
                <dl className="what-if-parts">
                  <dt>{t.happens}</dt>
                  <dd className="path-stop-text">{item.happens}</dd>
                  <dt>{t.why}</dt>
                  <dd className="path-stop-text">{item.why}</dd>
                  <dt>{t.avoid}</dt>
                  <dd className="path-stop-text">{item.avoid}</dd>
                </dl>
                <p className="path-stop-lessons">
                  {t.lessonLabel}{' '}
                  {item.lessons.map((part, i) => (
                    <span key={part}>
                      {i > 0 && ' · '}
                      <PartLink to={part} className="lesson-link" onFollow={onFollowLink}>
                        {PART_LABELS[part]}
                      </PartLink>
                    </span>
                  ))}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <p className="visually-hidden" aria-live="polite" data-testid="what-if-announcer">
        {current ? t.stepAnnounce(step + 1, WHAT_IF_STEP_IDS.length, current.name) : ''}
      </p>

      <SheetFooter
        sheet={WHAT_IF_SHEET}
        read={read}
        onToggleRead={onToggleRead}
        onFollowLink={onFollowLink}
      />
    </section>
  );
}
