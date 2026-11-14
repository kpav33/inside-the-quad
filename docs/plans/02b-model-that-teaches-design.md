# Section 02b — The model that teaches: Design

Design agreed in conversation on 2026-11-14, with throwaway prototype renders to choose from. The
implementation plan will be `02b-model-that-teaches.md`. Branch: `feat/model-that-teaches`.

## Intent

A beginner should be able to see on the 3D drone which part is which and what it is wired to, so
they can then recognise the parts on a real drone. Today the model is a picker: every part has the
same dark fill and white edges, the middle of the drone (stack, receiver, VTX, camera) reads as a
tangle of lines, and the drone takes up about half the drawing field. What real parts look like is
left to section 03c (CC-licensed photos), which comes straight after this one.

## Goals

1. **The open part stands out, with what it connects to.** When a sheet is open, its part stays
   redline, the parts it connects to stay drawn, and everything else fades.
2. **The drone fills the drawing field** (about 15–20 % larger than today at 1280 × 800).
3. **Spin arcs on the Propellers sheet** show which way each prop turns.
4. **Hovering a part in 3D lights up its row** in the parts list.

## Non-goals and anti-goals

- **Dropped from the roadmap line (user decision):** dimension lines (exact millimetres on an
  example drone are not what a beginner needs; spec codes stay explained in the lessons), callout
  balloons (the parts list already names and highlights parts), a front marker (the overview stays a
  clean drawing), and a different grey per part.
- **No more realistic part shapes.** The model stays simple linework; photos carry "what it looks
  like" in 03c.
- **Anti-goals:** the drawing must not get busier than today on the overview, and redline must
  still mean only "this one".
- Hovering a parts-list row does not light up the part in 3D (it does not today either); not added.

## Approaches

- **How parts are told apart (user decision): fade the rest when a part is open.** Chosen over
  always-on callout balloons (duplicate the parts list, clutter the drawing) and a different grey
  per part (makes the drawing a grey model rather than linework, little gain).
- **How connections show (user decision): connected parts stay drawn in grey.** Chosen over fade
  only (the drawing would not show relationships) and dashed connection lines (more new marks on the
  drawing, hard to keep legible while the drone turns).
- **How the drone fills the field (user decision): fit the camera to the drone's real outline**
  as seen from the views the app uses, for the canvas's shape. Chosen over lowering the fit margin
  (one tuned number that crops on other screen shapes and when the model changes). Today drei
  `Bounds` fits a cube around the prop discs by its largest side, which wastes the field's height.

## Decisions

1. **Four looks for a part in 3D** (one function, extending `partAppearance`):
   - **Open:** redline fill, ground edges (as today).
   - **Connected:** a mid-grey fill, a new 3D-only token, lighter than every `MODEL_COLOR` and
     never used as a surface or text colour; ink edges.
   - **Faded:** nearly transparent ground fill and edges in `ruleStrong`, so the part reads as a
     faint drawing behind the open one.
   - **Normal:** today's look, including the small per-part tonal steps of `MODEL_COLOR`. Used
     everywhere on the overview (no part open).
     The prototype values were: connected fill `#4a525a`; faded fill ground at 25 % opacity with
     depth writes off. The builder tunes them with impeccable and records them in `DESIGN.md`.
2. **Connected parts come from the lessons.** The set for the open part is the `partId`s of its
   lesson's "What is it connected to?" list, without duplicates and without itself. The part
   explorer, which already reads lessons, passes the set to the viewer; the 3D code gets no copy of
   the list. Today's lists give, for example: ESC → battery, motors, flight controller, frame;
   Propellers → motors, frame; Frame → every part except Propellers and Extras, so on the Frame
   sheet those two fade (builder's call, accepted: the lessons are the source, and no lesson
   content changes in this section).
3. **Faded parts can still be clicked and hovered.** Clicking one opens its sheet, as today.
4. **No fade animation.** Looks switch at once, so reduced motion needs nothing new and the canvas
   keeps rendering on demand.
5. **Fit to the real outline.** The camera distance is the smallest that keeps the drone inside the
   canvas, with a small margin, from the default view and from the camera-turn views
   (`partView`: front and rear), and with the stack and rear bay lifted as well as closed. It is
   computed from the drone's extents (prop tips as full discs, antennas, battery, lifted layers),
   projected for the canvas's aspect ratio and field of view, and recomputed on resize. It replaces
   `Bounds` + `FitBox`. Turning the drone by hand to other angles may push a prop tip past the frame
   edge; that is accepted. The zoom limits (today fixed at 0.15 and 0.8) become relative to the
   fitted distance, so zoom keeps the same range on every screen.
6. **Spin arcs**, on the Propellers sheet only: one arc with an arrowhead over each prop, in ink, in
   the direction from the motor layout (`motorPlacements(...).spin`, props-in). They turn with the
   drone and are hidden from assistive technology like the rest of the canvas; the lesson text
   already explains the directions.
7. **3D hover lights the row.** The viewer reports the part under the pointer (mouse only, not
   touch, as in 04); the parts list gives that row its normal hover look. Hover never uses redline.
8. **Zone markers stay** as frame decoration; no change.

## Constraints

- ADR 0002: the drone stays procedural, one component per part; no model files.
- Tokens only; redline only for selection, the current sheet and focus. New 3D tokens go in
  `src/shared/design/tokens.ts` (and `tokens.css` if CSS needs them) and in `DESIGN.md`.
- Layering: `features/drone-model` and `features/drone-viewer` do not import `content/` directly;
  the connected set reaches them as a prop.
- three.js stays lazy (reached through `React.lazy`).
- The existing 3D e2e click tests must keep working, so their click points may need updating once
  the drone is larger.

## Left to the builder

The builder check (Codex) found no open questions for the user; its two factual corrections and
the Frame-sheet question are folded in above.

Exact fade opacity and grey values, the arc's radius, sweep and arrowhead, the fit margin, how hover
state travels from the viewer to the list, and the unit-test split. Each gets checked by eye with
impeccable at 1280, 768 and 390 px.

## Tests

- Unit: the appearance for each of the four looks; the connected set from lessons (no duplicates,
  no self, each id a real part); the fit (the projected extents of the closed and lifted drone fit
  inside the frustum for the three views at a wide and a tall aspect ratio, and the drone fills
  more of a 1280 × 800 field than with today's fit); spin directions from the layout.
- e2e: the drone fills at least a set share of the drawing field's width on desktop; opening ESC
  and Propellers renders without errors (canvas frame check); hovering a part on the canvas gives
  its parts-list row the hover look and leaving clears it.
- Docs: `DESIGN.md` (the four looks, spin arcs, new tokens), the roadmap line for 02b (rewritten
  to the agreed scope; 03c next), the surface brief.
