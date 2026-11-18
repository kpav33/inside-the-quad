# Section 06 — The gear you hold and wear: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (or
> superpowers:subagent-driven-development) to implement this plan task-by-task, and the
> `impeccable:impeccable` skill for every UI edit (read its `reference/craft-floor.md` immediately
> before editing UI). Steps use checkbox (`- [ ]`) syntax. Branch: `feat/gear`.

**Goal:** A third chapter, **The gear you hold and wear**: Radio, Goggles and Charger sheets, each
a flat labelled drawing in the drawing field, the four questions, and one thing to try.

**Architecture:** `GearId` joins the sheets and routing (`/gear/<id>`) as a third `Chapter`; the
footer, switcher, overview and masthead stop assuming two chapters. Gear copy is typed data in
`src/content/gear/`. A new `features/gear` draws the three SVGs (like `features/intro`) from plain
props and holds the pure logic of the toggles; the explorer shows the gear drawing instead of the
3D viewer, and a `GearPanel` in the sheet column, with toggle and highlight state lifted into a
`useGearSheet` hook.

**Tech Stack:** React 19, TypeScript strict, SVG, Vitest + Testing Library, Playwright.

**Spec:** [06-gear-design.md](06-gear-design.md). Goals 1–6 and "Decided calls" are binding.

## Global Constraints

- Node 22: prefix node/pnpm commands with `source ~/.nvm/nvm.sh && nvm use >/dev/null &&`.
- Addresses `/gear/radio`, `/gear/goggles`, `/gear/charger`; anything else under `/gear` (no id,
  unknown id, extra segments) is an unknown address. Order: radio, goggles, charger; the chapter
  comes after What if, so Next from What if is Radio and Next from Charger is the overview.
- Chapter name: **The gear you hold and wear** (switcher and title block); masthead link text
  **The gear** (short, it sits beside "What is an FPV drone?" and "How it works together").
- Numbers come from `REFERENCE_5_INCH`, `LIPO_CELL_VOLTS` and `packVolts`, never typed in copy:
  6 cells, 4.2 V → 25.2 V (Charge), 3.8 V → 22.8 V (Storage); ELRS 2.4 GHz; analog 5.8 GHz video.
- No brand or product names, prices or buying advice. Digital video is "digital systems".
- Tokens only, no new colours; redline only for the highlighted gear part, the current sheet,
  focus. All copy in `src/content/gear/` and `src/content/ui.ts`.
- `features/gear` never imports three.js or `drone-viewer`; a gear sheet never mounts the 3D view.
- 02d holds: no sideways scroll at 320 px with 200 % text; the pinned phone drawing leaves every
  line of the sheet readable; reduced motion respected (switch levers may move without easing).
- Existing sheets behave as before; their tests keep passing apart from deliberate count changes
  (chapter lists, overview count, navigation walk).

## Review Focus

1. **Leaving and coming back resets the sheet:** arm the radio, open Goggles, come back: the radio
   is disarmed, in the first mode, nothing highlighted. (Task 4 test.)
2. **Odd addresses:** `/gear`, `/gear/`, `/gear/drone`, `/gear/radio/2` show the unknown-address
   notice, never a blank or crashed page. (Task 1 test.)
3. **No WebGL:** a gear sheet works fully when the 3D view can't load, since it never mounts it.
   (Task 4 test: the viewer is not rendered on a gear sheet.)
4. **Keyboard:** every toggle is a button with `aria-pressed`; focusing a part name highlights it
   on the drawing exactly as hovering does, and blur clears it. (Task 4 test.)
5. **Stored progress:** a saved read list from before this section (no gear ids) still loads, and
   gear ids saved now survive a reload; "Every sheet read" needs the gear sheets too.
   (Task 1 test.)

---

### Task 1: The gear chapter in the set and the address

**Files:**

- Create: `src/shared/domain/gear.ts` (+ `gear.test.ts`)
- Modify: `src/shared/domain/sheets.ts` (+ test), `src/shared/routing/routes.ts` (+ test),
  `usePartRoute.ts` if it switches on route kinds, `src/content/ui.ts` (`sheetName`, chapter
  names, footer labels, overview count), `src/features/part-explorer/SheetFooter.tsx`,
  `ChapterSwitcher.tsx`, `OverviewStart.tsx`, `src/app/App.tsx` (masthead), `src/features/progress/progress.ts`
  (+ test)

