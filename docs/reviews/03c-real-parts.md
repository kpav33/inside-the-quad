# Review: section 03c — Real parts

- Branch: `feat/real-parts` · Reviewed commit: `6e2e606b2f5096c3eb864436725fb7a177acf996` · Date: 2026-11-14
- Compared with `main` (`57b2540`); six commits. Independent review; no implementation changes made.

## Summary

All eleven lessons show recognisable real parts, with descriptive alternatives, wrapping captions
and source/licence links. Local checks pass and the five requested behaviour areas were examined;
restore the supplied CC BY-SA 3.0 titles before merging and resolve the regeneration issue below.
Docker-image execution and CI remain outside this review's verified results.

## Checks

| Command        | Result                                                                                                            |
| -------------- | ----------------------------------------------------------------------------------------------------------------- |
| pnpm check     | Passed: typecheck, lint, formatting; 438 tests in 40 files.                                                       |
| pnpm test:e2e  | Passed: 103 tests; five Docker-only server tests skipped against Vite preview.                                    |
| pnpm build     | Passed: TypeScript and Vite production build, including 22 hashed WebP assets.                                    |
| docker build . | Not run: Docker unavailable in this sandbox. Executor will build the image and run image-targeted e2e afterwards. |

Every direct Node/pnpm command used `source ~/.nvm/nvm.sh && nvm use >/dev/null &&`;
Node was 22.23.4. Logs, screenshots, API response and temporary scripts are in
`/tmp/codex-review-03c`. The photo fetcher was read, never executed. The review report is the only
repository source/document changed; nothing was committed.

Operational limitation: the review dev server remains on port 5183. Each command has an isolated
process list, so subsequent commands cannot resolve its listener PID; the original session has
closed stdin. The executor must stop that listener from the host. No broad process kill was used.

## Review Focus

| Behaviour                                                 | Verified result                                                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slow or failed photo keeps its space and exposes alt text | Intercepted WebP requests for FC, VTX, ESC and Frame at 390 and 1280px, held them pending, then aborted them. Image dimensions and caption positions were identical before/after failure; failed-image screenshots show descriptive alt text. Loaded-image measurements also retain the expected aspect/height cap.                                                                      |
| Wide/tall photos scale down whole, at most 22rem high     | All eleven decoded at each requested width. Maximum image heights: 213.72px at 320px/200% text, 344.44px at 390px, and 352px at both 768px and 1280px. FC and Extras show the complete crop within the cap; the VTX strip stays shallow. CSS uses contain and left alignment.                                                                                                            |
| 320px, 200% text                                          | All eleven checked with a 32px root font; zero horizontal document overflow. Caption and credit wrap visibly, including licence and Commons links. The committed reflow tests also pass at 320/390px with 200% and longer text.                                                                                                                                                          |
| Description rather than caption duplicated as image alt   | Every image has distinct descriptive alt; inspected the photos against the text and Chromium accessibility snapshots. The image node carries the description; the native figure gets its name from figcaption. This is browser/DOM evidence, not a physical screen-reader trial.                                                                                                         |
| Production WebP cache and security headers                | Static verification only: emitted URLs are hashed `/assets/*.webp`; nginx's `/assets/` location sets `public, max-age=31536000, immutable` and includes all five security headers. The added server test requests an actual lesson photo, checks 200, WebP MIME, immutable and header presence. It does not assert the numeric max-age. Execution against nginx is left to the executor. |

## Licence and provenance

One read-only Commons `imageinfo` request covered all nine distinct source files for the eleven
photos, with a generic User-Agent. It succeeded without a 429; no retry was needed. Compared
Artist, licence, licence URL and description URL with every committed record; all match.
The API response is saved as `commons-api.json`. Source pages and the CC licence text were also
read. The per-photo result follows; links point to the exact Commons sources.

