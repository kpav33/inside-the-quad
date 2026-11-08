# Review: section 02 — Design pass (foundation)

- Branch: feat/design-pass · Reviewed commit: d974591 · Date: 2026-11-08

## Summary

The section delivers what the plan promised: one token source for CSS and three.js with contrast
tests, self-hosted fonts under the CSP, all interface text in `src/content/ui.ts`, the drawing
sheet layout, one-finger page scroll over the 3D view, and the Task 8 robustness fixes. All gates
are green on both e2e targets, the architecture rules hold, and the e2e tests measure real geometry
and behaviour. Nothing is blocking. Two should-fix items: the wide layout breaks in a narrow band
of window widths where the height rule (a viewport media query) and the column switch (a container
query) disagree, and in forced-colours mode keyboard focus on the selected part row looks the same
as no focus. DESIGN.md also still describes the layout from before Task 8. Ready to merge once the
should-fix items are fixed or given a written reason.

## Checks

| Command                                       | Result                                                      |
| --------------------------------------------- | ----------------------------------------------------------- |
| pnpm check                                    | pass (typecheck, lint, format; 15 files, 81 unit tests)     |
| pnpm test:e2e                                 | pass (31 passed, 4 nginx-only tests skipped)                |
| pnpm build                                    | pass (entry 237.8 kB / 75.2 kB gzip; viewer chunk separate) |
| docker build .                                | pass                                                        |
| e2e against the Docker image (`E2E_BASE_URL`) | pass (35 passed, including server.spec.ts, fonts under CSP) |

Also checked by hand with Playwright scripts against `vite preview` (outside the repo): layout
around the breakpoint at 16px and 24px browser defaults, forced-colours focus, two-finger vertical
gesture on a Pixel 7 emulation, and title-block value overflow at 320/390/1280px with 200% text.
Servers and the container were stopped afterwards.

## Review Focus results

1. **Phone scrolling:** verified. One-finger swipe scrolls (e2e). A two-finger _vertical_ drag
   (not covered by the e2e) also turns the drone and does not scroll the page in Chromium touch
   emulation. Real-device behaviour was not tested.
2. **Translation and large text:** verified at the plan's sizes (+40% at 320px, 200% at 1280px and
   390px, 24px default at 1440px). It breaks in a width band near the breakpoint (finding 1).
3. **Selection parity:** verified. The row uses rule fill, bold name, filled balloon,
   `aria-pressed` and a 3px inset redline. The 3D part gets a redline fill
   (`partAppearance`, unit-tested).
4. **Token drift:** no hex literals outside `tokens.ts`/`tokens.css`/`index.html`
   (`theme-color`, which is tested). Contrast tests cover ink and muted on ground and sheet, but
   not every pair the UI uses (finding 7). I computed the untested pairs and they pass.
5. **Focus visibility:** verified in normal colours (2px redline ring; inset ring on rows is
   4.4:1 against the selected-row fill). The lesson title is focusable after following a
   connection and shows the ring (e2e). Forced-colours mode has a gap (finding 2).

## Rulings in progress.md

- **Task 1, `?raw` import of tokens.css instead of `node:fs`:** sound. It keeps Node types out
  of the app tsconfig. `vite.config.ts` limits CSS processing in tests to tokens.css.
- **Task 4, `motor.count` in the spec instead of `motorPlacements` length:** sound. `shared/`
  cannot import `features/`, and `layout.test.ts` pins `motorPlacements(spec).length` to the count.
- **Task 4, filled row plus balloon instead of a redline left rule:** this ruling is out of date.
  The shipped CSS draws the contract's rule as `box-shadow: inset 3px 0 0` (global.css:351), which
  is a line inside the box, not a coloured `border-left`, so it follows the contract and the
  craft-floor ban both. DESIGN.md agrees with the code. No action needed beyond a note.
- **Task 4, viewer inset above the list band (14.5rem):** Task 8 replaced it with a grid row, which
  is better. DESIGN.md still documents the old version (finding 3).
- **Task 6, redline fill plus `<Edges>` instead of drei `<Outlines>`:** acceptable. DESIGN.md
  records it as a deliberate divergence. Review Focus 3 says "redline outline", so the plan text
  is out of date, not the code.

