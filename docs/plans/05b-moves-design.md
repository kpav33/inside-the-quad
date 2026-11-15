# Section 05b — How a quad moves: Design

Design agreed in conversation on 2026-11-15. The implementation plan will be `05b-moves.md`.
Branch: `feat/moves`. Builds on 05a (paths); 05c ("what if") comes after.

## Intent

The paths (05a) show what travels through the drone. A beginner still can't picture how four
spinning props steer anything: there is no rudder and no wing, only four motor speeds. This
sheet lets them push the sticks and watch, on the same 3D drawing, which motors speed up and how
the drone turns because of it, then see the gyro loop catch a knock. The goal is "now I can
imagine it", not accuracy to the decimal.

## Goals

1. One new sheet, **How a quad moves**, in the "How it works together" chapter after the three
   paths: a guided walk of five steps, **Throttle, Roll, Pitch, Yaw, Gyro loop**.
2. Two virtual sticks laid out like a real radio (mode 2): left = throttle (up/down) and yaw
   (left/right), right = pitch (up/down) and roll (left/right). Usable at any step, with pointer,
   touch and keyboard.
3. Each motor shows its speed, and the drone on the drawing turns in place as a result.
4. The drone behaves like **acro** (user decision): the stick sets how fast the drone rotates;
   centred, it stops rotating and keeps the angle it is at. It does not level itself.
5. The gyro loop is shown: a gust knocks the drone, the motors answer, and it returns to the
   angle it was holding.

## Non-goals and anti-goals

- **No flight (user decision).** The drone never travels across the field: no position, no
  gravity simulation, no crashing. Only rotation in place, and a small up/down hint for throttle.
- No physics engine and no claim of physical accuracy: a simple, tested model that gets the
  _directions_ right and the _sizes_ readable.
- No angle mode, no arming, no rates or PID tuning, no flight training (scope: out).
- No faults or failures (05c).
- **Anti-goal:** a toy that teaches the wrong direction. Which motors speed up for each stick must
  be right for this drone's layout (Quad X, Betaflight order, props in); a reversed yaw or roll
  makes the sheet worse than none.
- **Anti-goal:** a busy drawing. One drone, four motor readouts, two sticks; nothing else moves.

## Approaches

- **A new sheet in the drawing set (user decision).** Same layout, title block, footer, phone
  behaviour and step-in-the-address as the path sheets; a small tested model turns sticks into
  motor speeds and a rotation; the existing 3D drone turns as a whole.
- **A separate simulator page:** freer layout, but breaks the chapter and needs its own
  navigation and look. Rejected.
- **A real physics engine:** accurate, but heavy for "show the idea", the same reason flight was
  ruled out. Rejected.
- **Angle mode** (stick = tilt, self-levelling) was proposed and rejected by the user: real FPV
  drones fly acro, and the intro already teaches "it keeps the angle you left it at".
- **Guided steps (user decision)** over a free playground: it is an introduction app; a beginner
  needs to be told what to look at.

## The physics, as the sheet teaches it

Fixed by this drone's layout (`motorPlacements`: 1 rear-right CW, 2 front-right CCW, 3 rear-left
CCW, 4 front-left CW, seen from above; front is −z). The builder pins each line with a unit test:

| Stick                        | Motors faster | Motors slower | The drone                       |
| ---------------------------- | ------------- | ------------- | ------------------------------- |
| Throttle up                  | all four      | —             | rises a little (hint only)      |
| Roll right                   | 3, 4 (left)   | 1, 2 (right)  | rolls right, keeps rolling      |
| Pitch forward (stick up)     | 1, 3 (rear)   | 2, 4 (front)  | nose tips down                  |
| Yaw right (nose turns right) | 2, 3 (CCW)    | 1, 4 (CW)     | turns clockwise seen from above |

Yaw: each prop twists the body the opposite way to its spin, so speeding up the CCW pair turns
the drone clockwise. The step text says this in plain words.

