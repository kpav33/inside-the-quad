# Review: section 04 — "What is an FPV drone?" intro

- Branch: feat/intro · Reviewed commit: c597a69 · Date: 2026-11-13

## Summary

The section delivers what the design and plan promised. It adds an `/intro` route, a sheet order
that puts the intro before sheet 1, intro copy and size data, a separate intro read flag, two flat
SVG drawings with text equivalents, an intro sheet that shares the lesson footer, and a newcomer
start block. All gates are green, including e2e against the Docker image. All five Review Focus
items hold in the browser. Layering holds. Nothing is blocking. Two should-fixes: tapping or
clicking a device inside the system drawing only works on its 1 px lines and its label, and the
drawing labels scale with the drawing, down to 7 px at 320 px and up to 29 px at 768 px. The rest
are nits. Ready to merge once findings 1 and 2 are fixed or given a written reason.

## Checks

| Command                                       | Result                                                      |
| --------------------------------------------- | ----------------------------------------------------------- |
| pnpm check                                    | pass (typecheck, lint, format; 34 files, 330 unit tests)    |
| pnpm test:e2e                                 | pass (82 passed, 4 nginx-only tests skipped)                |
| pnpm build                                    | pass (entry 278.8 kB / 88.9 kB gzip; viewer chunk separate) |
| docker build .                                | pass                                                        |
| e2e against the Docker image (`E2E_BASE_URL`) | pass (86 passed)                                            |

`pnpm test` still prints jsdom's "Not implemented: navigation to another Document" twice (the
modified-click tests from 02c). It is harmless.

I also checked things by hand with Playwright scripts (kept outside the repo) against the Docker
image on port 8094: focus after every kind of navigation, the stack and redline on leaving for the
intro, Escape, repeated device presses with mouse, keyboard and touch, hit-testing in the drawing,
blocked storage, the phone deep link, the accessibility tree, and screenshots of the intro and the
overview at 320, 768 and 1280 px. `curl` gives 200 for `/intro` and `/intro/`. I stopped the
container and removed the image afterwards.

## Review Focus results

1. **Leaving an open stack for the intro:** verified. From `/intro` I opened ESC in the parts
   list (942 redline pixels, stack open), then pressed Back. That gives `/intro`, no pressed row,
   0 redline pixels and focus on the intro heading. From `/parts/esc`, Escape then the start link
   also gives 0 redline pixels and focus on the intro heading. The e2e test for this item does not
   reach the intro from an open stack, though (finding 4).
2. **Escape on the overview:** verified. With focus on the start link, Escape keeps the address
   `/`, adds no history entry and keeps focus. The unit test pins it with focus on a list row.
3. **Repeated device presses:** verified for the state. Keyboard: Enter on Drone, then Space on
   Radio leaves only Radio pressed and only Control lit. Space on Radio again clears both links.
   Touch on the buttons: tap Goggles lights Video, a second tap clears it. Mouse: the second click
   sets `aria-pressed="false"`, but the drawing stays lit until the pointer leaves the button,
   because the hover preview takes over (finding 5). Tapping inside a device in the drawing fails
   (finding 1).
4. **Intro read with blocked storage:** verified. I used an init script that makes the
   `window.localStorage` getter throw a `SecurityError`. Mark as read presses, Close gives "Start
   with sheet 1: Frame" focused, and Clear progress gives the newcomer block with focus on the
   intro link. After a reload it is back to the newcomer block. There were no page or console
   errors. The unit test mocks `getItem`/`setItem`/`removeItem` to throw.
5. **Back/Forward across the intro boundary:** verified, also by e2e.

   | Action                                               | Focus lands on                      |
   | ---------------------------------------------------- | ----------------------------------- |
   | Overview → intro (start link)                        | the intro h2                        |
   | Intro → Frame (Next)                                 | the Frame h2                        |
   | Back, Back                                           | the intro h2, then the start link   |
   | Forward, Forward                                     | the intro h2, then the Frame h2     |
   | Frame's Previous                                     | the intro h2                        |
   | "Start with sheet 1: Frame" (newcomer block)         | the Frame h2                        |
   | Quiet "What is an FPV drone?" link                   | the intro h2                        |
   | Close intro / Escape (also from a device button)     | the start link                      |
   | Clear progress (intro read only, or parts and intro) | the start link (now the intro link) |

**Keyboard:** verified. On the intro, Tab goes Close intro → Radio → Drone → Goggles → Mark as read
→ Next. Every new control is a real `<button>` or `<a href>`. Nothing in the SVGs takes focus.

**Phone deep link:** `/intro` at 390 × 800 scrolls the intro sheet to the top of the screen
(panel top 2 px) without moving focus, as 02c does for lessons.

## Rulings in progress.md

- **Task 1, widening the explorer's link callbacks to `Page` early:** sound. Task 5 replaced the
  fallback.
- **Task 2, FPV checked by the intro's own test, not the shared `JARGON`:** sound for this section.
  The cost the executor names is real: a learner who jumps straight to a lesson meets "FPV"
  undefined. That predates 04 (see Declined to judge).
