# Section 02d — Phones and keyboard: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (or
> superpowers:subagent-driven-development) to implement this plan task-by-task, and the
> `impeccable:impeccable` skill for every UI edit (read its `reference/craft-floor.md` immediately
> before editing UI). Steps use checkbox (`- [ ]`) syntax. Branch: `feat/phones-and-keyboard`.

**Goal:** Fix the four findings of the 2026-11-13 critique and audit: a masthead link to the
intro, focus that follows the opened sheet, narrow sheets that reflow under large or long text,
and reduced motion that applies live.

**Architecture:** A shared `usePrefersReducedMotion` hook replaces the read-once `matchMedia` in
the 3D components. The part explorer moves focus to any sheet the app opens. The masthead (in
`app/`) reads the route through `shared/routing`. The reflow is CSS under container queries.

**Tech Stack:** TypeScript, React 19, CSS container queries, Vitest + Testing Library, Playwright.

**Spec:** [02d-phones-and-keyboard-design.md](02d-phones-and-keyboard-design.md). Read it first.

## Global Constraints

- Node 22: prefix node/pnpm commands with `source ~/.nvm/nvm.sh && nvm use >/dev/null &&`.
- Pages to cover: `/`, `/intro`, `/parts/<id>` for all 11 ids.
- Widths 320 and 390 px; text at 200% (`document.documentElement.style.fontSize = '200%'`) and
  +40 % (`stretchText` in `e2e/stretch.ts`). The page never scrolls sideways; a table may scroll
  inside its own frame.
- Baseline measured on main (200% text): at 320 px, 12 of 13 pages overflow (intro +226 px, fc
  +114, props +105, frame and esc +57, …); at 390 px, intro +156, fc +44, props +35. The audit's
  three "failing" layout tests pass here (15/15 over three repeats); they were not reproduced.
- Redline only for selection, the current sheet and focus. Tokens only. Text in `src/content/ui.ts`.
- Each task ends with `pnpm check` passing and a Conventional Commit (header ≤ 72 chars, body
  lines ≤ 100).

## Review Focus

1. **Turning reduced motion off again:** animation resumes for the next turn or lift. Pinned in
   Task 1's hook test (both directions).
2. **Closing a sheet still returns focus to where it came from** (the part's row, or the start
   link for the intro) after focus moved into the sheet. Pinned in Task 2's component test.
3. **The masthead link is in the first screen of a 320 × 640 phone** on the overview. Pinned in
   Task 2's e2e.
4. **A deep link on load still moves no focus** (02c rule) now that every open moves focus. Pinned
   in Task 2's component test.
5. **Desktop at 200% text keeps its layout** (the 02 test of the viewer and list) after the reflow
   CSS. Pinned by running `e2e/design.spec.ts` in Task 3.

---

### Task 1: Reduced motion, live

**Files:** Create `src/shared/ui/usePrefersReducedMotion.ts`, `usePrefersReducedMotion.test.ts`.
Modify `src/features/drone-model/Lift.tsx`, `src/features/drone-viewer/TurnToPart.tsx`.

**Interfaces:**

- Produces: `usePrefersReducedMotion(): boolean`, following `(prefers-reduced-motion: reduce)`
  and its `change` events through `useSyncExternalStore`; `false` when `matchMedia` is missing.

- [ ] **Step 1: Failing test** with a fake `MediaQueryList` on `window.matchMedia` (matches +
      `addEventListener('change')`): starts `false`; after the fake fires `change` with matches
      `true` it is `true`; after it fires back to `false` it is `false`; with `window.matchMedia`
      deleted it returns `false` without throwing.
- [ ] **Step 2:** Run; fail. Implement; replace the `useMemo` reads in `Lift.tsx` and
      `TurnToPart.tsx` with the hook (the lesson reveal already reads `matchMedia` at call time and
      stays as is). `pnpm check`.
- [ ] **Step 3:** e2e in `e2e/explorer.spec.ts`: load `/`, wait for the still canvas, then
      `page.emulateMedia({ reducedMotion: 'reduce' })`, choose ESC in the list, and two canvas
      screenshots taken 60 ms apart right after are identical (the stack jumps, no easing).
- [ ] **Step 4:** `feat(motion): follow reduced-motion changes without a reload`

### Task 2: Focus follows the opened sheet; masthead link

