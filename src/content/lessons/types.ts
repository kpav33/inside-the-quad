import type { PartId } from '@/shared/domain/parts';

/** One row of "What do the numbers mean?". */
export interface LessonSpecRow {
  label: string;
  value: string;
  meaning: string;
}

/** One answer to "What is it connected to?". `partId` links to that part's lesson. */
export interface LessonConnection {
  text: string;
  partId?: PartId;
}

/** A part lesson, answering the four questions every lesson answers (docs/product/scope.md). */
export interface Lesson {
  partId: PartId;
  title: string;
  /** "What does it do?" in one plain-language sentence. */
  whatItDoes: string;
  /** "How does it work?" as short paragraphs. */
  howItWorks: string[];
  /** "What do the numbers mean?" */
  specs: LessonSpecRow[];
  /** "What is it connected to?" */
  connections: LessonConnection[];
}
