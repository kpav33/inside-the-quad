# Section 07 — Check a build: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (or
> superpowers:subagent-driven-development) to implement this plan task-by-task, and the
> `impeccable:impeccable` skill for every UI edit (read its `reference/craft-floor.md` immediately
> before editing UI). Steps use checkbox (`- [ ]`) syntax. Branch: `feat/checker`.

**Goal:** A **Check a build** sheet (`/check`) where a beginner picks their parts' numbers and sees
seven checks say Fits, Doesn't fit or Check this, each with why and a lesson link.

**Architecture:** The rules are plain TypeScript in `shared/domain/build-check.ts`
(`checkBuild(build)` returns one result per check, statuses and the numbers behind them, no
words); the words live in `content/checker.ts`. `check` joins the sheets as a fourth chapter
("Plan a build"); the build itself lives in the query string, read and written by a small codec in
`shared/routing`. A `CheckPanel` in the explorer shows the results and the pick lists; the 3D
drawing lights the parts of the check under the pointer or focus.

**Tech Stack:** React 19, TypeScript strict, Vitest + Testing Library, Playwright.

**Spec:** [07-checker-design.md](07-checker-design.md). Its pick-list table, the seven-checks table
and "Decided calls" are binding.

## Global Constraints

- Node 22: prefix node/pnpm commands with `source ~/.nvm/nvm.sh && nvm use >/dev/null &&`.
- Address `/check`; the build in the query string, only fields that differ from the reference,
  written with `history.replaceState` (never pushed). Unknown, out-of-list or malformed values fall
  back to the reference value for that field.
- Order: Frame, FC/ESC stack, Motors, Props, Battery, Camera, VTX, Goggles. Reference: 5″ frame,
  30.5 / 19 / 16 mm; stack 30.5 mm, ESC and FC 3–6S; motors 16 mm, 1950 KV; 5″ props; 6S; camera
  19 mm; analog VTX; analog goggles.
- Statuses: `fits`, `check`, `fails`, shown as **Fits**, **Check this**, **Doesn't fit**, each with
  an SVG mark (✓ / ! / ✕); only Doesn't fit in redline. No brand or product names, no prices.
- New spec values: `esc.batteryCells: [3, 6]`, `fc.batteryCells: [3, 6]`. Every threshold comes from
  the design's tables (KV bands: 5″ 6S 1750–1950, 4S 2400–2700; 5″ 6S with ≥ 2400 KV fails).
- KV is a typed whole number, 500–5000; anything else is "not entered" (the KV check says to enter
  it, status `check`), and is left out of the address.
- 02d holds: no sideways scroll at 320 px with 200 % text; focus visible; results announced
  politely when they change.

## Review Focus

1. **Typed KV:** empty, `abc`, `2400.5`, `99999` → no crash; the KV check reads "enter the KV"
   (Check this); the address drops `kv`. (Task 1 + Task 4 tests.)
2. **Tampered addresses:** `/check?stack=31&cells=9&kv=abc&video=x` → those fields show reference
   values, the page renders, nothing is thrown; `/check/?kv=2400` keeps its query when the trailing
   slash is removed. (Task 3 test.)
3. **Back after several picks** leaves the sheet in one step: picks replace history, never push.
   (Task 5 e2e.)
4. **Long option labels at 320 px / 200 % text** ("Digital with an analog receiver") → the selects
   wrap or shrink, no sideways scroll. (Task 5 e2e.)
5. **Reset** restores every field and clears the query string; results all Fits again.
   (Task 4 test.)

---

### Task 1: The rules

**Files:**

- Create: `src/shared/domain/build-check.ts` (+ `build-check.test.ts`)
- Modify: `src/shared/domain/drone-spec.ts` (+ test): `esc.batteryCells`, `fc.batteryCells`

**Interfaces:**

