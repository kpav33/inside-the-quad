# Section 05a — Paths: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (or
> superpowers:subagent-driven-development) to implement this plan task-by-task, and the
> `impeccable:impeccable` skill for every UI edit (read its `reference/craft-floor.md` immediately
> before editing UI). Steps use checkbox (`- [ ]`) syntax. Branch: `feat/paths`.

**Goal:** Three path sheets (Control, Power, Video) after the 11 part sheets, each a numbered walk
through the parts on the 3D drawing with a redline leader from stop to stop.

**Architecture:** Path ids join the sheet ids and the routing hook (`/paths/<id>`). Path content
(stops, text, which stops each feeds) lives in `src/content/paths/`. Stops name model anchors; a
pure module in `drone-model` turns anchors into points from the model's own layout functions, and
a `PathLeader` component draws them. The explorer gains a `PathPanel` and a `usePathStep` hook that
owns the current step and play; the viewer takes a set of open parts instead of one part.

**Tech Stack:** React 19, TypeScript strict, react-three-fiber + drei (`Line`, `Html`), Vitest +
Testing Library, Playwright.

**Spec:** [05a-paths-design.md](05a-paths-design.md). Read it first; its stop table and its
"Branches", "Stops on part of a part" and "off-drone ends" paragraphs are binding.

## Global Constraints

- Node 22: prefix node/pnpm commands with `source ~/.nvm/nvm.sh && nvm use >/dev/null &&`.
- Addresses `/paths/control`, `/paths/power`, `/paths/video`; order Control, Power, Video, after
  Extras. Sheet numbers count the whole set: parts "x of 14", Control "12 of 14".
- Masthead link text: `How it works together`, to `/paths/control`, current on any path sheet.
- Tokens only, no new colours; redline only for the current selection, current sheet and focus.
  Faint leader uses an opacity, not a new colour.
- Text in `src/content/` (paths in `src/content/paths/`, interface words in `ui.ts`). Numbers in
  stop text come from the reference spec and must match the lessons.
- 02d holds: no sideways scroll at 320 px with 200 % text; focus follows the opened sheet; reduced
  motion live. No model geometry or selection changes (whole parts light up).
- Each task ends with `pnpm check` passing and a Conventional Commit (header ≤ 72 chars, body
  lines ≤ 100).

## Review Focus

1. **Leaving a path mid-play** (another path, a part, Back, Escape): play stops and the new path
   starts at step 1; no step index from one path is used on another. Pinned in Task 6's
   `usePathStep` tests.
2. **Read progress stored before this section** (part ids only) and junk values: kept and parsed,
   path ids accepted alongside. Pinned in Task 2's `parseReadSheets` tests.
3. **Reduced motion switched on during play:** the dashes stop at once, stepping still works.
   Pinned in Task 5's `dashOffset` test and Task 6's e2e.
4. **A phone at 390 px:** every numbered marker and end label sits inside the drawing field on all
   three paths. Pinned in Task 6's e2e.
5. **Back/Forward between path sheets:** focus moves to the sheet heading and the step is 1.
   Pinned in Task 6's e2e.

---

### Task 1: Path sheets and their addresses

**Files:** Create `src/shared/domain/paths.ts`. Modify `src/shared/domain/sheets.ts`,
`src/shared/routing/{routes.ts,usePartRoute.ts,index.ts}`, their tests, `LessonPanel.tsx`,
`SheetFooter.tsx`, `src/content/ui.ts`.

**Interfaces — produces:**

- `PATH_IDS = ['control', 'power', 'video'] as const`; `type PathId`; `isPathId(v: unknown): v is PathId`.
- `type AnchorId = 'radio' | 'receiverAntenna' | 'receiver' | 'fc' | 'esc' | 'capacitor' | 'xt60' |
'battery' | 'motors' | 'props' | 'camera' | 'vtx' | 'vtxAntenna' | 'goggles'` (in `paths.ts`).
- `SheetId = 'intro' | PartId | PathId`; `SHEET_IDS = ['intro', ...PART_IDS, ...PATH_IDS]`;
  `NUMBERED_SHEETS = [...PART_IDS, ...PATH_IDS]` (14); `sheetNumber(sheet: Exclude<SheetId,'intro'>): number` (1-based).
