# Review: section 02d — Phones and keyboard

- Branch: feat/phones-and-keyboard · Reviewed commit: 46e1684 · Base: de16f3e · Date: 2026-11-14

## Summary

The four changes are implemented: live reduced motion, focus on newly opened sheets, an intro
link in the masthead, and narrow-sheet reflow. The local fast checks, browser suite and production
build pass; the browser checks found one minor focus inconsistency and one test coverage gap.
Docker is unavailable in this environment, so its required build and production-server checks
remain unverified.

## Checks

| Command        | Result                                                                                                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pnpm check     | pass: typecheck, lint, format; 35 test files, 337 tests                                                                                                                                     |
| pnpm test:e2e  | pass: 92 passed, 4 nginx-only tests skipped                                                                                                                                                 |
| pnpm build     | pass: entry 279.19 kB / 88.95 kB gzip; viewer remains a separate lazy chunk                                                                                                                 |
| docker build . | executor ran it after the review: pass; e2e against the image 96 passed. Reviewer could not run it: Docker's WSL shim reports that Docker is unavailable in this distro; no image was built |

The Docker command included `-t itq-review`. No container was started. Node/pnpm commands used
the requested nvm prefix and Node 22. Temporary scripts, logs, browser response substitutions and
screenshots are in `/tmp/codex-review-02d`; no implementation or test files were edited.

Both review dev servers are stopped, and ports 4173 and 4174 have no remaining listeners. The
first dev server was stopped through its owning execution session because subsequent sandbox
commands could not see its listening PID. The final verification server was stopped by its
listening PID (629 on port 4174), identified within the shell that started it.

The unit run prints jsdom's existing “Not implemented: navigation to another Document” messages
twice. They do not fail the modified-click tests. CI and nginx behaviour were not verified here.

## Review Focus results

1. **Reduced motion off again:** verified in the running app. After switching reduction on,
   selecting ESC draws one frame; selecting VTX, which also turns the camera, draws two. After
   switching reduction off, the next ESC lift draws 18 frames and Camera draws 17. Switching it
   back on makes Receiver settle in four frames. These counts wrap actual WebGL draw calls and
   measure distinct animation frames, not the test script's own animation-frame loop. The hook's
   component test also covers false → true → false. The shipped e2e covers only the lift, however
   (finding 2).
2. **Focus on closing:** Close and Escape still return to the current part's row, or the overview
   start link for the intro, after focus has moved into the sheet. Verified after list, connection,
   masthead, start-link and 3D navigation. Clearing a lesson by clicking empty 3D space takes a
   different path and drops focus (finding 1).
3. **First-screen masthead link:** verified at 320 × 640 on the overview, without scrolling.
   Its entire 44px target is at y=65.3–109.3px. With 200% text its 88px target remains inside the
   first screen, at y=287.9–375.9px. Keyboard activation opens and focuses the intro heading and
   sets `aria-current="page"`.
4. **Deep links move no focus:** verified for `/intro`, `/parts/vtx` and their trailing-slash
   variants. Focus stays on `document.body`; phone deep links reveal the sheet. Canonicalising
   the trailing slash does not introduce a focus move.
5. **Desktop at 200% text:** verified at 1280 × 800, including the overview, intro, Flight
   controller and Propellers. The intended rem breakpoint gives a stacked layout, the viewer is
   1118 × 382px, and the parts list follows below it without overlapping it. No horizontal page
   overflow. The existing desktop large-text geometry tests pass.

## Navigation and accessibility

Browser checks, in addition to the component and e2e suites:

| Action                                          | Verified focus result                    |
| ----------------------------------------------- | ---------------------------------------- |
| Enter on Frame in the list                      | Frame heading                            |
| Mouse click on Motors in the list               | Motors heading                           |
| Mouse click on Battery in 3D                    | Battery heading                          |
| Connection from Motors to Propellers            | Propellers heading                       |
| Intro start link or masthead link               | Intro heading                            |
| Intro's Next                                    | Frame heading                            |
| Close lesson / Escape after a connection        | Current part's row                       |
| Close intro / Escape on intro                   | Overview start link                      |
| Back from Frame through intro to overview       | Intro heading, then overview start link  |
| Forward to intro                                | Intro heading                            |
| Deep-link load                                  | No focus movement                        |
| Click empty 3D space to close Battery or Motors | Body; next Tab reaches Frame (finding 1) |

