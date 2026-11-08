# Section 02 — Design pass (foundation): Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (or
> superpowers:subagent-driven-development) to implement this plan task-by-task, and the
> `impeccable:impeccable` skill for every UI edit (read its `reference/craft-floor.md` immediately
> before editing UI). Steps use checkbox (`- [ ]`) syntax. Branch: `feat/design-pass`.

**Goal:** Give the part explorer its visual world, the engineering **drawing sheet** chosen in the
impeccable direction round, and fix the critique and audit findings that sit in the foundation:
visual system, phone behaviour, translation-proof layout, accessibility, UI strings and 3D
performance.

**Architecture:** One token module (`src/shared/design/tokens.ts`) is the single source of colour
for both CSS and the three.js materials; `tokens.css` mirrors it and a test keeps them identical
and checks WCAG contrast. Fonts are self-hosted (CSP allows only `'self'`). Interface text moves to
`src/content/ui.ts`. The explorer is restyled into a drawing field (3D) plus a sheet column (title
block, four numbered questions, ruled spec grid), with the parts list as the picker.

**Tech Stack:** React 19, TypeScript, CSS (custom properties, container queries), react-three-fiber
9 / drei 10 (`Outlines`), `@fontsource/barlow-condensed`, `@fontsource/atkinson-hyperlegible`,
Vitest, Playwright.

**Spec:** the direction contract in
`.impeccable/surfaces/src-features-part-explorer-partexplorer-tsx.md`, `PRODUCT.md`, and the
critique and audit findings (archived in `.impeccable/critique/`, summarised in this plan's
Review Focus).

**Not in this section** (new roadmap sections): the model-as-teacher layer (dimension lines,
callout balloons and leader lines drawn in 3D, front marker, spin arcs, sub-part labels) and
lookup/navigation (per-part URLs, previous/next part, progress, onboarding hints beyond the empty
state).

## Global Constraints

- Colours, verbatim from the contract: ground `#121416`, sheet `#1c1f22`, rules `#2a2e32` /
  `#3a3f44`, ink `#dfe3e6`, redline accent `#ff5b3a`. The muted grey is chosen in Task 1 to pass
  4.5:1 on both ground and sheet.
- Redline is used **only** for selection, the current sheet and focus, identically in the list and
  on the 3D model. It is never decoration.
- Type: Barlow Condensed (caps labels, part names, question headings, title block); Atkinson
  Hyperlegible (all reading text). Body ≥ 16px, reading measure ≤ 70ch, fixed rem scale.
- Structure is the only ornament: every rule, frame and marker is real structure.
- WCAG 2.2 AA: text ≥ 4.5:1, UI and focus ≥ 3:1, targets ≥ 44px for the part picker and close
  button, visible focus everywhere, state never shown by colour alone.
- Layouts hold at 320px with text 40% longer, and at 200% text size, with no page-level horizontal
  scroll.
- Motion: 150–200 ms state transitions only; respect `prefers-reduced-motion`.
- Accessible names stay stable: part buttons "Frame", "Motors", "Propellers"; "Close lesson".

## Review Focus

1. **Phone scrolling:** a one-finger vertical swipe over the 3D view must scroll the page, and two
   fingers must still rotate. Pinned by an e2e touch test using CDP touch events (Task 5).
2. **Translation and large text:** pseudo-localised copy (+40%) at 320px and 200% root text at
   1280px must not create page-level horizontal scroll. Pinned by e2e (Task 4).
3. **Selection parity:** the same part reads as selected in the list (fill + redline rule, not
   colour alone) and in 3D (redline outline). Pinned by component test and screenshot check
   (Tasks 4, 6).
4. **Token drift:** CSS and 3D colours must come from one source; contrast must hold for every
   text/ground pair. Pinned by unit tests (Task 1).
5. **Focus visibility:** every interactive element, including the focused lesson title after
   following a connection, shows a visible focus indicator. Pinned by e2e (Task 4).

---

## File structure

```
src/shared/design/tokens.ts (+ test)   colours, type scale, spacing; contrast helpers
src/styles/tokens.css                  CSS custom properties mirroring tokens.ts
src/styles/global.css                  base: fonts, color-scheme, resets, focus, layout shell
src/content/ui.ts (+ test)             all interface text (masthead, hints, headings, labels)
src/shared/domain/parts.ts             PART_LABELS move out to content/ui.ts
src/features/part-explorer/
  PartList.tsx                         parts list (item no. · part · qty) as toggle rows
  TitleBlock.tsx (+ test)              part, sheet n of N, qty, spec line
  LessonPanel.tsx                      four numbered questions, ruled spec grid
  PartExplorer.tsx                     drawing field + sheet column layout
src/features/drone-model/materials.ts  colours from tokens; outline instead of emissive
src/features/drone-viewer/DroneViewer.tsx  frameloop demand, touch config, preload
e2e/design.spec.ts                     reflow, zoom, touch, focus checks
```

---

### Task 1: Design tokens with contrast tests

