---
version: 1
slug: 'src-features-part-explorer-partexplorer-tsx'
primary_target: 'src/features/part-explorer/PartExplorer.tsx'
related_targets: ['src/app/App.tsx', 'src/styles/global.css']
---

# Surface brief: part explorer (the app's main screen)

## Scope and mode

The single screen of the app: 3D reference quad, part picker, lesson panel. Mode: **Read** (the
visitor understands something), with an interactive 3D figure. Users and constraints live in
PRODUCT.md. Section 02 (design pass) builds the world's foundation. Section 02b made the model
teach: with a sheet open, the open part is redline, the parts its lesson connects to stay in a
connected grey and everything else fades; spin arcs on the Propellers sheet; the camera fitted to
the drone's outline; 3D hover lights the list row. Dimension lines, callout balloons, a front
marker and per-part greys were tried and dropped (the parts list already names parts; photos in
03c show what real parts look like). Section 03c added a real part photo to every part sheet: a detail figure under the title
block (muted "Real part" label, the photo at most 22rem tall, a bold sentence-case caption that
always says "One example:", and a muted credit line), from Wikimedia Commons under free licences
only. Section 05a added a second chapter, How it works together, with three path sheets (Control,
Power, Video, numbered 1–3; the footer marks the chapter crossing): the same sheet frame with a
chapter title block, a path switcher, step controls and numbered stops, while the drawing opens the
frame, lights the current stop and draws a redline leader from part to part with numbered
balloons over the canvas (see DESIGN.md: Path Sheet, Path Leader). Section 05c added sheet 5, What if: four mistakes acted out on the
drawing with live sticks, a status line, a ground square and a VTX heat gauge (see DESIGN.md:
What If Sheet, Flight Status, Ground and VTX Gauge). Section 07 added a fourth chapter, Plan a build, with one sheet, Check a build: the parts' pick lists under a live summary, then seven ruled result rows with drawn status marks (only Doesn't fit in redline); pointing at a result opens its parts on the 3D drawing (see DESIGN.md: Check a Build Sheet, Status Marks). Section 06 added a third chapter, The gear you hold and wear (Radio, Goggles, Charger, numbered 1–3): lesson sheets with a Try it box of framed switches, while the drawing field shows a flat labelled front view of the gear instead of the 3D drone, its pointed-at part in redline (see DESIGN.md: Gear Sheet, Gear Drawing). Section 05b added sheet 4 of
that chapter, How a quad moves: the path sheet's frame with five steps and Show me, Gust and Level
in the step controls; the drawing flies the drone from two stick pads in its lower corners, with a
motor balloon per motor (see DESIGN.md: Stick Pad, Motor Readout). On phones the drawing is pinned
above the steps with a band for the sticks. Section 02c
added lookup and navigation: each lesson has its own URL, a lesson footer with Mark as read and
previous/next sheet cells, connection links set as "see sheet" references, read checks in the
parts list, and a start/continue link on the overview. Section 04 added the intro sheet ("What is
an FPV drone?") before sheet 1, in the same sheet column with the drone still in view, with two
flat SVG drawings (the system scene and a size comparison to scale) and an overview start block
that offers it to newcomers. Section 02d added the masthead's first section link (the intro), moved
focus into every sheet the app opens, let narrow sheets reflow with enlarged or longer text, and
made reduced motion apply live.

Physical scene: a beginner at a desk or workbench, often in the evening under a bench lamp, laptop
or phone beside loose parts and a soldering iron. That forces a dark ground.

## Direction contract

THESIS: Each part lesson is a sheet from the reference quad's drawing set: a framed drawing field,
a title block and a parts list that make the numbers legible. It refuses the category default of a
dark docs site with a sidebar and a 3D model boxed in a card, and the neon-on-black tech HUD.

OWN-WORLD: Carbon-black ground (#121416), a slightly lifted sheet (#1c1f22), hairline rules
(#2a2e32 / #3a3f44), drafting-white ink (#dfe3e6), muted grey for secondary text, and one redline
accent (#ff5b3a) used only for selection, the current sheet and focus, the same in the list and on
the 3D model. Labels, title block, part names and question headings in a technical condensed sans
set in caps (Barlow Condensed); reading text in a legibility face (Atkinson Hyperlegible). Numbers
are tabular. The only ornament is structure: drawing-frame zone markers, rules, numbered balloons.

STORY: The visitor sees one drone drawn as a technical sheet, picks a part from the parts list or
the model, and reads its sheet: title block with the key numbers first, then the four questions as
numbered balloons 1 to 4. They leave able to name the part and read its numbers.

FIRST VIEWPORT: Desktop: a thin masthead (wordmark "INSIDE THE QUAD", "QUAD" in redline; section
tabs only once more modules exist). Left, about two thirds: the drawing field, a hairline frame with
zone markers on its edges around the 3D model, the parts list (item, part, qty) docked at its lower
left as the picker, a quiet "drag to turn · tap a part" note at its lower right. Right: the sheet
column, title block (part, sheet n of 10, qty, spec line), part title, the one-sentence answer as
a lead, then balloons 1 to 4. Phone: masthead, a shorter drawing field (about 40svh) where one
finger scrolls the page, then the parts list as full-width 48px rows, then the sheet.

FORM: Engineering drawing sheet (ISO technical drawing with title block and parts list), position
4 of 7 on the grounded list (assigned by the roll). seed:94199afce34d4100. Raises kept from
declined challengers: structure is the only ornament (exposed binding); state reads without colour
via outline, fill and balloon number (exposure record); one ink, committed (cutting bench); a
strict hairline module grid for spec rows (high-density modules); one continuous leader line from
the selected part to its lesson (provenance ribbon; not drawn: 02b chose fading the rest instead).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the
verdict, DESIGN.md, and every shipping raster carrying its provenance

## Signature interaction

Selecting a part (list row or model) lights the same redline in both places at once: the list row
gets a redline left rule and filled row, the 3D part gets a redline outline, and the title block
updates. Motion: 150-200 ms state transitions only; nothing orchestrated on load. Selecting a
board under the top plate (ESC, flight controller, receiver, VTX) opens the frame as an
exploded-view drawing, the layers lifting apart in order within the same 200 ms (sections 03a, 03b).

## Unresolved

- Exact muted grey and redline values must be verified for WCAG AA contrast on both grounds.
- Light theme: not planned; the dark ground is a product decision for the bench scene.
