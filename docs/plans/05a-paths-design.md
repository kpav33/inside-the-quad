# Section 05a — Paths: Design

Design agreed in conversation on 2026-11-15, after a mockup of a path sheet. The implementation
plan will be `05a-paths.md`. Branch: `feat/paths`.

Module 3 ("How it all works together") is split into three sections: **05a paths** (this one),
**05b how a quad moves** (virtual sticks, motor speeds, the gyro loop) and **05c what if** (failsafe,
prop on backwards, 4S vs 6S, VTX without antenna). 05b and 05c build on this one.

## Intent

The part sheets teach what each part is. A beginner also needs to follow a signal or a current
through the drone: what happens between pushing a stick and a motor speeding up, where the power
goes, how the picture reaches the goggles. That is what lets them apply the lessons to a real
drone ("no picture: camera → VTX → antenna, check those"). The paths teach the order **and** where
each stop sits on the drone, on the same 3D drawing.

## Goals

1. Three path sheets, **Control**, **Power** and **Video**, each a numbered walk through the parts
   the path passes, on the 3D drawing.
2. On the drawing, the path's parts stay drawn, the rest fade, and a redline leader joins the stops
   in order, moving in the direction of flow at the current step.
3. A learner can step through a path (previous / next step, or play it once), and every stop links
   to that part's lesson.
4. The paths are reachable from the masthead and run on from the part sheets in reading order.

## Non-goals and anti-goals

- No sticks, motor speeds, tilting or gyro loop (05b); no faults or "what if" (05c).
- No modelled wires, solder pads or cables: the leader is a drawing convention, not a wire.
- No flat block diagram in this section (it may come later as a summary strip).
- No flight, tuning or product content (scope).
- **Anti-goal:** a busy drawing. The paths must read as cleanly as a part sheet: one leader, one
  current step, the rest quiet. If the leader turns into a tangle, the section has failed even if
  it works.
- **Anti-goal:** a path that claims a precision it hasn't got. Steps describe what passes and what
  the part does to it, in the same plain words as the lessons; numbers (rates, voltages) come only
  from the reference spec and must match the lessons.

## Approaches

- **Path sheets on the 3D drawing (user decision).** Same layout as the part explorer, the drone
  faded except the path's parts, a redline leader part to part, the radio and goggles as labelled
  ends. Chosen because it teaches where the parts are as well as their order, and reuses the 02b
  fading, connections and camera turns.
