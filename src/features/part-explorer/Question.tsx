import type { ReactNode } from 'react';

/** One numbered part of a sheet: a balloon, a heading, and its body beside it. */
export function Question({
  number,
  heading,
  headingId,
  children,
}: {
  number: number;
  heading: string;
  /** The heading's id, for a list or group inside that it names. */
  headingId?: string;
  children: ReactNode;
}) {
  return (
    <section className="lesson-question">
      <span className="lesson-question-number" data-question-number aria-hidden="true">
        {number}
      </span>
      <div className="lesson-question-body">
        <h3 id={headingId}>{heading}</h3>
        {children}
      </div>
    </section>
  );
}