## Findings

| #   | Severity   | Area                                                                               | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Resolution                                                                                                                                                        |
| --- | ---------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | should-fix | src/styles/global.css:116-124, 636-677                                             | **The height rule and the column switch use different conditions.** The two-column layout switches on a container query (`.app-main` ≥ 56rem). Whether `.app`/`.app-main` keep `height: 100%` is decided by a viewport media query (`max-width: 56.1875em`). For windows 896–899px wide at a 16px default (and 1344–1348px at a 24px default), the container query applies the grid but the media query sets `height: auto`. Every `height: 100%` in the wide layout then resolves to auto, and the `minmax(0, 1fr)` canvas row shrinks to its padding. Measured: the viewer is about 222×82px (vs 226×417 at 900px), with the drone a thumbnail and the hint crowding it. Confirmed by screenshot. The bug works the same way at any root size, so a user stepping through window widths will hit it. Fix: drive both rules from one condition. For example, give `.app-main` a definite height whenever the wide layout can apply, or give `.drawing-canvas` a `min-height` in the wide layout so it can't collapse. Add an e2e test at 897px. | Fixed in 4e77474: page-height media query aligned with the 56rem container switch, canvas min-height 16rem; e2e at 897/900/960 px (RED 82 px → GREEN).            |
| 2   | should-fix | src/styles/global.css:681-686                                                      | **Forced colours: focus on the selected row is invisible, and focus looks like selection.** `.part-list-row[data-selected='true'] { outline: 2px solid Highlight; outline-offset: -2px }` is more specific than `:focus-visible`/`.part-list-row:focus-visible`. With `forcedColors: 'active'` emulated, the selected row has the same computed outline (2px solid, -2px offset, same system colour) whether focused or not. A focused unselected row also gets the same outline. Tabbing onto the selected row shows no change (WCAG 2.4.7), and the focus ring reads as "selected". Fix: drop the outline (the filled `Highlight` balloon already marks selection in this mode), or use a different selection marker in forced colours (e.g. a `Highlight` border or a thicker/double outline) so it doesn't share the focus ring's look.                                                                                                                                                                                                      | Fixed in 4e77474: dashed CanvasText focus outline over the selection marker in forced colours; e2e with forcedColors emulation (RED → GREEN).                     |
| 3   | should-fix | DESIGN.md:191, 199; .impeccable/design.json:195, 305                               | **The design docs describe the layout from before Task 8.** "Wide (from 56.25em)", "the parts list docks at the frame's lower left (min(20rem, 45%) wide)" and the Clear Field Rule's "its bottom edge clears the list by 14.5rem" describe the absolute-docked, viewport-media-query layout. The code now uses a 56rem container query, an in-frame grid row, and `min(22rem, 100% - 3rem)`. CLAUDE.md rule 7 asks for docs to change in the same branch.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Fixed in dc08b51: DESIGN.md and design.json describe the container query and the parts-list grid row.                                                             |
| 4   | nit        | src/features/part-explorer/PartExplorer.tsx:42-53, 86-90                           | **`revealLesson` can stay set.** `onPartClick` sets `revealLesson.current = true` even when the clicked 3D part is already selected. State doesn't change, so the effect doesn't run and the flag stays `true`. The effect also returns early without clearing it when `selectedPart` becomes null. The stale flag then fires on the next selection change, e.g. following a connection (smooth `scrollIntoView` on top of the focus scroll). Mostly harmless. Fix: set it like `togglePart` does (`selectedPart !== part`) and clear it before the early return. (`focusTarget` has the same shape but never hits it, because connections never point to their own part.)                                                                                                                                                                                                                                                                                                                                                                       | Fixed in f1b1539: clicking the already-open part in 3D no longer arms the reveal. No automated test (jsdom has no layout to observe the scroll); ruling recorded. |
| 5   | nit        | src/features/part-explorer/TitleBlock.tsx:32-35; global.css:453-474                | **No-wrap spec values can overflow at 320px with 200% text.** Measured: "30.5 × 30.5 mm" (Frame) is 231px wide in a 206px item and runs into the title-block frame. "5 in (127 mm)" (Propellers) does the same. "1 of 3" in the Sheet cell breaks onto two lines. This combination goes beyond the plan's tested sizes, and both robustness tests pass, so this is a nit. A `min()`-based item width or allowing a wrap at " × " would fix it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Deferred: only at 320 px with 200% text; title values are meant to stay unbroken. Revisit with 02c's title block work.                                            |
| 6   | nit        | global.css:639                                                                     | **The drawing field gets less space than the sheet near the breakpoint.** `minmax(0,1fr) minmax(20rem,36rem)` grows the sheet column to 36rem before the drawing gets any space. At 900px the drawing field is 274px wide and the sheet 576px, and at 1280px the field is about 55%. The contract's first viewport says the drawing takes "about two thirds". Consider `minmax(20rem, 36rem)` → `minmax(20rem, 40%)` or similar. Design judgement, not a defect.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Deferred to 02b, which owns the drawing field's share of the width.                                                                                               |
| 7   | nit        | src/shared/design/tokens.test.ts; src/features/drone-model/materials.test.ts:16-18 | **Contrast tests skip some pairs the UI uses.** Not covered: ground numeral on redline balloon (6.0:1), redline focus ring on the selected-row rule fill (4.4:1), muted on rule (5.3:1). All pass today, but a palette change could break them unnoticed. Also, `materials.test.ts` "keeps the drawn lines readable on the ground" only tests tokens, not materials, so it doesn't add anything.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Deferred: all pairs pass today; extend when the palette grows.                                                                                                    |
| 8   | nit        | src/content/ui.ts:39; src/content/overview.ts                                      | **Overview copy partly bypasses the spec and `UI`.** `overviewPart: 'Reference 5‑inch quad'` hard-codes the size instead of deriving it from `REFERENCE_5_INCH` (principle "one drone, consistent truth"). The overview spec labels (Wheelbase, Motors, Battery, Props) live in `content/overview.ts`, not `ui.ts`. That still satisfies "content is data", but it is a second place to translate.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Deferred: the reference drone is the only size; derive from the spec when other sizes land.                                                                       |
| 9   | nit        | ad8a691                                                                            | **One commit bundles unrelated changes.** "theme the favicon and tidy small design-system drift" combines the favicon, the forced-colours CSS, removing a UI string, a token test and a DESIGN.md note. It matches the plan's "small items" step, but is not one logical change. The rest of the history is clean Conventional Commits.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Won't fix: the branch is pushed; the commit message lists each change.                                                                                            |

