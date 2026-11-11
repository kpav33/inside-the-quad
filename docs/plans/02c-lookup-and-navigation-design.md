# Section 02c — Lookup and navigation: Design

Agreed design for section 02c. The implementation plan is
[02c-lookup-and-navigation.md](02c-lookup-and-navigation.md). Branch: `feat/lookup-and-navigation`.

## Goal

With 11 parts, the explorer needs ways to find a part, move through the lessons in order and know
how far you've got. A beginner can follow the sheets from 1 to 11 without getting lost; a builder at
the bench can bookmark or share one part's lesson and open it directly (the "jump straight to one
part" use in `PRODUCT.md`). The section also fixes two findings from the 02 design critique:
connection links hide where they go, and each lesson shows the part name twice.

## Decisions

- **Path URLs.** A lesson lives at `/parts/<id>` (for example `/parts/vtx`); the overview is `/`.
  Paths leave room for later pages (`/intro`, `/simulator`).
- **Own routing hook, no router library.** There are two kinds of page, so a small hook over the
  History API is enough. Recorded in ADR 0004.
- **The URL is the selection.** The selected part is read from the URL, not held in separate state.
- **Progress is deliberate.** A lesson counts as read only when the learner presses "Mark as read".
  Progress is kept in this browser only (there is no backend).
- **Onboarding is a start button**, always visible on the overview. No coach marks.
- **Connection links name their target.** The sentence is plain text; a short link with the part's
  name and sheet follows it.
- **The heading carries the part name.** The big heading and Close sit above the title block; the
  lesson's title block drops its PART cell.

## Not in this section

- Dimension lines, callouts or hover linking in 3D (02b).
- Photos of real parts (a later section; see the roadmap).
- Accounts or progress synced between devices.
- Pages other than the overview and the part lessons.

## Routing

### Paths

`src/shared/routing/routes.ts`, pure and unit tested (in `shared/` because the part explorer uses it,
and features may not import `app/`):

- `partPath(part: PartId): string` returns `/parts/<id>`.
- `OVERVIEW_PATH = '/'`.
- `parseRoute(pathname: string): Route`, where
  `Route = { kind: 'overview' } | { kind: 'part'; part: PartId } | { kind: 'unknown'; slug: string }`.
  - `/` and the empty path are the overview.
  - `/parts/<id>` and `/parts/<id>/` with a known id are that part. Ids are matched exactly
    (lower case, as in `PART_IDS`).
  - `/parts/<anything else>` is `unknown`, with the decoded slug (shown in the notice).
  - Any other path is `unknown` with the whole path as the slug.

### Hook

`usePartRoute()` in `src/shared/routing/` returns `{ route, unknownSlug, cause, navigate }`, where `route` is
an overview or part route and `cause` (`load`, `push` or `pop`) says how the URL last changed:

- It reads `window.location.pathname` through `useSyncExternalStore`, subscribed to `popstate` and
  to the hook's own navigations.
- `navigate(part: PartId | null)` pushes a history entry for `partPath(part)` or `/`, unless the
  URL is already that path.
- On an `unknown` route it replaces the URL with `/` (no new history entry) and keeps the slug, so
  the overview can show the notice once. The notice clears on the next navigation.
- The part explorer (not the hook, since `shared/` may not import `content/`) sets
  `document.title`: `"<Part label> · Inside the Quad"` on a part, `"Inside the Quad"` otherwise.
  Strings come from `src/content/ui.ts`.

### Behaviour

- Every way of opening or closing a part goes through `navigate`, so every one adds a history
  entry: the 3D model, the parts list, connection links, previous/next, the start button, Close,
  Escape, clicking the empty background and toggling the selected list row off. Back retraces the
  learner's steps.
- Links (connections, previous/next) are real `<a href>` elements. A plain left click is handled in
  the app (`navigate` plus `preventDefault`); a modified click (Ctrl, Cmd, Shift, middle button)
  is left to the browser, so "open in new tab" works.