- `Route` adds `{ kind: 'path'; path: PathId }`; `PageRoute` likewise; `Page = SheetId | null`;
  `PATH_PREFIX = '/paths/'`; `pathSheetPath(path: PathId): string`; `pagePath` handles paths;
  canonical form strips a trailing slash as for parts.

- [ ] **Step 1: Failing tests.** `sheets.test.ts`: `sheetNumber('frame') === 1`,
      `sheetNumber('extras') === 11`, `sheetNumber('control') === 12`, `sheetNumber('video') === 14`;
      `sheetNeighbours('extras').next === 'control'`, `sheetNeighbours('video').next === null`.
      `routes.test.ts`: `parseRoute('/paths/power')` → `{kind:'path', path:'power'}`;
      `'/paths/power/'` the same; `'/paths/wires'` → `{kind:'unknown', slug:'wires'}`;
      `pagePath('video') === '/paths/video'`. `usePartRoute.test.tsx`: `/paths/control/` is replaced
      by `/paths/control`. `LessonPanel.test.tsx`: the frame sheet shows `1 of 14`.
- [ ] **Step 2:** Run; fail. Implement. Replace every `PART_IDS.indexOf(x) + 1` sheet number and
      `PART_IDS.length` sheet count in `LessonPanel` and `SheetFooter`'s `SheetRef` with
      `sheetNumber` / `NUMBERED_SHEETS.length`; `SheetRef` for a path shows its title from
      `UI.paths.title[path]` (add `UI.paths.title: Record<PathId, string>` = `Control path`,
      `Power path`, `Video path`). Run; pass. `pnpm check`.
- [ ] **Step 3:** `feat(routing): give the three path sheets their addresses`

### Task 2: Reading progress across all 14 sheets

**Files:** Modify `src/features/progress/{progress.ts,useReadParts.ts,index.ts}` and tests,
`OverviewStart.tsx` and its test, `PartExplorer.tsx` (types only).

**Interfaces — produces:** `type ReadableSheet = PartId | PathId`; `parseReadSheets(raw): ReadonlySet<ReadableSheet>`
(renamed from `parseReadParts`, same key `READ_PARTS_KEY`, so old data stays);
`serializeReadSheets`; `firstUnread(read): ReadableSheet | null` in `NUMBERED_SHEETS` order;
`StartState` `continue` becomes `{ kind: 'continue'; sheet: ReadableSheet }`; `useReadParts()`
keeps its name, `read: ReadonlySet<ReadableSheet>`, `toggle(sheet: ReadableSheet)`.

- [ ] **Step 1: Failing tests.** `parseReadSheets('["frame","power","nope",3]')` → `{frame, power}`;
      `parseReadSheets('["frame"]')` (data from before) → `{frame}`; malformed JSON → empty.
      `firstUnread(all 11 parts)` → `'control'`; all 14 → `null`. `startState(all 11 parts, true)` →
      `{kind:'continue', sheet:'control'}`. `OverviewStart`: with all parts read it offers
      `Continue with sheet 12: Control path`; the count reads `x of 14`; "all read" only when 14 are.
- [ ] **Step 2:** Run; fail. Implement (`UI.explorer` continue text takes the sheet's label: part
      label or path title). Run; pass. `pnpm check`.
- [ ] **Step 3:** `feat(progress): count the path sheets in reading progress`

### Task 3: Path content

**Files:** Create `src/content/paths/{types.ts,control.ts,power.ts,video.ts,index.ts,paths.test.ts}`.

**Interfaces — produces:**

```ts
interface PathStop {
  /** Stop name shown in the list, e.g. "Flight controller". */
  name: string;
  /** Parts lit in the open look at this step, each linked to its lesson; empty for an end. */
  parts: readonly PartId[];
  /** An off-drone end; its name links to the intro sheet. */
  end?: 'radio' | 'goggles';
  /** Where the leader touches this stop. */
  anchors: readonly AnchorId[];
  /** Indexes of the stops this one feeds; empty at a path's end or a branch end. */
  feeds: readonly number[];
  text: string;
}
interface PathContent {
  id: PathId;
  title: string;
  lead: string;
  stops: readonly PathStop[];
}
const PATHS: Record<PathId, PathContent>;
function pathParts(path: PathId): ReadonlySet<PartId>; // union of all stops' parts
```

