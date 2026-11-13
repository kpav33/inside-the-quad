# Section 04 — "What is an FPV drone?" intro: Design

Agreed design for section 04 (Module 1 of the scope). The implementation plan will be
[04-intro.md](04-intro.md). Branch: `feat/intro`.

## Intent

A complete beginner arrives knowing roughly what a drone is, but not what "FPV" means, that the
drone is only one of three devices, or why sizes are named in inches. Before the parts, the app
gives them a short intro that answers those questions, so the part lessons land on solid ground.
It serves the learning use in `PRODUCT.md` (reading start to finish) without getting in the way
of the reference use (jumping straight to one part).

## Goals

- Cover the four Module 1 topics in `docs/product/scope.md`: FPV vs camera drones; the whole system
  (drone, radio, goggles; two wireless links); sizes named by prop size, with a visual comparison;
  what "5-inch" means and why it is the reference.
- Make the intro the obvious first step for a newcomer, while the 3D drone stays the first thing
  everyone sees.
- Keep the intro inside the drawing-set world: it reads as one more sheet.

## Non-goals

- Section tabs in the masthead (they wait for the first truly separate page, the simulator in 05).
- Animated signals or the "what if" simulator (05); how a quad moves (05).
- The radio and goggles explained in depth (06).
- 3D models of the radio, goggles or pilot.

## Anti-goals