- **Task 2, `role` instead of `sends`:** sound. The goggles send nothing.
- **Task 2, `formatRangeMm` in `size-classes.ts` and a `reference` label:** sound. A formatter in
  `shared/domain` is a small presentation leak, but it has no React or content imports.
- **Task 3, `INTRO_READ_KEY` in `useIntroRead.ts`:** sound.
- **Task 4, hover preview in React state, mouse only:** sound. The touch case is tested and holds
  in the browser. It causes finding 5's lingering preview on a second mouse click.
- **Task 4, the visual look moved to Task 5:** sound.
- **Task 4, SVG label sizes in drawing units:** not sound as it stands. The labels shrink to 7 px
  and grow to 29 px with the column (finding 2).
- **Task 5, one commit instead of refactor + feat:** acceptable. The commit is large but coherent.
- **Task 5, "Close intro":** sound. It matches "Close lesson".
- **Task 5, no quiet intro link in the newcomer block:** sound. The start link is that link.
- **Task 5, Clear progress returns focus to the intro start link:** sound. It is the same
  `OVERVIEW_FOCUS_ID`, and it is checked above.
- **Task 5, the size table's own styles, short drawing labels, details hidden on narrow
  sheets:** sound. The table never stacks, and the list repeats the hidden details.
- **Task 6, dropped right padding in the size table, in the e2e commit:** the fix is sound. Its
  commit body doesn't mention it (finding 9).
- **Task 6, pattern-matched Next/Previous names in e2e:** sound. It is the deferred 02c nit 8.

## Findings

