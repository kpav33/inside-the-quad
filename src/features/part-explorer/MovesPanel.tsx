import { useRef } from 'react';

import { MOVES } from '@/content/moves';
import { PART_LABELS, UI } from '@/content/ui';
import { type Flight, type FlightReadout, useFlightReadout } from '@/features/flight';
import { MOVE_STEP_IDS, MOVES_SHEET } from '@/shared/domain/moves';
import { chapterCount, sheetNumber } from '@/shared/domain/sheets';
import { type Page, PartLink } from '@/shared/routing';

import { ChapterSwitcher } from './ChapterSwitcher';
import { LESSON_PANEL_ID, MOVES_TITLE_ID } from './ids';
import { SheetFooter } from './SheetFooter';
import { TitleBlock } from './TitleBlock';
import { useStepScroll } from './useStepScroll';

export interface MovesPanelProps {
  /** The drone on the drawing, or null while it is being set up. */
  flight: Flight | null;
  /** The current step, from 0. */
  step: number;
  read: boolean;
  onStep: (step: number) => void;
  /** Plays the current step's demo again. */
  onShowMe: () => void;
  onClose: () => void;
  onToggleRead: () => void;
  /** Called before a link in the sheet opens another sheet (null: the overview). */
  onFollowLink?: (page: Page) => void;
}

const t = UI.moves;
const AXES = ['roll', 'pitch', 'yaw'] as const;

/** The gyro loop step's comparison: the rotation asked for and the rotation measured, per axis. */
function Compare({ readout }: { readout: FlightReadout }) {
  return (
    <table className="moves-compare">
      <caption>{t.compare.caption}</caption>
      <thead>
        <tr>
          <th scope="col">{t.compare.axis}</th>
          <th scope="col">{t.compare.wanted}</th>
          <th scope="col">{t.compare.measured}</th>
        </tr>
      </thead>
      <tbody>
        {AXES.map((axis) => (
          <tr key={axis}>
            <th scope="row">{t.compare.axes[axis]}</th>
            <td>{t.compare.rate(readout.wanted[axis])}</td>
            <td>{t.compare.rate(readout.measured[axis])}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * The moves sheet: its title block, the step controls (with Show me, Gust and Level), the five
 * steps with the current one marked, then the way on. The drawing beside it flies the drone.
 */
export function MovesPanel({
  flight,
  step,
  read,
  onStep,
  onShowMe,
  onClose,
  onToggleRead,
  onFollowLink,
}: MovesPanelProps) {
  const list = useRef<HTMLOListElement>(null);
  const controls = useRef<HTMLDivElement>(null);
  useStepScroll(list, controls, MOVES_SHEET, step);
  const readout = useFlightReadout(flight);
  const last = MOVE_STEP_IDS.length - 1;
  const currentId = MOVE_STEP_IDS[step];
  const current = currentId ? MOVES.steps[currentId] : undefined;

  return (
    <section id={LESSON_PANEL_ID} className="lesson-panel" aria-labelledby={MOVES_TITLE_ID}>
      <header className="lesson-panel-header">
        <h2 id={MOVES_TITLE_ID} tabIndex={-1}>
          {MOVES.title}
        </h2>
        <button type="button" className="button-outline" onClick={onClose}>
          {t.close}
        </button>
      </header>

      <TitleBlock
        chapter={UI.chapters.paths}
        sheet={UI.titleBlock.sheetOf(sheetNumber(MOVES_SHEET), chapterCount(MOVES_SHEET))}
        specs={MOVES.facts.map((fact) => ({ ...fact, wraps: true }))}
      />

      <ChapterSwitcher open={MOVES_SHEET} onFollowLink={onFollowLink} />

      <p className="lesson-lead path-lead">{MOVES.lead}</p>

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
        <button type="button" className="button-outline" onClick={onShowMe}>
          {t.showMe}
        </button>
        <button type="button" className="button-outline" onClick={() => flight?.gust()}>
          {t.gust}
        </button>
        <button type="button" className="button-outline" onClick={() => flight?.level()}>
          {t.level}
        </button>
      </div>

      <ol ref={list} className="path-stops" aria-label={t.stepsLabel}>
        {MOVE_STEP_IDS.map((id, index) => {
          const item = MOVES.steps[id];
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
                <p className="path-stop-text">{item.text}</p>
                {id === 'gyro' && index === step && readout && <Compare readout={readout} />}
                {item.lessons.length > 0 && (
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
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <p className="visually-hidden" aria-live="polite" data-testid="moves-announcer">
        {current ? t.stepAnnounce(step + 1, MOVE_STEP_IDS.length, current.name, current.text) : ''}
      </p>

      <SheetFooter
        sheet={MOVES_SHEET}
        read={read}
        onToggleRead={onToggleRead}
        onFollowLink={onFollowLink}
      />
    </section>
  );
}