- Produces:

  ```ts
  export type CellRange = readonly [min: number, max: number];
  export interface Build {
    frameSizeIn: 3 | 5 | 7;
    frameStackMm: 30.5 | 25.5 | 20;
    frameCameraMm: 28 | 21 | 19 | 14;
    frameMotorMm: 16 | 12 | 9;
    stackMm: 30.5 | 25.5 | 20;
    escCells: CellRange; // one of [1,2] [2,4] [3,6] [3,8]
    fcCells: CellRange;
    motorMm: 16 | 12 | 9;
    kv: number | null; // null: not entered
    propIn: 3 | 4 | 5 | 6 | 7;
    cells: 2 | 3 | 4 | 5 | 6;
    cameraMm: 28 | 21 | 19 | 14;
    vtxVideo: 'analog' | 'digital';
    goggles: 'analog' | 'digital' | 'digital-analog';
  }
  export type CheckId = 'stack' | 'camera' | 'motor-mount' | 'props' | 'voltage' | 'kv' | 'video';
  export type CheckStatus = 'fits' | 'check' | 'fails';
  export interface CheckResult {
    id: CheckId;
    status: CheckStatus;
    /** Why, as a key the copy turns into words (e.g. 'camera-narrower', 'esc-cells'). */
    reason: string;
    /** The drone parts this check is about, lit on the drawing. */
    parts: readonly PartId[];
  }
  export const BUILD_OPTIONS: { [K in keyof Build]?: readonly Build[K][] };
  export const REFERENCE_BUILD: Build; // from REFERENCE_5_INCH
  export const CHECK_IDS: readonly CheckId[]; // in the order above
  export function checkBuild(build: Build): CheckResult[];
  ```

- [ ] **Step 1: Write the failing tests** in `build-check.test.ts`:
  - `REFERENCE_BUILD` matches the reference (30.5, 19, 16, 1950, 5, 6, analog…) and
    `checkBuild(REFERENCE_BUILD)` is seven `fits` in `CHECK_IDS` order;
  - one `it` per row of the design's seven-checks table, covering every status cell, e.g.
    stack 20 on a 30.5 frame → `fails`; camera 14 on a 19 mount → `check` (`camera-narrower`),
    21 → `fails`; prop 7 on a 5″ frame → `fails`, 4 → `fits`, 3 → `check`; 6S with ESC 2–4S →
    `fails` (`esc-cells`), FC 2–4S → `fails` (`fc-cells`); 4S with 2500 KV → `fits`; 6S 2100 →
    `check`; 6S 2400 → `fails`; 7″ frame 1300 KV → `check` (`kv-other-size`); `kv: null` →
    `check` (`kv-missing`); analog VTX + digital goggles → `fails`, + digital-analog → `fits`;
    digital + digital → `check`, + analog → `fails`;
  - each result's `parts` equals the design's Lights column.
- [ ] **Step 2: Run; expected FAIL** (module missing):
      `pnpm exec vitest run src/shared/domain/build-check.test.ts`
- [ ] **Step 3: Implement** `build-check.ts` and the two spec values (both `[3, 6]`).
- [ ] **Step 4: Run; expected PASS.**
- [ ] **Step 5: Commit** `feat(domain): check whether a build's parts fit together`

### Task 2: The words

**Files:**

- Create: `src/content/checker.ts` (+ `checker.test.ts`)
- Modify: `src/content/ui.ts` (`UI.checker`: title `Check a build`, chapter `Plan a build`,
  masthead link `Check a build`, status words, Reset, summary)

**Interfaces:**

- Consumes: `Build`, `CheckResult`, `CheckId`, `BUILD_OPTIONS` (Task 1).
- Produces: `CHECKER.lead: string`; `CHECKER.groups` (each part: heading and its fields' labels, in
  the design's order); `optionLabel(field: keyof Build, value): string` (`30.5 mm`, `3–6S`, `5″`,
  `Digital with an analog receiver`); `checkName(id: CheckId): string`;
  `checkReason(result: CheckResult, build: Build): string` (one line with the numbers involved);
  `checkLesson(id: CheckId): PartId` (frame, frame, motors, props, battery, motors, vtx).

