import type { Lesson } from '@/content/lessons';
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
          Close lesson
        </button>
      </header>

      <h3>What does it do?</h3>
      <p>{lesson.whatItDoes}</p>

      <h3>How does it work?</h3>
      {lesson.howItWorks.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}

      <h3>What do the numbers mean?</h3>
      <table>
        <thead>
          <tr>
            <th scope="col">Spec</th>
            <th scope="col">Value</th>
            <th scope="col">What it means</th>
          </tr>
        </thead>
        <tbody>
          {lesson.specs.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              <td>{row.value}</td>
              <td>{row.meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>What is it connected to?</h3>
      <ul>
        {lesson.connections.map(({ text, partId }) => (
          <li key={text}>
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
