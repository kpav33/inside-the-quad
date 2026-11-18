import type { LessonConnection, LessonSpecRow } from '@/content/lessons/types';
import type { GearId } from '@/shared/domain/gear';

/** A named part of a gear drawing: its balloon label and one line on what it is for. */
export interface GearPart<Id extends string = string> {
  id: Id;
  label: string;
  note: string;
}

export type RadioPartId =
  'antenna' | 'left-stick' | 'right-stick' | 'arm-switch' | 'mode-switch' | 'screen';
export type GogglesPartId = 'screens' | 'video-receiver' | 'antennas' | 'strap';
export type ChargerPartId = 'main-lead' | 'balance-lead' | 'balance-port' | 'screen' | 'cells';

/** Any gear drawing's part. */
export type GearPartId = RadioPartId | GogglesPartId | ChargerPartId;

/** A gear sheet, answering the same four questions as a part lesson, plus its drawing's parts. */
export interface GearLesson<Id extends GearPartId = GearPartId> {
  id: GearId;
  title: string;
  /** "What does it do?" in one plain-language sentence. */
  whatItDoes: string;
  /** "How does it work?" as short paragraphs. */
  howItWorks: string[];
  /** "What do the numbers mean?" */
  specs: LessonSpecRow[];
  /** "What is it connected to?"; `partId` links to a part sheet. */
  connections: LessonConnection[];
  /** The parts named on the drawing, in drawing order. */
  parts: GearPart<Id>[];
}

/** The radio's flight mode switch positions. */
export type RadioModeId = 'acro' | 'angle';
/** The two kinds of FPV video. */
export type VideoSystem = 'analog' | 'digital';
/** What the charger does with the pack. */
export type ChargerMode = 'charge' | 'storage';