- [ ] **Step 1: Write the failing test** `checker.test.ts`: every check id has a name and a lesson;
      every reason key `checkBuild` can return has a sentence (drive it from the Task 1 cases);
      the camera-narrower reason contains `14 mm` and `19 mm`; the esc-cells reason names the
      ESC and `6S`; the voltage `fits` reason says the camera and VTX run from the flight
      controller's regulated power; the digital + digital reason says they must be the same system;
      no copy matches `/DJI|Walksnail|HDZero|Radiomaster|TBS|Fat ?Shark|ISDT|\$|€/i`.
- [ ] **Step 2: Run; expected FAIL.**
- [ ] **Step 3: Write the copy** in the lessons' voice, checked against frame, motors, props, ESC,
      FC, battery, camera, VTX and goggles copy.
- [ ] **Step 4: Run; expected PASS.**
- [ ] **Step 5: Commit** `feat(content): add the checker's words`

### Task 3: The sheet in the set and the address

**Files:**

- Create: `src/shared/domain/check.ts` (`CHECK_SHEET = 'check'`), `src/shared/routing/build-query.ts`
  (+ test)
- Modify: `sheets.ts` (+ test), `routes.ts` (+ test), `usePartRoute.ts`, `history.ts`
  (`replaceSearch`), `ui.ts` (`sheetName`, chapter `build`, footer `endOf`/`backTo`, overview
  count), `OverviewStart.tsx`, `ChapterSwitcher.tsx` (no switcher for a one-sheet chapter),
  `src/app/App.tsx` (masthead link), `progress.ts` (+ test)

**Interfaces:**

- Consumes: `Build`, `REFERENCE_BUILD`, `BUILD_OPTIONS` (Task 1).
- Produces: `Chapter` gains `'build'`, `CHAPTER_SHEETS.build = ['check']`; `Route` gains
  `{ kind: 'check' }`; `pagePath('check') === '/check'`; `parseBuild(search: string): Build`;
  `buildSearch(build: Build): string` (`''` for the reference, else `?a=b&…` with only differing
  fields, in a fixed order); `replaceSearch(search: string): void` (replaceState, same path, no
  history entry, wakes subscribers).

- [ ] **Step 1: Write the failing tests**:
  - `build-query.test.ts`: `parseBuild('')` → `REFERENCE_BUILD`; round trip of a changed build;
    `buildSearch(REFERENCE_BUILD) === ''`; `parseBuild('?stack=31&cells=9&kv=abc&video=x')` →
    reference for those fields (Review Focus 2); `kv=2400.5` and `kv=99999` → `kv` stays the
    reference.
  - `sheets.test.ts`: `sheetNeighbours('charger').next === 'check'`, `sheetNeighbours('check').next
=== null`, `chapterOf('check') === 'build'`.
  - `routes.test.ts`: `/check` and `/check/` → `{ kind: 'check' }`; `/check/x` → unknown.
  - `usePartRoute.test.tsx`: at `/check/?kv=2400` the canonical address is `/check?kv=2400`.
  - `progress.test.ts`: `check` is a readable sheet; `startState` is `done` only with it read.
  - `OverviewStart`/explorer test: the count ends `· Build 0 of 1`.
- [ ] **Step 2: Run; expected FAIL.**
- [ ] **Step 3: Implement.** The footer on Charger reads "End of the gear: Plan a build, sheet 1:
      Check a build". The masthead's fourth link is `Check a build`; re-run the 900 × 700 fit test
      and, if the masthead wraps, widen the tagline band from Task 7 of section 06 to whatever
      keeps one row (ledger a ruling).
- [ ] **Step 4: Run; expected PASS**, then `pnpm check`.
- [ ] **Step 5: Commit** `feat(routing): add the Check a build sheet and its address`

### Task 4: The sheet

**Files:**

- Create: `src/features/part-explorer/CheckPanel.tsx` (+ test), `useBuild.ts` (+ test)
- Modify: `PartExplorer.tsx` (+ test), `ids.ts` (`CHECK_TITLE_ID`), `src/styles/global.css`,
  `src/shared/ui/icons.tsx` (check / warning / cross marks if missing)

