# Section 02c — Lookup and navigation: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (or
> superpowers:subagent-driven-development) to implement this plan task-by-task, and the
> `impeccable:impeccable` skill for every UI edit (read its `reference/craft-floor.md` immediately
> before editing UI). Steps use checkbox (`- [ ]`) syntax. Branch: `feat/lookup-and-navigation`.

**Goal:** Part URLs with working Back/Forward, previous/next through the sheets, deliberate
"Mark as read" progress, an overview start button, connection links that name their target, and
one part name per lesson sheet.

**Architecture:** Routing is a pure `src/shared/routing/routes.ts` plus a small store over the
History API read through `useSyncExternalStore` (`usePartRoute`); the URL is the selection.
Progress is a new `src/features/progress` feature: pure parsing plus a `localStorage` hook. The
part explorer composes both; components only render.

**Tech Stack:** TypeScript, React 19, Vitest + Testing Library (jsdom), Playwright.

**Spec:** [02c-lookup-and-navigation-design.md](02c-lookup-and-navigation-design.md). Read it
first.

## Global Constraints

- Paths: overview `/`, lesson `/parts/<id>` with ids exactly as in `PART_IDS` (lower case).
- Storage key `inside-the-quad.read-parts.v1`; value a JSON array of part ids in `PART_IDS` order.
- Sheet order is `PART_IDS`: frame 1, motors 2, props 3, esc 4, fc 5, battery 6, strap 7,
  receiver 8, camera 9, vtx 10, extras 11.
- Layering: `shared/` imports nothing from `content/` or `features/`; features import other
  features only through their `index.ts`.
- No new dependencies. All interface text in `src/content/ui.ts`. Colours only from tokens;
  redline only for selection, current sheet and focus (read state uses ink and a check).
- Everything fits at 320 px with text 40 % longer; no page scroll at 900, 1000, 1100 × 700.
- Each task ends with `pnpm check` passing and a Conventional Commit (header ≤ 72 chars, body
  lines ≤ 100).

## Review Focus

1. **Duplicate history entries:** choosing the part that is already open, or pressing a link to the
   current page, must not push a new entry (otherwise Back appears to do nothing). Pinned in
   Task 1's `navigate` no-op test.
2. **Blocked storage:** `localStorage` that throws on read or write (private windows, blocked site
   data) must leave the app working with progress simply unsaved. Pinned in Task 3.
3. **Modified clicks on links:** Ctrl/Cmd/Shift/middle click on a connection or previous/next link
   must open a new tab, not navigate in place. Pinned by Task 1's `isPlainLeftClick` test and
   Task 4's link test.
4. **Focus after Back/Forward and Close:** focus never falls to `<body>`; Back to the overview
   lands on the start button, Back to a lesson on its heading. Pinned in Task 2's component test
   and Task 6's e2e.
5. **Reload and deep links in production:** reloading `/parts/vtx` (and `/parts/vtx/`) in the nginx
   image shows the VTX lesson. Pinned by Task 6's e2e, which CI runs against the Docker image.

---

### Task 1: Routing core

**Files:** Create `src/shared/routing/routes.ts`, `routes.test.ts`, `history.ts`,
`usePartRoute.ts`, `usePartRoute.test.tsx`, `PartLink.tsx`, `PartLink.test.tsx`, `index.ts`.
Modify `src/test/setup.ts` (reset the URL to `/` after each test with
`window.history.replaceState(null, '', '/')`).

**Interfaces:**

- Produces (`routes.ts`): `OVERVIEW_PATH = '/'`; `partPath(part: PartId): string`;
  `type Route = { kind: 'overview' } | { kind: 'part'; part: PartId } | { kind: 'unknown';
slug: string }`; `parseRoute(pathname: string): Route`.
- Produces (`history.ts`): `type NavigationCause = 'load' | 'push' | 'pop'`;
  `navigateTo(path: string): void` (pushState and notify; no-op when `location.pathname` already
  equals `path`); `subscribe(listener): () => void` (own navigations and `popstate`);
  `getSnapshot(): { path: string; cause: NavigationCause }` (same object until something changes,
  as `useSyncExternalStore` requires); `isPlainLeftClick(event: { button: number; ctrlKey;
metaKey; shiftKey; altKey }): boolean`.
- Produces (`usePartRoute.ts`): `usePartRoute(): { route: { kind: 'overview' } | { kind:
'part'; part: PartId }; unknownSlug: string | null; cause: NavigationCause; navigate(part:
PartId | null): void }`. On an unknown path it calls `history.replaceState(null, '', '/')`,
  keeps the slug until the next push, and reports the overview.
