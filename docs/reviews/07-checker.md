# Review: section 07 — Check a build

- Branch: `feat/checker` · Reviewed commit: `a285c30b8b52462cae056d0330755e594918633b` · Date: 2026-11-20
- Compared with `674d70ddac3a772c0b8690a9a0c9277235408fe9` (main); nine commits. Independent review of the supplied whole-branch diff, binding design, implementation plan and all 12 executor rulings. Reviewed in source, content and Chromium passes. No subagents or repository changes.

## Summary

**Request changes.** The implementation follows the planned architecture, integrates cleanly with navigation and progress, and passes all available automated checks. All five Review Focus scenarios passed independent browser probes.

Three Important findings remain: the voltage explanation generalises the reference drone’s wiring to arbitrary builds; the KV verdict applies prop-dependent guidance using frame size alone; and the KV input’s resting boundary has insufficient contrast. The first two expose problems in the binding design itself, which the implementation follows faithfully. No Critical or Minor finding was established.

## Checks

| Command / check                                                       | Result                                                                                                                                                                                                                                                                                |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm check`                                                          | Passed: typecheck, lint, formatting and 814 tests in 78 files. Non-failing jsdom navigation and three.js deprecation messages were present.                                                                                                                                           |
| `pnpm build`                                                          | Passed. Entry JavaScript: 364.33 kB; separate viewer chunk: 987.77 kB, before compression.                                                                                                                                                                                            |
| `pnpm test:e2e --workers=2 --output=/tmp/codex-review-07/e2e-results` | Passed: 164 tests, five Docker-only tests skipped; 3.5 minutes. All eight checker tests passed.                                                                                                                                                                                       |
| Docker build / image e2e                                              | Not rerun, as instructed. The executor’s reported 169 image-e2e passes are supplied evidence, not independently verified.                                                                                                                                                             |
| Independent Chromium probes                                           | Invalid KV, tampered addresses, canonicalisation, history replacement, Back/Forward, lesson links, complete Reset, keyboard navigation, drawing highlights, enlarged phone text, progress persistence and WebGL failure. Findings below qualify accessibility and content acceptance. |
| Impeccable detector                                                   | No diagnostics in `CheckPanel.tsx`. Nine advisories in existing CSS concerned unchanged radii and font sizes; these do not establish checker defects.                                                                                                                                 |
| Checkout integrity                                                    | Clean before and after review; branch and HEAD unchanged.                                                                                                                                                                                                                             |

Validation ran from a copy of the reviewed commit under `/tmp/codex-review-07/source`, with copied dependencies, keeping generated files outside the checkout. Every direct Node/pnpm command used the required prefix:

```sh
source ~/.nvm/nvm.sh && nvm use >/dev/null &&
```

Evidence is under `/tmp/codex-review-07`: `check.log`, `build.log`, `e2e-local.log`, `browser-results.json`, `edge-results.json`, `accessibility.txt`, `detector.json` and screenshots. The preview servers are stopped; ports 4173 and 4187 were verified closed.

## Review Focus

| Failure mode from the plan                   | Verified result                                                                                                                                                                                                                    |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Typed KV: empty, `abc`, `2400.5`, `99999` | Passed individually. Each remains visible as typed, produces **Check this** with “Enter the motors’ KV…”, removes `kv` from the address and raises no page error. Another field change preserves the missing-KV state.             |
| 2. Tampered addresses and trailing slash     | Passed. `/check?stack=31&cells=9&kv=abc&video=x` displays the reference stack, cells, KV and video values, with seven Fits. `/check/?kv=2400` becomes `/check?kv=2400`, retaining 2400 and its result.                             |
| 3. Back after several picks                  | Passed. Instrumented history recorded three `replaceState` calls and no additional pushes. History length stayed unchanged; one Back returned to Charger and focused its heading. Forward restored the changed build.              |
| 4. Long labels at 320 px / 200% text         | Passed for reflow. The root font measured 32 px, page overflow was zero, and “Digital with an analog receiver” wrapped visibly and remained selectable. All four masthead links had separate targets and correct centre hit tests. |
| 5. Complete Reset                            | Passed. Starting with every field changed and an invalid KV, Reset restored all 14 fields, cleared the query and returned seven Fits. Focus remained on Reset.                                                                     |

## Content, drawings and accessibility

The rules and all 27 reason keys were compared with the binding tables and the relevant lessons, gear sheets and paths.

- Stack and motor mounting compare the stated hole patterns; camera width distinguishes direct fit, a narrower camera needing brackets, and a camera wider than the mount.
- Prop clearance follows the selected largest-prop frame size, including the one-inch and two-inch differences.
- Voltage correctly checks both ends of both board-rating ranges. Its explanation overstates what those inputs establish: finding 1.
- The KV bands and 2400 threshold match the binding table. Applying them by frame size, irrespective of the selected prop and motor class, produces unsupported verdicts: finding 2.
- Analog reception includes digital goggles with an analog receiver; digital combinations remain **Check this** pending a system match. This agrees with the corrected goggles lesson and [manufacturer documentation of analog input paths](https://docs.hd-zero.com/goggles-operation).
- The new checker copy contains no commercial brands, prices, product recommendations or shop links.

Statuses have both words and distinct SVG marks; they do not depend on colour alone. The results region is `aria-live="polite"`. The accessibility tree exposes labelled controls, fieldset legends, radio groups, the KV hint and lesson links. Tab traverses the controls in reading order, radio arrow keys work, and focus indicators are visible. The remaining contrast defect concerns the unfocused KV field, not its focus indicator.

Chromium screenshots confirmed that hovering Camera width highlights the frame and camera, and focusing Voltage highlights the battery, ESC and FC, with the other parts faded. With WebGL unavailable, the viewer fallback appeared and the checker remained operable.

Existing nineteen-sheet progress was preserved, offered Check a build next, and became Build 1 of 1 after marking the sheet read and reloading.

## Architecture and tests

The separation is sound: domain functions return statuses and reason keys; content supplies teaching sentences; routing owns the query codec; the hook manages the sheet state. Query parsing uses fixed options and handles malformed input without throwing. No dependency or schema migration is introduced, and the changes fit the existing routing ADR.

Tests cover the core rules, reason coverage, query parsing, state, integration and user flows. The independent probes extend the narrower committed tests by exercising every specified invalid KV, every Reset field, actual history calls, keyboard traversal and rendered drawing highlights.

The content tests primarily verify expected strings and keywords. They cannot establish that a rule remains true across all combinations the pick lists permit. Likewise, reflow and focus tests do not establish resting input contrast.

All nine commit subjects follow Conventional Commits and have recognisable task boundaries. Historical checks were not rerun per commit.

## Findings

Important findings should be resolved before merging. Resolutions are summarised under Resolutions below.

| #   | Severity  | Area                                                                                                                                               | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Resolution |
| --- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 1   | Important | `src/content/checker.ts:144`; `docs/plans/07-checker-design.md:76`; `docs/product/scope.md:192`                                                    | **The voltage explanation turns reference wiring into a universal compatibility claim.** **Failure scenario:** a learner enters their own 3–6S FC/ESC and a 6S battery. Voltage says Fits and asserts that regulated FC power prevents the battery reaching the camera and VTX, although no input establishes their supply arrangement or voltage requirements. Some FC video connections pass through battery voltage; even a regulated output must match the connected device. The manufacturer’s [FC wiring manual](https://spcdn.speedybee.cn/cdn/48678186107539456.pdf) documents battery-powered VTX connections and explicitly requires an external regulator for a video unit that cannot accept 6S. **Why it matters:** a beginner can infer that camera/VTX power compatibility has been established when it has not, potentially damaging hardware. **Suggested fix:** scope the result explicitly to ESC/FC input ratings and qualify regulated camera/VTX power as the reference arrangement. State that their supply requirements still need checking. Correct the corresponding universal statements in the design and scope. This is a flaw in the agreed simplification, not an omitted implementation task. |            |
| 2   | Important | `src/shared/domain/build-check.ts:144`; `src/shared/domain/build-check.ts:147`; `src/content/checker.ts:157`; `docs/plans/07-checker-design.md:92` | **The KV rule ignores the selected prop size and assigns an unsupported 4S rating.** **Failure scenario:** `/check?frame-motor=9&motor=9&kv=2900&props=3` reports that 2900 KV motors are made for 4S and will overheat on 6S. Changing only the frame size to 3″ changes this to Check this. The manufacturer documents a [2900 KV motor for small props and 6S operation](https://www.t-hobby.com/products/micro-fpv-drones-brushless-motor); a larger frame alone does not establish the claimed motor rating. The same sentence also labels every entered KV through 5000 as made for 4S. **Why it matters:** the checker promotes usual reference-build guidance into a categorical hardware verdict despite permitting different props and motor mounts. **Suggested fix:** apply the lesson bands only within the combination they describe, and use Check this where the available inputs cannot establish compatibility. Remove the claim that every KV ≥2400 identifies a 4S motor. Revise the binding table and add cross-field cases for smaller props and high KV. This finding challenges the design’s frame-based rule as well as its implementation.                                                          |            |
| 3   | Important | `src/styles/global.css:2315`; `src/styles/global.css:2316`                                                                                         | **The KV input’s resting boundary has insufficient contrast.** **Failure scenario:** clear KV, then move focus elsewhere. Its only visible input boundary is `#3a3f44` against `#121416`, approximately **1.74:1**; the input fill matches the surrounding ground. Chromium computed styles confirmed these colours with neither hover nor focus active. **Why it matters:** people with low vision may not perceive the empty editable area. Author-styled text-input boundaries needed to identify the control must meet **3:1** under [WCAG 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html). **Suggested fix:** give the KV field a resting boundary using an existing sufficiently contrasting token, such as muted, while retaining the focus treatment. Verify the empty, unfocused state; the passing focus and text-contrast checks do not cover it. Evidence: `edge-results.json`, `kv-empty.png`.                                                                                                                                                                                                                                                                                       |            |