- **A flat block diagram** (like the intro's system scene): clearer and cheaper, but teaches order
  without location, so it is less use at the bench. Rejected for now.
- **Wiring modelled in 3D** with flow along real routes: most realistic, but much geometry and a
  busy drawing where it most needs to be clean. Rejected.
- **Home (user decision): inside the drawing set**, three sheets after the 11 parts, not a
  separate `/how-it-works` page. One layout, one place; a path and a part are one link apart.

## The paths

The stops follow `docs/product/scope.md` (Module 3) and must agree with the part lessons. Each
stop names a part (its lesson link) and says, in one or two plain sentences, what reaches it and
what it does with it. Wording is the builder's, checked against the lessons; the stops are fixed:

| Path    | Stops, in order                                                                                                                                                               |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Control | Your radio (off the drone) → receiver (and its antenna) → flight controller (gyro) → ESC → motors → propellers                                                                |
| Power   | Battery → XT60 plug and capacitor (at the ESC) → ESC, which feeds the motors **and** the flight controller → flight controller's regulators (BECs) → receiver, camera and VTX |
| Video   | Camera → flight controller (adds the OSD) → VTX → VTX antenna → your goggles (off the drone)                                                                                  |

The power path branches: one stop may lead to several parts (the ESC to the motors and the flight
controller; the regulators to the receiver, camera and VTX). The leader fans out at such a stop.

**Branches (builder's call, settled in the design):** each stop names the stops it feeds. At a
step, the current stop's part is in the open look and the moving dashes run from it to **every**
stop it feeds at once, so power never appears to pass through the motors on its way to the flight
controller. Power is numbered: 1 battery, 2 XT60 and capacitor, 3 ESC (feeds 4 and 5), 4 motors
(a branch end), 5 flight controller's regulators (feed 6), 6 receiver, camera and VTX together
(one stop, three parts; the end).

**Stops on part of a part (builder's call):** the model selects whole parts only. A stop named
for part of a part (the receiver's antenna, the XT60, the capacitor, the VTX antenna, the
regulators on the flight controller) lights the whole part it belongs to; only its leader anchor
sits on the named piece where the model draws it (the regulators have no geometry: the anchor is
the flight controller). No model or selection changes.

**The off-drone ends (builder's call):** "Your radio" and "your goggles" have no lessons yet (they
come in 06). They link to the intro sheet, which introduces the three devices; 06 repoints them.

## Decisions

1. **Addresses:** `/paths/control`, `/paths/power`, `/paths/video`, through the existing routing
   hook (ADR 0004 already leaves room for more pages). An unknown path id behaves like an unknown
   part (overview with a notice).
2. **Place in the set:** after the 11 part sheets, in the order Control, Power, Video. Reading-order
   previous/next runs on from Extras into Control and through the three paths. Sheet numbers count
   the whole set (parts become "x of 14"; Control is "12 of 14").
3. **Masthead:** a second link in the Sections nav, "How it works together", to the Control path,
   marked current on any path sheet.
4. **The path sheet** (as mocked up): title block (sheet number, and the path's stop count in
   place of the part spec), a one-line lead, a switcher between the three paths, then the
   numbered stops as a list; the current stop is marked with redline (as the parts list marks the
   open part). Under it: previous step / next step and "Play the path", then the sheet's usual
   footer (previous/next sheet, mark as read). Every stop's name links to its part's lesson.
5. **Stepping:** the current step lives in the page, not the address (the address names the path;
   opening a path starts at step 1). Step 1 is current when the sheet opens. "Play the path"
   advances one step every few seconds and stops at the last; any step control, link or Escape
   stops it. Screen readers hear the current stop's name and text when it changes.
6. **The drawing on a path sheet:** the frame is opened (exploded view), since every path passes a
   board under the top plate. The path's parts are drawn in the connected grey, the current
   step's part(s) in the open look, everything else faded (02b looks, no new colours). The view
   turns to show the current step's part, using the existing part views.
7. **The leader:** a redline line through anchor points on the parts in stop order. Stretches
   already passed are solid and faint, the current stretch dashed and moving toward the next stop,
   the stretches ahead not drawn. At each stop a small numbered marker matching the list. The
   radio and goggles are labelled ends just outside the drone, inside the drawing field and never
   clipped; the drone still fits the field.
8. **Redline:** the leader and the current stop count as the current selection, which is what
   redline is reserved for. DESIGN.md records the path leader as a component.
9. **Reduced motion:** no moving dashes and no automatic camera easing (as today); the current
   stretch is drawn dashed but still. "Play the path" still steps.
10. **Reading progress:** path sheets can be marked as read like part sheets; the overview's
    "continue" offers the first unread sheet across the whole set.
11. **Text** lives in `src/content/` (path content in its own folder, interface words in `ui.ts`).
12. **3D view fails to load:** the path sheet still works as a numbered list with links (as part
    sheets do today).

## Constraints

- Layering as today: path content in `content/`, the sheet in `features/part-explorer`, the
  leader in the 3D features; nothing in `shared/` imports content.
- Tokens only; no new colours; redline only for the current selection, the current sheet and
  focus.
- 02d rules hold: no sideways page scroll at 320 px with 200 % text; focus follows the opened
  sheet; reduced motion is honoured live.
- The 3D model stays procedural (ADR 0002); the leader is drawn in code from the model's own
  layout functions, so it follows the model if a part moves.
- PRODUCT.md, DESIGN.md, the surface brief, the architecture overview and the roadmap are updated.

## Left to the builder

Each stop's exact wording (checked against the lessons), anchor points on the parts, the leader's
rendering technique, where the radio and goggles ends sit, marker size, the play interval, how the
switcher is built (links, styled as tabs), how the sheet number type grows to include paths, and
the test split.

## Tests

- Unit: every path's stops name real parts in the order above; every part named on a path is a
  part the lessons connect it to (or its own neighbour on the path); routes parse and build the
  three path addresses and reject unknown ones; reading order and sheet numbers run 1–14.
- Component: the path sheet renders its stops in order with lesson links, step controls move the
  current stop and announce it, play stops at the end and on any control, the 3D-less fallback
  still lists the stops.
- e2e: the masthead link opens the Control path; stepping moves the marked stop and the drawing
  keeps the path's parts drawn; next sheet from Extras opens Control; reduced motion stops the
  moving dashes; 320 px with 200 % text has no sideways scroll.

## Amendment 1 (2026-11-15, after the user tried the built sheets)

The user found the paths read as more part sheets, lost their place when the drawing or a lesson
link took them away, and had to scroll to see each new step. Agreed changes, which replace the
decisions they contradict above:

1. **Two chapters (user decision: a clear new chapter).** The drawing set has two chapters, "The
   parts" (sheets 1–11) and "How it works together" (the paths, sheets 1–3). Numbering restarts:
   Control is "1 of 3"; parts stay "x of 11". The path title block shows the chapter, the sheet,
   and what the path is about: From, To and Carries (e.g. Your radio → Propellers, stick
   commands), replacing the Stops count. The footer marks the crossing: from Extras, Next reads
   "End of the parts" and names "How it works together, sheet 1: Control path"; from Control,
   Previous reads "Back to the parts". References to a path sheet name it with its chapter
   sheet number. The overview counts each chapter ("Parts 3 of 11 · Paths 0 of 3") and continues
   into the paths after the parts. (A chapter label above the heading was rejected: the design
   system bans eyebrows over headings; the title block and footer carry the chapter.)
2. **Clicking the drawing on a path sheet stays in the path.** A part on the path opens that part's
   step (the stop with that part alone, else the first stop with it); a part off the path does
   nothing. Lessons are reached from the stop list's links.
3. **The step is in the address** (`/paths/control/3`; stop 1 is `/paths/control`). Stepping and
   Play replace the address (no history entry per step), so Back from a lesson returns to the same
   step. An out-of-range step is replaced by the nearest valid one. A lesson opened from a path's
   stop list shows "Back to Control path, step 3" until another sheet is opened.
4. **The current step scrolls into view** when it changes (step controls, Play, a click on the
   drawing) and is not fully visible, smoothly unless motion is reduced.
5. **A stop's name picks the step (user decision, after trying Amendment 1).** In the paths chapter
   a stop's name is a button that makes it the current step, like Next and Previous; the lesson is
   one quieter link below the stop's text ("Lesson: Receiver", "Lessons:" for several parts, "More
   in What is an FPV drone?" for the off-drone ends). The step controls stay pinned at the top of
   the sheet while the stops scroll under them, so keyboard focus stays visible (review A3).