Stops (spec table and "Branches"): Control: radio → receiver (anchors `receiverAntenna`,
`receiver`) → flight controller → ESC → motors → propellers, each feeding the next. Power: 1
battery → 2 XT60 and capacitor (parts `battery`, `esc`; anchors `xt60`, `capacitor`) → 3 ESC
(feeds 4 and 5) → 4 motors (feeds none) → 5 flight controller's regulators (anchor `fc`, feeds 6)
→ 6 receiver, camera and VTX (parts and anchors all three). Video: camera → flight controller
(OSD) → VTX → VTX antenna (part `vtx`, anchor `vtxAntenna`) → your goggles.

- [ ] **Step 1: Failing tests** in `paths.test.ts`: stop names in the orders above (6, 6, 5 stops);
      Power stop 3 `feeds` is `[3, 4]` and stop 4 `feeds` is `[]`; every `feeds` index points
      forward and in range; every stop but the last of each path feeds something, except Power's
      motors; exactly the radio and goggles stops have `end` and `parts: []`; every other stop has
      at least one part; text and lead non-empty; for every on-drone stop A feeding B, they share
      a part or some part of one is in `connectedParts` of a part of the other — keeps paths and
      lessons agreeing; `pathParts('video')` is `{camera, fc, vtx}`.
- [ ] **Step 2:** Run; fail. Write the content (plain words, checked against the lessons and
      `REFERENCE_5_INCH`; e.g. the BEC voltages come from the spec as `fc.ts` does). If the
      connections test exposes a lesson that omits a real connection, fix the lesson, not the
      test, and ledger it. Run; pass. `pnpm check`.
- [ ] **Step 3:** `feat(content): describe the control, power and video paths`

### Task 4: Leader geometry

**Files:** Create `src/features/drone-model/path-anchors.ts`, `path-anchors.test.ts`.

**Interfaces — consumes** `AnchorId` (Task 1); `motorPlacements`, `rearBay`, `escBox`,
`xt60Box`, `cameraPlacement`, `stackLayers`, `explodedOffsets` and `droneOutlineMm`'s blade-tip
corners (existing). **Produces:**

- `anchorPoints(spec: DroneSpec, anchor: AnchorId, lift: Record<LiftGroup, number>): Vec3[]` in mm:
  one point per instance (`motors` and `props` give four, in `motorPlacements` order), on top of
  the piece so the leader is not hidden inside it, lifted with its group when the frame is open.
- `leaderSegments(from: Vec3[], to: Vec3[]): [Vec3, Vec3][]`: one point to many fans out; equal
  counts pair by index; otherwise each `to` point from its nearest `from` point.
- `endPoint(spec, 'radio' | 'goggles')`: both on the segment between the two rear blade-tip
  corners of the fit outline (so always inside the fitted view), radio left of centre, goggles
  right.

- [ ] **Step 1: Failing tests:** `anchorPoints(spec,'motors',closed)` has 4 points equal in x/z to
      the motor placements; `props` points sit above the matching motor points; `fc` with the
      open lift is higher than closed by `lift.fc`; `receiverAntenna` lies within the receiver
      antenna's bar ends; `leaderSegments([a],[b,c,d,e])` → 4 segments from `a`;
      `leaderSegments([a1..a4],[b1..b4])` pairs by index; both end points are convex combinations
      of the two rear blade-tip corners.
- [ ] **Step 2:** Run; fail. Implement. Run; pass. `pnpm check`.
- [ ] **Step 3:** `feat(drone-model): place path anchors on the model`

### Task 5: The leader on the drawing

**Files:** Create `src/features/drone-model/PathLeader.tsx`, `leader-motion.ts` (+ test). Modify
`DroneModel.tsx`, `materials.ts` (+ test), `index.ts`, `src/features/drone-viewer/DroneViewer.tsx`,
`TurnToPart.tsx` (prop rename only), `src/shared/design/tokens.ts` (`MODEL_LOOK.leaderPassedOpacity`),
`src/styles/global.css` (marker and end-label styles). UI via impeccable.

**Interfaces — produces:**

- `partLook(part, open: ReadonlySet<PartId>, connected)`: `open.size === 0` → `'normal'`.
- `interface LeaderStop { anchors: readonly AnchorId[]; feeds: readonly number[]; marker: number; endLabel?: string }`;
  `interface Leader { stops: readonly LeaderStop[]; step: number }`.