**Files:** create `src/shared/design/tokens.ts`, `src/shared/design/tokens.test.ts`,
`src/styles/tokens.css`.

**Interfaces:**

- Produces:

  ```ts
  export const COLOR = {
    ground: '#121416',
    sheet: '#1c1f22',
    rule: '#2a2e32',
    ruleStrong: '#3a3f44',
    ink: '#dfe3e6',
    muted: string /* chosen to pass 4.5:1 on ground and sheet */,
    accent: '#ff5b3a',
  } as const;
  export const MODEL_COLOR: Record<PartId, string>; // 3D base colours, derived from the world
  export function contrastRatio(a: string, b: string): number; // WCAG 2.x relative luminance
  ```

  `tokens.css` declares `--color-<name>` for every `COLOR` key, plus `--font-label`,
  `--font-body`, a rem type scale (`--step--1` … `--step-4`, ratio ≈ 1.2) and a spacing scale.

- [ ] **Step 1: Write failing tests:** `contrastRatio('#000000', '#ffffff')` ≈ 21;
      `ink`/`muted` on `ground` and on `sheet` ≥ 4.5; `accent` on `ground` and `sheet` ≥ 3;
      every `COLOR` key appears in `tokens.css` as `--color-<kebab-key>: <same hex>;`
      (read the file with `node:fs` in the test).
- [ ] **Step 2: Run** `pnpm test src/shared/design` — expected FAIL (module missing).
- [ ] **Step 3: Implement** both files; pick `muted` as the lightest grey that keeps a clear step
      below `ink` and passes on both grounds.
- [ ] **Step 4: Run** the tests — PASS; `pnpm check`.
- [ ] **Step 5: Commit** `feat(design): add drawing sheet design tokens`.

### Task 2: Fonts, base styles and the page shell

**Files:** modify `package.json` (add `@fontsource/barlow-condensed`,
`@fontsource/atkinson-hyperlegible`), `src/main.tsx`, `src/styles/global.css`, `src/app/App.tsx`,
`index.html` (`<meta name="color-scheme" content="dark">`).

- [ ] **Step 1: Write a failing e2e check** in `e2e/design.spec.ts`: body computed
      `background-color` is `rgb(18, 20, 22)`; buttons inherit the body font family (not Arial);
      a focused part button has an outline at least 2px wide.
- [ ] **Step 2: Run** `pnpm test:e2e e2e/design.spec.ts` — FAIL.
- [ ] **Step 3: Implement:** import only the weights used (Barlow Condensed 500/600/700, Atkinson
      Hyperlegible 400/700, latin subset); `color-scheme: dark`; explicit body background;
      `button, input, select, textarea { font: inherit; color: inherit }`; a global
      `:focus-visible` ring (2px redline, 2px offset); heading spacing with more space above than
      below; masthead with the wordmark ("QUAD" in redline). Verify fonts load under the CSP by
      running the e2e suite against the Docker image.
- [ ] **Step 4: Run** e2e (both targets) — PASS; `pnpm check`.
- [ ] **Step 5: Commit** `feat(design): self-host fonts and set the base page styles`.

### Task 3: Move interface text into content

**Files:** create `src/content/ui.ts`, `src/content/ui.test.ts`; modify `App.tsx`,
`PartExplorer.tsx`, `LessonPanel.tsx`, `PartList.tsx`, `src/shared/domain/parts.ts` (remove
`PART_LABELS`); update imports of `PART_LABELS`.

**Interfaces:** `export const UI` (masthead title and tagline, hint, loading, viewer fallback,
close label, the four question headings, spec grid labels, parts list heading and column labels,
drag hint) and `export const PART_LABELS: Record<PartId, string>`.

- [ ] **Step 1: Failing test:** `UI.questions` has exactly the four scope questions in order;
      every `PART_IDS` entry has a non-empty `PART_LABELS` value; no `UI` string is empty.
- [ ] **Step 2: Run** — FAIL. **Step 3:** implement and replace hard-coded strings; replace React
      keys built from content text with index-based or id-based keys; render `aria-controls` only
      while the lesson panel exists (existing PartList test extended: no `aria-controls` when
      nothing is selected).
- [ ] **Step 4: Run** `pnpm check` — PASS. **Step 5: Commit**
      `refactor(content): move interface text out of components`.

### Task 4: Drawing field, parts list, title block and lesson sheet

**Files:** create `TitleBlock.tsx` (+ test); modify `PartList.tsx`, `LessonPanel.tsx`,
`PartExplorer.tsx`, `global.css`; extend `e2e/design.spec.ts` and the existing component tests.

**Interfaces:**

```ts
export interface TitleBlockProps {
  lesson: Lesson;
  sheet: number;
  sheets: number;
  quantity: number;
}
```

Quantity per part comes from the spec (`frame` 1, `motors` and `props` = `motorPlacements` length)
via a pure helper `partQuantity(part: PartId, spec: DroneSpec): number` in `shared/domain`, with a
unit test.

