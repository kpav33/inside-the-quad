import { useRef } from 'react';

import type { PathContent, PathStop } from '@/content/paths';
import { PART_LABELS, UI } from '@/content/ui';
import { chapterCount, sheetNumber } from '@/shared/domain/sheets';
import { type Page, PartLink } from '@/shared/routing';

import { ChapterSwitcher } from './ChapterSwitcher';
import { LESSON_PANEL_ID, pathTitleId } from './ids';
import { SheetFooter } from './SheetFooter';
import { TitleBlock } from './TitleBlock';
import { useStepScroll } from './useStepScroll';

export interface PathPanelProps {
  path: PathContent;
  /** The current stop, from 0. */
  step: number;
  playing: boolean;
  read: boolean;
  onStep: (step: number) => void;
  onPlay: () => void;
  onStop: () => void;
  onClose: () => void;
  onToggleRead: () => void;
  /** Called before a link in the sheet opens another sheet (null: the overview). */
  onFollowLink?: (page: Page) => void;
}

/** Under a stop's text: its lesson (or lessons), or for an off-drone end, the intro. */
function StopLessons({
  stop,
  onFollowLink,
}: {
  stop: PathStop;
  onFollowLink?: ((page: Page) => void) | undefined;
}) {
  const t = UI.paths;
  if (stop.end) {
    return (
      <p className="path-stop-lessons">
        {t.endMoreLabel}{' '}
        <PartLink to="intro" className="lesson-link" onFollow={onFollowLink}>
          {UI.intro.link}
        </PartLink>
      </p>
    );
  }
  return (
    <p className="path-stop-lessons">
      {stop.parts.length > 1 ? t.lessonsLabel : t.lessonLabel}{' '}
      {stop.parts.map((part, i) => (
        <span key={part}>
          {i > 0 && ' · '}
          <PartLink to={part} className="lesson-link" onFollow={onFollowLink}>
            {PART_LABELS[part]}
          </PartLink>
        </span>
      ))}
    </p>
  );
}

/**
 * A path's drawing sheet: its title block, a switcher between the three paths, the numbered stops
 * with the current one marked, step controls, then the way on. The drawing beside it follows the
 * current stop.
 */
export function PathPanel({
  path,
  step,
  playing,
  read,
  onStep,
  onPlay,
  onStop,
  onClose,
  onToggleRead,
  onFollowLink,
}: PathPanelProps) {
  const t = UI.paths;
  const titleId = pathTitleId(path.id);
  const list = useRef<HTMLOListElement>(null);
  const controls = useRef<HTMLDivElement>(null);
  useStepScroll(list, controls, path.id, step);
  const { stops } = path;
  const current = stops[step];
  const last = stops.length - 1;

  return (
    <section id={LESSON_PANEL_ID} className="lesson-panel" aria-labelledby={titleId}>
      <header className="lesson-panel-header">
        <h2 id={titleId} tabIndex={-1}>
          {path.title}
        </h2>
        <button type="button" className="button-outline" onClick={onClose}>
          {t.close}
        </button>
      </header>

      <TitleBlock
        chapter={UI.chapters.paths}
        sheet={UI.titleBlock.sheetOf(sheetNumber(path.id), chapterCount(path.id))}
        specs={[
          { label: t.from, value: path.from, wraps: true },
          { label: t.to, value: path.to, wraps: true },
          { label: t.carries, value: path.carries, wraps: true },
        ]}
      />

      <ChapterSwitcher open={path.id} onFollowLink={onFollowLink} />

      <p className="lesson-lead path-lead">{path.lead}</p>

      <div ref={controls} className="path-controls">
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
        {playing ? (
          <button type="button" className="button-outline" onClick={onStop}>
            {t.stop}
          </button>
        ) : (
          <button type="button" className="button-outline" onClick={onPlay}>
            {t.play}
          </button>
        )}
      </div>

      <ol ref={list} className="path-stops" aria-label={t.stopsLabel}>
        {stops.map((stop, index) => (
          <li
            key={index}
            className="path-stop"
            aria-current={index === step ? 'step' : undefined}
            data-state={index === step ? 'current' : index < step ? 'passed' : 'ahead'}
          >
            <span className="path-stop-number" aria-hidden="true">
              {index + 1}
            </span>
            <div className="path-stop-body">
              {/* The name picks this stop, like the step buttons; the lesson is the link below. */}
              <button
                type="button"
                className="path-stop-name"
                onClick={() => {
                  onStep(index);
                }}
              >
                {stop.name}
              </button>
              <p className="path-stop-text">{stop.text}</p>
              <StopLessons stop={stop} onFollowLink={onFollowLink} />
            </div>
          </li>
        ))}
      </ol>

      <p className="visually-hidden" aria-live="polite" data-testid="path-announcer">
        {current ? t.stepAnnounce(step + 1, stops.length, current.name, current.text) : ''}
      </p>

      <SheetFooter
        sheet={path.id}
        read={read}
        onToggleRead={onToggleRead}
        onFollowLink={onFollowLink}
      />
    </section>
  );
}
