import type { Lesson } from '@/content/lessons';
import { UI } from '@/content/ui';
import type { PartId } from '@/shared/domain/parts';

import { LESSON_PANEL_ID, lessonTitleId } from './ids';

export interface LessonPanelProps {
  lesson: Lesson;
  onClose: () => void;
  /** Follows a connection to another part's lesson. */
  onSelectPart: (part: PartId) => void;
}

export function LessonPanel({ lesson, onClose, onSelectPart }: LessonPanelProps) {
  const titleId = lessonTitleId(lesson.partId);

  return (
    <section id={LESSON_PANEL_ID} className="lesson-panel" aria-labelledby={titleId}>
      <header className="lesson-panel-header">
        <h2 id={titleId} tabIndex={-1}>
          {lesson.title}
        </h2>
        <button type="button" onClick={onClose}>
          {UI.lesson.close}
        </button>
      </header>

      <h3>{UI.lesson.questions[0]}</h3>
      <p>{lesson.whatItDoes}</p>

      <h3>{UI.lesson.questions[1]}</h3>
      {lesson.howItWorks.map((paragraph, index) => (
        // Lesson text is static, so its position is a stable key (translations may repeat text).
        <p key={index}>{paragraph}</p>
      ))}

      <h3>{UI.lesson.questions[2]}</h3>
      <table>
        <thead>
          <tr>
            <th scope="col">{UI.lesson.specColumns.label}</th>
            <th scope="col">{UI.lesson.specColumns.value}</th>
            <th scope="col">{UI.lesson.specColumns.meaning}</th>
          </tr>
        </thead>
        <tbody>
          {lesson.specs.map((row, index) => (
            <tr key={index}>
              <th scope="row">{row.label}</th>
              <td>{row.value}</td>
              <td>{row.meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>{UI.lesson.questions[3]}</h3>
      <ul>
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
    </section>
  );
}
