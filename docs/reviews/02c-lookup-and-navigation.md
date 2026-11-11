# Review: section 02c — Lookup and navigation

- Branch: feat/lookup-and-navigation · Reviewed commit: 2546f75 · Date: 2026-11-11

## Summary

The section delivers what the spec and plan promised. It adds path URLs through a small,
well-tested History API hook, makes the URL the selection, and adds Back/Forward focus rules, an
unknown-part notice, deliberate "Mark as read" progress that survives blocked storage, a lesson
sheet with one part name, connection links that name their target, a previous/next footer, read
checks in the list and an overview start/continue link. All gates are green, including e2e
against the Docker image, and all five Review Focus items hold in the browser. Nothing is
blocking. One should-fix: a shared or bookmarked lesson link opened on a phone lands with the
lesson more than a screen below the fold, and nothing on screen shows that it is open. The rest are
nits. Ready to merge once finding 1 is fixed or given a written reason.

## Checks

| Command                                       | Result                                                      |
| --------------------------------------------- | ----------------------------------------------------------- |
| pnpm check                                    | pass (typecheck, lint, format; 27 files, 276 unit tests)    |
| pnpm test:e2e                                 | pass (69 passed, 4 nginx-only tests skipped)                |
| pnpm build                                    | pass (entry 267.4 kB / 85.3 kB gzip; viewer chunk separate) |
| docker build .                                | pass                                                        |
| e2e against the Docker image (`E2E_BASE_URL`) | pass (73 passed)                                            |

`pnpm test` prints "Not implemented: navigation to another Document" twice. This is jsdom
reacting to the Ctrl-click and middle-click tests in `PartLink.test.tsx`, which leave the click to
the browser. It is harmless noise.

I also checked things by hand with Playwright scripts (kept outside the repo) against the Docker
image on port 8089. I probed history length, focus after every kind of navigation, modified clicks,
blocked storage, unknown and odd paths, and phone deep links. I also took screenshots of the footer,
the connection links, the overview and the notice, and probed with `curl` for deep links. I stopped
the container and removed the image afterwards.

## Review Focus results

1. **Duplicate history entries:** verified. `navigateTo` is a no-op when `location.pathname`
   already equals the target (`history.ts:45`), and a unit test pins it. In the browser, Next adds
   exactly one entry. The list row of the open part closes it (a deliberate toggle). Clicking the
   open part in 3D calls `navigate(part)`, which is a no-op. There is one gap, which I found by
   reading the code and did not reproduce in 3D. On a deep link with a trailing slash
   (`/parts/vtx/`) the address is kept as written, so `navigate('vtx')` sees `/parts/vtx/` ≠
   `/parts/vtx` and pushes a duplicate (finding 3).
2. **Blocked storage:** verified. I used an init script that makes the `window.localStorage`
   getter itself throw a `SecurityError`. With it, the frame loads, and Mark as read presses
   (`aria-pressed="true"`). The row becomes "Frame, read" and the overview offers "Continue with
   sheet 2". After a reload it is back to "Start with sheet 1: Frame". There were no page errors
   and no console errors. The unit test mocks `getItem`/`setItem` to throw. Both forms are wrapped
   in `try` (`useReadParts.ts`).
3. **Modified clicks:** verified. Ctrl-click and Shift-click on Next, and a middle click on
   Previous, each opened a new page at the target, and the original page stayed on
   `/parts/motors`. Ctrl-click on the overview start link opened a new page too. Only Ctrl and the
   middle button are tested (finding 9).
4. **Focus after Back/Forward and Close:** verified. Focus never reached `<body>` after keyboard
   or history navigation:

   | Action                                      | Focus lands on                   |
   | ------------------------------------------- | -------------------------------- |
   | Enter on a list row (open, then toggle off) | the row                          |
   | Escape                                      | the part's row                   |
   | Close lesson                                | the part's row                   |
   | Back to a lesson                            | the lesson's h2                  |
   | Back to the overview                        | the start link                   |
   | Enter on a connection link, then Back       | the new h2, then the previous h2 |
   | Next on sheet 11 ("Back to overview")       | the start link (e2e)             |
   | Clear progress                              | the start link                   |
   | Mark as read                                | stays on the toggle              |

   At 1280×800, Back to Extras after Previous left its heading on screen (top 76 px). A mouse
   click on the 3D background with focus in the lesson sends focus to `<body>`. That is the browser
   blurring on a non-focusable canvas, and it happens on `main` too (see Declined to judge).