- `DroneModelProps` / `DroneViewerProps`: `openParts: ReadonlySet<PartId>` replaces
  `selectedPart`; new `exploded: boolean`, `turnTo: PartId | null`, `leader: Leader | null`.
- `dashOffset(elapsedS: number, reduceMotion: boolean): number` — 0 when reduced, else moves
  toward the next stop.

Drawing rules (spec decision 7): segments out of stops before `step` solid at
`leaderPassedOpacity`; segments out of stop `step` to every stop in its `feeds` dashed, moving;
nothing ahead. A numbered marker (drei `Html`, `aria-hidden`, token styles, the current one in
redline) at each stop up to `step`; end labels ("Your radio", "Your goggles") as `Html` at the end
points. While dashes move and motion is allowed, keep invalidating frames (the canvas is
`frameloop="demand"`); stop when not.

- [ ] **Step 1: Failing tests:** `materials.test.ts` updated to the set form, plus two open parts
      both `'open'`. `leader-motion.test.ts`: `dashOffset(2, true) === 0`; offsets at 0 and 0.5 s
      differ when not reduced. `DroneModel`/`PartExplorer` tests still pass with a part sheet
      passing `openParts={new Set([part])}`, `exploded={isInsidePart(part)}`, `turnTo={part}`.
- [ ] **Step 2:** Run; fail. Implement. Run; pass; `pnpm check`; the existing e2e
      (`explorer`, `fit`) pass — part sheets look exactly as before.
- [ ] **Step 3:** `feat(drone-model): draw the path leader`

### Task 6: The path sheet

**Files:** Create `src/features/part-explorer/{PathPanel.tsx,PathPanel.test.tsx,usePathStep.ts,usePathStep.test.ts}`,
`e2e/paths.spec.ts`. Modify `PartExplorer.tsx` (+ test), `src/app/App.tsx` (+ test),
`src/content/ui.ts`, `src/styles/global.css`, `e2e/reflow.spec.ts` (add the three paths). UI via
impeccable.

**Interfaces — consumes** Tasks 1–5. **Produces:**

- `usePathStep(path: PathId | null, stopCount: number): { step; goTo(i); next(); previous(); playing; play(); stop() }`;
  `PLAY_INTERVAL_MS = 3500`. Reset to 0 and stop when `path` changes; play advances to the last
  step and stops; `goTo`, `next`, `previous` stop play.
- `<PathPanel path={PathContent} step onStep(i) playing onPlay onStop read onToggleRead onClose onFollowLink />`:
  heading (the path title, focus target `pathTitleId(path)` in `ids.ts`), `TitleBlock` (sheet
  `x of 14`, specs `[{ label: 'Stops', value: String(stops.length) }]`), lead, a path switcher
  (`nav` of three `PartLink`s, `aria-current="page"` on the open one), an `ol` of stops (current
  one marked with `aria-current="step"`; a one-part stop's name is a `PartLink` to that part, an
  end's to the intro, a several-part stop's name is plain with a `Lessons:` line of one link per
  part), step controls
  (`Previous step`, `Next step`, `Play the path` / `Stop`), a polite live region announcing
  `UI.paths.stepAnnounce(n, total, name, text)`, then `SheetFooter`.
- Explorer on a path sheet: `openParts` = current stop's parts, `connectedParts` = `pathParts`
  minus those, `exploded = true`, `turnTo` = current stop's first part (none for an end),
  `leader` from the content. Escape stops play before it closes the sheet. Document title
  `UI.app.pageTitle(title)`. Masthead: second link `UI.app.pathsLink` = `How it works together`.

- [ ] **Step 1: Failing tests.** `usePathStep`: next/previous clamp at the ends; play reaches the
      last step after `(n-1) × PLAY_INTERVAL_MS` (fake timers) and stops; `next()` during play
      stops it; changing `path` resets to 0 and stops (Review Focus 1). `PathPanel`: stops in
      order with links (radio links to `/intro`; Power stop 6 links receiver, camera and VTX); `Next step` moves `aria-current="step"` and
      the live region names the new stop; the switcher marks the open path. `PartExplorer`:
      `/paths/power` renders the sheet with `12`→`13 of 14`; with the viewer throwing, the stop
      list still renders. `App`: the nav has `How it works together`, current on `/paths/video`.