**Interfaces:**

- Produces: `GEAR_IDS = ['radio', 'goggles', 'charger'] as const`, `type GearId`,
  `isGearId(value: unknown): value is GearId`; `SheetId`/`NumberedSheet` include `GearId`;
  `type Chapter = 'parts' | 'paths' | 'gear'`, `CHAPTER_SHEETS.gear = GEAR_IDS`;
  `Route` gains `{ kind: 'gear'; gear: GearId }`; `gearPath(id: GearId): string`;
  `pagePath(id)` handles gear; `ChapterSwitcher({ chapter, open, onFollowLink })` lists any
  chapter's sheets; `UI.chapters.gear = 'The gear you hold and wear'`; `UI.gear.title: Record<GearId, string>` (`Radio`, `Goggles`, `Charger`).

- [ ] **Step 1: Write the failing tests**
  - `gear.test.ts`: `isGearId('radio')` true; `'drone'`, `''`, `undefined` false.
  - `sheets.test.ts`: `CHAPTER_SHEETS.gear` equals `['radio','goggles','charger']`;
    `sheetNeighbours('what-if').next === 'radio'`; `sheetNeighbours('charger').next === null`;
    `sheetNumber('goggles') === 2`, `chapterCount('charger') === 3`, `chapterOf('radio') === 'gear'`.
  - `routes.test.ts`: `parseRoute('/gear/radio')` and `'/gear/radio/'` →
    `{ kind: 'gear', gear: 'radio' }`; `'/gear'`, `'/gear/'`, `'/gear/drone'`, `'/gear/radio/2'`
    → `kind: 'unknown'`; `pagePath('charger') === '/gear/charger'`.
  - `progress.test.ts`: `parseReadSheets('["frame","radio"]')` keeps both; an old list without
    gear ids still parses; `firstUnread` of every part and stepped sheet read is `'radio'`;
    `startState` is `done` only with the gear sheets read too.
  - `SheetFooter` test (existing file or new): on What if, Next reads "End of How it works
    together" and names Radio with its chapter; on Radio, Previous reads "Back to How it works
    together".
  - `OverviewStart` test: the count reads `Parts a of 12 · How it works b of 5 · Gear c of 3`
    (use the real part count from `PART_IDS.length`).
- [ ] **Step 2: Run them; expected FAIL** (`isGearId` missing, no `gear` chapter, etc.):
      `pnpm exec vitest run src/shared src/features/progress src/features/part-explorer`
- [ ] **Step 3: Implement.**
  - `chapterOf(sheet)`: gear ids → `'gear'`, stepped → `'paths'`, else `'parts'`.
  - `crossesChapter` and `SheetRef` generalise from "parts ↔ paths" to any two chapters:
    `UI.lesson.endOf: Record<Chapter, string>` (`End of the parts`, `End of How it works together`,
    `End of the gear`), `UI.lesson.backTo: Record<Chapter, string>` (`Back to the parts`, `Back to How it works together`, `Back to the gear`), and
    `UI.lesson.sheetInChapter(chapter: string, sheet: number, title: string)` replacing
    `pathInChapter` (same text for paths: "How it works together, sheet 1: Control path").
  - `UI.overview.continueIn(chapter, sheet, name)` replaces `continuePaths`; used for any
    chapter but parts. `UI.overview.count` takes the three chapters' read and total counts.
  - `ChapterSwitcher` takes `chapter: Exclude<Chapter, 'parts'>`; label = `UI.chapters[chapter]`
    (paths keeps `UI.paths.switcherLabel`, which equals it). Path sheets keep their short names.
  - Masthead: a third `PartLink to="radio"`, text `UI.app.gearLink = 'The gear'`, `current`
    when the route is a gear sheet.
  - `isReadableSheet` accepts gear ids.
- [ ] **Step 4: Run them; expected PASS.** Then `pnpm check` (fix any test that counted two
      chapters, and only those).
