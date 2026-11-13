# Section 04 — "What is an FPV drone?" intro: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (or
> superpowers:subagent-driven-development) to implement this plan task-by-task, and the
> `impeccable:impeccable` skill for every UI edit (read its `reference/craft-floor.md` immediately
> before editing UI). Steps use checkbox (`- [ ]`) syntax. Branch: `feat/intro`.

**Goal:** An intro sheet at `/intro`, shown in the part explorer's sheet column before sheet 1,
with a system scene and a size comparison drawn as flat SVG, its own read flag, and an overview
start block that offers it to newcomers.

**Architecture:** Routing gains an intro page (`Page = 'intro' | PartId | null`). A new
`shared/domain/sheets.ts` orders the sheets (intro, then the parts). Copy lives in
`src/content/intro.ts`; size data in `shared/domain/size-classes.ts`. The two drawings are a new
`features/intro` feature; the part explorer composes them into an `IntroPanel` that shares the
lesson footer.

**Tech Stack:** TypeScript, React 19, inline SVG, Vitest + Testing Library, Playwright.

**Spec:** [04-intro-design.md](04-intro-design.md). Read it first.

## Global Constraints

- Intro address `/intro`; `/intro/` is replaced by `/intro`. Tab title `What is an FPV drone? ·
Inside the Quad`. Sheet field "Intro".
- Sheet order: intro, frame, motors, props, esc, fc, battery, strap, receiver, camera, vtx, extras,
  then the overview. Part sheet numbers stay 1–11.
- Link values from `REFERENCE_5_INCH`: control `receiver.system` (ExpressLRS) at
  `receiver.frequencyGhz` (2.4 GHz); video analog at `vtx.frequencyGhz` (5.8 GHz). No number
  literals in intro copy.
- Size data (prop mm; motor-to-motor mm): whoop 31–40; 65–75 · 3" 76; 120–150 · 5" 127; 220–230 ·
  7" 178; 280–320.
- Intro read flag key `inside-the-quad.intro-read.v1`; parts count stays parts only.
- Layering: `shared/` imports nothing from `content/` or `features/`; features import other
  features only through `index.ts`; `features/intro` does not import `part-explorer`.