- The current focus and reveal rules stay: opening a lesson from a link moves focus to its heading
  and scrolls it into view when it is off screen; closing returns focus to the part's row. On
  Back/Forward, focus moves to the lesson heading (or the overview's start button), and the live
  region announces the lesson as it does now.
- Opening `/parts/<id>` directly shows that lesson, with the 3D view turned to the part (the
  existing `TurnToPart` behaviour).
- nginx already serves `index.html` for every path and Vite's base is `/`, so no server change is
  needed. The e2e suite runs against the Docker image in CI, which covers deep links in production.

## Progress

`src/features/progress/`:

- `progress.ts` (pure, unit tested):
  - `READ_PARTS_KEY = 'inside-the-quad.read-parts.v1'`.
  - `parseReadParts(raw: string | null): ReadonlySet<PartId>`. Accepts a JSON array of part ids.
    Malformed JSON, non-arrays, unknown ids and duplicates are dropped, never thrown.
  - `serializeReadParts(read: ReadonlySet<PartId>): string`, in `PART_IDS` order.
  - `firstUnread(read): PartId | null`, the first part in `PART_IDS` order not yet read.
- `useReadParts()` returns `{ read, toggle(part), clear() }`. It keeps the set in `localStorage`;
  every access is wrapped in try/catch, so blocked storage or a private window simply means
  progress is not saved and nothing breaks. It listens for the `storage` event, so two open tabs
  agree.

## What the learner sees

### Lesson sheet

Top to bottom:

1. **Heading row:** the part name as the `h2` and the Close button (moved above the title block).
2. **Title block:** sheet, quantity and spec. On lessons the PART cell is gone; `TitleBlock` takes
   `part` as optional and the overview still passes its "5-inch quad".
3. **The four questions.** In question 4 each connection with a target is its sentence, then a link
   on its own line: `→ BATTERY · sheet 6` (label in caps, the drawing's label style). Connections
   without a target stay plain sentences.
4. **Lesson footer:**
   - **Mark as read**, a toggle button with `aria-pressed`. Pressed, it reads "✓ Read". Read state
     uses ink and the check, never the redline (reserved for selection, current sheet and focus).
   - **Previous** and **Next** links, naming the target and its sheet: `← Motors · sheet 2`,
     `Props · sheet 3 →`. Order is `PART_IDS`. Sheet 1 has no Previous; on sheet 11 Next becomes
     "Back to overview".

### Parts list

Rows stay toggle buttons. A part marked read shows a check after its name; the button's accessible
name becomes "VTX, read".

### Overview

Below the title block:

- A short "Where to start" line and one button:
  - nothing read: "Start with sheet 1: Frame";
  - some read: "Continue with sheet N: <part>", at `firstUnread`;
  - all read: the line says all 11 parts are read and the button is "Start again from sheet 1".
- Then "N of 11 read" and a quiet "Clear progress" button (shown only when something is read).
- The unknown-part notice, when present: "There's no part called "<slug>". Pick one from the
  list." It is a polite status message, not an alert.

All text lives in `src/content/ui.ts`. The UI work goes through impeccable against `DESIGN.md` and
the surface brief. Every new element must fit at 320 px wide with text 40 % longer.

## Testing

- **Unit:** `parseRoute` / `partPath` round-trip for every part, plus `/`, empty, trailing slash,
  wrong case, unknown id, encoded slug and an unrelated path; `parseReadParts` with malformed
  JSON, a non-array, unknown ids and duplicates; `serializeReadParts` order; `firstUnread`;
  previous/next neighbours follow `PART_IDS`; the overview's three start states.
- **Component:** the lesson footer (toggle state, previous/next targets, sheet 1 and 11 ends); each
  connection link's `href` and the part it names; the read checks and accessible names in the
  parts list; the part name appears once on a lesson sheet; `useReadParts` survives a throwing
  `localStorage`.
- **e2e:**
  - opening `/parts/vtx` directly shows the VTX lesson;
  - choose a part, Back returns to the overview, Forward reopens the part;
  - Mark as read survives a reload and shows in the list;
  - Next walks from sheet 1 to sheet 11 and ends at the overview;
  - the start button opens the Frame and becomes "Continue" after marking it read;
  - `/parts/foo` shows the overview and the notice, and the URL becomes `/`;
  - no page scroll and no clipped text at 320 px with the new footer and overview.

## Docs

- New ADR `docs/decisions/0004-own-routing-hook.md` (path URLs, own hook over the History API).
- `docs/architecture/overview.md`: routing and progress.
- `DESIGN.md`, `.impeccable/design.json` and the surface brief: lesson heading order, footer,
  connection links, read check, overview start block.
- `PRODUCT.md` where it describes navigation; `docs/roadmap.md`: 02c status, and a new entry for
  photos of real parts (CC-licensed, with attribution).