5. **Reload and deep links in production:** verified. In the nginx image, `/parts/vtx`,
   `/parts/vtx/`, `/parts/foo` and `/parts/` all return `index.html` (200), and
   `/assets/nope.js` returns 404. The e2e tests `/parts/vtx` and `/parts/vtx/` with a reload, and
   they pass against the image.

**Keyboard:** verified. In the footer, Tab goes Mark as read → Previous → Next. Every new control
is a real `<button>` or `<a href>`. The connection links are 2.75rem tall.

## Rulings in progress.md

- **Task 1, `.impeccable/hook.cache.json` in `.prettierignore`:** sound. It is git-ignored tool
  scratch.
- **Task 4, drawn SVG arrows and check instead of → and ✓:** sound. The icons are `aria-hidden`
  and `focusable="false"`. DESIGN.md now records the two icons and bans glyph stand-ins. Link names
  lose an arrow character nobody needs read aloud.
- **Task 4, Mark as read keeps the name "Mark as read" while pressed:** sound. The state is
  carried by `aria-pressed`. The visible "Read" is contained in the name, so WCAG 2.5.3 (label in
  name) holds.
- **Task 4, previous/next as labelled cells ("PREVIOUS" over "Motors · sheet 2"):** sound and on
  style. The hidden colon gives Testing Library "Previous: …". Chrome's accessibility tree reads
  "Previous : Motors · sheet 2" with a stray space (finding 8).
- **Task 4, footer order and `onFollowLink` instead of inferring link-follows from a push:**
  sound. It keeps 3D clicks from stealing focus and makes the focus intent explicit. The plan's
  interface ("`onSelectPart` removed, links navigate themselves") still holds.
- **Task 4, spec-table labels break mid-word at 768 px (deferred):** agreed that it predates 02c.
- **Task 5, the start control is a `PartLink` styled as a button:** sound. It opens a page, so link
  semantics and "open in new tab" are right. The spec said "button" loosely.
- **Task 5, the hint doubles as the "where to start" line:** sound. It avoids a second instruction
  sentence. The spec's separate "Where to start" line is therefore absent by design.
- **Task 6, `position: relative` on the sheet column:** sound fix. It was committed inside the e2e
  commit, though (finding 10).

## Findings

