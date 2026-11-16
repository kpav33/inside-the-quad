# Section 05c — What if: Design

Design agreed in conversation on 2026-11-16. The implementation plan will be `05c-what-if.md`.
Branch: `feat/what-if`. Builds on 05b (the flight model, sticks, motor readouts and moves sheet).
It is the last section of Module 3.

## Intent

The lessons say what each part does; the paths and the moves sheet show how they work together.
A beginner also needs to know what goes wrong, before it happens to their own drone: the link
drops, a prop goes on backwards, the wrong battery gets plugged in, a VTX is powered without its
antenna. Seeing each one happen on the drawing, with live sticks, makes the cause and the fix
stick. Two of these (failsafe, a reversed prop) the lessons already describe; this sheet shows
them.

## Goals

1. One new sheet, **What if**, sheet 5 of "How it works together", at `/what-if` (step n at
   `/what-if/n`), listed in the chapter switcher and after How a quad moves in reading order.
2. Four guided steps, each a common mistake: **Link lost (failsafe)**, **Prop on backwards**,
   **Wrong battery**, **VTX without antenna**. Each step says what happens, why, and how to
   avoid it.
3. **Try it** plays the mistake on the drawing while the sticks stay live (user decision): the
   learner flies as on the moves sheet and sees the mistake change what the drone does.
4. **Reset** brings the drone back: level, at hover, in its place, with the mistake undone.

## Non-goals and anti-goals

- No flight around the field: the drone still turns in place; the only new movement is a fall to
  a ground line and a flip. No physics engine.
- No other faults (low battery sag, desync, cut wire, bent prop); no damage model beyond the VTX
  heat readout; no failsafe configuration or GPS Rescue walkthrough (GPS Rescue gets one line, as
  in the receiver lesson); no tuning.
- **Anti-goal:** a game. No explosions, smoke, sounds or scores: the drawing sheet stays calm; a
  crash is the drone resting on the ground line, upside down if it flipped.
- **Anti-goal:** teaching the wrong cause. Each mistake's behaviour must come from the right
  mechanism (a reversed prop flips the drone because that corner pushes the wrong way; failsafe
  stops the motors on purpose), and every claim agrees with the receiver, props, battery, motors,
  ESC and VTX lessons.

## Approaches

- **A "What if" sheet that acts the mistakes out (user decision)**, over a free sheet of text or
  folding each mistake into the paths and moves sheets (scattered, no one place for what can go
  wrong).
- **Live sticks (user decision)** over scripted clips: a dead link that ignores the sticks is
  what failsafe feels like.
- **Faults in the flight model (user decision)**, over canned animations per mistake: the
  behaviour comes out of the same tested model the sticks drive, so live sticks and the mistake
  never disagree (a reversed prop's corner fights the controller, which runs out of motor and the
  drone flips over by itself).

## The four steps

Content checked against the lessons (`receiver.ts`, `props.ts`, `battery.ts`, `motors.ts`,
`esc.ts`, `vtx.ts`). Wording is the builder's; the behaviour is fixed:

