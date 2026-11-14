# Section 03c — Real parts: Design

Design agreed in conversation on 2026-11-14, after a search of Wikimedia Commons and Openverse and
mockups of three placements. The implementation plan will be `03c-real-parts.md`. Branch:
`feat/real-parts`.

## Intent

The 3D drone is a simplified drawing. A beginner also needs to recognise each part on a real build,
in a shop or on a bench. Each part's lesson sheet gets one real photograph of that kind of part,
with an honest caption and a full credit.

## Goals

1. Every one of the 11 part sheets shows one real photo, under the title block, before the
   questions (placement A, user decision).
2. Every photo is free to use whatever happens to the project: CC BY, CC BY-SA, CC0 or public
   domain only (user decision: no non-commercial licences, so a donation link stays possible).
3. Every photo carries a credit that meets its licence: title or subject, author, source, licence
   with a link, and a note when we cropped it.
4. The photos are stored in the app (user decision): no request to a third party when a visitor
   opens a sheet.

## Non-goals and anti-goals

- No photos on the overview or the intro sheet; no gallery, lightbox, zoom or carousel.
- No shop, manufacturer or AI-generated images (PRODUCT.md), and no photo whose "own work" claim
  looks doubtful.
- **Anti-goal:** a photo that reads as a product recommendation. Every caption says it is one
  example and that the reader's part may look different (scope bans recommendations).
- Changing the 3D model to look more like the photos.

## Approaches

- **Placement (user decision): a figure under the title block**, full sheet width, before the
  questions. Chosen over a small photo cell inside the title block (too small to recognise a part)
  and a figure inside question 1 (pushes the photo below the first answer).
- **Hosting (user decision): stored in the app**, cropped and resized once, with a typed record per
  photo. Chosen over loading from Wikimedia's servers (each visitor's IP sent to a third party,
  breaks when a file is renamed or deleted, nginx image sources would need widening).
- **Gaps (user decision): best available, honestly captioned.** Where no good free photo of our
  exact kind of part exists (a 4-in-1 ESC), use the best free photo of the same part and say in the
  caption how ours differs. Chosen over leaving the sheet without a photo or delaying the section.
- **Licences (user decision): free licences only.** A check of Openverse found that allowing
  non-commercial photos would not fill any gap.

## The photos

All from Wikimedia Commons. "Crop" describes the intent; the builder picks the exact rectangle by
eye, keeping the part filling the frame and at least 640 px wide where the source allows.

| Part              | Commons file                                                                                        | Licence       | Use                                                                              |
| ----------------- | --------------------------------------------------------------------------------------------------- | ------------- | -------------------------------------------------------------------------------- |
| Frame             | `File:FPV Quadrocopter.jpg`                                                                         | CC BY-SA 4.0  | crop to the frame (a 5″ frame with motors and camera, no props)                  |
| Motors            | `File:FPV Quadrocopter.jpg`                                                                         | CC BY-SA 4.0  | crop to one motor                                                                |
| Propellers        | `File:ImpulseRC Alien 5″ FPV quad with components collage.jpg`                                      | CC BY-SA 4.0  | crop to the top-view panel (four 3-blade props)                                  |
| ESC               | `File:Esc2.jpg`                                                                                     | CC BY-SA 3.0  | crop to the ESC and its wires, leaving out the hand-written notes where possible |
| Flight controller | `File:AbuseMark AfroFlight Naze 32 Flight Controller rev5 white.jpg`                                | Public domain | crop to the front side                                                           |
| Battery           | `File:Racing Drone.jpg`                                                                             | CC BY-SA 4.0  | crop to the LiPo strapped on the quad, with its plug                             |
| Battery strap     | `File:71188-fpv-components.jpg`                                                                     | CC BY-SA 4.0  | crop to the strap over the battery, no watermark                                 |
| Receiver          | `File:TBS Crossfire Nano receiver (XF nano).jpg`                                                    | CC BY-SA 4.0  | whole photo                                                                      |
| Camera            | `File:Runcam Eagle black FPV camera with bracket.jpg`                                               | CC BY-SA 3.0  | whole photo                                                                      |
| VTX               | `File:TeamBlacksheep (TBS) Unify Pro HV 5.8 GHz RF video transmitter with RP SMA pigtail front.png` | CC BY-SA 3.0  | whole photo                                                                      |
| Extras            | `File:71188-fpv-components.jpg`                                                                     | CC BY-SA 4.0  | crop to the GPS module on top, no watermark                                      |