- [ ] **Step 5: Commit** `feat(routing): add the gear chapter and its addresses`

### Task 2: Gear copy

**Files:**

- Create: `src/content/gear/types.ts`, `radio.ts`, `goggles.ts`, `charger.ts`, `index.ts`,
  `gear.test.ts`
- Modify: `src/content/ui.ts` (`UI.gear` labels for the panel and toggles)

**Interfaces:**

- Consumes: `GearId` (Task 1); `LessonSpecRow`, `LessonConnection` from `content/lessons/types`.
- Produces:

  ```ts
  /** A named part of a gear drawing. */
  export interface GearPart {
    id: string;
    label: string;
    note: string;
  }
  export interface GearLesson {
    id: GearId;
    title: string;
    whatItDoes: string;
    howItWorks: string[];
    specs: LessonSpecRow[];
    connections: LessonConnection[]; // partId links to part sheets
    parts: GearPart[]; // in drawing order; ids unique per lesson
  }
  export const GEAR: Record<GearId, GearLesson>;
  export type RadioPartId =
    'antenna' | 'left-stick' | 'right-stick' | 'arm-switch' | 'mode-switch' | 'screen';
  export type GogglesPartId = 'screens' | 'video-receiver' | 'antennas' | 'strap';
  export type ChargerPartId = 'main-lead' | 'balance-lead' | 'balance-port' | 'screen' | 'cells';
  ```

  plus the toggle copy: `RADIO_MODES` (ids and labels; `'acro'` first, then the modes the
  receiver/FC lessons mention, e.g. angle), `radioSays(armed: boolean, mode)` → one line;
  `gogglesSays(system: 'analog' | 'digital')`; `chargerSays(mode: 'charge' | 'storage')`.

- [ ] **Step 1: Write the failing test** `gear.test.ts`:
  - every lesson has a title, ≥ 2 `howItWorks` paragraphs, ≥ 2 specs, ≥ 1 connection, and
    unique part ids matching its `*PartId` union;
  - connections link Radio → `receiver`, Goggles → `vtx` and `camera`, Charger → `battery`;
  - the radio says mode 2 with throttle and yaw on the left, pitch and roll on the right, and
    names ExpressLRS at `REFERENCE_5_INCH.receiver.frequencyGhz` GHz and EdgeTX;
  - the goggles name `camera.signal` (analog) and `vtx.frequencyGhz` GHz;
  - `chargerSays('charge')` contains `25.2 V` and `4.2 V`; `chargerSays('storage')` contains
    `22.8 V` and `3.8 V` (computed: assert against `packVolts(REFERENCE_5_INCH.motor.batteryCells, LIPO_CELL_VOLTS.full)`, not literals only);
  - no copy matches `/DJI|Walksnail|HDZero|Radiomaster|TBS|Fat ?Shark|\$|€/i`.
- [ ] **Step 2: Run; expected FAIL** (module missing).
- [ ] **Step 3: Write the copy** in the lessons' voice, checked against `receiver.ts`, `vtx.ts`,
      `camera.ts`, `battery.ts` and scope Module 4. Charger: balance charging keeps every cell
      equal through the balance lead; storage mode brings each cell to 3.8 V; a good charger
      balances, shows each cell, and stops when full (no brands).
- [ ] **Step 4: Run; expected PASS.**
- [ ] **Step 5: Commit** `feat(content): add the radio, goggles and charger sheets' copy`

### Task 3: The gear drawings

**Files:**

- Create: `src/features/gear/{RadioDrawing,GogglesDrawing,ChargerDrawing,GearDrawing}.tsx`,
  `charger.ts` (+ tests), `index.ts`
- Modify: `src/styles/global.css` (gear drawing styles)

**Interfaces:**

