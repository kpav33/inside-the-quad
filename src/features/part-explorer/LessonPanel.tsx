import type { Lesson } from '@/content/lessons';
import { PART_PHOTOS } from '@/content/photos';
import { UI } from '@/content/ui';
import { REFERENCE_5_INCH } from '@/shared/domain/drone-spec';
import { PART_IDS, type PartId } from '@/shared/domain/parts';
import { partQuantity } from '@/shared/domain/quantity';
import { type Page, PartLink } from '@/shared/routing';
import { ArrowIcon } from '@/shared/ui/icons';

import { LESSON_PANEL_ID, lessonTitleId } from './ids';
import { PartPhoto } from './PartPhoto';
import { Question } from './Question';
import { SheetFooter, SheetRef } from './SheetFooter';
import { TitleBlock } from './TitleBlock';

export interface LessonPanelProps {
  lesson: Lesson;
  /** Whether the learner has marked this lesson as read. */
  read: boolean;
  onClose: () => void;
  onToggleRead: () => void;
  /** Called before a link in the sheet opens another lesson (null: the overview). */
  onFollowLink?: (page: Page) => void;
}

const sheetNumber = (part: PartId) => PART_IDS.indexOf(part) + 1;

/**
 * One part's drawing sheet: its name, the title block, a real photo, the four questions, then the
 * way on.
 */
export function LessonPanel({
  lesson,
  read,
  onClose,
  onToggleRead,
  onFollowLink,
}: LessonPanelProps) {
  const titleId = lessonTitleId(lesson.partId);
  const columns = UI.lesson.specColumns;

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

      <PartPhoto photo={PART_PHOTOS[lesson.partId]} />

      <Question number={1} heading={UI.lesson.questions[0]}>
        <p className="lesson-lead">{lesson.whatItDoes}</p>
      </Question>

      <Question number={2} heading={UI.lesson.questions[1]}>
        {lesson.howItWorks.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </Question>

      <Question number={3} heading={UI.lesson.questions[2]}>
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

      <Question number={4} heading={UI.lesson.questions[3]}>
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
                    <SheetRef sheet={partId} />
                  </span>
                </PartLink>
              )}
            </li>
          ))}
        </ul>
      </Question>

      <SheetFooter
        sheet={lesson.partId}
        read={read}
        onToggleRead={onToggleRead}
        onFollowLink={onFollowLink}
      />
    </section>
  );
}
