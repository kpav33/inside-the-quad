import type { ReactNode } from 'react';

import type { Lesson } from '@/content/lessons';
import { PART_LABELS, UI } from '@/content/ui';
import { REFERENCE_5_INCH } from '@/shared/domain/drone-spec';
import { PART_IDS, type PartId, partNeighbours } from '@/shared/domain/parts';
import { partQuantity } from '@/shared/domain/quantity';
import { PartLink } from '@/shared/routing';
import { ArrowIcon, CheckIcon } from '@/shared/ui/icons';

import { LESSON_PANEL_ID, lessonTitleId } from './ids';
import { TitleBlock } from './TitleBlock';

export interface LessonPanelProps {
  lesson: Lesson;
  /** Whether the learner has marked this lesson as read. */
  read: boolean;
  onClose: () => void;
  onToggleRead: () => void;
  /** Called before a link in the sheet opens another lesson (null: the overview). */
  onFollowLink?: (part: PartId | null) => void;
}

const sheetNumber = (part: PartId) => PART_IDS.indexOf(part) + 1;

/** "Battery · sheet 6": a reference to another sheet; the sheet number never wraps apart. */
function SheetRef({ part }: { part: PartId }) {
  return (
    <>
      {PART_LABELS[part]} <span className="nowrap">{UI.lesson.sheetNumber(sheetNumber(part))}</span>
    </>
  );
}

function Question({ number, children }: { number: number; children: ReactNode }) {
  return (
    <section className="lesson-question">
      <span className="lesson-question-number" data-question-number aria-hidden="true">
        {number}
      </span>
      <div className="lesson-question-body">
        <h3>{UI.lesson.questions[number - 1]}</h3>
        {children}
      </div>
    </section>
  );
}

/** One part's drawing sheet: its name, the title block, the four questions, then the way on. */
export function LessonPanel({
  lesson,
  read,
  onClose,
  onToggleRead,
  onFollowLink,
}: LessonPanelProps) {
  const titleId = lessonTitleId(lesson.partId);
  const columns = UI.lesson.specColumns;
  const { previous, next } = partNeighbours(lesson.partId);

  return (
    <section id={LESSON_PANEL_ID} className="lesson-panel" aria-labelledby={titleId}>
      <header className="lesson-panel-header">
        <h2 id={titleId} tabIndex={-1}>
          {lesson.title}
        </h2>
        <button type="button" className="button-outline" onClick={onClose}>
          {UI.lesson.close}
        </button>
      </header>

      <TitleBlock
        sheet={UI.titleBlock.sheetOf(sheetNumber(lesson.partId), PART_IDS.length)}
        quantity={partQuantity(lesson.partId, REFERENCE_5_INCH)}
        specs={lesson.specs}
      />

      <Question number={1}>
        <p className="lesson-lead">{lesson.whatItDoes}</p>
      </Question>

      <Question number={2}>
        {lesson.howItWorks.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </Question>

      <Question number={3}>
        <table className="spec-grid">
          <thead>
            <tr>
              <th scope="col">{columns.label}</th>
              <th scope="col">{columns.value}</th>
              <th scope="col">{columns.meaning}</th>
            </tr>
          </thead>
          <tbody>
            {lesson.specs.map((row, index) => (
              <tr key={index}>
                <th scope="row">{row.label}</th>
                <td className="spec-grid-value">{row.value}</td>
                <td>{row.meaning}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Question>

      <Question number={4}>
        <ul className="lesson-connections">
          {lesson.connections.map(({ text, partId }, index) => (
            <li key={index}>
              <span>{text}</span>
              {partId && (
                <PartLink
                  to={partId}
                  className="lesson-link lesson-connection-link"
                  onFollow={onFollowLink}
                >
                  <ArrowIcon />
                  <span>
                    <SheetRef part={partId} />
                  </span>
                </PartLink>
              )}
            </li>
          ))}
        </ul>
      </Question>

      <nav className="lesson-footer" aria-label={UI.lesson.footerLabel}>
        <button
          type="button"
          className="button-outline lesson-read"
          aria-pressed={read}
          aria-label={UI.lesson.markRead}
          onClick={onToggleRead}
        >
          {read ? (
            <>
              <CheckIcon />
              {UI.lesson.isRead}
            </>
          ) : (
            UI.lesson.markRead
          )}
        </button>
        <div className="lesson-sheets">
          {previous ? (
            <PartLink to={previous} className="lesson-sheet-link" onFollow={onFollowLink}>
              <span className="lesson-sheet-label">
                <ArrowIcon back />
                {UI.lesson.previous}
                <span className="visually-hidden">:</span>
              </span>{' '}
              <span className="lesson-sheet-target">
                <SheetRef part={previous} />
              </span>
            </PartLink>
          ) : (
            <span className="lesson-sheet-link lesson-sheet-empty" aria-hidden="true" />
          )}
          <PartLink
            to={next}
            className="lesson-sheet-link lesson-sheet-next"
            onFollow={onFollowLink}
          >
            <span className="lesson-sheet-label">
              {UI.lesson.next}
              <span className="visually-hidden">:</span>
              <ArrowIcon />
            </span>{' '}
            <span className="lesson-sheet-target">
              {next ? <SheetRef part={next} /> : UI.lesson.backToOverview}
            </span>
          </PartLink>
        </div>
      </nav>
    </section>
  );
}