- No new dependencies. Text in `src/content/`. Tokens only; redline only for selection, current
  sheet and focus (the drawings' highlight is ink weight). No shadows, square corners.
- Fits 320 px with text 40 % longer; no page scroll at 900, 1000, 1100 × 700.
- Each task ends with `pnpm check` passing and a Conventional Commit (header ≤ 72 chars, body
  lines ≤ 100).

## Review Focus

1. **Leaving an open stack for the intro:** following Frame's Previous (or the start link) while a
   board's exploded view is open must close the stack and clear the selection on the model.
   Pinned by Task 5's test that `/intro` has no pressed parts-list row, and Task 6's e2e from
   `/parts/esc`.
2. **Escape on the overview:** with nothing open, Escape must do nothing and keep focus where it
   is. Pinned in Task 5's component test.
3. **Repeated device presses:** pressing the same device button twice clears the highlight;
   pressing another moves it. Pinned in Task 4.
4. **Intro read with blocked storage:** the flag works in memory and nothing throws. Pinned in
   Task 3.
5. **Back/Forward across the intro boundary:** overview → intro → Frame, then Back twice, lands on
   the intro heading and then the start link, focused. Pinned in Task 6's e2e.

---

### Task 1: Intro route and sheet order

**Files:** Modify `src/shared/routing/routes.ts`, `usePartRoute.ts`, `PartLink.tsx`, `index.ts`
and their tests. Create `src/shared/domain/sheets.ts`, `sheets.test.ts`.

**Interfaces:**

- Produces (`routes.ts`): `INTRO_PATH = '/intro'`; `type Page = 'intro' | PartId | null`;
  `pagePath(page: Page): string`; `Route` gains `{ kind: 'intro' }`; `parseRoute('/intro')` and
  `('/intro/')` give it; `/intro/x` is `unknown` with slug `'/intro/x'`.
- Produces (`usePartRoute.ts`): `PageRoute` gains `{ kind: 'intro' }`; `navigate(page: Page)`;
  canonical path for the intro is `/intro`.
- Produces (`PartLink.tsx`): `to: Page`; `onFollow?: (to: Page) => void`.
- Produces (`sheets.ts`): `type SheetId = 'intro' | PartId`; `SHEET_IDS: readonly SheetId[]`
  (`'intro'` then `PART_IDS`); `sheetNeighbours(sheet: SheetId): { previous: SheetId | null; next:
SheetId | null }`. `partNeighbours` is removed once Task 5 stops using it (Task 5 deletes it).

- [ ] **Step 1: Failing tests:** `parseRoute('/intro')` and `('/intro/')` are `{ kind: 'intro' }`;
      `parseRoute('/intro/x')` is unknown `'/intro/x'`; `pagePath('intro') === '/intro'`,
      `pagePath(null) === '/'`, `pagePath('vtx') === '/parts/vtx'`; `usePartRoute` started on
      `/intro/` reports the intro and `location.pathname === '/intro'`; `navigate('intro')` pushes
      `/intro`; `PartLink to="intro"` has `href="/intro"`; `sheetNeighbours('intro')` is
      `{ previous: null, next: 'frame' }`; `sheetNeighbours('frame').previous === 'intro'`;
      `sheetNeighbours('extras').next === null`; `SHEET_IDS` has no duplicate and `'intro'` is not
      a `PART_IDS` member.
- [ ] **Step 2:** `pnpm test src/shared` fails. Implement. `pnpm check` passes (the explorer
      still compiles: it ignores the intro route until Task 5).
- [ ] **Step 3:** `feat(routing): add the intro page and sheet order`

### Task 2: Size data and intro copy

**Files:** Create `src/shared/domain/size-classes.ts`, `size-classes.test.ts`,
`src/content/intro.ts`, `src/content/intro.test.ts`, `src/test/jargon.ts`. Modify
`src/content/lessons/lessons.test.ts` (import `JARGON` from `@/test/jargon`), `src/content/ui.ts`.

**Interfaces:**

- Produces (`size-classes.ts`): `type SizeClassId = 'whoop' | '3in' | '5in' | '7in'`;
  `interface SizeClass { id; propMm: readonly [min: number, max: number]; frameMm: readonly
[min: number, max: number] }` (frame = motor-to-motor); `SIZE_CLASSES: readonly SizeClass[]` in
  the Global Constraints order and values; `drawingSizeMm(c: SizeClass): number` = midpoint of
  `frameMm`.
- Produces (`src/test/jargon.ts`): `JARGON: Record<string, RegExp>` (moved verbatim) and
  `expectJargonExplained(text: string): void`.
- Produces (`intro.ts`): `INTRO: IntroContent`, with
  `IntroContent = { title: string; sections: readonly [IntroSection, IntroSection, IntroSection,
IntroSection]; scene: SceneContent; sizes: SizesContent }`,
  `IntroSection = { heading: string; paragraphs: readonly string[] }`,
  `SceneContent = { label: string; devices: readonly SceneDevice[]; links: Record<'control' |
'video', { label: string; detail: string }> }`,
  `SceneDevice = { id: 'radio' | 'drone' | 'goggles'; label: string; sends: string; links:
readonly ('control' | 'video')[] }` (drone: both),
  `SizesContent = { label: string; names: Record<SizeClassId, string>; columns: { size: string;
prop: string; frame: string } }`.
- Produces (`ui.ts`): `UI.intro.sheet` (`'Intro'`), `UI.intro.link` (`'What is an FPV drone?'`),
  `UI.app.introTitle` (`'What is an FPV drone? · Inside the Quad'`).

- [ ] **Step 1: Failing tests:** `SIZE_CLASSES.map(c => c.id)` is `['whoop','3in','5in','7in']`;
      the 5" prop range contains `Math.round(REFERENCE_5_INCH.prop.diameterIn * 25.4)` (127) and
      its frame range contains `REFERENCE_5_INCH.frame.wheelbaseMm` (225); ranges are min ≤ max and
      increase class by class. Intro: four sections with the four headings in scope order ("FPV vs
      camera drones", "The whole system", "Sizes", "Why 5-inch"); the scene's control detail
      contains `ExpressLRS` and `2.4 GHz`, the video detail `5.8 GHz` and `analog`; the drone's
      `links` are both; `JARGON` gains `FPV: /first-person view/i` and the intro says it; all intro text passes `expectJargonExplained`; the intro names DJI only
      with "for example"/"such as"; existing lesson tests still pass with the moved `JARGON`.
- [ ] **Step 2:** Run; fail. Write the data and copy (plain language, every term explained, facts
      from scope; numbers interpolated from `REFERENCE_5_INCH` and `SIZE_CLASSES`). `pnpm check`.
- [ ] **Step 3:** `feat(content): add the intro copy and drone size classes`

### Task 3: Intro read flag and start state

**Files:** Modify `src/features/progress/progress.ts`, `progress.test.ts`, `index.ts`. Create
`useIntroRead.ts`, `useIntroRead.test.tsx`.

**Interfaces:**

- Produces: `INTRO_READ_KEY = 'inside-the-quad.intro-read.v1'`; `useIntroRead(): { read: boolean;
toggle(): void; clear(): void }` (stores `'1'` when read, removes the key when not; try/catch
  like `useReadParts`; follows `storage` events). `StartState` gains `{ kind: 'intro' }`;
  `startState(read: ReadonlySet<PartId>, introRead: boolean): StartState` returns `intro` when
  `!introRead && read.size === 0`, else the 02c states.

- [ ] **Step 1: Failing tests:** `startState(new Set(), false)` is `intro`; `(new Set(), true)` is
      `start`; `(set('frame'), false)` is `continue` at motors; all parts read is `done` either
      way. `useIntroRead`: toggle on writes `'1'`, toggle off removes the key, `clear` removes it, a
      `storage` event updates it, and with `getItem`/`setItem`/`removeItem` throwing it starts
      false and toggles in memory.
- [ ] **Step 2:** Run; fail. Implement. Update the existing `startState` callers' tests in
      `part-explorer` only as far as compiling (pass `true`); Task 5 wires the real flag.
- [ ] **Step 3:** `feat(progress): track whether the intro is read`

### Task 4: The two drawings

**Files:** Create `src/features/intro/SystemScene.tsx`, `SystemScene.test.tsx`,
`SizeComparison.tsx`, `SizeComparison.test.tsx`, `index.ts`. Modify `src/styles/global.css`.
UI work via impeccable.

**Interfaces:**

- Consumes: `INTRO.scene`, `INTRO.sizes` (Task 2); `SIZE_CLASSES`, `drawingSizeMm` (Task 2).
- Produces: `SystemScene()` and `SizeComparison()`, no props, exported from
  `@/features/intro`.

- [ ] **Step 1: Failing tests (`SystemScene`):** the SVG is `aria-hidden` and contains no element
      with `tabindex`; a list labelled `INTRO.scene.label` has three buttons named by the device
      labels, each `aria-pressed="false"`; pressing Drone sets it pressed and marks both link
      paths highlighted (`data-highlight="true"` on `[data-link="control"]` and
      `[data-link="video"]`); pressing Drone again clears it; pressing Radio after Drone leaves only
      Radio pressed and only the control link highlighted; clicking the radio shape in the SVG
      (`[data-device="radio"]`) presses the Radio button. **(`SizeComparison`):** the SVG is
      `aria-hidden`; a table has one row per size class with its name, prop range and frame range
      in mm; the four drone shapes' rendered widths (`data-size` attribute in mm) are in strictly
      increasing order.
- [ ] **Step 2:** Run; fail. Implement: scene state is one `useState<DeviceId | null>`; hover
      preview is CSS only. Drawings in ink hairlines on the sheet tone, caps labels, the 5" marked
      "REFERENCE" in ink; SVGs scale to the column (`width: 100%`, `viewBox`).
- [ ] **Step 3:** Look at both at 320 px and 1280 px with impeccable, fix what one look shows,
      run its detector; `pnpm check`.
- [ ] **Step 4:** `feat(intro): draw the system scene and size comparison`

### Task 5: The intro sheet in the explorer

**Files:** Create `src/features/part-explorer/IntroPanel.tsx`, `IntroPanel.test.tsx`,
`SheetFooter.tsx`. Modify `LessonPanel.tsx` (use `SheetFooter`), `PartExplorer.tsx`,
`OverviewStart.tsx`, `ids.ts`, their tests, `src/shared/domain/parts.ts` (delete
`partNeighbours` and its tests), `src/content/ui.ts`, `src/styles/global.css`. UI via impeccable.

**Interfaces:**

- Consumes: `Page`, `pagePath`, `PartLink` (Task 1); `sheetNeighbours` (Task 1); `INTRO`
  (Task 2); `useIntroRead`, `startState` (Task 3); `SystemScene`, `SizeComparison` (Task 4).
- Produces: `SheetFooter({ sheet: SheetId; read: boolean; onToggleRead; onFollowLink })`,
  previous/next from `sheetNeighbours`, the intro's cell text `UI.intro.link`;
  `IntroPanel({ read, onClose, onToggleRead, onFollowLink })` with id `LESSON_PANEL_ID` and
  heading id `INTRO_TITLE_ID = 'intro-title'`; `UI.overview.newHere` (`'New to FPV? Start
here.'`), `UI.overview.knowBasics` (`'Already know the basics?'`).

- [ ] **Step 1: Failing tests:**
  - `IntroPanel`: heading "What is an FPV drone?"; a title block whose Sheet reads "Intro" (no
    Part, Qty or Spec cells); four balloon-numbered sections with the Task 2 headings; contains the scene's device buttons and the size table; footer has no
    Previous and a link `Next: Frame · sheet 1` to `/parts/frame`; Mark as read toggles.
  - `LessonPanel` for Frame: link `Previous: What is an FPV drone?` with `href="/intro"`.
  - `PartExplorer`: at `/intro` the intro heading shows, the title is the intro title, no
    parts-list row is pressed, the announcer says "What is an FPV drone? opened"; Close and
    Escape go to `/` and focus `OVERVIEW_FOCUS_ID`; the stub's background click leaves `/intro`;
    Escape on the overview leaves the URL and focus unchanged; following Frame's Previous focuses
    the intro heading; Back from the intro to a lesson (pop) focuses that lesson's heading.
  - `OverviewStart`: fresh visitor sees "New to FPV? Start here.", a link
    `What is an FPV drone?` (`/intro`) carrying `OVERVIEW_FOCUS_ID`, and "Start with sheet 1:
    Frame"; after the intro is read (no parts) the 02c start link carries the focus id and Clear
    progress shows with no count; Clear progress clears parts and intro; a quiet
    `What is an FPV drone?` link is present in every state.
- [ ] **Step 2:** Run; fail. Implement. The open sheet is the part or the intro: Escape closes
      only when one is open, and the 02c focus, pop-focus and reveal rules (including the
      deep-link reveal on phones) apply to the intro with `INTRO_TITLE_ID` as its heading.
- [ ] **Step 3:** Look at the intro sheet and the overview at 320, 768 and 1280 px with impeccable;
      fix what one look shows; run its detector; `pnpm check`.
- [ ] **Step 4:** `refactor(part-explorer): share the sheet footer`, then
      `feat(part-explorer): add the intro sheet before sheet 1`

### Task 6: End-to-end coverage

**Files:** Create `e2e/intro.spec.ts`. Modify `e2e/navigation.spec.ts` where the start link's name
changed for a fresh visitor.

- [ ] **Step 1:** Tests: `/intro` and `/intro/` load the intro, also after reload; a fresh
      visitor's start block leads to the intro, Next leads to Frame, Frame's Previous back to the
      intro; overview → intro → Frame, then Back twice lands on the intro heading, then the start
      link, focused; from `/parts/esc` (stack open) following links to the intro leaves no
      selected row and no redline on the canvas (`redlinePixels` is 0); marking the intro read
      changes the start block to "Start with sheet 1: Frame"; at 320 × 640 with `stretchText` the
      intro sheet and overview have no horizontal overflow; at 900/1000/1100 × 700 `/intro` causes
      no page scroll.
- [ ] **Step 2:** `pnpm test:e2e` passes locally and against the Docker image.
- [ ] **Step 3:** `test(e2e): cover the intro sheet and its start path`

### Task 7: Docs

**Files:** `docs/roadmap.md` (04 `in review`), `PRODUCT.md` (built so far), `DESIGN.md`,
`.impeccable/design.json`, the surface brief (intro sheet, drawings, start block),
`docs/architecture/overview.md` (intro route, `sheets.ts`, `features/intro`, intro flag).

- [ ] **Step 1:** Update; `pnpm check` passes.
- [ ] **Step 2:** `docs: describe the intro sheet`

## Acceptance

- `pnpm check`, `pnpm test:e2e` and CI (including e2e against the Docker image) are green.
- Every Review Focus item has its test.
- The independent Opus review is written to `docs/reviews/04-intro.md`, each finding resolved or
  deferred, before the PR is opened.
