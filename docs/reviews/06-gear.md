# Review: section 06 — The gear you hold and wear

- Branch: `feat/gear` · Reviewed commit: `15789a8d9dd78eb5bb5749a6a49f9f78bf17d10c` · Date: 2026-11-18
- Compared with `9a5409ff58e644a991d6402a02ca74f3072613dc` (main); eleven commits. Independent review of the supplied whole-branch diff, binding design, implementation plan and all 15 executor rulings. Read `CLAUDE.md`, the architecture and workflow instructions, the reviewer prompt, the design and plan, and the previous section's review. Reviewed in content, integration and browser passes; no subagents or implementation changes.

## Summary

The following judgments are withheld, with reasons expanded under “Declined to judge”:

- Docker build/image acceptance and remote CI: no independent build/image run or CI inspection.
- Actual screen-reader speech, physical phones and other browser engines: Chromium, accessibility markup and keyboard probes were available.
- Historical checks on each intermediate commit: checks ran on the reviewed HEAD.

**Request changes.** The three sheets integrate cleanly with reading order, progress and routing; the controls reset correctly, charger arithmetic shares the reference spec, and all available application checks passed. Three Important findings concern overlapping masthead links at enlarged phone text, undersized drawing labels/status, and incorrect goggles compatibility teaching. Three Minor findings concern the unnecessary viewer download, goggles form-factor descriptions, and drawing strings outside the content layer. No Critical finding was established.

## Checks