- Consumes: `GEAR`, part id unions, `RADIO_MODES` (Task 2); `LIPO_CELL_VOLTS`, `packVolts`.
- Produces:

  ```ts
  export type GearState =
    | { gear: 'radio'; armed: boolean; mode: RadioModeId }
    | { gear: 'goggles'; system: 'analog' | 'digital' }
    | { gear: 'charger'; mode: 'charge' | 'storage' };
  export function initialGearState(gear: GearId): GearState; // disarmed + first mode; analog; charge
  export function chargerCells(
    mode: 'charge' | 'storage',
    cells: number,
  ): { cellVolts: number; packVolts: number };
  export function GearDrawing(props: {
    state: GearState;
    highlight: string | null;
    onHighlight: (part: string | null) => void;
  }): JSX.Element;
  ```

- [ ] **Step 1: Write the failing tests**
  - `charger.test.ts`: `chargerCells('charge', 6)` → `{ cellVolts: 4.2, packVolts: 25.2 }`;
    `('storage', 6)` → `{ 3.8, 22.8 }`.
  - `GearDrawing.test.tsx`: for each gear, one balloon per `GEAR[id].parts` entry with its label;
    the highlighted part's group has `data-highlight="true"`, others `false`; hovering a balloon
    calls `onHighlight(id)`, leaving calls `onHighlight(null)`; radio: the arm lever's
    `data-position` follows `armed`; goggles: the screen shows the picture group for analog and
    the "No signal" text for digital; charger: six cell bars, each `data-volts` = cell volts; the
    svg is `aria-hidden` (the panel says it all in words, like `SystemScene`).
- [ ] **Step 2: Run; expected FAIL.**
- [ ] **Step 3: Implement** plain SVG in the intro drawings' line style (`SystemScene` is the
      model): front views, hairline ink, balloons on leaders, highlighted part and its balloon in
      redline. Cell bar heights scale between `LIPO_CELL_VOLTS.minResting` and `full`.
- [ ] **Step 4: Run; expected PASS.** Look at all three at 390 and 1280 px (light and dark).
- [ ] **Step 5: Commit** `feat(gear): draw the radio, goggles and charger`

### Task 4: The gear sheet in the explorer

**Files:**

- Create: `src/features/part-explorer/GearPanel.tsx` (+ test), `useGearSheet.ts` (+ test)
- Modify: `PartExplorer.tsx` (+ test), `ids.ts` (`gearTitleId(id)`), `src/styles/global.css`
  (pinned phone drawing on gear sheets)

**Interfaces:**

- Consumes: Tasks 1–3.
- Produces: `useGearSheet(gear: GearId | null): { state, setState, highlight, setHighlight }`,
  resetting both whenever `gear` changes; `GearPanel({ gear, state, onChange, highlight,
onHighlight, read, onClose, onToggleRead, onFollowLink })`.

- [ ] **Step 1: Write the failing tests**
  - `GearPanel.test.tsx`: heading `Radio`, title block "Sheet 1 of 3" in chapter "The gear you
    hold and wear", the gear switcher lists Radio · Goggles · Charger with the open one current,
    the four questions, connection links to the part sheets; radio: Arm and the mode options are
    buttons with `aria-pressed`, pressing Arm calls `onChange` with `armed: true` and the line
    reads `radioSays(true, mode)`; goggles: Digital pressed → line `gogglesSays('digital')`;
    charger: Storage → `chargerSays('storage')`; focusing a part name calls `onHighlight(id)`,
    blur calls `onHighlight(null)` (Review Focus 4).
  - `useGearSheet.test.ts`: arm the radio and highlight a part, switch to `goggles` and back to
    `radio` → disarmed, first mode, highlight null (Review Focus 1).
  - `PartExplorer.test.tsx`: at `/gear/radio` the gear drawing shows, the 3D viewer (its loading
    status) does not, and the radio sheet has focus (Review Focus 3).
- [ ] **Step 2: Run; expected FAIL.**
- [ ] **Step 3: Implement.** The panel follows `LessonPanel`'s order: header, title block,
      chapter switcher, what it does, the toggles and their line (a `role="group"` like the
      battery switch; the line is `aria-live="polite"`), how it works, the parts list (names as
      buttons that highlight), the numbers, connections, photo if one exists (Task 6), footer.
      In `PartExplorer`: route kind `gear` opens the panel; the drawing field renders
      `GearDrawing` instead of `DroneViewer` and hides the drag hint; the root gets `data-gear`
      and the phone pinned-drawing rules that key on `[data-flight]` also apply to `[data-gear]`,
      without the stick band; document title and the opened-sheet announcement as for paths.