- Produces (`PartLink.tsx`): `PartLink({ to: PartId | null, className?, children })`, an `<a
href>` to `partPath(to)` or `/` whose plain left click calls `navigateTo` and `preventDefault`.

- [ ] **Step 1: Failing tests (`routes.test.ts`):** for every id, `parseRoute(partPath(id))` is
      `{ kind: 'part', part: id }`; `parseRoute('/')` and `parseRoute('')` are the overview;
      `parseRoute('/parts/vtx/')` is VTX; `parseRoute('/parts/VTX')` is `{ kind: 'unknown', slug:
'VTX' }`; `parseRoute('/parts/foo%20bar')` has slug `'foo bar'`; a malformed escape
      (`'/parts/%E0'`) does not throw; `parseRoute('/about')` has slug `'/about'`.
- [ ] **Step 2: Failing tests (`usePartRoute.test.tsx`):** starts as `load` on `/parts/esc`;
      `navigate('fc')` gives part `fc`, cause `push`, `history.length` +1; `navigate('fc')` again
      leaves `history.length` unchanged; `navigate(null)` gives the overview; dispatching
      `popstate` after `history.back()`-style `replaceState` gives cause `pop`; starting on
      `/parts/foo` gives the overview, `unknownSlug: 'foo'`, `location.pathname === '/'`, and the
      slug clears after `navigate('frame')`.
- [ ] **Step 3: Failing tests (`PartLink.test.tsx`):** `href` is `/parts/battery`; a plain click
      changes `location.pathname`; a Ctrl click and a middle click (`button: 1`) do not.
- [ ] **Step 4:** `pnpm test src/shared/routing` fails. Implement. `pnpm check` passes.
- [ ] **Step 5:** `feat(routing): add part routes over the History API`

### Task 2: The URL is the selection

**Files:** Modify `src/features/part-explorer/PartExplorer.tsx`, `PartExplorer.test.tsx`,
`src/content/ui.ts`. Create `docs/decisions/0004-own-routing-hook.md`; add it to
`docs/decisions/README.md`.

**Interfaces:**

- Consumes: `usePartRoute`, `PartLink` (Task 1).
- Produces: `UI.app.pageTitle(part: string): string` (`"VTX · Inside the Quad"`),
  `UI.explorer.unknownPart(slug: string): string` (`There’s no part called “foo”. Pick one from
the list.`). `selectedPart` is `route.kind === 'part' ? route.part : null`; every setter in
  `PartExplorer` (`togglePart`, `followConnection`, `onPartClick`, `closeLesson`,
  `clearSelection`) calls `navigate`.

- [ ] **Step 1: Failing tests (`PartExplorer.test.tsx`):** rendering at `/parts/vtx` shows the
      VTX lesson heading and `document.title === 'VTX · Inside the Quad'`; pressing the Frame
      row sets `location.pathname` to `/parts/frame`; Close sets it to `/`; after `navigate`-ing
      to a part, `history.back()` + `popstate` closes the lesson and focuses the element with
      `OVERVIEW_FOCUS_ID` (in this task the overview block, `tabIndex={-1}`; Task 5 moves the id
      to the start button); rendering at `/parts/foo` shows the notice as `role="status"`.
- [ ] **Step 2:** Run; fail. Implement. On `cause === 'pop'`, focus the lesson heading
      (`lessonTitleId`) or, on the overview, `OVERVIEW_FOCUS_ID` (add to `ids.ts`). On `load`,
      move no focus. Keep the existing reveal and focus rules for pushes. Existing tests pass.
- [ ] **Step 3:** ADR 0004: path URLs; own hook over the History API instead of a router library
      (two kinds of page); revisit when a page needs nested routes or loaders.