| Step                   | Try it does                                                                                                                                                                                                                                                                                                                                                                                  | Why / how to avoid (the text)                                                                                                                                                                                                                                                                                                                                                                            |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 Link lost (failsafe) | The link indicator goes to **Lost**; from then the sticks move but are ignored. For about a second the flight controller uses safe stick values instead (sticks centred, throttle down), then it disarms: the motors stop (0 %) and the drone falls to the ground line.                                                                                                                      | Losing the link is detected by the receiver and flight controller; stopping the motors is on purpose, so a drone without signal can't fly away. The link coming back doesn't restart it: it has to be re-armed. (With GPS set up, GPS Rescue can fly it home instead: one line.) Avoid: range-check, mount the receiver antenna well away from carbon and wires, fly within range.                       |
| 2 Prop on backwards    | Motor 2 (front right) gets a prop made for the other direction (the classic props in / props out mix-up). The motor still spins its usual way, but the blades are angled for the other way, so that corner pushes air up instead of down. That corner drops; the controller speeds that motor up, which only pushes harder the wrong way; the drone tips over towards that corner and falls. | A prop made for the other direction pushes air the wrong way (props lesson). The flight controller can't correct it: more speed only pushes harder the wrong way. On a real drone it usually flips or tumbles at takeoff (Betaflight's runaway protection may disarm it first). Avoid: check every prop's direction and position after changing one; props in on this drone.                             |
| 3 Wrong battery        | A **6S / 4S** switch (this drone is built for 6S). On 4S the motors' top speed is roughly two-thirds (motor speed scales with voltage: 4 vs 6 cells), so there is less to steer with: the drone gets up to speed more slowly and full stick may not reach the full rate. The readouts on this sheet show speed as a share of the 6S top speed, so on 4S they top out near 67 %.              | The motors' KV is chosen for the battery (motors lesson). 4S on a 6S build flies, just weakly. The reverse mistake is the risky one: 6S on a drone built for 4S makes the motors spin faster and draw much more current than they are made for, and can exceed what the ESC and flight controller are rated for, so parts can overheat or burn (text only; this drone stays 6S).                         |
| 4 VTX without antenna  | Nothing moves. The VTX is marked on the drawing and a heat gauge on it climbs (Warm, Hot, then **Damaged**), with no °C: real temperatures and times vary from VTX to VTX. Reset starts over with a good VTX.                                                                                                                                                                                | A VTX sends its power out through the antenna; with no antenna the power is reflected back into the VTX's own amplifier, which heats and stresses it and can damage it, sometimes within seconds (VTX lesson: never power a VTX without its antenna). Some VTXs protect themselves; don't rely on it. Cooling down doesn't undo damage. Avoid: fit the antenna before plugging in a battery, every time. |

Numbers in the text (cell counts, voltages, power levels) come from the reference spec and
`lipo.ts`, never typed in. The props lesson's line "on the wrong motor, or mounted upside down,
pushes air the wrong way" is tightened in this section to match (a prop for the other direction
pushes the wrong way; one mounted upside down makes little thrust), since it now has a sheet
acting it out (builder check; my call).

## Decisions

1. **Address and place:** `/what-if`, `/what-if/n` (same step parsing and clamping as paths and
   moves). Sheet 5 of 5 of "How it works together"; Next from How a quad moves leads here; Next
   from here: the overview (end of the set). The chapter switcher lists it ("What if"). The
   overview's chapter count becomes "of 5".
2. **The sheet:** the moves sheet's layout and parts: title block (chapter, "5 of 5", and plain
   facts such as Battery "6S", Props "In"; builder's wording), chapter switcher, lead, step
   controls (Previous step, Next step, **Try it**, **Reset**), four numbered steps (name button,
   text in three short parts: what happens, why, how to avoid; quiet lesson links), live region,
   footer. No Show me, Gust or Level here (Reset covers levelling).
3. **Try it** turns the current step's mistake on; there is no Undo (my call, after the builder
   check: a crash, a disarmed drone and a damaged VTX don't undo themselves, and one way back is
   simpler to understand). **Reset** is the way back: drone level, at hover, in its place, link
   back, good prop, good VTX. Only one mistake is on at a time; it belongs to its step: opening
   another step or leaving the sheet resets. Steps open quietly: no demo plays by itself here.
4. **The battery step** shows a 6S / 4S switch (a two-option toggle) in place of Try it; Reset
   puts it back to 6S.