**Files:** Modify `src/features/part-explorer/PartExplorer.tsx`, `PartExplorer.test.tsx`,
`src/app/App.tsx`, `src/app/App.test.tsx`, `src/content/ui.ts`, `src/styles/global.css`. Add to
`e2e/intro.spec.ts`. UI via impeccable.

**Interfaces:**

- Consumes: `usePartRoute`, `PartLink`, `INTRO_PATH` from `@/shared/routing`.
- Produces: `UI.app.introLink` (`'What is an FPV drone?'`), `UI.app.navLabel` (`'Sections'`).
  Rule in `PartExplorer`: on a `push` that opens a sheet (part or intro), focus its heading and
  reveal it; closes keep their targets (row, or the start link for the intro); `load` and `pop`
  keep the 02c rules.

- [ ] **Step 1: Failing tests.** `PartExplorer`: Enter on the Frame row (keyboard) focuses the
      Frame heading; a 3D-stub click on motors focuses the Motors heading; Escape afterwards
      returns focus to the Motors row; loading `/parts/vtx` leaves focus on `document.body`;
      a `navigate('intro')` from outside the explorer (e.g. `history.pushState` + the hook's
      `navigateTo` via clicking an external `PartLink`) focuses the intro heading. `App`: a `nav`
      labelled "Sections" holds a link "What is an FPV drone?" with `href="/intro"`, no
      `aria-current` on `/`, `aria-current="page"` on `/intro`.
- [ ] **Step 2:** Run; fail. Implement. Masthead: link at the right of the header with a leader
      arrow, own line on narrow headers; current state is a 2px redline underline plus
      `aria-current`.
- [ ] **Step 3:** e2e: at 320 × 640 on `/`, the masthead link is in the viewport without
      scrolling; pressing it opens the intro with its heading focused and the link marked current.
- [ ] **Step 4:** Look at the masthead at 320, 768 and 1280 px with impeccable; `pnpm check`.
- [ ] **Step 5:** `feat(part-explorer): move focus into every sheet it opens`, then
      `feat(app): link the intro from the masthead`

### Task 3: Narrow sheets reflow

**Files:** Modify `src/styles/global.css`. Create `e2e/reflow.spec.ts`. UI via impeccable.

- [ ] **Step 1: Failing e2e** `e2e/reflow.spec.ts`: for each of the 13 pages, at 320 and 390 px,
      with 200% text and separately with `stretchText`: after the canvas is visible, poll that
      `scrollWidth - innerWidth <= 0`; and no element inside `.part-explorer-sheet` other than a
      `.size-table-frame` has `scrollWidth > clientWidth + 1`. Expect the baseline failures above.
- [ ] **Step 2:** Implement under container queries on the sheet (`lesson-panel`, title block and
      footer containers), in this order, re-running after each: headings and long words break
      (`overflow-wrap: anywhere` on the `h2`, question headings, title-block and spec values); on
      sheets under 20rem the balloon sits above its heading (single-column `.lesson-question`); the
      footer's `.lesson-sheets` stacks under 20rem; title-block and spec values may wrap between
      items (relax `.title-block-nowrap` under 20rem); wrap `SizeComparison`'s table in
      `<div class="size-table-frame">` with `overflow-x: auto` and let its headings wrap.
- [ ] **Step 3:** Run `e2e/reflow.spec.ts` and `e2e/design.spec.ts`; both pass. Look at the intro,
      Flight controller and Propellers at 320 px with 200% text with impeccable; `pnpm check`.
- [ ] **Step 4:** `fix(layout): let narrow sheets reflow with large or long text`

### Task 4: Docs

**Files:** `docs/roadmap.md` (add 02d, `in review`), `DESIGN.md` (masthead link; focus rule; the
narrow-sheet exception to the Unbroken Value rule; table frame), `.impeccable/surfaces/…` brief,
`docs/architecture/overview.md` (the motion hook in `shared/ui`).

- [ ] **Step 1:** Update; `pnpm check`.
- [ ] **Step 2:** `docs: describe the 02d phone and keyboard fixes`

## Acceptance

- `pnpm check`, `pnpm test:e2e` and CI (including e2e against the Docker image) are green.
- Every Review Focus item has its test.
- The independent review is written to `docs/reviews/02d-phones-and-keyboard.md`, each finding
  resolved or deferred, before the PR is opened.