| Part     | Author / source                                                                                                                                      | Licence       | Credit assessment                                                                                                         |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------- |
| frame    | [Clicklabs](https://commons.wikimedia.org/wiki/File:FPV_Quadrocopter.jpg)                                                                            | CC BY-SA 4.0  | Author, licence/link, source and crop/share-alike notice present.                                                         |
| motors   | [Lucasbosch](https://commons.wikimedia.org/wiki/File:Xlabs_Shrike-200_V2_5%E2%80%B3_FPV_quad_with_components_collage.jpg)                            | CC BY-SA 4.0  | Author, licence/link, source and crop/share-alike notice present.                                                         |
| props    | [Lucasbosch](https://commons.wikimedia.org/wiki/File:ImpulseRC_Alien_5%E2%80%B3_FPV_quad_with_components_collage.jpg)                                | CC BY-SA 4.0  | Author, licence/link, source and crop/share-alike notice present.                                                         |
| esc      | [1sfoerster](https://commons.wikimedia.org/wiki/File:Esc2.jpg)                                                                                       | CC BY-SA 3.0  | Author, licence/link, source and crop/share-alike notice present. Supplied title missing from rendered credit: finding 1. |
| fc       | [Lucasbosch](https://commons.wikimedia.org/wiki/File:AbuseMark_AfroFlight_Naze_32_Flight_Controller_rev5_white.jpg)                                  | Public domain | Public-domain status matches Commons; author, source and crop notice present.                                             |
| battery  | [Lucasbosch](https://commons.wikimedia.org/wiki/File:Xlabs_Shrike-200_V2_5%E2%80%B3_FPV_quad_with_components_collage.jpg)                            | CC BY-SA 4.0  | Author, licence/link, source and crop/share-alike notice present.                                                         |
| strap    | [Lucasbosch](https://commons.wikimedia.org/wiki/File:Xlabs_Shrike-200_V2_5%E2%80%B3_FPV_quad_with_components_collage.jpg)                            | CC BY-SA 4.0  | Author, licence/link, source and crop/share-alike notice present.                                                         |
| receiver | [SokilFPV](<https://commons.wikimedia.org/wiki/File:TBS_Crossfire_Nano_receiver_(XF_nano).jpg>)                                                      | CC BY-SA 4.0  | Author, licence/link and source present; not cropped.                                                                     |
| camera   | [Lucasbosch](https://commons.wikimedia.org/wiki/File:Runcam_Eagle_black_FPV_camera_with_bracket.jpg)                                                 | CC BY-SA 3.0  | Author, licence/link and source present; not cropped. Supplied title missing from rendered credit: finding 1.             |
| vtx      | [Lucasbosch](<https://commons.wikimedia.org/wiki/File:TeamBlacksheep_(TBS)_Unify_Pro_HV_5.8_GHz_RF_video_transmitter_with_RP_SMA_pigtail_front.png>) | CC BY-SA 3.0  | Author, licence/link and source present; not cropped. Supplied title missing from rendered credit: finding 1.             |
| extras   | [SokilFPV](https://commons.wikimedia.org/wiki/File:MATEKSys_F405-WSE_FC.jpg)                                                                         | CC BY-SA 4.0  | Author, licence/link, source and crop/share-alike notice present.                                                         |

Cropped share-alike figures explicitly say the crop is shared under the same licence. The public
domain FC correctly has no licence URL and does not claim share-alike. README separates image
licences from the code. No doubtful provenance was verified: eight sources declare own work;
the remaining [Frame/Motors source](https://commons.wikimedia.org/wiki/File:FPV_Quadrocopter.jpg)
links its external origin and has a VRT permission ticket confirming the copyright holder's
approval. A named brand in a photographer's title does not make a photograph a manufacturer asset.

The gap is the supplied title: `credits.json` retains it, but `PhotoCredit`/`PART_PHOTOS` drop it
and the rendered source link is only named “Wikimedia Commons”. CC BY-SA 3.0
[section 4(c)](https://creativecommons.org/licenses/by-sa/3.0/legalcode#s4c) requires the supplied
title as part of reasonable credit, in addition to author and source URI. The Camera and VTX
supplied titles identify their photographed products; the ESC source is titled `Esc2.jpg`.
A generic subject caption does not retain those titles. Finding 1 concerns these three 3.0
photos; it does not impose a title requirement on the 4.0 photos.

## Rendered behaviour and accessibility

Opened every part at 320 × 900 with 200% text, and at 390 × 900, 768 × 900 and 1280 × 900.
Inspected figure screenshots and complete viewport screenshots on Frame, ESC, Strap, VTX and
Extras, plus the contact sheet of all eleven committed large assets. The full 44-case measurement
set is `browser-results.json`, from the review server on port 5183.

Frame, motor, propellers, ESC, FC, battery, strap, receiver, camera, VTX and buzzer are identifiable.
The motor photograph is soft, but its bell, shaft, arm attachment and exposed windings still
communicate the part. The single ESC and older FC captions explain the reference-build gap.
Battery/strap show the intended restraint clearly, and Extras isolates the buzzer/USB board rather
than teaching a fixed-wing controller as our FC. No recommendation or verified factual caption
error was found. Every caption presents one example.

The figure has a neutral token border/background, muted label/credit and reading-face caption;
no decorative redline, shadow or new colour literal. The native image, figure and links have
sensible accessible roles. Keyboard Tab goes from the ESC licence to its Commons source, then
out to the lesson's next connection link; no trap. The decorative Real part label is hidden from
assistive technology. No redundant aria-label replaces the descriptive alt.

## Script, records and performance

The script batches and deduplicates titles, handles API title normalisation, rejects missing
files, non-allowed or changed licences and absent authors, and backs off on 429/5xx. Crops are
scaled from original pixels using the actual downloaded width; the current manifest rectangles
fit their originals. Each output is resized without enlargement and credits record the actual
large output dimensions. Expected licence checks happen before each entry's output writes.

Failure is not transactional: a later entry's failure can leave earlier WebPs rewritten while
credits are written only after the complete loop. It exits rather than fabricating credits;
a maintainer must inspect/reset a failed regeneration before committing. Cache resolution is a
separate, verified repeatability problem (finding 2). No live download/regeneration was performed.

All 22 files are under 150KB, totalling 985,732 bytes. The largest is FC large at 139,324 bytes;
small variants range from 7,664 to 52,338 bytes. Vite emits separate hashed images; importing all
records does not embed their pixels in JavaScript. Lazy/async attributes are present, and an
observed lesson visit made no third-party request. Current width/height records match actual
large WebP metadata. Three `srcset` descriptors do not (finding 3). `sizes` is a conservative
upper bound rather than the exact image slot: at 1280px it advertises 576px while the image box
is about 466px; at 768px it advertises 768px versus 710px. No separate user-visible defect was
established from that approximation.

## Design, plan and architecture

All four tasks have implementation and relevant documentation. The roadmap says in review;
plan checkboxes are still unchecked, but the progress ledger explicitly records completion.
No overview/intro gallery, third-party runtime image loading, external 3D models, shopping links
or unrelated teaching features were introduced. Documentation updates cover the figure,
photography policy, records and manual pipeline. Dependencies point inwards: shared imports no
content/features, content imports no feature, and PartPhoto stays within part-explorer.
Sharp is a development dependency used by the manual script, outside the runtime bundle.

Rulings were weighed individually:

- **Strap from Racing Drone; Extras from MATEKSys F405-WSE:** acceptable changes. Their matched
  free licences and visibly recognisable crops support the resolution rationale. Using the buzzer
  subsection avoids the reason the complete fixed-wing FC was rejected. The design photo table
  was binding, but these are explicit recorded substitutions, not an undisclosed scope change.
- **2560px downloads, scaled crops, quality 70:** scaling is correct for a uniform scaled source;
  quality 70 meets the committed size budget and looks adequate in the inspected figures. However,
  arbitrary existing cache sizes defeat the promised repeatability and give fresh output sizes
  different from the reviewed assets (finding 2). The claimed lack of visible cost is not evidence
  for the fresh, smaller outputs.
- **Sentence-case reading-face captions:** sound. These are wrapping teaching sentences; the
  muted caps Real part label retains the drawing voice. DESIGN and the direction brief now
  explicitly document it, consistent with the Two Voices rule.

The six commits have Conventional Commit headers, within 72 characters; message bodies are
within 100 characters per line. Design, plan, pipeline/assets, records, figure/tests and docs are
coherent separate changes. No history finding.

## Tests test behaviour

Record tests verify completeness, non-empty distinct alt/caption, free licence membership,
credit fields, dimensions and manifest crop flags. They do not validate real pixel dimensions or
attribution titles. Component tests exercise actual figure semantics, credit links, crop/public
domain branches and placement between title block and question 1. Explorer tests exclude figures
from overview/intro. Browser tests load all eleven actual assets at both planned widths and check
the height cap; existing reflow coverage exercises the new captions and credits.

The width/height component assertion alone cannot establish slow/failure layout stability;
the independent intercepted-browser checks above supply that evidence. The hard-coded srcset
assertion passes even for a fixture whose large width is 1024, so it misses finding 3. No tests
exercise the script's new crop/normalisation/licence/backoff/failure logic: those paths were
reviewed statically, not established by the green suite. Regression coverage for deterministic
source resolution and actual emitted widths would be useful with findings 2 and 3.

## Findings

| #   | Severity   | Area                                                                         | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Resolution |
| --- | ---------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 1   | blocking   | src/content/photos/index.ts:119; src/features/part-explorer/PartPhoto.tsx:31 | **The three CC BY-SA 3.0 photos lose their supplied titles in the visible attribution.** Camera, VTX and ESC source titles exist in credits.json but are omitted from PhotoCredit and the figure; the source link is generically named Wikimedia Commons. CC BY-SA 3.0 section 4(c) requires a supplied title alongside author/source. Carry the title into the photo credit and show it, for example as the source link text, with coverage for a 3.0 record.                                                                                                                                                                                                                                                                                                                                                                                                         | Open.      |
| 2   | should-fix | scripts/photos/fetch-photos.mjs:82                                           | **Regeneration depends on unrecorded cache resolution and cannot reproduce the reviewed crops.** Cache keys contain only the Commons title; any existing original/thumbnail is reused, while an empty cache requests 2560px. From the verified Commons dimensions and manifest, a fresh run yields Motors 533px, Props 800px, Battery 1148px, Strap 613px and Extras 751px wide, versus committed 1280/1280/1280/1180/1127px. This follows directly from the script's scaling and no-upscale rules; the fetcher was not run. Maintainers following README on a clean checkout would silently replace reviewed images with smaller ones, including duplicate size variants for Motors/Strap. Make source resolution deterministic and part of cache identity, ensure enough resolution for intended crops, and cover cached versus fresh inputs without network access. | Open.      |
| 3   | nit        | src/features/part-explorer/PartPhoto.tsx:21                                  | **Three large srcset candidates advertise the wrong intrinsic width.** Every large file is declared 1280w, but decoded metadata is ESC 1024px, Strap 1180px and Extras 1127px. Browsers use those descriptors to choose/correct image density; the ESC candidate overstates available resolution by 25%. Use each actual large width and verify descriptors against asset metadata. All small committed files are actually 640px wide. No broken layout was observed.                                                                                                                                                                                                                                                                                                                                                                                                  | Open.      |

## Strengths

- Local assets, honest reference-build exceptions and explicit crop/share-alike credit support the
  educational purpose without adding shopping or third-party runtime dependencies.
- The figure contains wide and tall crops while preserving recognisability and narrow-sheet reflow.
- The integration remains small, follows the content/feature boundary and has real-image browser
  coverage in addition to component assertions.

## Declined to judge

- **Preference for GPS over the substituted buzzer, or for the original strap image:** explicit
  rulings explain the substitutions; the new crops are free and recognisable. No user harm verified.
- **Caps versus sentence-case caption taste:** the reading-face ruling is documented and readable;
  the figure's caps label preserves the design voice.
- **Sharper motor photography or enlarging the VTX strip:** the current parts remain identifiable;
  photo replacement or zoom would be a new editorial/design decision, not a verified failure.
- **Small rounding differences in intrinsic aspect ratios and the conservative sizes estimate:**
  no material layout jump or separate usability failure observed. Incorrect width descriptors are
  addressed separately in finding 3.
- **Physical screen-reader speech and cross-browser differences:** Chromium accessibility trees
  and keyboard operation were checked; no NVDA/VoiceOver or other browser trial was available.
- **Hidden copyright defects beyond available provenance:** authors/licences match Commons and
  Frame/Motors have VRT evidence; no unsupported allegation of infringement is made.
- **Hypothetical API changes, corrupt caches, interrupted writes or future invalid manifests:**
  failure paths were read and the non-transactional limitation is recorded; these conditions were
  not induced by running the fetcher, as instructed. Finding 2 is established from current inputs.
- **Whether the user already approved the contact sheet:** acceptance requires it, but the ledger
  promises presentation before the PR and this review has no evidence of that conversation.
- **Docker/nginx runtime headers, image-targeted e2e and green CI:** config/test code was read;
  execution is unavailable here and belongs to the executor's subsequent checks.

## Verdict

Do not merge until finding 1 is fixed. Resolve finding 2 so the documented photo workflow preserves
reviewed quality; finding 3 can be fixed cheaply or explicitly deferred as a nit. All local commands
passed, but they do not substitute for the executor's Docker-image build/e2e and green CI.