5. **Faults in the model** (pure TypeScript in `features/flight`, unit-tested):
   - `linkLost`: sticks ignored; for about one second safe values (sticks centred, throttle down),
     then disarmed: motors forced to 0 and the drone falls.
   - `wrongProp` (motor 2): that corner's thrust acts the wrong way, so its push on roll and pitch
     is reversed in the body's response while the motor still spins its usual way (spin arrow
     unchanged; the motor marked in redline); the controller drives that motor up, the drone tips
     over, and once tilted past 90° it falls.
   - `cells` (6 or 4): the motors' available top speed and the body's turning authority scale by
     cells / 6; the controller asks the same rates but can push less, so it gets there more
     slowly and may not reach full rate. Readouts show speed as a share of the 6S top speed.
   - `vtxNoAntenna`: a heat level rising from Warm through Hot to Damaged in about 12 s on
     this sheet (illustrative; executor's call after building); nothing else changes.
6. **Falling:** a simple drop (gravity, capped speed) from the drone's place to a ground line drawn
   across the field below it, where it rests (keeping its attitude: upside down after a flip).
   While on the ground the drone doesn't turn; Reset lifts it back. The camera fit covers the
   drone and the ground line.
7. **Indicators on the drawing:** a small status line in the drawing field (drawing-sheet caps):
   **Link OK / Link lost**, **6S / 4S**; the VTX heat gauge as a balloon on the VTX (Warm, Hot,
   Damaged; no °C). Motor
   readouts and spin arrows as on the moves sheet. Redline marks the current mistake's part (the
   reversed prop's motor, the VTX, the link status when lost), as the current selection.
8. **Sticks** are live on every step, exactly as on the moves sheet (same component and phone
   layout, drawing pinned on phones). With the link lost they still move (so the learner sees
   them being ignored).
9. **Reduced motion:** falls and flips still play (the learner asked for them with Try it); the
   VTX heat still climbs. Nothing starts by itself.
10. **Reading progress:** markable as read; overview and footer follow the new sheet.
11. **Text** in `src/content/` (`what-if.ts`, interface words in `ui.ts`).
12. **3D view fails:** the steps still read; sticks, Try it and Reset are hidden or inert, with the
    viewer's usual fallback line.

## Constraints

- Layering as today: content in `content/`, the model in `features/flight` (no three.js, no
  content), the 3D parts in `drone-model` / `drone-viewer` (types only from `flight`, never
  `content/`), the sheet in `features/part-explorer`.
- Tokens only, no new colours; redline only for selection, the current sheet and step, the
  current mistake's part, and focus. Damaged/hot is said in words, not a new colour.
- 02d rules hold: no sideways scroll at 320 px with 200 % text; every step readable below the
  pinned drawing; focus visible; reduced motion honoured live.
- The canvas draws on demand; the VTX heat and a fall keep it drawing only while they change.
- The 05b sheet keeps working unchanged (faults are off there).
- PRODUCT.md, DESIGN.md, the surface brief, the architecture overview, scope (05c done, Module 3
  complete) and the roadmap (mark 05b done, 05c in progress) are updated.

## Left to the builder

Step wording (checked against the lessons), the model's fault constants (hold time, fall speed,
heat curve, how far past 90° counts as tipped over), ground line placement, the status line's
place, the 6S / 4S toggle's look, and the test split.

## Tests

- Unit: with `linkLost`, sticks have no effect, motors reach 0 after the hold and the drone falls
  to the ground and stays, and the link returning would not restart it; with `wrongProp`, the drone
  tips past 90° within a few seconds from hover with sticks centred, motor 2 speeding up; on 4S,
  top motor speed is about 4/6 of 6S's and a full-stick roll takes longer to reach its rate; the
  VTX heat level rises through Hot to Damaged and Reset clears it; Reset clears every fault; faults off leave the 05b behaviour unchanged (existing model
  tests still pass); routes parse `/what-if` and `/what-if/n`; reading order moves → what-if;
  chapter counts 5.
- Component: four steps; Try it / Reset; opening another step turns the fault off; the
  battery toggle; the switcher lists five sheets.
- e2e: switcher and Next from How a quad moves reach the sheet; Link lost: sticks ignored, motors
  at 0 and the drone on the ground, Reset restores; Prop on backwards flips the drone; 4S caps the
  readouts; VTX heat reaches Damaged; 320 px with 200 % text readable; no console errors.