| Command                                                               | Result                                                                                                                                                                                                                                                                                                                                               |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm check`                                                          | Passed: typecheck, lint, formatting and 756 tests in 72 files. The three.js CommonJS deprecation notices did not fail the run.                                                                                                                                                                                                                       |
| `pnpm build`                                                          | Passed: TypeScript and Vite production build. Entry JavaScript: 348.33 kB; separate viewer chunk: 987.77 kB, before compression.                                                                                                                                                                                                                     |
| `pnpm test:e2e --workers=2 --output=/tmp/codex-review-06/e2e-results` | Passed: 155 tests, five Docker-only tests skipped, 3.4 minutes. All ten gear tests passed.                                                                                                                                                                                                                                                           |
| `docker build .` / image e2e                                          | Not rerun under the brief's stated Docker-unavailable limitation. The executor separately reports 160 image e2e passes; that result is not independently verified. A read-only `docker info` probe actually succeeded in this session, so the brief's availability statement could not be confirmed. This does not establish build/image acceptance. |
| Independent Chromium probes                                           | Reset, Back focus, switches, part focus/blur, all four odd addresses, legacy/new saved progress, disabled WebGL, blocked viewer chunk, reduced motion, phone reading and masthead hit testing. Findings below qualify the results.                                                                                                                   |
| Photo reproduction                                                    | All six committed gear WebPs reproduced byte-for-byte from the cached originals with the manifest crops and pipeline settings. Original dimensions and SHA-1 values match the Commons file pages.                                                                                                                                                    |

Every direct Node/pnpm command used `source ~/.nvm/nvm.sh && nvm use >/dev/null &&`.
Evidence is under `/tmp/codex-review-06`: `check.log`, `build.log`, `e2e.log`,
`browser-results.json`, `edge-results.json`, `masthead-results.json`,
`photo-reproduction.json` and the screenshots. The bounded impeccable detector scan of the gear
feature and panel returned no diagnostics; it did not establish visual correctness.
The dev app used StrictMode, and production probes used Vite preview. All servers started for
this review are stopped; ports 4173, 5187 and 5188 were verified closed (`servers.json`).
This report is the only repository file changed; no commit or branch/index change was made.

## Review Focus

| Failure mode from the plan                  | Verified result                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Leaving and coming back resets the sheet | Passed. After arming, selecting Angle and highlighting a part, leaving for Goggles and returning with Back yielded Disarmed, Acro, zero highlighted groups and focus on `gear-title-radio`. The switcher integration and hook tests also exercise reopening/reset. Render-time adjustment in `useGearSheet` prevents a stale drawing from appearing on a different gear sheet.                                          |
| 2. Odd addresses                            | Passed. `/gear`, `/gear/`, `/gear/drone` and `/gear/radio/2` all show the existing unknown-address notice and canonicalise to the overview; no blank page or crash. A trailing slash on a valid gear address is accepted and canonicalised.                                                                                                                                                                             |
| 3. No WebGL                                 | Passed for functionality. With WebGL disabled the charger has no canvas and Storage still produces 22.8 V. With the production viewer chunk blocked, Goggles still switches to Digital and shows its result. However, the unnecessary chunk is still requested and its rejected preload is unhandled: finding 4.                                                                                                        |
| 4. Keyboard                                 | Passed for sheet controls. Native toggle buttons have mutually exclusive `aria-pressed` values, named groups and visible focus outlines; Space operates the radio, goggles and charger controls. Focusing a part name highlights its SVG group; Tab/blur clears it. Navigation focuses the opened heading, while direct load leaves focus on the body. The masthead's phone pointer targets fail separately: finding 1. |
| 5. Stored progress                          | Passed. A stored list containing all eleven parts and five together sheets loads unchanged and offers Radio, with Gear 0 of 3. Marking each gear sheet read survives individual reloads; only after all three does the overview say “Every sheet read” and Gear 3 of 3. Existing parsing, malformed-storage handling and cross-tab storage logic remain intact.                                                         |

## Content, drawings and accessibility

Radio copy has the intended mode 2 axes, an ExpressLRS module on the reference 2.4 GHz band,
binding and return telemetry, arm/mode switches and EdgeTX. Acro/Angle explanations agree with
the flight-controller and moves lessons. Receiver, VTX and camera connections are consistent
with the existing lessons and the spec: analog video on 5.8 GHz, matching channel and RHCP
polarisation, and the flight controller's OSD on the camera picture. The commercial-brand/price
scan of `src/content/gear/` found none; the explicitly required ExpressLRS and EdgeTX names are
present. There is no buying guide or setup walkthrough. The goggles compatibility exception is
incorrectly narrowed to built-in receivers (finding 3).

Charger copy and drawing use six cells, 4.2 V full / 25.2 V pack, and 3.8 V storage / 22.8 V pack;
the 1100 mAh reference pack gives 1.1 A at 1C. Main-current and balance leads have distinct
roles, balancing drains cells that get ahead, and Storage can charge or discharge. These numbers
and mechanisms agree with the battery lesson and the
[SkyRC S60 manual](https://www.skyrc.com/download/S60_Instruction_Manual_%28EN%29.pdf).
The simplified drawing represents each lead as a grouped connection to the pack, rather than a
wiring schematic; the copy explicitly explains the individual cell taps. I found no requirement
to depict each conductor separately.

All named parts are present on the three drawings. Radio arm and mode levers change their actual
geometry; Digital removes both picture groups and shows No signal; Storage changes all six
cell fills to about 55.6% of their full height and changes the pack display. Highlighting affects
the named group, its leader and label. The controls are calm and instantaneous; a live change to
reduced motion leaves them operational. The sheet provides the drawing's information in words,
and the SVG is hidden from assistive technology with no focusable children. Named switch groups,
pressed states, heading focus, route announcement and the polite result paragraph provide the
intended accessible equivalents. Actual spoken announcements were not tested.

At 320 × 667 and 200% text, the pinned field is 354.8 px tall and there is no horizontal page
overflow. Independent first/last-character probes across every text node in the paragraphs
could reveal the copy below that field. Focused try-it controls remained visible and operable.
The passing paragraph/overflow results do not establish the usability of the drawing text or
masthead: findings 1 and 2. At 900, 992, 1000 and 1280 × 700, the ordinary-text desktop layout
remained within the viewport; the tagline was hidden at 900 and present at the larger widths.

## Photos and credits

The committed metadata matches the primary file pages:
[radio](https://commons.wikimedia.org/wiki/File:TBS_Tango_II.jpg) — SokilFPV, CC BY 4.0;
[goggles](https://commons.wikimedia.org/wiki/File:FPV_Brille_mit_Diversity_Modul.jpg) — Clicklabs,
CC BY-SA 4.0; [charger](https://commons.wikimedia.org/wiki/File:Charger_Battery.JPG) —
KundaliniZero, CC BY-SA 3.0. Cached originals match all three published SHA-1 values, and
regeneration reproduces both WebP sizes for each photo. No fetch/regeneration command that
would rewrite repository assets was run.

Each rendered credit includes the source title/link, author and linked licence. Both cropped
photos disclose the crop; the goggles crop explicitly retains its share-alike licence. Images
are local Vite assets with responsive sources and alt text, rather than remote image loads.
Brand marks/source titles are attribution and example photography, not recommendations.
The radio source uses a different control system from the reference drone; its caption only
claims to illustrate the physical layout, so that choice is acceptable under “One example”.
The goggles photo's box-style identification is inaccurate (finding 5).

## Architecture and test quality

The gear feature has no three.js or viewer imports. Domain/routing/progress remain plain data
and functions; switch state stays out of the URL and localStorage. Feature consumers use the
gear public index, and no dependency or external model was added. The existing type-only import
of `DroneViewerProps` from a feature-internal file predates this branch. The eager viewer preload
also predates it, but now defeats the new flat sheets' claimed loading isolation (finding 4).
New colours use existing tokens; a few new drawing strings bypass the content convention
(finding 6). Architecture, scope, roadmap, product and design documentation were updated.

The full reading-order e2e walks all nineteen numbered sheets and ends on the focused overview.
Existing part, intro, path, moves and what-if tests pass. Footer chapter crossings, switcher
contents, title/announcement handling and existing chapter numbering remain coherent in source
and the exercised flows. All eleven commit subjects follow Conventional Commits and their
changes have recognisable task boundaries; historical checks were not rerun individually.

Tests cover the essential interactions and state, but their acceptance boundary is narrower
than the design's:

- Reflow assertions inspect page overflow and sheet descendants, not overlapping masthead links.
- Drawing assertions check label separation, not effective font size or readable status text.
- The viewer mock establishes that a viewer is not mounted; it cannot detect an eager module request.
- Content assertions check keywords, numbers and a prohibited-brand list; they cannot establish
  the accuracy of compatibility or form-factor claims.

## Findings

**Important** findings should be fixed before merging. **Minor** findings have narrower impact
or concern maintainability. No Critical finding was established. Resolution entries are left open.

| #   | Severity  | Area                                                                                                                                      | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Resolution |
| --- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 1   | Important | `src/app/App.tsx:27`; `src/styles/global.css:124`; `src/styles/global.css:135`                                                            | **The third masthead link overlaps the existing chapter link at enlarged phone text.** At 320 px and 200% text, the links are 88 px high but their wrapped rows start only 40 px apart because of the negative block margins. “The gear” covers the second line and centre of “How it works together”; clicking that chapter link's centre opens/remains on `/gear/radio`. Removing only the new link in the browser restores that centre and the second line to the together link. The first two links already had a related overlap, but this branch extends it to the formerly last link. This is a reading and pointer-navigation regression on every sheet, despite zero horizontal overflow. **Suggested fix:** use non-overlapping row spacing/margins when the section navigation wraps; retain comfortable independent targets. Test glyph and target hit areas at 320 px / 200% text and confirm both existing chapters and gear can be opened. Evidence: `masthead-results.json`, `masthead-320-200.png`. |            |
| 2   | Important | `src/styles/global.css:1845`; `src/styles/global.css:1883`; `src/styles/global.css:1909`                                                  | **The required phone drawing is not legible at enlarged text.** The SVG's 16-unit phone labels render at only 9.52 CSS px at 320 px; its 13-unit screen text renders at 7.735 px. Enlarging the page text to 200% does not enlarge either. The charger voltage and goggles' No signal result are especially small, while unused drawing height remains above/below the narrow SVG. Listing the names in the sheet preserves a text equivalent, but does not satisfy the binding requirement that the pinned drawing stay readable. **Suggested fix:** give phone labels and result text a readable rendered size through an adaptive SVG layout or CSS-sized overlays, preserving separation and the reading area. Verify effective text size and visual readability, including Digital and Storage, rather than only label non-overlap. Evidence: `browser-results.json`, `radio-320-200.png`, `goggles-320-200.png`, `charger-320-200.png`.                                                                        |            |
| 3   | Important | `src/content/gear/goggles.ts:16`; `src/content/gear/goggles.ts:69`                                                                        | **The compatibility explanation falsely requires an analog receiver to be built in.** Digital goggles can also display this drone's video through compatible external analog receiver modules or AV input. The lesson excludes those configurations, while the try-it result categorically says digital goggles cannot read analog video. This teaches the wrong hardware compatibility rule to beginners. The manufacturer's [HDZero operation documentation](https://docs.hd-zero.com/goggles-operation) explicitly documents all three paths: built-in receiver, external module and AV input. **Suggested fix:** explain that the receiving system must match the VTX; some digital goggles accept analog through a built-in or compatible external receiver/input. Qualify the Digital example as a digital receiver without that analog provision. Keep the teaching copy free of commercial brands.                                                                                                           |            |
| 4   | Minor     | `src/features/part-explorer/PartExplorer.tsx:10`; `src/features/drone-viewer/index.ts:5`                                                  | **Opening a flat gear sheet still downloads the entire 3D viewer.** A fresh production `/gear/goggles` requests `DroneViewer-DQATsGhN.js` (987.77 kB before compression), although no canvas mounts. The imported viewer index starts the promise immediately; blocking that request produces an unhandled rejection/page error even while the gear remains usable. The preload is inherited, but this new route makes it unnecessary and contradicts the documented claim that the 3D view is not loaded for gear. **Suggested fix:** defer the import until a non-gear viewer is actually needed, retaining appropriate preload/error handling for drone sheets. Test production gear requests and a failed unused chunk. Evidence: `edge-results.json`.                                                                                                                                                                                                                                                           |            |
| 5   | Minor     | `src/content/photos/index.ts:121`; `scripts/photos/manifest.json:135`; `src/content/gear/goggles.ts:14`; `src/content/gear/goggles.ts:54` | **Goggles form factors are described inaccurately.** The committed photo shows slim binocular goggles, but its caption, alt text and manifest call them box goggles. Conversely, the general lesson presents one screen per eye as universal; box goggles can use one shared panel (for example, the [manufacturer's Scout specification](https://www.fatshark.com/product-page/scout) lists a single 4-inch display). A learner is given the wrong name for the photographed hardware and no qualification for the drawing's particular layout. **Suggested fix:** identify the photograph as binocular goggles, describe only visible details in its alt text, and qualify the two-screen explanation as this drawn style, with a brief acknowledgement of single-panel box goggles.                                                                                                                                                                                                                               |            |
| 6   | Minor     | `src/features/gear/GogglesDrawing.tsx:19`; `src/features/gear/ChargerDrawing.tsx:40`                                                      | **New visible status strings live in drawing components.** No signal, Charge and Storage are literal JSX strings; the latter two duplicate labels already in `UI.gear`. This breaks the branch's explicit content-only copy convention and makes later translation/copy changes inconsistent between drawing and controls. **Suggested fix:** reuse `UI.gear.chargerMode` and add a content-owned No signal label; leave components responsible for rendering state.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |            |

## Rulings

Every `Ruling:` in `.superpowers/sdd/06-gear/progress.md` was weighed separately:

| #   | Ledger line / ruling                                            | Verdict and reason                                                                                                                                                                                                                                                     |
| --- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 4 — derive the chapter from the open sheet                      | **Stands.** The open sheet determines its chapter unambiguously; existing paths retain the same switcher output and gear lists its three sheets.                                                                                                                       |
| 2   | 6 — offer Acro and Angle only                                   | **Stands.** Both match the existing lessons and satisfy the binding choice of Acro plus explained modes. More mode names are not required.                                                                                                                             |
| 3   | 8 — put state and charger maths in `gear-state.ts`              | **Stands.** Plain, tested functions share one appropriate module and are exported through the feature index.                                                                                                                                                           |
| 4   | 9 — defer the visual look to integration                        | **Stands as sequencing.** Rendering in the actual field is necessary for a useful look. It does not excuse the final phone legibility failure.                                                                                                                         |
| 5   | 10 — instantaneous lever and bar changes                        | **Stands.** The design permits changes without easing; there is no autonomous animation and reduced motion works.                                                                                                                                                      |
| 6   | 12 — test focus on navigation, not first load                   | **Stands.** This preserves the app's existing focus contract; direct load leaves focus alone and navigation/Back focus the sheet heading.                                                                                                                              |
| 7   | 13 — switches under question 1, parts under question 2          | **Stands.** The four questions remain intact and the small experiment is close to its explanation.                                                                                                                                                                     |
| 8   | 14 — keep fixed small phone drawing labels at 200% text         | **Does not stand.** The binding design requires a readable drawing at 320 px / 200% text. Actual rendered labels are 9.52 px and status is 7.735 px; the duplicated sheet names do not establish drawing legibility. Finding 2.                                        |
| 9   | 15 — no-break space before V                                    | **Stands.** It keeps each voltage/unit together while the sheet still reflows.                                                                                                                                                                                         |
| 10  | 17 — put intro links in the device list                         | **Stands.** That list is where the descriptions are rendered; links use normal routing and propagate the focus callback.                                                                                                                                               |
| 11  | 19 — three credited example photos below the switcher           | **Stands for selection, placement and licensing; does not stand for the “box goggles” identification.** The three free licences and local assets are verified, and visible brand marks are not recommendations. The goggles caption/alt must be corrected (finding 5). |
| 12  | 20 — hand-populate the original-image cache after rate limiting | **Stands.** All three cached originals match Commons SHA-1 values, and all six WebPs reproduce exactly through the declared transforms. The manual download did not bypass the resulting asset/credit checks.                                                          |
| 13  | 22 — split system/video and frequency into separate rows        | **Stands.** The values stay derived from the spec; separating concepts is clear and avoids forcing long combined values into a narrow sheet.                                                                                                                           |
| 14  | 23 — hide the tagline between 56rem and 62rem                   | **Stands for that band.** The 900 × 700 layout fits and the tagline returns at 992 px. It does not resolve the separate enlarged-phone navigation overlap in finding 1.                                                                                                |
| 15  | 24 — let reflow tests wait for canvas or gear drawing           | **Stands.** A mounted canvas is correctly absent on gear. The test still needs separate assertions for masthead overlap and drawing legibility.                                                                                                                        |

## Declined to judge

- Docker build, Docker-image e2e/nginx behaviour and remote CI. The executor's 160-pass image
  result is recorded as supplied evidence only. The brief called Docker unavailable; the
  successful `docker info` probe means I cannot independently assert that limitation. No image
  acceptance run was performed.
- Actual screen-reader speech, physical touch/OS accessibility settings, physical phone
  performance and non-Chromium engines. Conclusions use source/ARIA inspection, Chromium
  rendering and keyboard/pointer probes, not those environments.
- Whether every intermediate commit independently passed checks. History and scope were read,
  but the reported commands verify only the reviewed HEAD.

No additional product behaviour was set aside as outside the plan or specification. In
particular, the inherited preload and masthead rules were assessed where the new gear routes
and link expose them; they were not exempted merely because those rules predate this branch.

## Resolutions (executor, 2026-11-18)

Findings 1, 2, 3 and 5 were fixed in one pass, each with a test that failed first (5 re-graded
Important: it taught a wrong fact to beginners). Findings 4 and 6 are deferred as Minor.

- **1 (masthead overlap):** wrapped section links are spaced by twice their tap-target overhang.
  Test: `e2e/gear.spec.ts` "the masthead's three section links stay apart" (failed: boxes
  overlapped). `977317d`.
- **2 (phone drawing legibility):** on phones the drawing has a narrow margin and labels of at
  least 11 px (the screens' words 10 px), bottom labels on two staggered rows, No signal on two
  lines, and zone markers that keep their size. Test: the 320 × 667 / 200 % gear tests now
  measure rendered size and a 2 px gap to every label and zone marker (failed at 9.52 px and
  7.735 px, then on the goggles' zone marker). Ruling 8 is withdrawn: like the moves sheet's
  motor labels, the drawing's words keep that size when text is enlarged; the sheet repeats them
  in its own text. `977317d`.
- **3 (goggles compatibility):** digital goggles show analog through a built-in receiver, a
  plug-in module or a video input; the Digital result now means goggles with no analog
  receiver. Test: `src/content/gear/gear.test.ts` "says how digital goggles can still show analog
  video". `23af54d`.
- **5 (goggles form factors):** the lesson says slim goggles have a screen per eye and box goggles
  one shared screen. Test: "does not claim every pair of goggles has a screen for each eye".
  `23af54d`. At the owner's request the goggles and charger photos were replaced the same day
  (Fat Shark goggles with a plug-in receiver module; an ISDT SC-608), so the "box goggles"
  caption is gone. `a5adbad`.
- **4 (viewer chunk preloaded on gear sheets):** deferred, Minor. Docs now say no 3D canvas is
  drawn on a gear sheet, not that the chunk isn't loaded.
- **6 (strings in drawing components):** partly addressed (No signal moved to `UI.gear`); the
  Charge and Storage screen words remain in the drawing, deferred, Minor.

After the pass: `pnpm check` 758 tests passed; `pnpm test:e2e` 156 passed; Docker image e2e (`E2E_BASE_URL=http://localhost:8089`) 161 passed.