- The intro must not block or redirect anyone: no first-visit redirect, no modal, no splash.
- The home page must behave the same for everyone (no hidden per-visitor variants beyond the
  start block's progress-based wording, which already exists).
- No product recommendations; brand names only as examples, as in the lessons.

## Approaches considered

**Where a first-time visitor meets the intro**

- **Chosen: the drone stays on the home page; the intro is the suggested first step.** The
  overview's start block offers the intro first. Keeps the 3D hook first and reference use fast.
- Intro as the home page, explorer moved to `/parts`: every returning visitor clicks past it, and
  the main screen's address changes. Rejected.
- Automatic redirect on first visit: the home page differs per visitor, is hard to test, and hides
  the drone from newcomers. Rejected.

**The system scene**

- **Chosen: a flat SVG line drawing** in the drawing-sheet style. Clear, light on phones, easy to
  make accessible.
- 3D scene reusing the drone plus new radio and goggles models: heavier, new models, overlaps the
  simulator. Rejected.

**Where the intro page lives**

- **Chosen: a sheet in the part explorer.** `/intro` opens the intro in the sheet column, like a
  lesson, with the 3D drone still on the left. Reuses the lesson footer, focus rules, Back/Forward
  and the start block from 02c. Trade-off: the drawings fit a column at most 36rem wide.
- A full-width page of its own with masthead tabs: more room, but new layout and focus code, and
  the drone disappears. Rejected for now; revisit with the simulator.

## Decisions

### Address and routing

- The intro lives at `/intro`. `src/shared/routing` gains an intro route alongside the overview
  and part routes; `/intro/` is replaced by `/intro`, as part addresses are. Links to it are real
  `<a href>` elements (same click rules as `PartLink`).
- The part explorer shows the intro sheet in the sheet column when the route is the intro. No part
  is selected, so nothing on the 3D model is highlighted and the parts list has no selected row.
- Tab title: "What is an FPV drone? · Inside the Quad".
- Back/Forward, focus on arrival (the intro heading) and reveal-on-phone follow the 02c rules for
  lessons.
- **Sheet order (user decision):** the intro is a real sheet before sheet 1. Its footer has no
  Previous and "Next: Frame · sheet 1"; the Frame lesson's footer gains "Previous: What is an FPV
  drone?" leading back to `/intro`. Previous/next therefore run intro → frame → … → extras →
  overview, and the sheet-link types accept the intro as well as parts.
- **Closing (my call):** Close and Escape close the intro and move focus to the overview's start
  link (the element 02c's Back-to-overview already focuses). A click on empty space in the 3D view
  does not close the intro (it only clears a selected part), so the visitor can turn the drone
  while reading.

### The intro sheet

Top to bottom, in the lesson's layout:

1. Heading "What is an FPV drone?" (`h2`, display style) with Close (back to the overview).
2. Title block: Sheet "Intro", no Part or Qty cells, and no Spec cell. (Builder: if the empty
   title block looks wrong, a Sheet-only block or no block at all are both acceptable; record the
   call.)
3. Four numbered sections with balloons 1 to 4, headings in the question style:
   1. **FPV vs camera drones.** You see live from the drone through goggles and fly it by hand;
      camera drones (DJI Mini, Mavic as examples) hold their position for you. Harder to learn,
      much more freedom.
   2. **The whole system.** Three devices, two wireless links: the radio sends your stick moves up
      to the drone; the drone sends live video down to the goggles. With the system scene.
   3. **Sizes.** Drones are named by the size of their props. With the size comparison.
   4. **Why 5-inch.** What "5-inch" means (5-inch props, about 220–230 mm across the motors) and
      why it is the reference: the most common freestyle size, big enough for standard parts that
      are easy to see and replace, small enough to be practical. Ends by pointing at the drone on
      the left.
4. Footer: Mark as read, and the sheet cells with no Previous and "Next: Frame · sheet 1".

All copy lives in `src/content/intro.ts` (a typed object, like a lesson). Every term the jargon
test already knows is explained the first time the intro uses it; the intro is added to that test.
Numbers come from data, never literals in copy: link frequencies and systems from
`REFERENCE_5_INCH` (receiver: ExpressLRS 2.4 GHz; VTX: analog 5.8 GHz), sizes from the size data
below.

### The system scene

A flat SVG drawing in ink on the sheet, hairline weights, no fills except the sheet tone:

- The pilot (a simple figure) holding the radio and wearing the goggles; the drone drawn as a top
  view in the air.
- Two labelled link arrows: **Control** from the radio up to the drone ("2.4 GHz · ExpressLRS")
  and **Video** from the drone down to the goggles ("5.8 GHz · analog").
- Each device has a caps label. Highlighting (my call, one model for every input):
  - The visible text equivalent under the drawing is a short list with one toggle button per
    device (radio, drone, goggles; `aria-pressed`), each with what it sends and over which link.
    Pressing one highlights that device and its link(s) in the drawing until another is chosen or
    it is pressed again.
  - Tapping or clicking a device in the drawing does the same as its button; hovering a device or
    a button previews the highlight. The SVG stays `aria-hidden` and contains nothing focusable;
    the keyboard path is the buttons.
  - The drone highlights both links (it receives control and sends video). The pilot is part of
    the picture, not a device.
  - Highlight is a heavier ink stroke and the label in ink; redline is not used.
- The list must fit 320 px with text 40 % longer.

### The size comparison

A flat SVG of four drones as top views, drawn to one scale, left to right, each with a caps label
and its prop size:

| Size       | Prop diameter   | Typical motor-to-motor size |
| ---------- | --------------- | --------------------------- |
| Tiny whoop | 31–40 mm        | 65–75 mm                    |
| 3"         | 76 mm (3 inch)  | 120–150 mm                  |
| 5"         | 127 mm (5 inch) | 220–230 mm                  |
| 7"         | 178 mm (7 inch) | 280–320 mm                  |

The data lives in `src/shared/domain/size-classes.ts` (plain data with a test that the 5" entry
agrees with `REFERENCE_5_INCH`). The drawing uses one representative value per class for scale.
The 5" is marked as the reference with an ink label, not redline. The same data is shown as a
small table (visible text equivalent). At narrow widths the four drones may wrap to two rows but
stay to one scale.

### Read state and the start block

- The intro has its own read flag in `src/features/progress`, separate from the parts set, under a
  versioned `localStorage` key; blocked storage behaves as for parts. The "N of 11 read" count
  stays parts only.
- The overview's start block, while the intro is not read and no part is read:

  ```
  New to FPV? Start here.
  [ WHAT IS AN FPV DRONE? → ]
  Already know the basics? Start with sheet 1: Frame →
  ```

  Once the intro is read or any part is read, it behaves exactly as in 02c (start, continue,
  start again).

- Clear progress also clears the intro flag. (My call:) Clear progress shows once anything is read,
  the intro included; the "N of 11 read" count shows once a part is read. So the visitor can always
  get back to the "New to FPV? Start here." state from the overview.
- A quiet "What is an FPV drone?" link stays reachable from the overview at all times (under the
  start block), so the intro is never hidden once read.

### Accessibility

- Both drawings are decorative to assistive technology; their visible text equivalents carry the
  meaning.
- Device highlighting works with hover, tap and keyboard focus.
- Focus and announcements follow the lesson rules (the live region announces "What is an FPV
  drone? opened").

## Constraints

- No new dependencies. Colours only from tokens; redline only for selection, the current sheet and
  focus. Square corners; no shadows; two type voices.
- Fits 320 px wide with text 40 % longer; no page scroll at 900–1100 × 700 on desktop.
- Content facts must match `docs/product/scope.md`; numbers from the spec or size data.
- UI work goes through impeccable against `DESIGN.md` and the surface brief.

## Left to the builder

- Exact SVG drawing (proportions, figure style), within the drawing-sheet rules.
- Component and file names, and how the intro sheet shares code with `LessonPanel`.
- The exact copy, within the facts above, reviewed for the jargon test and plain language.

## Tests (summary)

- Unit: the intro route and its trailing-slash form; the sheet order intro → frame (Frame's
  Previous is the intro); size data agrees with the reference spec;
  the start block's intro state; the intro flag survives blocked storage and is cleared by Clear
  progress.
- Component: the intro sheet's heading, four sections, footer (no Previous; Next to sheet 1);
  Frame's footer links back to the intro; device buttons toggle the highlight; Escape and Close
  return to the overview with focus on the start link; a 3D background click leaves the intro open;
  text equivalents present; the jargon test covers the intro.
- e2e: `/intro` loads directly and after reload; the start block leads a fresh visitor to the
  intro, Next leads on to Frame; marking the intro read changes the start block; fit at 320 px
  with longer text.

## Docs

Roadmap (04 status), `PRODUCT.md` (built so far), `DESIGN.md`, `.impeccable/design.json` and the
surface brief (intro sheet, drawings), architecture overview (intro route, intro flag).