Rejected: a "BLHeli 12A ESC" photo (shop-listing file name and format: doubtful "own work"), a
blurry Flickr bench photo, a fixed-wing flight controller (Matek F405-WSE), and an RC-car LiPo
hard case.

The author in each credit is the Commons "Author" (Artist) field, not the uploader, read when the
photo is fetched. If a file's licence or author turns out different from this table when fetched,
the builder stops and reports it rather than substituting.

## Decisions

1. **Captions** name the example and say it is one example; where it differs from our reference
   build they say how (ESC: "A single ESC, one per motor. On most 5″ builds the four sit together
   on one 4-in-1 board."; flight controller: an older board, the same job). Captions and alt text
   live with the photo records in `src/content/`; the caption is visible text, the alt text
   describes what is in the picture for screen readers (not a repeat of the caption).
2. **Credit line** under the caption, muted, small: "Photo: {author}, {licence} (link), via
   Wikimedia Commons (link to the file page)", plus "cropped" when cropped. Cropped CC BY-SA photos
   are adaptations; the credit says they are shared under the same licence.
3. **Figure look** (as mocked up): a sheet-filled panel with a rule-strong hairline border and
   padding; a muted caps label "Real part"; the photo full width with its own background (most are
   on white, which is fine inside the frame); caption in Barlow 600 caps under it; credit below.
   No redline. Text in `src/content/ui.ts`.
4. **Files:** each photo stored as WebP at about 640 and 1280 px wide, served with `srcset`, explicit
   width and height (no layout shift), `loading="lazy"` and `decoding="async"`. Imported through
   Vite so file names are hashed and cached long by nginx.
5. **Reproducible:** a committed manifest (Commons title, crop rectangle, part) and a script that
   downloads the originals, reads their licence and author, crops, resizes and writes the WebP
   files and the record data. It is run by hand when photos change, never in CI. Its outputs are
   committed. A dev dependency for image processing is acceptable.
6. **Licence notice:** the README (or a credits doc it links) says the photos are third-party
   works under their own licences, separate from the code's licence.

## Constraints

- Layering: photo records live in `content/`; the figure component lives in
  `features/part-explorer`; nothing in `shared/` imports content.
- Tokens only; redline only for selection, the current sheet and focus.
- The narrow-sheet reflow rules (02d) hold: no horizontal page scroll at 320 px with 200 % text.
- PRODUCT.md and DESIGN.md are updated: imagery is now allowed (real photos of parts, credited),
  and the figure is a documented component.

## Left to the builder

Exact crop rectangles, the image-processing tool, the script's location and name, WebP quality,
file layout under `src/assets/`, and the test split. Each crop is checked by eye with impeccable at
390 and 1280 px.

## Tests

- Unit: every part has exactly one photo record; each has non-empty alt, caption, author, source
  URL on commons.wikimedia.org, a licence from the allowed set with its URL, both image sizes, width
  and height; the alt text differs from the caption; captions say it is one example.
- Component: a lesson sheet renders the figure after the title block and before question 1, with
  the image's alt, the caption and working credit links; the overview and intro render no figure.
- e2e: on every part sheet the photo loads (natural width > 0); the 02d reflow spec still passes
  (no sideways scroll at 320 px with 200 % text); the production image serves the WebP files with
  long cache headers.
