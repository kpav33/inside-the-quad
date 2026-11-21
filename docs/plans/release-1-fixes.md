# Release 1 fixes: Implementation Plan

**Goal:** fix what the whole-app review found before the first release
(`docs/reviews/release-1.md`): its five Important and five of its six Minor findings, and four cheap
deferred ones. Its Minor M3 (link previews, `robots.txt`) belongs to the release branch.

**Branch:** `fix/release-review`. Each fix gets a test that fails first; one commit per fix.

## Global constraints

- Node 22: prefix node/pnpm commands with `source ~/.nvm/nvm.sh && nvm use >/dev/null &&`.
- Copy stays in the lessons' voice, explains terms the first time they appear in reading order,
  names no brands as recommendations and no prices. It teaches no Betaflight setup.
- Colours only from the tokens; redline only for selection, the current sheet and focus.
- No new runtime dependencies.

## Tasks

1. **I1, focus under the pinned step controls.** When the step controls would take more than a
   quarter of the viewport height (large text on a phone), they stop being pinned. The new
   `usePinnedWhileShort` hook sets `data-unpinned` on the controls, and the CSS drops `sticky`.
   Applies to the path, moves and what-if sheets. Test: e2e at 320 × 667 with 200 % text: Tab
   to every stop's lesson link on the three paths; the element at the link's centre is the link.
2. **I3, offscreen animation.** The path leader's dashes animate only while the canvas is on
   screen and the page is visible. `useCanvasOnScreen` uses IntersectionObserver and
   `visibilitychange`, and showing the canvas again asks for one frame. Test: a unit test of the
   hook; an e2e at 390 px counts WebGL draw calls on `/paths/control` with the canvas scrolled
   off: zero in a second.
3. **I2, third-party notices.** A small Vite plugin (in `scripts/`, no dependency) writes
   `third-party-licenses.txt` into the build. It lists every npm package bundled into the app,
   with its copyright and licence text, plus the fonts' OFL text. Test: a unit test of the
   collector; a build check that the file names react, three and the two font families with
   their licence texts.
4. **I4, terms in reading order.** First-use glosses:
   - the intro: ExpressLRS as the radio control system, analog vs digital video in one clause;
   - the FC: roll, pitch, yaw;
   - the battery: throttle;
   - Moves: acro and armed.

   Test: a reading-order test that walks the sheets in order and checks each listed term is
   glossed on or before its first sheet.

5. **I5, GPS Rescue.** The receiver and extras copy say GPS Rescue must be set up and tested, with
   a home position fix before take-off. Test: a content test.
6. **M1 and M2, copy.**
   - The battery copy says the drone is designed for 6S: a lower voltage flies weakly, a higher
     one can damage parts.
   - The intro's "keeps the angle" applies to acro mode, which most FPV pilots fly.

   Test: a content test for each.

7. **M4, nginx.** `Cache-Control: immutable` applies only to successful asset responses (drop
   `always`). Test: `e2e/server.spec.ts` checks that a missing asset has no immutable header.
8. **M5, hidden progress.** Stored read marks are filtered through the sheets that exist, so a
   held-back sheet's mark doesn't count. Test: in `checker-off.test.tsx`, with only `"check"`
   stored, the overview offers the intro.
9. **M6, stick pad marks.** The pad's edge and centre lines use the muted token. Test: an e2e
   contrast check of at least 3:1 at rest.
10. **Deferred, cheap.**
    - 06 #4: the 3D viewer loads only when a sheet draws the drone (e2e: no viewer chunk is
      requested on a gear sheet).
    - 02c #5: "Start again from sheet 1" becomes "Read again from sheet 1".
    - 03b #6: the VTX says that the permitted channels vary by country too.
    - 03c #3: photo `srcset` widths come from the real image widths.
11. **Docs and review.** A Resolutions section in the review, and DESIGN.md where the step
    controls change. Then a Codex check of the fixes.