**Critical:** none established.  
**Minor:** none established.

## Rulings

Every `Ruling:` in `.superpowers/sdd/07-checker/progress.md` was weighed separately.

| #   | Ledger line / ruling                                                       | Verdict and reason                                                                                                                                                                                                                                                  |
| --- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 8 — KV uses frame size; other cell counts need checking                    | **Partly stands.** Other cell counts correctly remain Check this, and frame-based evaluation faithfully implements the table. The table’s applicability is flawed when smaller props are selected; revise it with finding 2.                                        |
| 2   | 10 — chapter name in `UI.chapters.build`                                   | **Stands.** This follows the existing shared chapter-name convention.                                                                                                                                                                                               |
| 3   | 12 — query-key names and hyphenated cell ranges                            | **Stands.** Names were left open; encoding is deterministic, tested and round-trips the fields.                                                                                                                                                                     |
| 4   | 13 — history snapshot includes search; known canonicalisation preserves it | **Stands.** This fixes the required trailing-slash case while unknown addresses discard their query. Preserving previously discarded queries on other known canonicalisations is a small behaviour change, but no functional regression was established.            |
| 5   | 14 — widen the tagline-hidden band                                         | **Stands.** The four links fit at 900 × 700 with loaded fonts; phone links also remain separate at enlarged text.                                                                                                                                                   |
| 6   | 15 — add build footer wording and overview count                           | **Stands.** Chapter crossings, the full reading-order walk and existing progress integrate correctly.                                                                                                                                                               |
| 7   | 17 — use radio buttons for VTX and goggles                                 | **Stands as a justified, recorded deviation** from the binding native-select wording. The fixed choices remain native controls, keyboard operation works, and the long option wraps visibly at 320 px / 200% text.                                                  |
| 8   | 18 — `useBuild(open)` forgets cleared KV on leaving                        | **Stands.** The extra parameter keeps transient missing-KV state tied to the open sheet.                                                                                                                                                                            |
| 9   | 19 — invalid KV stays null locally; reload restores reference KV           | **Stands.** This follows the combined requirements to omit invalid KV and default missing address values. The reload behaviour was independently reproduced; it is an exception to build persistence, not a hidden codec failure.                                   |
| 10  | 20 — numbered Question sections, optional heading ID and SheetRef links    | **Stands.** These reuse the established sheet vocabulary without changing the required results-before-parts order.                                                                                                                                                  |
| 11  | 22 — replace the proposed drawing e2e with address/KV coverage             | **Stands as a coverage tradeoff.** Integration tests verify the viewer props, and independent Chromium screenshots establish actual hover/focus highlighting. Canvas pixels are observable, even though there is no direct DOM representation of highlighted parts. |
| 12  | 23 — cap the status column at `min(8.5rem, 100%)`                          | **Stands.** The mixed-status sheet reflows without sideways scrolling at 320 px / 200% text.                                                                                                                                                                        |