The masthead is a `nav` named “Sections”. Its real `/intro` link has the intended accessible name;
the decorative arrow is hidden from assistive technology. The current-page attribute and redline
underline appear on the intro and disappear on leaving it. Keyboard focus has the redline ring;
ordinary mouse list/link navigation does not introduce a heading outline in the tested sequence.
Close names remain “Close lesson” and “Close intro”.

At 320px and 200% text the size table is 426px wide inside its 256px scrolling frame. Chromium
includes that frame in keyboard navigation even though its DOM `tabIndex` reads -1: Tab from
Goggles reaches it, and ArrowRight moves its scroll position to 40px. The third column is
therefore reachable without a mouse in the tested browser.

## Design, plan and architecture

Inspected rendered overview, intro, Flight controller and Propellers at 320, 390, 768 and 1280px,
plus 200% text at both phone widths and at 1280px. Screenshots include full pages and readable
viewport details. Normal-size phones retain the balloon gutter and two-cell footer; enlarged
phone sheets put balloons above headings and stack the footer. The smaller enlarged-text sheet
heading keeps “Controller” intact. No new clipping or harmful normal-size layout change was
observed. The drawing-sheet palette, fonts, hairlines, square controls and redline usage remain
consistent with `DESIGN.md`.

All four implementation tasks have corresponding changes and tests. The size-table wrapper is
planned, although the Task 3 file list omits its component. The 16rem threshold and smaller sheet
heading are the recorded design adjustments, rather than unexplained scope additions. Docs cover
the hook, masthead, focus and narrow-sheet rules, and the roadmap marks 02d in review. Plan
checkboxes remain unchecked; the ledger records task completion. Docker/CI acceptance is still
outstanding from this review's perspective.

Import inspection found no inward-dependency violations. `shared/` imports neither content nor
features; content imports no features. Cross-feature production imports go through each feature's
public entry point. The existing internal viewer imports in tests are the documented mocking
exception. The motion hook has no content, feature or three.js dependency, and the viewer remains
lazy. Added interface strings live in `src/content/ui.ts`; added CSS colours use tokens. No
teaching facts or procedural-model architecture were changed.

All eight commits use Conventional Commits, with headers within 72 characters and bodies within 100. The design, plan, formatter exclusion, motion, focus, masthead, reflow and documentation are
separate coherent changes. The masthead commit also updates selectors made ambiguous by its new
link, which belongs with that change. No history-hygiene finding.

## Tests test behaviour

`e2e/reflow.spec.ts` visits all 13 pages in each of four combinations: 320/390px with 200% text
or separately longer text. It checks both page overflow and element overflow within the sheet.
Its caught polling timeout does not discard a failure: the subsequent measurement is collected
and the final assertion rejects any remaining overflow.

As a negative control, substituted main's stylesheet in the browser without editing repository
files. The same measurement at 320px/200% reports Flight controller at +114px and Propellers at
+105px, with overflowing sheet elements. The branch gives zero page overflow and no reported
sheet elements for both. This confirms that the check detects the regression it is meant to pin.

The table frame and its contents are excluded because internal scrolling is permitted; its
ancestors and page width are still checked. The 1px exclusion avoids the deliberately hidden
stacked-table header. Actual table scrolling was checked separately above. Longer-text mutation
targets the explorer, not the masthead; a separate manual stretch of the masthead link also fits
320px without page overflow.

The reduced-motion frame counter observes actual rendering and is a useful replacement for two
screenshots that may both arrive after an animation finishes. Its selected part does not exercise
the camera, however. A browser-only negative control forcing `TurnToPart` to ignore reduced motion
still draws just one frame for ESC, satisfying the shipped test, while Camera then animates for
19 frames. See finding 2. No source files were changed for either negative control.

## Rulings in progress.md

- **Ignore local critique snapshots in Prettier:** sound. The exclusion is narrowly scoped to
  the local archive and is isolated in its own housekeeping commit.
- **Count WebGL-drawn frames instead of comparing screenshots:** sound for detecting easing;
  the independent measurements distinguish instant changes from animation. It needs a camera
  case and a positive-render assertion (finding 2); the ruling's “cost if wrong: none” understates
  that coverage gap.
- **Negative block margins for the masthead target:** acceptable. The 44px normal-size and 88px
  enlarged targets fit in the header at the checked widths without covering interactive content.
- **Optional `PartLink.current` prop:** sound. It exposes generic link semantics in shared code
  without importing app or content knowledge.
