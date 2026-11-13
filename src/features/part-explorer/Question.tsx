import type { ReactNode } from 'react';

/** One numbered part of a sheet: a balloon, a heading, and its body beside it. */
export function Question({
  number,
  heading,
  children,
}: {
  number: number;
  heading: string;
  children: ReactNode;
}) {
  return (
    <section className="lesson-question">
      <span className="lesson-question-number" data-question-number aria-hidden="true">
        {number}
      </span>
      <div className="lesson-question-body">
        <h3>{heading}</h3>
        {children}
      </div>
    </section>
  );
}
