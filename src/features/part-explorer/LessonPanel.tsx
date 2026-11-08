import type { ReactNode } from 'react';

import type { Lesson } from '@/content/lessons';
import { UI } from '@/content/ui';
import { REFERENCE_5_INCH } from '@/shared/domain/drone-spec';
import { PART_IDS, type PartId } from '@/shared/domain/parts';
import { partQuantity } from '@/shared/domain/quantity';

import { LESSON_PANEL_ID, lessonTitleId } from './ids';
import { TitleBlock } from './TitleBlock';

export interface LessonPanelProps {
  lesson: Lesson;
  onClose: () => void;
  /** Follows a connection to another part's lesson. */
  onSelectPart: (part: PartId) => void;
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

/** One part's drawing sheet: title block, then the four questions. */
export function LessonPanel({ lesson, onClose, onSelectPart }: LessonPanelProps) {
  const titleId = lessonTitleId(lesson.partId);
  const columns = UI.lesson.specColumns;

  return (
    <section id={LESSON_PANEL_ID} className="lesson-panel" aria-labelledby={titleId}>
      <TitleBlock
        part={lesson.title}
        sheet={UI.titleBlock.sheetOf(PART_IDS.indexOf(lesson.partId) + 1, PART_IDS.length)}
        quantity={partQuantity(lesson.partId, REFERENCE_5_INCH)}
        spec={lesson.specs.map((row) => row.value).join(' · ')}
      />

      <header className="lesson-panel-header">
        <h2 id={titleId} tabIndex={-1}>
          {lesson.title}
        </h2>
        <button type="button" className="button-outline" onClick={onClose}>
          {UI.lesson.close}
        </button>
      </header>

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
              {partId ? (
                <button
                  type="button"
                  className="lesson-link"
                  onClick={() => {
                    onSelectPart(partId);
                  }}
                >
                  {text}
                </button>
              ) : (
                text
              )}
            </li>
          ))}
        </ul>
      </Question>
    </section>
  );
}