**The model (builder's call within these rules):**

- Stick → wanted rotation rate per axis, capped at about **90°/s** (real quads spin 6–8 times
  faster; that is unreadable). The text says the sheet is slowed down.
- A rate controller compares wanted rate with measured rate (the "gyro") and sets a turning
  effort per axis; it remembers the error over time, so after a knock the drone returns to the
  angle it held (as Betaflight's I term does). The mix turns throttle + efforts into four motor
  speeds, 0–100 %, using the table above.
- Some air drag on rotation, so a held stick keeps a visible difference between the motors (not
  just a blip at the start and end of a turn). The difference is biggest while starting and
  stopping a turn; the text may say so.
- Throttle: centre is roughly hover. Motors never drop below an idle speed (the drone is always
  armed on this sheet; arming is 06's radio topic). Throttle moves the drone up or down by a
  small, capped amount around its place, a hint and no more.
- Runs on the animation frame with a capped time step, so a slow or hidden tab can't explode it.
  Pure TypeScript, no three.js in the model, fully unit-tested.

## Decisions

1. **Address and place:** `/moves`, step n at `/moves/n` (step 1 is `/moves`), same parsing and
   clamping as path steps. It is sheet 4 of 4 in "How it works together", after Video. Reading
   order: Video → How a quad moves; Next from here: none (end of the set until 05c/06). The
   masthead's "How it works together" stays current on it. Overview chapter count becomes "of 4".
2. **The sheet:** title block (chapter, sheet "4 of 4", and two or three plain facts in place of
   From/To/Carries, e.g. "Mode: Acro", "Motors: 4, props in"; wording the builder's), a one-line
   lead, then the five steps as a numbered list with the same pinned step controls, stop-name
   buttons, scroll-into-view and live region as a path sheet. No lesson links needed; a step may
   link a part lesson (Motors, Flight controller) as the quieter link, as on paths.
3. **Each step:** a heading, one or two short paragraphs, and a short **demo**: opening a step
   moves the sticks through its manoeuvre once (Throttle: up then back to centre; Roll: right,
   hold, centre; Pitch and Yaw likewise; Gyro loop: a gust). A **"Show me"** button replays it.
   Under reduced motion the demo does not start by itself; "Show me" still runs it. Grabbing a
   stick stops a running demo. There is no "Play" across steps (Play is a path thing).
4. **Gyro loop step:** a **Gust** button knocks the drone (a sudden spin on a random axis or a
   fixed roll knock, builder's call); the step shows, small and live, what the flight controller
   compares: **wanted** rotation (from the sticks) and **measured** rotation (the gyro), per
   axis, in °/s. The text: thousands of times a second, the gap is turned into motor speeds. The
   Gust button is available on every step (it is cheap and fun), but explained here.
5. **Level:** a **Level** button puts the drone back upright and facing front, always available
   (acro can leave it upside down). Opening the sheet or another step does not reset the angle;
   Level does.
6. **The sticks:** two square gimbals in the drawing field's lower corners, left stick left,
   right stick right, like holding the radio over the drone. They spring back to centre on
   release, except throttle, which stays (as on a real radio). Each stick shows its position;
   each axis is a slider for assistive technology (name, value, value text such as "Roll 40 %
   right"), arrow keys move the focused stick and it springs back when the key is released;
   Home/End/Page keys optional. The drone is fitted to the field with room left for them.
   **On phones (user decision):** on this sheet the drawing, sticks included, is pinned at the
   top of the screen (about 40 % of its height) while the steps scroll under it, so the drone
   and sticks stay in view while reading and when a demo starts (the open 05a idea). The pinned
   step controls sit just under the drawing. Path sheets may adopt this later; not in 05b.
7. **Motor readouts:** a small balloon per motor on the drawing, its number and speed in %
   ("2 · 64 %"), projected beside its motor like the path pins (DOM overlay, `aria-hidden`), not
   covering the sticks. The faster motors on a manoeuvre are marked (builder's call: the redline
   ring of the current pin; no new colours). The step list repeats what matters in words, so
   the readouts are not the only source. Props show their spin arcs (from the Props sheet); each
   arc's **length** follows its motor's speed. The arcs never animate on their own, so the
   canvas stops drawing once the drone settles (builder check; my call).
8. **The drawing:** frame closed (not exploded), all parts in the normal look; the drone group
   rotates as one. The camera is fixed at a three-quarter view from front-above, so roll, pitch
   and yaw all read; it is fitted to the drone's bounding sphere so any rotation fits. Clicking
   the drawing does nothing on this sheet. Orbiting the camera stays as on other sheets (if it
   is enabled there).
9. **Reduced motion:** the drone still turns when the user moves a stick or presses Gust (the
   user asked for it); demos don't auto-start.
10. **3D view fails:** the steps still read, sticks and readouts are hidden, a line says the
    drawing could not load (as other sheets do).
11. **Reading progress:** the sheet can be marked as read like the others.
12. **Text** in `src/content/` (the moves content in its own file or folder, interface words in
    `ui.ts`). Every claim agrees with the motor, prop, FC and intro lessons.

## Constraints

- Layering as today: content in `content/`, the model and readouts in the 3D features, the sheet
  in `features/part-explorer` (or a sibling feature if that file grows too large; builder's
  call), nothing in `shared/` imports content.
- Tokens only, no new colours; redline only for selection, the current sheet, the current step
  and focus.
- 02d rules hold: no sideways scroll at 320 px with 200 % text; focus visible; reduced motion
  honoured live.
- The canvas draws on demand: the model asks for frames only while something moves (stick off
  centre, rotation or correction still settling, a demo or gust running), then stops.
- ADR 0002 holds: no model files. No new runtime dependencies.
- PRODUCT.md, DESIGN.md (sticks and motor readout as components), the surface brief, the
  architecture overview, scope (05b done) and the roadmap are updated. Mark 05a done in the
  roadmap on this branch.

## Left to the builder

Step wording (checked against the lessons), the model's constants (gains, drag, idle, rise
height), stick size and look (drawing-sheet style), readout placement, the demo scripts' timing,
the gust's shape, how the chapter type grows from "paths" to include this sheet, and the test
split.

## Tests

- Unit: the mixer table above, each row (which motors rise and fall, sign by sign); centred
  sticks and no rotation give four equal speeds; speeds stay within idle–100 %; a held roll
  keeps rolling, centring stops it and the angle stays; a gust returns to the held angle within
  a few seconds; the model is stable at large and tiny time steps; routes parse and build
  `/moves` and `/moves/n`; reading order Video → moves; chapter counts 4.
- Component: the sheet lists five steps; stepping moves the current step and announces it; stick
  sliders respond to arrow keys and spring back (throttle stays); Level and Gust buttons; demo
  doesn't auto-start under reduced motion; 3D-less fallback.
- e2e: Next from Video opens the sheet; dragging the right stick right raises motors 3 and 4 and
  tilts the drone (readouts change); keyboard-only use of a stick; Level; at 375×667, scrolled
  to step 5, drone and both sticks visible together; 320 px with 200 % text has no sideways
  scroll; reduced motion.