- [ ] **Step 4: Run; expected PASS**, then `pnpm check`.
- [ ] **Step 5: Commit** `feat(part-explorer): open the gear sheets`

### Task 5: Links into the chapter

**Files:**

- Modify: `src/features/part-explorer/PathPanel.tsx` (+ test), `src/content/paths/types.ts`,
  `src/features/part-explorer/IntroPanel.tsx` or `src/content/intro.ts` (+ tests), `ui.ts`

**Interfaces:**

- Consumes: `GearId` (Task 1). A path end `'radio' | 'goggles'` is already a `GearId`.

- [ ] **Step 1: Write the failing tests**
  - `PathPanel.test.tsx`: on the control path's first stop, the "more" link is "Radio" to
    `/gear/radio`; on the video path's last stop, "Goggles" to `/gear/goggles`.
  - Intro test: the scene's radio and goggles descriptions each carry a link to their gear sheet.
- [ ] **Step 2: Run; expected FAIL.**
- [ ] **Step 3: Implement**: `StopLessons` links `stop.end` to that gear sheet (label
      `UI.gear.title[end]`); the intro's device entries for radio and goggles add a link line
      (`UI.intro.moreAbout(name)`).
- [ ] **Step 4: Run; expected PASS.**
- [ ] **Step 5: Commit** `feat(part-explorer): link the paths and intro to the gear sheets`

### Task 6: Photos (only if good ones exist)

- [ ] **Step 1:** Search Wikimedia Commons for a sharp, free-licensed (CC0, CC BY, CC BY-SA)
      photo of a mode 2 FPV radio, FPV goggles and a balance charger, without brand logos as the
      subject. Check sharpness at display size (user rule from 03c).
- [ ] **Step 2:** For each one found, add it through the 03c pipeline (`credits.json`,
      `pnpm photos:fetch`, `PART_PHOTOS`-style map keyed by `GearId`) and show it in `GearPanel`
      with its attribution; a test asserts the credit renders. Ledger a ruling for any sheet left
      without a photo.
- [ ] **Step 3: Commit** `feat(content): add gear photos` (skip if none qualify).

### Task 7: End to end and docs

**Files:**

- Create: `e2e/gear.spec.ts`
- Modify: `e2e/navigation.spec.ts`, `e2e/reflow.spec.ts` (gear pages in `PAGES`), DESIGN.md,
  PRODUCT.md, `docs/architecture/overview.md`, `docs/product/scope.md` (Module 4 complete),
  `docs/roadmap.md` (05c done, 06 in review), `.impeccable/design.json` if it lists components.

- [ ] **Step 1: Write `e2e/gear.spec.ts`**:
  - Next from `/what-if` reaches Radio, focused; the masthead's "The gear" link opens it;
  - radio: press Arm → the line changes and the drawn lever moves; open Goggles and back → disarmed;
  - goggles: Digital → "No signal" on the drawing; charger: Storage → six cells at 3.8 V, 22.8 V;
  - hovering a part name highlights it on the drawing;
  - control path stop 1 "Radio" link opens `/gear/radio`;
  - `/gear/drone` shows the unknown-address notice;
  - 320 × 667 with 200 % text: no sideways scroll, each paragraph of the sheet readable below the
    pinned drawing (same check as `what-if.spec.ts`), drawing balloons don't overlap.
- [ ] **Step 2: Run; expected PASS** once Tasks 1–5 are in:
      `pnpm exec playwright test e2e/gear.spec.ts e2e/navigation.spec.ts e2e/reflow.spec.ts`
- [ ] **Step 3: Docs.** DESIGN.md: Gear Sheet, Gear Drawing, gear toggles; architecture: the
      `gear` feature and chapter; scope and roadmap statuses.
- [ ] **Step 4:** `pnpm check`, full `pnpm test:e2e`, Docker image e2e.
- [ ] **Step 5: Commit** `test(e2e): cover the gear chapter` and `docs: record the gear chapter`
