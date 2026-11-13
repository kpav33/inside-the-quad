import { INTRO } from '@/content/intro';
import { UI } from '@/content/ui';
import { SizeComparison, SystemScene } from '@/features/intro';
import type { Page } from '@/shared/routing';

import { INTRO_TITLE_ID, LESSON_PANEL_ID } from './ids';
import { Question } from './Question';
import { SheetFooter } from './SheetFooter';
import { TitleBlock } from './TitleBlock';

export interface IntroPanelProps {
  read: boolean;
  onClose: () => void;
  onToggleRead: () => void;
  onFollowLink?: ((page: Page) => void) | undefined;
}

/** The sheet before sheet 1: what an FPV drone is, its system, sizes, and why 5-inch. */
export function IntroPanel({ read, onClose, onToggleRead, onFollowLink }: IntroPanelProps) {
  const [fpv, system, sizes, why] = INTRO.sections;
  const paragraphs = (section: (typeof INTRO.sections)[number]) =>
    section.paragraphs.map((text, index) => <p key={index}>{text}</p>);

  return (
    <section id={LESSON_PANEL_ID} className="lesson-panel" aria-labelledby={INTRO_TITLE_ID}>
      <header className="lesson-panel-header">
        <h2 id={INTRO_TITLE_ID} tabIndex={-1}>
          {INTRO.title}
        </h2>
        <button type="button" className="button-outline" onClick={onClose}>
          {UI.intro.close}
        </button>
      </header>

      <TitleBlock sheet={UI.intro.sheet} />

      <Question number={1} heading={fpv.heading}>
        {paragraphs(fpv)}
      </Question>
      <Question number={2} heading={system.heading}>
        {paragraphs(system)}
        <SystemScene />
      </Question>
      <Question number={3} heading={sizes.heading}>
        {paragraphs(sizes)}
        <SizeComparison />
      </Question>
      <Question number={4} heading={why.heading}>
        {paragraphs(why)}
      </Question>

      <SheetFooter
        sheet="intro"
        read={read}
        onToggleRead={onToggleRead}
        onFollowLink={onFollowLink}
      />
    </section>
  );
}