- **Right-align the link on its own narrow-screen line:** acceptable. It is visible in the first
  phone viewport and preserves the section-link alignment on wider layouts.
- **16rem for balloons/footer/heading and 20rem for title-block wrapping:** sound in the tested
  layouts. The rem thresholds respond to enlarged text and leave normal phone structure intact.
- **Smaller heading under 16rem:** acceptable recorded addition. The inspected enlarged phone
  headings remain prominent and readable, and “Controller” fits without a mid-word break.
- **Skip elements with clientWidth ≤ 1:** acceptable for these deliberate hidden headers. The
  page and sheet-ancestor checks remain effective, as the negative control demonstrates. It is
  not a general guarantee against arbitrary future clipped content.

## Findings

| #   | Severity | Area                                            | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Resolution                                                                                                      |
| --- | -------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 1   | nit      | src/features/part-explorer/PartExplorer.tsx:136 | **Closing through the empty 3D background leaves no useful focus target.** Open Motors with the keyboard or Battery with a 3D click, then click empty canvas space. The URL becomes `/`, focus is `document.body`, and the next Tab reaches Frame rather than continuing from the closed part. `clearSelection` bypasses the focus target used by Close/Escape. This is an existing mouse-only edge, also reproduced with main's focus rule, rather than a new regression; it remains inconsistent with the design's general closing-focus statement. Route this close through the existing close handler and cover background dismissal if that statement is intended to include every way of closing. | Deferred: mouse-only and pre-existing; closing by background click leaves focus on the page.                    |
| 2   | nit      | e2e/explorer.spec.ts:247                        | **The live-motion e2e does not exercise the camera or animation resuming.** ESC has no target camera view, so the test passes even when `TurnToPart` ignores reduced motion: verified by a browser-only substitution, with ESC at one frame but Camera at 19. Only the hook test covers switching reduction off; the real lift and turn do resume in manual checks. Add a part that turns the camera, toggle reduction off for a subsequent change, and require a positive render/change as well as the existing upper bound, which currently accepts zero draws.                                                                                                                                       | Deferred: the hook unit test covers switching both ways; the reviewer verified the camera and resuming by hand. |

## Strengths

- The focus change is small and preserves the explicit Close/Escape and History API rules.
- The shared external-store hook follows the real media query in both directions; it does not
  add content knowledge to shared code or pull three.js into the entry bundle.
- The reflow changes repair measurable overflow while retaining the existing drawing-sheet
  structure. Internal table scrolling is contained and keyboard-operable in Chromium.
- The new masthead link is discoverable before the phone drawing and parts list, with a real
  address and a current-page state that does not misuse redline for an ordinary link.

## Declined to judge

- **Returning a masthead-opened intro to the overview start link instead of the masthead:** the
  design explicitly chooses the start link as the intro's closing target. The verified result
  follows that rule.
- **Activating the already-current masthead link without refocusing the heading:** no sheet is
  being opened and no history entry is added. The focus-on-open rule does not require treating
  a same-page link as a fresh navigation.
- **Desktop changing to the stacked layout at 200% text:** the existing rem breakpoint explicitly
  permits this. The requested viewer/list geometry holds; retaining two columns is not the rule.
- **Lesson reveal continuing to read matchMedia at invocation instead of using the hook:** the
  implementation plan explicitly leaves that code in place. Each new reveal reads the current
  setting, so it does not have the old read-once problem.
- **The table's missing explicit tabindex or region label as an assumed keyboard failure:** the
  labelled table remains semantic, and its scrolling frame is keyboard-reachable and scrolls in
  the tested Chromium. Other browser/assistive-technology combinations were not verified, so no
  cross-browser accessibility conclusion is claimed.
- **A heading focus ring after a 3D click following keyboard use:** Chromium can retain keyboard
  focus-visible behaviour when the pointer target is the non-focusable canvas. This does not
  break navigation or hide focus, and forcing the ring off would need a stronger reason.
- **Production nginx behaviour and Docker/CI readiness:** Docker is unavailable locally and no
  CI run was inspected. Passing Vite-preview tests does not establish those results.

## Verdict

No blocking or should-fix defect was verified. The two findings are nits: one existing mouse-only
focus edge and one regression-test gap; all five Review Focus behaviours hold for their intended
paths. The code review is otherwise favourable, but merge readiness remains conditional on the
required Docker build and green production-image CI checks, which this environment could not
verify.
