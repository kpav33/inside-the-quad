# Section 06 — The gear you hold and wear: Design

Design agreed in conversation on 2026-11-18. The implementation plan will be `06-gear.md`.
Branch: `feat/gear`. Module 4 of `docs/product/scope.md`.

## Intent

The app so far explains the drone. A beginner can't fly it without three more things: the radio in
their hands, the goggles on their head, and the charger on the bench. The intro names the radio
and goggles, and the control and video paths end at them, but nothing says what they are, how they
work or what their numbers mean. This section gives each its own sheet, in the same voice as the
part sheets, with one thing to try that shows the idea the sheet is there for.

## Goals

1. A third chapter of the drawing set, **The gear you hold and wear**, after "How it works
   together", with three sheets: **Radio** (`/gear/radio`), **Goggles** (`/gear/goggles`),
   **Charger** (`/gear/charger`). Sheets 1–3 of 3, in reading order after What if, with their own
   chapter switcher, read marks and previous/next.
2. Each sheet answers the part sheets' four questions (what it does, how it works, what the
   numbers mean, what it connects to), using the scope's content:
   - **Radio:** two sticks (gimbals), mode 2 (left: throttle and yaw; right: pitch and roll),
     switches (arm, flight mode), the ELRS module inside, EdgeTX firmware.
   - **Goggles:** a video receiver plus screens; analog and digital, which must match the drone's
     VTX.
   - **Charger:** balance charging, storage mode, why a good charger matters.
3. **The drawing (user decision, A):** on a gear sheet the drawing field shows a flat line drawing
   of the item, in place of the 3D drone, with balloons naming its parts. Clicking a part's name,
   on the drawing or in the sheet's text, highlights that part on the drawing.
4. **One thing to try per sheet (user decision, B):**
   - **Radio:** an **arm switch** (disarmed / armed) and a **flight mode switch** (the modes are
     the builder's to choose from what the lessons say; acro must be one, since the moves sheet
     uses it). The switch levers on the drawing move. A line says what the drone would do, e.g.
     "Disarmed: the motors won't spin, whatever the sticks do." / "Armed: the props spin."
   - **Goggles:** **Analog / Digital**. The goggles' screen on the drawing shows a picture (analog,
     matching this drone's analog VTX) or "No signal" (digital). A line says why: the two systems
     send video in different ways and can't receive each other.
   - **Charger:** **Charge / Storage**. Six cell bars (this drone's pack is 6S) on the drawing fill
     to 4.2 V each (25.2 V total) or settle at 3.8 V each (22.8 V total), with the balance lead
     drawn to the cells. The values come from `LIPO_CELL_VOLTS` and the spec's cell count, never
     typed in.
5. **Links into the chapter:** "Your radio" and "Your goggles" at the ends of the control and
   video paths link to the Radio and Goggles sheets (today they link to the intro). The intro's
   radio and goggles descriptions link to them too. Next from What if leads to Radio. Each gear
   sheet links to the related part sheets: Radio → Receiver; Goggles → VTX, Camera; Charger →
   Battery.
6. **Phones:** the drawing is pinned above the sheet text, as on the flight sheets, and stays
   readable at 320 px with 200 % text.

## Non-goals and anti-goals

- No product names as recommendations, no prices, no buying guide (scope: out of scope). Digital
  video is named as a kind of system ("digital systems"), not by brand.
- No EdgeTX or ELRS setup walkthrough (binding, model setup, mixes), no Betaflight modes setup, no
  charger settings walkthrough beyond Charge and Storage. One line each where the lessons need it.
- No 3D models of the gear; no live sticks on the radio sheet (the moves sheet does that).
- **Anti-goal:** a toy. The toggles are calm drawing-sheet controls; nothing flashes, beeps or
  scores. The goggles' "picture" is a simple line drawing of a view, not a video.
- **Anti-goal:** teaching something wrong. Every claim agrees with the receiver, VTX, camera and
  battery lessons and the drone spec (ELRS 2.4 GHz, analog 5.8 GHz video, 6S, 3.8 V storage,
  4.2 V full).

## Approaches

How to draw the gear:

- **Flat labelled drawings (user decision).** A front view of each item, balloons naming its
  parts. Matches the intro's flat drawings; a front view is what teaches the layout (which stick,
  which switch).
- 3D procedural models of each item, swapped into the drawing: most consistent with the drone but
  much more work, and turning a charger round teaches nothing new.
- Photos and text only: cheapest, but loses the drawing sheet.

What the sheet does:

- **One small thing to try per sheet (user decision).** Each toggle shows the sheet's one idea.
- Names only: quick, but quieter than the sheets before it.
- Also live sticks on the radio driving the moves drone: repeats sheet 4.

## Decided calls (mine, for review)

- **Photos:** each gear sheet gets a real photo (as the part sheets do, 03c pipeline) only if a
  sharp, free-licensed one exists; otherwise none. Not required for the section to be done.
- **Code:** a new feature `src/features/gear/` with the three SVG drawings (plain React SVG, like
  `features/intro`) and their toggles' state; gear copy in `src/content/gear/`. The drawing field
  shows the gear drawing instead of the 3D viewer, so the 3D chunk isn't needed on a gear sheet.
- **Routes:** `/gear/<id>` with `GearId = 'radio' | 'goggles' | 'charger'` in
  `src/shared/domain/gear.ts`; unknown ids are an unknown address, like unknown parts.
- **Toggle state** lives on the sheet and resets when you open the sheet again; it is not in the
  address.
- **Highlight:** a gear part highlights in redline (redline is for selection), the rest stays
  ink. Hovering a balloon or a name in the text highlights it too.
- **Overview:** the overview lists the new chapter as it lists the other two.

## What's left to the builder

- The exact wording, within the facts above.
- Each drawing's exact shape and the parts it names (at least: radio — antenna, gimbals, arm and
  mode switches, screen; goggles — screens, video receiver, antenna, strap; charger — main lead,
  balance port and lead, screen, the pack's cells).
- The flight modes offered (acro plus what the lessons already mention).
- How the toggles look, within DESIGN.md (the battery switch on the what-if sheet is the model).