- [ ] **Step 1: Failing tests:**
  - `TitleBlock`: shows the part title, "2 of 3" for motors, qty 4, and the spec line built from
    the lesson's spec values.
  - `PartList`: each row shows item number, label and quantity; the selected row has
    `aria-pressed="true"` and a `data-selected` hook for styling (not colour alone).
  - `LessonPanel`: the four questions render as headings each preceded by its number 1–4.
  - e2e: at 320px with pseudo-localised copy (a test-only route is not allowed; instead inject
    longer text with `page.evaluate` into lesson text nodes) and at 1280px with
    `document.documentElement.style.fontSize = '200%'`: `scrollWidth ≤ innerWidth`; after following
    a connection link, the focused `h2` has a visible outline.
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement** the first viewport from the contract: drawing field with a hairline
      frame and edge zone markers around the canvas; parts list docked at its lower left with 48px
      rows; drag hint at its lower right; sheet column with title block, part title (caps),
      lead sentence, numbered questions, and the spec grid as ruled rows that stack (label, value,
      meaning) in a container query below ~32rem. Viewer gets `min-width: 0`; breakpoints in `em`.
      Empty state: the sheet column shows the hint in the sheet's voice.
- [ ] **Step 4: Run** unit and e2e — PASS; screenshot desktop 1280, phone 390, and 320 and check
      against the contract. **Step 5: Commit**
      `feat(part-explorer): lay out the explorer as a drawing sheet`.

### Task 5: Phone layout and touch

**Files:** modify `DroneViewer.tsx`, `global.css`; extend `e2e/design.spec.ts`.

- [ ] **Step 1: Failing e2e** (Chromium, 390×844, `hasTouch`): a one-finger vertical swipe over the
      canvas (CDP `Input.dispatchTouchEvent`) increases `scrollY`; the drawing field height is
      between 35% and 45% of the viewport; part rows are ≥ 44px tall.
- [ ] **Step 2: Run** — FAIL (swipe currently orbits).
- [ ] **Step 3: Implement:** `OrbitControls` `touches={{ ONE: undefined, TWO: TOUCH.DOLLY_ROTATE }}`
      and, after the controls attach, set the canvas element's `touch-action` to `pan-y` (three's
      OrbitControls sets `none` on connect); drawing field `height: 40svh` below the breakpoint;
      a phone-only hint "Two fingers to turn". If the override cannot keep two-finger rotation,
      record a ruling and fall back to a "Turn model" toggle.
- [ ] **Step 4: Run** — PASS. **Step 5: Commit** `fix(drone-viewer): let one finger scroll the page on phones`.

### Task 6: 3D materials, selection outline and render loop

**Files:** modify `src/features/drone-model/materials.ts` (+ test), `parts/PartMaterial.tsx`,
`DroneModel.tsx`, `DroneViewer.tsx`, `src/features/drone-viewer/index.ts`.

- [ ] **Step 1: Failing tests:** `materials.test.ts` — part base colours equal `MODEL_COLOR`;
      the selection colour equals `COLOR.accent`; `partEmissive` is removed in favour of
      `selectionOutline(highlighted)` returning `{ visible, color, thickness }`.
- [ ] **Step 2: Run** — FAIL. **Step 3: Implement:** materials from tokens; drei `<Outlines>` in
      redline on the selected part's meshes; scene lit for the dark ground; `frameloop="demand"`;
      start the viewer chunk download at module load of `drone-viewer/index.ts` (keep it out of the
      entry chunk; verify with `pnpm build` output).
- [ ] **Step 4: Run** unit and e2e (both targets) — PASS; screenshot each selected part on desktop
      and phone. **Step 5: Commit** `feat(drone-model): draw the selection as a redline outline`.

### Task 7: Finish (impeccable and project gates)

- [ ] Run `impeccable detect --json index.html src` once; fix mechanical findings.
- [ ] Capture `.impeccable/review/desktop.png` (1440 wide, full page, a lesson open) and
      `mobile.png` (390 wide); spawn `impeccable-finish-reviewer` with the contract, screenshots
      and detector findings; act on its disposition (max two fix rounds).
- [ ] Spawn `impeccable-documenter` to write `DESIGN.md` and `.impeccable/design.json` from the
      built world.
- [ ] Update `CLAUDE.md` rule 6 (design now follows `DESIGN.md` and the surface brief),
      `docs/architecture/overview.md` (tokens, fonts) and the roadmap (add sections "Model that
      teaches" and "Lookup and navigation"; mark 02 done at merge).
- [ ] Re-run `/impeccable critique` and `/impeccable audit` for the score change; then the
      independent section review (`docs/workflow/review.md`), fixes, PR.

## Acceptance

- The first viewport matches the contract's FIRST VIEWPORT on desktop and phone.
- Critique and audit P1 findings in scope (visual system, phone scroll, reflow) are resolved.
- `pnpm check`, both e2e targets, `pnpm build` and `docker build .` pass.