| #   | Severity   | Area                                                                  | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Resolution                                                                                                                                                             |
| --- | ---------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | should-fix | src/features/part-explorer/PartExplorer.tsx:43-60                     | **A lesson link opened on a phone lands far above the lesson.** The spec's "jump straight to one part" use is a builder at the bench opening a shared or bookmarked `/parts/vtx`. At 390×800 the lesson panel's top is at 1066 px, and the first screen shows only the masthead, the drone and parts 1–6. The VTX row (10) is off screen, and the redline in 3D is small. On `load` the explorer moves neither focus nor scroll (by design), so nothing says the lesson is open. Scroll the lesson panel into view on a `load` with a part on narrow layouts (reusing the reveal logic, without moving focus), or say why not. | Fixed (341f434): a lesson address opened directly scrolls the lesson into view at once, without moving focus; e2e at 390 × 800.                                        |
| 2   | nit        | src/styles/global.css:404                                             | **A long unknown slug overflows the page.** `/parts/` followed by 60 unbroken characters gives 299 px of horizontal page scroll at 320 px. The notice has `max-width: 40ch` but no `overflow-wrap`. This is contrived (only a hand-typed URL causes it), but `overflow-wrap: anywhere` on the notice fixes it.                                                                                                                                                                                                                                                                                                                 | Fixed (f4e4f73): the notice wraps anywhere; e2e with an 80-character slug at 320 px.                                                                                   |
| 3   | nit        | src/shared/routing/history.ts:45; src/shared/routing/routes.ts:31     | **A trailing-slash address isn't normalised, so it can create a duplicate entry.** On `/parts/vtx/`, clicking the VTX in 3D pushes `/parts/vtx`, and Back then shows the same lesson ("Back does nothing"). I found this by reading the code and did not reproduce it in 3D. One fix is to `replaceState` a known part with a trailing slash to its canonical path on load.                                                                                                                                                                                                                                                    | Fixed (a987dc1): part addresses are replaced by their canonical spelling on load; unit test that the open part adds no entry. Upgraded from nit: it is Review Focus 1. |
| 4   | nit        | src/shared/routing/routes.ts:31-34                                    | **Odd but plausible paths give odd notices.** `/parts/` gives "There's no part called “”." `/parts` and `/index.html` give "no part called “/parts”" and "“/index.html”" (verified in the image). Treating `/parts`, `/parts/` and `/index.html` as the overview without a notice would read better.                                                                                                                                                                                                                                                                                                                           | Deferred: rare addresses; the notice still leads back to the list.                                                                                                     |
| 5   | nit        | src/content/ui.ts:55; src/features/part-explorer/OverviewStart.tsx:39 | **"Start again from sheet 1" doesn't start again.** With all 11 read it opens the Frame, which is still marked read, and the progress stays 11 of 11. A learner may expect a reset. Either say "Read again from sheet 1" or leave the reset to Clear progress and keep it as is.                                                                                                                                                                                                                                                                                                                                               | Deferred: "Start again" reopens sheet 1 for rereading; Clear progress resets. Revisit the wording with 04.                                                             |
| 6   | nit        | src/features/part-explorer/OverviewStart.tsx:58-66                    | **Clear progress acts at once, with no undo.** One tap, which is easy to misplace on a phone next to the count, wipes every check. The cost is small (11 toggles), but a confirm or an "Undo" status line would be kinder.                                                                                                                                                                                                                                                                                                                                                                                                     | Deferred: progress is a convenience and cheap to rebuild; revisit if users report it.                                                                                  |
| 7   | nit        | src/features/part-explorer/LessonPanel.tsx:131                        | **The footer `<nav>` also holds the Mark as read toggle.** A screen-reader user jumping to the "Sheets" navigation landmark finds a state toggle first. Moving the `<nav>` to wrap only `.lesson-sheets` keeps the landmark to navigation.                                                                                                                                                                                                                                                                                                                                                                                     | Deferred: minor landmark scope.                                                                                                                                        |
| 8   | nit        | src/features/part-explorer/LessonPanel.tsx:154, 170                   | **Chrome names the sheet links "Previous : Motors · sheet 2".** The label span is `inline-flex`, so Chrome puts a space before the hidden colon (seen in the accessibility snapshot). Tests use Testing Library's name, "Previous: …". Most screen readers won't voice it, but putting the colon inside the label's text node would avoid it.                                                                                                                                                                                                                                                                                  | Deferred: the name still reads correctly.                                                                                                                              |
| 9   | nit        | src/shared/routing/PartLink.test.tsx                                  | **`isPlainLeftClick` is tested only for Ctrl and the middle button.** The plan's Review Focus 3 names Ctrl/Cmd/Shift/middle. Meta, Shift and Alt have no test. I verified Shift by hand. A table test of `isPlainLeftClick` would pin all of them.                                                                                                                                                                                                                                                                                                                                                                             | Deferred: Shift checked by hand in review; the guard is one expression.                                                                                                |
| 10  | nit        | commit a2a01f3                                                        | **A layout fix rides in the e2e commit.** `test(e2e): …` also changes `src/styles/global.css` (`position: relative` on the sheet column, which fixes a 1178 px desktop page scroll). That is a `fix(...)` of its own. The body explains it, so this is only about history hygiene.                                                                                                                                                                                                                                                                                                                                             | Accepted: history is not rewritten; the fix is described in the commit body.                                                                                           |
| 11  | nit        | src/styles/global.css:692                                             | **`list-style: none` on the connections list.** In Safari with VoiceOver, this removes list semantics, so "list, 4 items" is no longer announced. This is a known WebKit behaviour; I did not verify it on Safari. `role="list"` on the `<ul>` keeps the semantics.                                                                                                                                                                                                                                                                                                                                                            | Deferred: unverified on Safari; revisit with a Safari/VoiceOver pass.                                                                                                  |