**Interfaces:**

- Consumes: Tasks 1–3.
- Produces: `useBuild(): { build: Build; set: (change: Partial<Build>) => void; reset: () => void }`
  (reads `parseBuild(location.search)`, writes with `replaceSearch(buildSearch(...))`);
  `CheckPanel({ build, onChange, onReset, onHighlight, read, onClose, onToggleRead, onFollowLink })`
  where `onHighlight(parts: readonly PartId[] | null)`.

- [ ] **Step 1: Write the failing tests**:
  - `CheckPanel.test.tsx`: heading `Check a build`, title block "Sheet 1 of 1", chapter
    "Plan a build"; seven results in order, all Fits, summary `7 fit`; picking Camera width 21 in
    its `<select>` calls `onChange({ cameraMm: 21 })`; with that build the camera result reads
    Doesn't fit, carries the reason and a link to the Frame lesson, and the summary reads
    `6 fit · 1 doesn't`; the results region is `aria-live="polite"`; hovering or focusing a result
    calls `onHighlight(['frame', 'camera'])`, leaving or blur `onHighlight(null)`; typing `abc`
    in KV calls `onChange({ kv: null })` (Review Focus 1); Reset calls `onReset`.
  - `useBuild.test.ts`: `set({ cells: 4 })` writes `?cells=4` with no new history entry;
    `reset()` clears the query (Review Focus 5).
  - `PartExplorer.test.tsx`: at `/check?camera=21` the camera result is Doesn't fit and the
    drawing gets no open part until a result is pointed at, then `['frame', 'camera']`.
- [ ] **Step 2: Run; expected FAIL.**
- [ ] **Step 3: Implement** in the design's layout: title block, lead, summary, results (status
      mark and word, check name, reason, lesson link), then the parts grouped under their
      headings (label + native `<select>`; KV an `<input inputmode="numeric">` with its own label
      and the 500–5000 hint), Reset, footer. The drawing is the part-sheet drawing with the
      pointed check's parts open (`partDrawing`-like, no turn).
- [ ] **Step 4: Run; expected PASS**, then `pnpm check`; look at 1280 and 390 px.
- [ ] **Step 5: Commit** `feat(part-explorer): add the Check a build sheet`

### Task 5: End to end and docs

**Files:**

- Create: `e2e/checker.spec.ts`
- Modify: `e2e/navigation.spec.ts` (walk ends on Check a build; overview count),
  `e2e/reflow.spec.ts` (`/check`, `/check?camera=21&kv=2400`), DESIGN.md (Check a Build sheet,
  status marks), PRODUCT.md, `docs/architecture/overview.md`, `docs/product/scope.md` (checker
  done), `docs/roadmap.md` (06 done, 07 in review), `.impeccable/design.json`, the surface brief.

- [ ] **Step 1: Write `e2e/checker.spec.ts`**:
  - the masthead link and Next from Charger open the sheet, all seven Fits;
  - pick Camera 21 → Doesn't fit with the Frame lesson link; reload keeps it; the address has
    `camera=21`;
  - type KV 2400 with 6S → Doesn't fit; switch Battery to 4S → Fits;
  - pick three values, press Back once → the page before the sheet (Review Focus 3);
  - Reset → all Fits and no query string;
  - 320 × 667 with 200 % text: no sideways scroll with Goggles set to "Digital with an analog
    receiver" (Review Focus 4).
- [ ] **Step 2: Run; expected PASS:**
      `pnpm exec playwright test e2e/checker.spec.ts e2e/navigation.spec.ts e2e/reflow.spec.ts`
- [ ] **Step 3: Docs** as listed.
- [ ] **Step 4:** `pnpm check`, full `pnpm test:e2e`, Docker image e2e.
- [ ] **Step 5: Commit** `test(e2e): cover Check a build` and `docs: record Check a build`