## Strengths

- **Tokens:** one module feeds CSS (mirrored and tested), three.js materials (`partAppearance`) and
  lights (`SCENE_LIGHT`). The `theme-color` meta is pinned by a test. There are no stray hex
  literals.
- **Architecture:** `content/` and `shared/` import nothing from `features/`. The viewer chunk is
  preloaded at module load but stays out of the entry chunk. The failure path is still covered by
  the smoke test.
- **Wide layout:** using a container query on `.app-main` (not on the explorer itself, which can't
  query itself) is the right tool for text-size robustness. The title-block `@container` on its
  own grid targets only its children, so it is valid.
- **TouchScrollPassThrough:** small, documented, and correct. The `eslint-disable` for
  `react-hooks/immutability` is justified: writing to the controls' DOM element is the effect's
  purpose. It works because drei sets the store's `controls` after `connect()`.
- **Accessibility:** focus returns to the part button on close and Escape, and moves to the new
  lesson title when following a connection. The polite live region is empty until something is
  selected. `aria-controls` is only rendered while the panel exists. Rows are 48px.
- **E2E tests:** they assert real geometry (viewer size and list overlap via bounding boxes,
  overflowing cells, `scrollY` after CDP touch input, canvas pixels changing after a two-finger
  gesture), not just that elements exist.

## Declined to judge

- 3D visual quality of the redline-fill selection on each part: accepted as recorded in DESIGN.md;
  I checked it only through the unit test and passing e2e, not with per-part screenshots.
- Behaviour on real iOS/Android hardware (touch-action with OrbitControls): only Chromium touch
  emulation was available.
- Lesson FPV facts: the lesson text was not changed in this section beyond moving strings.
- Items deferred to 02b/02c in the roadmap (zone markers being decorative, dead space in the
  drawing field, connection-link wording, part URLs).