## Strengths

- **Routing is small and correct.** `routes.ts` is pure and round-trips every part. `history.ts`
  keeps one stable snapshot object for `useSyncExternalStore`, subscribes to `popstate` only while
  something listens, and replaces unknown addresses without a history entry. `usePartRoute` stays
  in `shared/` and imports nothing from `content/` or `features/`. The page title is set by the
  explorer, as the spec required.
- **Layering holds.** `shared/routing` and `shared/ui/icons` import only from `shared/`.
  `features/progress` imports only from `shared/domain`. The part explorer uses
  `@/features/progress` through its `index.ts`. I found no hex literals, shadows or rounded corners
  in the new CSS (the only `box-shadow` is the pre-existing inset selection rule). Redline appears
  only in the existing focus ring and selection. Read state uses ink, a check and the rule fill.
- **Progress is defensive.** It uses a versioned key and tolerates malformed JSON, non-arrays,
  unknown ids and duplicates. It writes in sheet order and follows the `storage` event (also for
  `key === null` from `localStorage.clear()`). Storage that throws on access leaves the app fully
  working.
- **Tests test behaviour.** The hook tests check `history.length`. The explorer tests check
  `location.pathname`, `document.title`, focus after pop/close/clear and the three start states.
  The e2e suite covers deep links (with a reload and a trailing slash), Back/Forward focus,
  Ctrl-click to a new tab, the whole Next walk, persistence across a reload and fit at 320 px with
  40 % longer text. The word-lengthening step moved to a shared `e2e/stretch.ts`, as planned.
- **Design follows the drawing.** The connection references ("→ FRAME · SHEET 1"), the two-cell
  previous/next block and the outline start link all read as parts of the drawing sheet in
  screenshots. They use both voices correctly: sentences in Atkinson, references and labels in
  Barlow caps, and "· sheet N" in a no-wrap group.
- **Docs are current.** There is a new ADR 0004 (indexed), and the architecture overview, DESIGN.md,
  the design sidecar, the surface brief, PRODUCT.md and the roadmap (02c in review, new 03c for
  photos) are all updated.
- **Commits:** Conventional Commits with headers of 72 characters or fewer and body lines of 100 or
  fewer. Each is one logical change, apart from finding 10.

## Declined to judge

- Focus to `<body>` after a mouse click on the 3D background while focus is in the lesson: the
  browser blurs on a click on a non-focusable canvas, `main` behaves the same, and it is a pointer
  action, not keyboard navigation.
- No focus move on a deep-link `load`: the spec says to move no focus on load. Finding 1 asks only
  for scrolling.
- `/parts/VTX` (wrong case) shows the notice: the spec deliberately matches ids exactly.
- "Continue with sheet 1: Frame" when only a later sheet is read: this is the spec's `firstUnread`
  rule, and it is unit-tested.
- Alt-click is left to the browser (Chrome downloads the link): this is consistent with "modified
  clicks belong to the browser" and with common router behaviour.
- Query strings and hashes on a part URL (`/parts/vtx?x=1#q`): they are kept and the lesson opens.
  Nothing in the app uses them.
- A side effect (`save`) inside the `setRead` updater: it is idempotent, so a StrictMode double
  call is harmless. It is a style point, not a defect.
- Whether "Next: Back to overview" on sheet 11 reads well: this is the spec's own wording and the
  ruling's labelled-cell idiom.
- The spec-table labels breaking mid-word at 768 px: this predates 02c, and the executor deferred
  it.
- Behaviour after bfcache restores or when arriving from another site with Back: not exercised;
  the store re-reads the pathname on every snapshot.
- Real screen readers (NVDA, VoiceOver) and Safari/Firefox: I checked only Chromium's
  accessibility tree and Testing Library names.
- Whether every intermediate commit passes `pnpm test:e2e`: git.md only requires `pnpm check` per
  commit.