| #   | Severity   | Area                                                                  | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Resolution |
| --- | ---------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 1   | should-fix | src/styles/global.css:1041; src/features/intro/SystemScene.tsx:46-100 | **A tap or click inside a device in the drawing does nothing.** The drawing has `fill: none`, so only the 1 px strokes and the labels are hit-testable. `elementFromPoint` at the centre of the radio and the goggles returns the `<svg>`, and a mouse click (1280 px) or a tap (390 px, touch) at the radio body's centre leaves Radio unpressed. Only the label works. The design promises "tapping or clicking a device in the drawing does the same as its button", and the pointer cursor and mouse preview have the same gaps. The unit test uses `fireEvent.click` on the group, so it can't catch this. Giving `.scene-device` `pointer-events: bounding-box` (or a transparent fill) would fix it. An e2e tap at a device's centre would pin it. |            |
| 2   | should-fix | src/styles/global.css:1029, 1118-1126, 1175-1178                      | **Drawing labels scale with the drawing, far outside the type ramp.** Measured rendered font sizes: at 320 px, the size labels are 10.3 px, "REFERENCE" is 7.1 px and the scene labels are 10.4 px. At 768 px (stacked layout, the drawing about 680 px wide), the size labels are 28.6 px and the scene labels are 22.1 px, larger than the section headings. At 1280 px they are 18.9 and 14.6 px. A 7 px caps label is hard to read on a phone. Capping the drawings' width (for example `max-width: 36rem`, the sheet column's own limit) and raising the narrow-container label sizes so they stay near the 0.833rem label step would fix both ends.                                                                                                 |            |
| 3   | nit        | src/content/intro.ts:62, 68, 103                                      | **Two copy gaps.** "ExpressLRS" is written as a literal twice, where the plan said to read `receiver.system`. Beginners also meet it with no explanation ("control uses ExpressLRS on 2.4 GHz"), so a few words like "a radio control system" would help. And the sizes paragraph says drones are "named by the size of their propellers, in inches", then gives the whoop's props in mm. The scope names whoops by their frame (65–75 mm), which is how they are sold ("65 mm whoop"). One clause saying that whoops are named by their frame size in millimetres would close the gap.                                                                                                                                                                   |            |
| 4   | nit        | e2e/intro.spec.ts:48-58                                               | **The "leaving an open stack" e2e doesn't leave an open stack for the intro.** It walks ESC → Propellers → Motors → Frame → intro with Previous, so the stack closes at the first step and the redline check at the intro passes trivially. The behaviour is right (Review Focus 1, checked by hand with Back from ESC to the intro). Going `/intro` → ESC in the list → Back would pin what the plan meant.                                                                                                                                                                                                                                                                                                                                              |            |
| 5   | nit        | src/features/intro/SystemScene.tsx:31, 39-45                          | **A second mouse click on a device button doesn't visibly clear the drawing.** `active = hovered ?? selected`, so while the pointer is still on the button that was just unpressed, the preview keeps the device and its links lit. The highlight disappears only when the mouse leaves. The button state is right, but a mouse user who clicks again to clear sees no change in the drawing. Clearing `hovered` on click, or previewing only devices that aren't the one being toggled, would fix it.                                                                                                                                                                                                                                                    |            |
| 6   | nit        | src/features/intro/SystemScene.tsx:72, 82, 99                         | **Device labels are picked by array position** (`scene.devices[2]?.label` for the goggles). If the content order changes, the drawing mislabels a device and no test notices. Look the label up by id.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |            |
| 7   | nit        | .impeccable/design.json:394-399                                       | **The design sidecar's "Intro Drawing" sample doesn't match the build.** Its text uses muted fill, 11px and weight 700. The implementation uses ink fill (muted only on links and the reference note), 13/17 drawing units and weight 600.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |            |
| 8   | nit        | docs/architecture/overview.md:39                                      | **One unwrapped 123-character line** in an otherwise 100-column paragraph. Prettier doesn't rewrap Markdown here, so it slipped through.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |            |
| 9   | nit        | commit c8470ee                                                        | **A CSS fix rides in the e2e commit** (`test(e2e): …` also changes `src/styles/global.css` to drop the size table's last-column padding). Unlike 02c's finding 10, the body doesn't mention it; only the ruling does. This is about history hygiene only.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |            |

## Strengths

- **Routing stays small and correct.** `Page` and `pagePath` replace the part-or-null special
  cases. `/intro/` is canonicalised by the existing replace effect, and `/intro/x` falls to the
  unknown notice. `sheets.ts` is plain data with tests. `partNeighbours` was removed with its
  tests, as planned.
- **Layering holds.** `shared/routing` and `shared/domain` import nothing from `content/` or
  `features/`. `features/intro` imports only `@/content/intro` and `@/shared/domain`, never
  `part-explorer`. `part-explorer` uses `@/features/intro` and `@/features/progress` through their
  `index.ts`.
- **Design rules hold.** The new CSS has no hex literals, shadows or rounded corners. Highlight is
  2.5 px ink, and I saw no redline in a screenshot of a lit drone. Sentences are Atkinson, and
  labels, table values and link details are Barlow caps. "5‑inch", "3‑inch" and "7‑inch" use
  U+2011. The size table keeps values on one line.
- **Accessibility is careful.** Both SVGs are `aria-hidden` with nothing focusable. The device list
  is a labelled list of `aria-pressed` buttons, each followed by its role and link. The size table
  has a label, column headers and row headers. The announcer says "What is an FPV drone? opened".
  Focus never reached `<body>` after any navigation I tried.
- **Content is accurate and in scope.** FPV versus camera drones, three devices and two links (with
  numbers from `REFERENCE_5_INCH`), sizes from `SIZE_CLASSES` with a test that the 5″ entry agrees
  with the reference, and why 5-inch. DJI is named only "such as", and nothing is recommended.
  The size ranges are reasonable typical values.
- **Tests test behaviour.** Start states cover intro read × parts read. The hook is tested with
  throwing storage and storage events. The scene tests use the keyboard and simulated touch. The
  explorer tests check focus, title, announcer, URL and storage. The e2e suite covers direct and
  reloaded `/intro`, the newcomer path, Back with focus, fit at 320 px with longer text, and no page
  scroll at 900, 1000 and 1100 × 700.
- **Docs are current:** roadmap (04 in review), PRODUCT.md, DESIGN.md (overview start, intro sheet,
  intro drawings), the sidecar, the surface brief and the architecture overview.
- **Commits:** Conventional Commits with headers of 72 characters or fewer and body lines of 100 or
  fewer. Each is one logical change, apart from finding 9 and the ruled single Task 5 commit.

## Declined to judge

- Values and units split by an ordinary space in intro paragraphs ("31–40 mm"): the lessons do the
  same, and the Unbroken Value rule names only title-block values and "5-inch".
- "FPV" undefined in lessons for a learner who skips the intro: this predates 04, and the ruling
  records it.
- Device buttons don't preview on keyboard focus: the design's "keyboard focus" reads as keyboard
  operation, and pressing works. A focus preview would be an enhancement.
- The drawing's device hit areas at 320 px (about 50 × 35 px around the label): the device
  buttons are the designed touch path and are full-size targets. Finding 1 covers the hit-testing
  defect itself.
- Tab from the intro's Next link leaves the page and wraps to the first part row: this is normal
  document order, and it is the same on lessons.
- The newcomer block's inline "Start with sheet 1: Frame" link being smaller than 2.75rem: it is
  a link in a sentence, which WCAG 2.5.8 exempts.
- Whether the acro-mode simplification ("keeps the angle you left it at") should mention
  self-levelling modes: flight modes are out of scope (no flight training), and the sentence is
  correct for how FPV drones are usually flown.
- Exact typical wheelbase ranges for 3″ and 7″ frames: frames vary, and the values are within
  common ranges. The design fixed them.
- The plan's refactor + feat commit pair merged into one: the ruling explains it, and the history
  is not rewritten.
- Real screen readers (NVDA, VoiceOver) and Safari/Firefox: I checked only Chromium's
  accessibility tree and Testing Library names.
- Whether every intermediate commit passes `pnpm test:e2e`: git.md only requires `pnpm check` per
  commit.