- [ ] **Step 4:** `pnpm check` passes; `pnpm test:e2e` still passes.
- [ ] **Step 5:** `feat(part-explorer): read the selected part from the URL`, then
      `docs(decisions): record the own routing hook`

### Task 3: Progress

**Files:** Create `src/features/progress/progress.ts`, `progress.test.ts`, `useReadParts.ts`,
`useReadParts.test.tsx`, `index.ts`. Modify `src/shared/domain/parts.ts` and its test.

**Interfaces:**

- Produces (`parts.ts`): `partNeighbours(part: PartId): { previous: PartId | null; next: PartId
| null }` in `PART_IDS` order.
- Produces (`progress.ts`): `READ_PARTS_KEY`; `parseReadParts(raw: string | null):
ReadonlySet<PartId>`; `serializeReadParts(read: ReadonlySet<PartId>): string`;
  `firstUnread(read: ReadonlySet<PartId>): PartId | null`; `type StartState = { kind: 'start' } |
{ kind: 'continue'; part: PartId } | { kind: 'done' }`; `startState(read): StartState`.
- Produces (`useReadParts.ts`): `useReadParts(): { read: ReadonlySet<PartId>; toggle(part:
PartId): void; clear(): void }`.

- [ ] **Step 1: Failing tests:** `partNeighbours('frame')` has no previous and next `motors`;
      `partNeighbours('extras')` has previous `vtx` and no next. `parseReadParts` returns empty for
      `null`, `'nope'`, `'{}'`, `'[1]'`; drops unknown ids and duplicates from `'["vtx","x","vtx"]'`;
      `serializeReadParts(new Set(['vtx','frame']))` is `'["frame","vtx"]'`; `startState` is
      `start` for none read, `continue` at `motors` when only the frame is read, `continue` at
      `frame` when only `vtx` is read, `done` when all are. `useReadParts`: `toggle` adds then
      removes and writes the key; `clear` empties it; a `storage` event for the key updates `read`;
      with `localStorage.getItem` and `setItem` mocked to throw, it renders empty and `toggle`
      still updates in-memory state without throwing.
- [ ] **Step 2:** Run; fail. Implement (keep state in React; write through to storage in
      try/catch). `pnpm check` passes.
- [ ] **Step 3:** `feat(progress): track parts marked as read`

### Task 4: Lesson sheet

**Files:** Modify `src/features/part-explorer/LessonPanel.tsx`, `LessonPanel.test.tsx`,
`TitleBlock.tsx`, `TitleBlock.test.tsx`, `PartExplorer.tsx`, `src/content/ui.ts`,
`src/styles/global.css`. UI work via impeccable.

**Interfaces:**

- Consumes: `PartLink` (Task 1); `partNeighbours` (Task 3); `useReadParts` from
  `@/features/progress`.
- Produces: `TitleBlock` `part?: string` (cell omitted when absent). `LessonPanelProps` gains
  `read: boolean; onToggleRead: () => void`; `onSelectPart` is removed (links navigate
  themselves). UI strings: `UI.lesson.connectionLink(part, sheet)` → `"→ Battery · sheet 6"`
  (caps by CSS), `UI.lesson.previous(part, sheet)` → `"← Motors · sheet 2"`,
  `UI.lesson.next(part, sheet)` → `"Props · sheet 3 →"`, `UI.lesson.backToOverview`,
  `UI.lesson.markRead` (`"Mark as read"`), `UI.lesson.isRead` (`"✓ Read"`),
  `UI.lesson.footerLabel`.

- [ ] **Step 1: Failing tests (`LessonPanel.test.tsx`):** the lesson's title text occurs once in
      the panel (`getAllByText(title)` length 1, the `h2`); the `h2` comes before the title block
      in document order; the title block has no Part cell; for the ESC, the battery connection's
      sentence is plain text and a link named `→ Battery · sheet 6` has `href="/parts/battery"`;
      the Mark as read button has `aria-pressed="false"`, calls `onToggleRead`, and reads `✓ Read`
      with `aria-pressed="true"` when `read`; Frame has no Previous and Next is
      `/parts/motors`; Extras' Next is "Back to overview" with `href="/"`.
