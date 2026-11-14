# Section 02d — Phones and keyboard: Design

Short design for a fix section, agreed after the 2026-11-13 impeccable critique (30/40) and audit
(16/20). The implementation plan is [02d-phones-and-keyboard.md](02d-phones-and-keyboard.md).
Branch: `feat/phones-and-keyboard`.

## Intent

The app should work as well on a phone and with a keyboard as on a laptop with a mouse, before
02b adds more to the same screens. Phones are a main use scene in `PRODUCT.md` (a laptop or phone
beside the parts).

## Goals (the four review findings)

1. A newcomer on a phone reaches the intro without scrolling past the drawing, the parts list and
   the title block (critique P1).
2. Enlarged (200%) or longer (+40 %) text never makes a 320–390 px page scroll sideways (audit
   P1, critique P2).
3. Keyboard focus follows the sheet that opens (critique and audit P2).
4. Turning reduced motion on mid-visit applies at once, without a reload (audit P2).

## Non-goals

Links from spec values to their meanings, deferring the 3D viewer on phones, and an undo for Clear
progress (recorded for later sections). No layout rework and no separate phone layout.

## Approaches

- **Where a phone newcomer finds the intro (user decision): a masthead link.** Chosen over a
  phone-only newcomer strip above the drawing (shows in one state on one screen size) and putting
  the overview sheet above the drawing on phones (the drone no longer opens the page). The masthead
  is also where section 05's tabs will go.
- **How to build it: targeted fixes** to the existing components and CSS, each with a test. A layout
  rework or a separate phone layout would be far larger than the findings need.

## Decisions

1. **Masthead link.** "WHAT IS AN FPV DRONE?" with a leader arrow at the right of the masthead; on
   narrow screens it takes its own line under the wordmark. A real link to `/intro`
   (`PartLink`). On the intro it has `aria-current="page"` and a redline underline (redline marks
   the current sheet). The overview's newcomer start block stays.
2. **Focus follows the opened sheet.** Whenever a sheet opens by the app's own navigation (a parts
   list row, a link in a sheet, the masthead link, the start link, a click on the 3D model), focus
   moves to its heading and the sheet is revealed if off screen. Closing returns focus to the
   part's row (or the start link for the intro); Escape is unchanged; Back/Forward keep the 02c
   rules; a deep link on load still reveals without moving focus. Browsers show no focus ring after
   a mouse click, so mouse users see no change.
3. **Text reflow on narrow sheets** (320–390 px, 200% text or +40 % text):
   - sheet headings and long words may break;
   - on very narrow sheets the numbered balloon sits above its heading instead of in a gutter;
   - the footer's previous/next cells stack;
   - the size table wraps its headings and, only if it still does not fit, scrolls inside its own
     frame, never the page;
   - title-block and spec values may wrap between items, keeping each number with its unit where
     there is room. `DESIGN.md` records this as the narrow-sheet exception to the Unbroken Value
     rule.
4. **Reduced motion, live.** One shared hook follows `prefers-reduced-motion` and its changes; the
   camera turn, the exploded-view lift and the lesson reveal use it.

## Also

Before planning, check the three layout tests the audit reported failing in its sandbox (they pass
locally and in CI) and record what was found.

## Tests

- e2e over all 13 pages (overview, intro, 11 parts): no horizontal page scroll at 320 and 390 px,
  with 200% text and with +40 % text.
- Keyboard: Enter on a part row focuses that lesson's heading; the masthead link opens the intro
  with its heading focused and marks itself current.
- Reduced motion: switching it on mid-visit makes the next view turn and lift instant (unit test of
  the hook and its users).