## Declined to judge

- Docker build, Docker-image/nginx acceptance and remote CI: no independent image run or CI inspection; the executor’s 169-pass result is recorded as supplied evidence.
- Actual screen-reader speech, physical phone settings and non-Chromium engines: conclusions use source inspection, the Chromium accessibility tree, rendering and keyboard probes.
- Physical hardware operation or damage outcomes for arbitrary selected boards, including operation below minimum ratings: no hardware or circuit measurements were supplied; content was compared with lessons and primary documentation.
- Whether every intermediate commit independently passed checks: history was reviewed, but verification ran on the reviewed HEAD.

No additional product behaviour was set aside as outside the plan or specification. The two factual findings were assessed despite their origin in the binding design.

## Recommendations

Resolve the two teaching assumptions in the design and copy, then add tests covering the affected cross-field combinations. Raise the KV input’s resting boundary contrast and verify its empty, unfocused state.

## Assessment

**Ready to merge? No — request changes.**

The implementation and exercised flows are solid, but two categorical teaching claims exceed what the checker’s inputs establish, and the new text input has an accessibility contrast defect. These should be corrected before merge.

## Resolutions

All three Important findings were fixed on `feat/checker` in one pass, each with a test that failed first.

1. **Voltage explanation (fixed).** The Fits line now scopes the result to the ESC's and FC's ratings and says to check what the camera and VTX need too: on this app's drone they run from the flight controller's regulated power, but some builds power the VTX straight from the battery. The design and scope are amended to match. Test: `checker.test.ts` › "scopes the voltage check to the ESC and FC, and says to check the camera and VTX".
2. **KV rule (fixed).** The lesson bands are judged on the prop size, not the frame: with props other than 5″ the KV check says Check this and asks the reader to check with the motor maker for that prop size. The high-KV line is tied to 5″ props instead of calling every KV of 2400 or more a 4S motor. The design's table is amended. Tests: `build-check.test.ts` › "kv: judges the lesson bands only on 5\" props, whatever the frame"; `checker.test.ts` › "ties the high-KV warning to 5″ props, not to every KV".
3. **Input contrast (fixed).** The KV field and the pick lists now have a muted edge (7.2:1 against the ground) instead of the strong rule (1.74:1). Test: `e2e/checker.spec.ts` › "the KV field and pick lists show their edges at rest, at 3:1 or more".

After the fixes: `pnpm check` 816 tests passed; `pnpm test:e2e` 165 passed; Docker image e2e re-run (see the PR).