- [ ] **Step 2:** Run; fail. Implement. Opening a lesson through a link must keep today's focus
      rule (focus the new lesson's heading): `PartExplorer` treats a push that changes the part
      while a lesson is open as `followConnection` did.
- [ ] **Step 3:** Look at it at 320 px, 768 px and 1280 px with impeccable; fix what one look
      shows; `pnpm check` passes.
- [ ] **Step 4:** `feat(part-explorer): name connection targets and add a lesson footer`, and a
      separate `refactor(part-explorer): show the part name once per sheet` if the header move is
      its own commit.

### Task 5: Parts list checks and overview start

**Files:** Modify `PartList.tsx`, `PartList.test.tsx`, `PartExplorer.tsx`, `PartExplorer.test.tsx`,
`src/content/ui.ts`, `src/styles/global.css`. UI work via impeccable.

**Interfaces:**

- Consumes: `useReadParts`, `startState` (Task 3); `OVERVIEW_FOCUS_ID` (Task 2).
- Produces: `PartListProps` gains `read: ReadonlySet<PartId>`. UI strings:
  `UI.parts.readName(part)` → `"VTX, read"`; `UI.overview.where`, `UI.overview.start(part)` →
  `"Start with sheet 1: Frame"`, `UI.overview.continue(sheet, part)`, `UI.overview.allRead`,
  `UI.overview.startAgain`, `UI.overview.count(read, total)` → `"3 of 11 read"`,
  `UI.overview.clear` (`"Clear progress"`).

- [ ] **Step 1: Failing tests:** a read part's row has accessible name `VTX, read` and a visible
      check; an unread row keeps `VTX`. Overview: with nothing read the button reads `Start with
sheet 1: Frame`, there is no count and no Clear button; after marking the frame read it
      reads `Continue with sheet 2: Motors` and `1 of 11 read`; with all read it shows the
      all-read line and `Start again from sheet 1`; Clear progress empties the count and moves
      focus to the start button; the start button navigates to its part.
- [ ] **Step 2:** Run; fail. Implement; the start button carries `OVERVIEW_FOCUS_ID`.
- [ ] **Step 3:** Look at it with impeccable at 320 px and 1280 px; `pnpm check` passes.
- [ ] **Step 4:** `feat(part-explorer): show read parts and a start button`

### Task 6: End-to-end coverage

**Files:** Create `e2e/navigation.spec.ts`. Modify `e2e/design.spec.ts` if a layout test needs the
new footer.

- [ ] **Step 1:** Tests: `goto('/parts/vtx')` shows the VTX heading, also with a trailing slash and
      after `page.reload()`; choose Frame in the list, `goBack()` shows the overview with the start
      button focused, `goForward()` shows Frame with its heading focused; Mark as read, reload, the
      Frame row is named `Frame, read`; Next from sheet 1 visits all `PART_NAMES` in order and ends
      on the overview; the start button opens Frame and then reads Continue with Motors after
      marking it read; `goto('/parts/foo')` shows the notice and the URL ends with `/`; with
      Ctrl+click on a connection link a new page opens (`context.waitForEvent('page')`); at 320 ×
      640 with 40 % longer text (the word-lengthening step in `design.spec.ts`; move it into a
      shared `e2e/` helper) a lesson footer and the overview do not
      overflow.
- [ ] **Step 2:** `pnpm test:e2e` passes locally and against `pnpm build` + the Docker image (as
      CI does).
- [ ] **Step 3:** `test(e2e): cover part URLs, progress and sheet navigation`

### Task 7: Docs

**Files:** `docs/roadmap.md` (02c `in review`; new row for real-part photos, CC-licensed with
attribution, planned), `docs/architecture/overview.md` (routing, progress, `shared/routing`),
`DESIGN.md`, `.impeccable/design.json`, the surface brief (heading order, lesson footer,
connection links, read check, overview start block), `PRODUCT.md` (navigation; part URLs).

- [ ] **Step 1:** Update; `pnpm check` passes.
- [ ] **Step 2:** `docs: describe 02c routing, progress and sheet navigation`

## Acceptance

- `pnpm check`, `pnpm test:e2e` and CI (including e2e against the Docker image) are green.
- Every Review Focus item has its test.
- The independent Opus review is written to `docs/reviews/02c-lookup-and-navigation.md` with
  each finding resolved or deferred, before the PR is opened.