- [ ] **Step 2:** Run; fail. Implement. Run; pass. `pnpm check`.
- [ ] **Step 3: e2e** `e2e/paths.spec.ts`: masthead link opens `/paths/control` with heading
      focused; `Next step` twice marks stop 3 (flight controller); Next sheet from Extras opens
      Control; Back from Power to Control focuses the Control heading and stop 1 is current
      (Review Focus 5); at 390 × 844 and 1280 × 720, on each path stepped to its last stop, every
      `.path-marker` and `.path-end` box lies inside `.drawing-canvas` (Review Focus 4); with
      `reducedMotion: 'reduce'`, `Play the path` still advances the stop (Review Focus 3).
      `reflow.spec.ts` covers the three paths. Run `pnpm test:e2e`; pass.
- [ ] **Step 4:** Look at each path, every step, at 390, 768 and 1280 px with impeccable; the
      leader must read cleanly (spec anti-goal). Adjust anchors in Task 4's module if a stretch
      hides behind a part; rerun its tests.
- [ ] **Step 5:** `feat(part-explorer): add the path sheets`

### Task 7: Docs

**Files:** `PRODUCT.md` (paths built), `DESIGN.md` and `.impeccable/design.json` (Path Sheet and
Path Leader components; leader redline as current selection), `.impeccable/surfaces/…` brief,
`docs/architecture/overview.md` (path content, anchors, leader, step hook), `docs/roadmap.md`
(05 split into 05a/05b/05c; 05a `in review`, branch `feat/paths`), `docs/product/scope.md`
(Module 3 note on the split), ADR 0004 unchanged (the paths fit its "later pages").

- [ ] **Step 1:** Update; `pnpm check`.
- [ ] **Step 2:** `docs: describe the path sheets`

## Acceptance

- `pnpm check`, `pnpm test:e2e` and CI (including e2e against the Docker image) are green.
- Every Review Focus item has its test.
- The user has seen the three paths in the browser before the PR.
- The independent review (Codex gpt-6.1-sol) is written to `docs/reviews/05a-paths.md`, each
  finding resolved or deferred, before the PR is opened.

## Amendment 1 tasks

Spec: "Amendment 1" in the design doc. Same constraints and commit rules.

- **Task 8 — Chapters.** `shared/domain/sheets.ts`: `Chapter = 'parts' | 'paths'`,
  `chapterOf(sheet)`, `CHAPTER_SHEETS`, `sheetNumber` within its chapter, `chapterCount(sheet)`.
  Lesson "x of 11", path "x of 3"; `SheetFooter` marks crossings (`UI.lesson.endOfParts`,
  `UI.lesson.backToParts`, path refs "How it works together, sheet n: Title"); `TitleBlock` takes
  `chapter`; path content gains `from`, `to`, `carries`; overview counts per chapter and its
  "all read" and continue texts name chapters. Tests first in `sheets.test.ts`,
  `LessonPanel.test.tsx`, `PathPanel.test.tsx`, `OverviewStart`/explorer tests; e2e navigation walk
  updated. `feat: split the drawing set into two chapters`
- **Task 9 — Step in the address.** `Route` path gains `step` (1-based, from `/paths/<id>/<n>`;
  canonical drops `/1`); `pagePath(page, step?)`; `PartLink` takes `step`; `usePartRoute` gains
  `replaceStep(path, step)`. `usePathStep(path, stopCount, step, onStep)` keeps only Play; the
  explorer clamps and replaces an out-of-range step; a lesson opened from a stop shows "Back to
  {title}, step n". Tests first in `routes.test.ts`, `usePartRoute.test.tsx`, `usePathStep.test.ts`,
  explorer tests; e2e: lesson link then Back returns to the step. `feat: keep the path step in the
address`
- **Task 10 — The drawing on a path sheet.** `stopForPart(path, part): number | null` in content;
  explorer's 3D click on a path sheet goes to that stop or does nothing. Tests first (unit +
  explorer stub). `feat: let the drawing pick a path's step`
- **Task 11 — Scroll to the step.** `PathPanel` scrolls the current stop into view on a step change
  (`block: 'nearest'`, smooth unless reduced motion); not on first render. Component test with a
  mocked `scrollIntoView`; e2e: Next step at 390 px brings the new stop into the viewport.
  `feat: bring the current step into view`
- Docs (DESIGN.md Path Sheet, PRODUCT, architecture), then Codex review of the amendment range,
  appended to `docs/reviews/05a-paths.md`.
