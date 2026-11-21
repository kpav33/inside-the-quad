---
name: Inside the Quad
description: How an FPV drone works, part by part, drawn as a technical sheet on carbon black.
colors:
  ground: '#121416'
  sheet: '#1c1f22'
  rule: '#2a2e32'
  rule-strong: '#3a3f44'
  ink: '#dfe3e6'
  muted: '#9aa3ab'
  accent: '#ff5b3a'
  model-motors: '#202428'
  model-props: '#24282c'
  model-esc: '#1e2226'
  model-fc: '#202326'
  model-battery: '#22262a'
  model-strap: '#1d2125'
  model-receiver: '#1f2327'
  model-camera: '#212529'
  model-vtx: '#23272b'
  model-extras: '#25292d'
  scene-fill-light: '#b8c4d0'
typography:
  display:
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif"
    fontSize: '2.488rem'
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: '0.04em'
  headline:
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif"
    fontSize: '1.44rem'
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: '0.12em'
  title:
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif"
    fontSize: '1.2rem'
    fontWeight: 600
    lineHeight: '1.75rem'
    letterSpacing: '0.06em'
  value:
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif"
    fontSize: '1.2rem'
    fontWeight: 600
    letterSpacing: '0.03em'
    fontFeature: 'tnum'
  lead:
    fontFamily: "'Atkinson Hyperlegible', system-ui, sans-serif"
    fontSize: '1.2rem'
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "'Atkinson Hyperlegible', system-ui, sans-serif"
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.6
    fontFeature: 'tnum'
  label:
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif"
    fontSize: '0.833rem'
    fontWeight: 500
    letterSpacing: '0.1em'
rounded:
  none: '0px'
  balloon: '50%'
spacing:
  '1': '0.25rem'
  '2': '0.5rem'
  '3': '0.75rem'
  '4': '1rem'
  '5': '1.5rem'
  '6': '2rem'
  '7': '3rem'
components:
  button-outline:
    backgroundColor: 'transparent'
    textColor: '{colors.ink}'
    typography: '{typography.label}'
    rounded: '{rounded.none}'
    padding: '0 1rem'
    height: '2.75rem'
  part-list:
    backgroundColor: '{colors.sheet}'
    rounded: '{rounded.none}'
  part-list-row:
    backgroundColor: 'transparent'
    textColor: '{colors.ink}'
    typography: '{typography.body}'
    padding: '0 0.75rem'
    height: '3rem'
  part-list-row-selected:
    backgroundColor: '{colors.rule}'
    textColor: '{colors.ink}'
  balloon:
    backgroundColor: 'transparent'
    textColor: '{colors.muted}'
    rounded: '{rounded.balloon}'
    size: '1.75rem'
  balloon-selected:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.ground}'
    rounded: '{rounded.balloon}'
    size: '1.75rem'
  title-block:
    backgroundColor: '{colors.sheet}'
    textColor: '{colors.ink}'
    rounded: '{rounded.none}'
  title-block-cell:
    padding: '0.5rem 0.75rem'
---

# Design System: Inside the Quad

## Overview

**Creative North Star: "The Reference Drawing Sheet"**

Every screen is a sheet from the reference quad's drawing set: a hairline-framed drawing field with zone markers, a parts list that doubles as the picker, and a title block that puts the part's key numbers first. The page is a carbon-black bench under a lamp (the product is read in the evening beside loose parts), so the ground is dark and the drawing is ink on it. The drone itself is drawn the same way: dark fills with drafting-white edges, so the 3D model reads as linework rather than a rendered product shot.

Density is that of a technical drawing: compact labelled cells, hairline rules, tabular numbers, and generous reading measure only where a beginner actually reads (the lesson text). Structure is the only ornament: frames, rules, zone markers and numbered balloons. There is one ink and one redline, and the redline means "this one".

Confirmed rejections (from the direction contract): the dark docs site with a sidebar and a 3D model boxed in a card, and the neon-on-black tech HUD.

**Key Characteristics:**

- Carbon ground, one lifted sheet tone, two hairline weights, drafting-white ink.
- One redline accent, reserved for selection, the current sheet and focus.
- Condensed caps lettering for everything the drawing labels; a legibility face for everything the beginner reads.
- Square corners everywhere except the circular balloons.
- Flat: depth is tonal steps and hairlines, never shadow.
- State transitions only (180ms); nothing animates on load.

**Divergences from the direction contract, recorded deliberately:**

- 3D selection is a redline _fill_ with ground-coloured drafting edges, not a redline outline. drei `Outlines` rendered artifacts and was invisible on box geometry. Unselected parts are dark fills with ink edges, so redline is the only filled colour in the drawing.
- On wide screens the 3D viewer is inset above the docked parts list, so the list never covers the drone.
- The 3D view opens on the drone's front three-quarter, so the FPV camera faces the viewer; the frame has two camera side plates at the front. Selecting a part the starting view hides (camera, VTX, receiver, extras) eases the view to an angle that shows it, in the same restrained motion, and instantly under reduced motion.
- The parts list splits into two columns (each with its own ITEM / PART / QTY headings, filled top to bottom) when the drawing field is at least 28rem wide and three from 40rem, so the 3D view keeps its height with all eleven parts. With a mouse, rows are 2.5rem.
- Selecting a board under the top plate (ESC, flight controller, receiver, VTX) opens the frame as an exploded-view drawing: the ESC, the FC, the rear bay (VTX and receiver) and the top plate with the battery, strap and GPS lift apart in order; the standoffs and the camera plates stay put. It eases to about 95 % in 200 ms and jumps under reduced motion.
- Spec values in the title block are unbreakable groups, so a number is never split from its unit.
- The "current sheet" is marked by the selected parts-list row (redline rule and filled balloon); the title block's Sheet field itself stays ink.
- On a lesson the part name is the sheet's heading, above the title block; the title block drops its Part cell there (the overview keeps it), so the name appears once.
- Two drawn icons exist, both inline SVG at 1em with a 1.5 stroke and square caps: the leader arrow (references to other sheets) and the check (read). No other icons, and no Unicode glyphs standing in for them.

## Colors

A near-monochrome carbon palette with a single warm redline; every colour is a token.

### Primary

- **Redline** (accent): the drafter's correction red. Selected parts-list row (3px left rule and filled balloon), the open part's fill in the 3D drawing, the focus ring, text selection, and the "QUAD" of the wordmark. Nothing else.

### Neutral

- **Carbon Ground** (ground): page and masthead background; also the text colour on redline fills and the edge colour of the selected 3D part.
- **Lifted Sheet** (sheet): panels that sit on the drawing: parts list, title block. Also the 3D frame's fill.
- **Hairline** (rule): internal rules between rows and cells, the masthead underline, and the selected row's fill.
- **Frame Line** (rule-strong): outer frames (drawing frame, parts list, title block, spec table top), outline-button border, unselected balloon ring, scrollbar thumb.
- **Drafting Ink** (ink): reading text, values, and the 3D model's edge lines; also the hover border colour.
- **Graphite** (muted): secondary text: column headers, cell labels, hints, zone markers, tagline, question balloon numerals, link underlines at rest.
- **Part Fills** (model-motors, model-props, model-esc, model-fc, model-battery, model-strap, model-receiver, model-camera, model-vtx, model-extras): 3D-only fills, small tonal steps around the sheet so parts separate without colour.
- **Connected Grey** (`MODEL_LOOK.connected`, #4a525a): 3D-only, the fill of parts the open part connects to; lighter than every part fill and still a dark tone (contrast under 3:1 on ground). Never a surface or text colour.
- **Scene Fill Light** (`SCENE_LIGHT.fill`, #b8c4d0): 3D-only, the cool fill light that keeps dark parts' shapes readable. Never used as a surface or text colour.

Contrast (WCAG 2.x): ink 14.3:1 on ground, 12.8:1 on sheet; muted 7.2:1 on ground, 6.5:1 on sheet, 5.3:1 on the rule fill; redline 6.0:1 on ground; ground text on redline 6.0:1.

### Named Rules

**The Redline Rule.** Redline marks selection, the current sheet and focus (plus the wordmark's "QUAD"). It never marks hover, links, headings, warnings or decoration. If it is red, it is chosen or focused.

**The One Source Rule.** Colours come only from `src/shared/design/tokens.ts` (`COLOR`, `MODEL_COLOR`). `src/styles/tokens.css` mirrors them as custom properties and `tokens.test.ts` keeps the two identical. The three.js materials import the same constants. No hex literals in components, materials or lights.

**The State Without Colour Rule.** Selection also reads without red: the selected row gets the rule fill and a bold name, its balloon is filled; hover lifts a faint fill and turns the balloon ring ink. Hover never uses redline.

## Typography

**Display / Label Font:** Barlow Condensed (with Arial Narrow, sans-serif), weights 500, 600, 700
**Body Font:** Atkinson Hyperlegible (with system-ui, sans-serif), weights 400, 700

**Character:** Barlow Condensed in spaced caps is the drawing's lettering: titles, labels, values, balloon numerals. Atkinson Hyperlegible carries every sentence a beginner reads. Numerals are tabular throughout (set on body).

The ramp is a fixed rem scale at ratio 1.2 (0.833, 1, 1.2, 1.44, 1.728, 2.488rem).

### Hierarchy

- **Display** (Barlow 700, 2.488rem, 1.1, 0.04em, uppercase): the part title on its sheet.
- **Headline** (Barlow 700, 1.44rem, 0.12em, uppercase): the masthead wordmark.
- **Title** (Barlow 600, 1.2rem, 1.75rem line, 0.06em, uppercase): the four question headings, aligned to their balloons.
- **Value** (Barlow 600, 1.2rem, 0.03em, balanced wrap): title-block values and spec-table values.
- **Lead** (Atkinson 400, 1.2rem, 1.5): the one-sentence answer to "What does it do?".
- **Body** (Atkinson 400, 1rem, 1.6, pretty wrap, max 68ch): lesson paragraphs, parts-list names (700 when selected), tagline at 0.833rem.
- **Label** (Barlow, 0.833rem, 0.08 to 0.1em, uppercase, muted): cell labels, column headers, zone markers, the drawing hint. Headed labels (parts-list heading, table header) use 600.

### Named Rules

**The Two Voices Rule.** The drawing speaks in condensed caps; the teacher speaks in Atkinson. Never set a reading paragraph in condensed caps, and never set a label or value in the body face.

**The Unbroken Value Rule.** A number is never split from its unit. Title-block spec values are each a no-wrap group joined by " · ", and copy uses U+2011 (non-breaking hyphen) for "5-inch". Narrow-sheet exception: when a title block is under 20rem (in practice, enlarged text on a phone), values may wrap between items rather than push the page sideways.

## Layout

Spacing is a 7-step scale (0.25, 0.5, 0.75, 1, 1.5, 2, 3rem); touch targets are at least 2.75rem, parts-list rows 3rem.

**Wide (when the main area is at least 56rem wide, a container query, so enlarged text falls back to the stacked layout):** a two-column grid filling the viewport under a thin masthead (one row: wordmark, tagline and the section links, What is an FPV drone?, How it works together and The gear, plus Check a build when that held-back feature is on; below 62rem (68rem with four links) the tagline gives way so the row holds; when the links wrap on a phone, their rows are spaced so their tap targets never overlap): the drawing field on the left (flexible) and the sheet column on the right (20 to 36rem, and at most 44 % of the width so mid-size windows keep a two-column parts list), which scrolls on its own with a stable gutter. The drawing frame fills the field as a grid: the canvas (zone markers 1 to 4 along its top, A to C down its left edge, drawing hint at its lower right) fills the space above, and the parts list sits in its own row across the bottom.

**Narrow:** a single scrolling column: masthead, a drawing frame of 40svh (min 15rem), the parts list full width, then the sheet. One finger scrolls the page over the drawing; two fingers turn it. The hint text switches to touch wording under `(hover: none) and (pointer: coarse)`.

**Large or long text on narrow sheets:** the page never scrolls sideways. Headings and long words may break. Under 16rem of sheet (container queries in rem, so this applies to enlarged text, not normal-size phones) the numbered balloon sits above its heading, the footer's previous/next cells stack and the sheet heading drops to 1.44rem. The intro's size table scrolls inside its own frame as a last resort.

**Masthead:** the wordmark and tagline on the left, the sections on the right (for now one link, "WHAT IS AN FPV DRONE?" with a leader arrow, Barlow 600 caps with a muted underline). It takes its own line when the masthead wraps on phones, and its 2.75rem tap target reaches into the header padding so the masthead keeps its height. While the intro is open the link has `aria-current="page"` and a 2px redline underline: it marks the current sheet.

**Focus:** any sheet the app opens (from the parts list, a link, the masthead, the start link or the 3D model) takes focus at its heading, so keyboard focus never stays behind; closing returns it to where the sheet was opened from. A page load moves no focus. Browsers show no focus ring after a mouse click, so this is invisible to mouse users.

**Parts list columns:** the parts list runs down two columns when the drawing field (a container query on the field, not the page) is at least 28rem wide, and three from 40rem, filled top to bottom, each column with its own headings and a hairline between them. Narrower fields keep one column. With a fine pointer the rows are 2.5rem; touch keeps 3rem.

**Sheet column:** part title with the close button, the title block, then the four questions as a 2rem balloon gutter plus body, 2rem apart, then the lesson footer. The spec table becomes stacked label/value/meaning blocks when the sheet is narrower than 32rem (container query).

### Named Rules

**The Clear Field Rule.** The parts list has its own grid row below the canvas, never on top of it, so the list never covers the drone at any text size.

## Elevation & Depth

Flat. There are no drop shadows. Depth is two things only: a tonal step (ground to sheet to rule fill) and hairline borders (rule inside, rule-strong outside). The selected row's redline is a 3px inset rule, drawn inside the row's box; it is a line, not a shadow. In 3D, depth comes from a bench-lamp key light with a cool fill and drafting edges, not from shading or materials (roughness 1, metalness 0).

### Named Rules

**The Hairline Rule.** Panels separate from the ground by a lifted tone and a 1px frame, never by shadow, glow or blur.

## Shapes

Square corners on every frame, panel, cell, row and button (0px). The only curve is the balloon: a 1.75rem circle with a 1px ring that numbers parts-list items and lesson questions, exactly as balloons number items on a drawing. Rules are 1px; the selection rule is 3px; the focus ring is 2px with 2px offset (inset -2px inside list rows).

## Components

### Buttons

Drafted, not pressed.

- **Shape:** square (0px), 1px rule-strong border, transparent fill, min height 2.75rem, 0 1rem padding.
- **Type:** Barlow 600 caps, 0.08em tracking.
- **Hover / Focus:** border turns ink (180ms ease-out); focus is the 2px redline ring.

### Sheet references (in-lesson connections)

Each connection is its sentence in the body face, then a link to the part it names, set like a drawing's "see sheet" note: a muted leader arrow and "BATTERY · SHEET 6" in Barlow 600 caps, ink with a muted underline (0.2em offset) that turns ink on hover, 2.75rem tall. "· sheet 6" never wraps apart. Never redline.

### Lesson footer

Below the questions, over a hairline: the **Mark as read** outline button (a toggle; pressed, it shows the check and "READ" on the rule fill with an ink border, never redline), then a two-cell hairline grid like the title block: PREVIOUS on the left and NEXT on the right, each a muted caps label with an arrow over the target sheet in Barlow 600 ("Motors · sheet 2"). Sheet 1 leaves the previous cell empty; on the last sheet Next reads "Back to overview". Cells take the row hover fill; focus is the inset ring.

### Overview start

A newcomer (nothing read, not even the intro) sees the hint, "New to FPV? Start here." in bold, one outline-button link "WHAT IS AN FPV DRONE?" with a leader arrow, and "Already know the basics? Start with sheet 1: Frame" as a muted line with an ink link. Once the intro or any part is read: the hint (or, once every part is read, the all-read line), one outline-button link ("START WITH SHEET 1: FRAME", then "CONTINUE WITH SHEET N: …", then "START AGAIN FROM SHEET 1") with a leader arrow, and once anything is read a muted caps count ("3 OF 11 READ") with a quiet underlined "What is an FPV drone?" link and "Clear progress" (Clear shows once anything, the intro included, is read; it clears both). An unknown part address shows a framed one-line notice above the title block.

### Navigation: Parts List

The drawing's parts list is the part picker.

- **Frame:** sheet fill, rule-strong frame; muted caps heading and ITEM / PART / QTY column header row, each over a hairline.
- **Rows:** a 2.5rem / 1fr / 3rem grid, 3rem tall, hairline between rows. Two or three columns on wider drawing fields, 2.5rem tall with a mouse (see Layout). Balloon item number, part name in body, quantity right-aligned.
- **Hover:** faint rule-tinted fill (45% rule) and the balloon ring turns ink.
- **Selected:** rule fill, 3px redline left rule, redline-filled balloon with ground numeral, bold name. Exposed as `aria-pressed`.
- **Read:** an ink check after the name; the row's accessible name becomes "VTX, read".

### Title Block

The sheet's identity in a strict hairline module grid: three cells (Part, Sheet "n of N", Qty) over a full-width Spec cell. On a lesson the Part cell is left out (the heading above names the part) and Sheet and Qty share the row. Sheet fill, rule-strong frame, rule dividers, 0.5rem 0.75rem cell padding; muted caps label over a Barlow value. Spec values are no-wrap groups separated by " · ". On the overview it shows the reference quad and "Overview".

### Intro sheet

"What is an FPV drone?" is the sheet before sheet 1, in the sheet column like a lesson: the display heading with "Close intro", a title block with only Sheet "Intro", then four balloon-numbered sections (FPV vs camera drones, the whole system, sizes, why 5-inch) and the same footer (no Previous; Next to "Frame · sheet 1"). The Frame lesson's Previous leads back to it.

### Intro drawings

Two flat SVG drawings, framed like a title block (sheet fill, rule-strong border) and hidden from assistive technology; the visible text beside each carries the facts.

- **System scene:** the pilot (muted, not a device) with the radio and goggles, the drone as a top view, and two dashed muted link arrows labelled CONTROL and VIDEO with their frequency. A list of device toggles (outline buttons, `aria-pressed`) sits under it, each with its role and link. Pressing a device, or tapping it in the drawing, draws it and its links in 2.5px solid ink; a mouse hover previews; the drone lights both links. Redline is not used. On sheets under 26rem the drawing drops the frequency details (the list repeats them), enlarges its labels, and the list stacks each button above its text.
- **Size comparison:** a tiny whoop, 3″, 5″ and 7″ as top views drawn to one scale (millimetres), each in a column at least wide enough for its short caps label; the 5″ carries a muted REFERENCE note. Under it, a plain three-column table (size, props, motor to motor) with Barlow values that never stacks.
- Lines stay 1px hairlines at any scale (`vector-effect: non-scaling-stroke`). Label sizes inside the SVGs are in drawing units and scale with the drawing, so they sit outside the CSS type ramp by design.

### Balloons and Questions

Each lesson answers four questions, numbered 1 to 4 in muted ring balloons, heading in title caps beside it, body indented under the heading.

### Real Part Photo

A detail figure on every part sheet, between the title block and question 1: sheet fill, a 1px rule-strong frame, 0.5rem 0.75rem padding; a muted caps "Real part" label; the photo full width with its own background, at most 22rem tall and scaled down whole (`object-fit: contain`, left-aligned); then the caption in the reading face, bold, sentence case, always starting "One example:" (a photo is never a recommendation); then the credit, muted and small: "Photo: author, licence (link). Cropped; shared under the same licence. Source: Wikimedia Commons (link)." The app's own photos (the radio) read "Photo: Inside the Quad, CC0 (link)." with no source. Links use the muted underline and turn ink on hover. No redline. The image has its own width and height (no layout jump), 640 and 1280 px WebP sources and lazy loading. Not on the overview or the intro.

### Path Sheet

The drawing set has two chapters: The parts (sheets 1–11) and How it works together (the paths, sheets 1–3: Control, Power, Video), each numbered from 1. A path sheet uses the lesson sheet's frame: heading and Close sheet, then a title block with Chapter, Sheet ("1 of 3") and what the path is about (From, To, Carries; these word values may wrap, unlike numbers). Under it the chapter switcher: one caps link per sheet of How it works together (Control, Power, Video, How a quad moves, What if) in one rule-strong frame, divided by hairlines, the open sheet in ink with a 2px redline underline (the current sheet); it wraps on narrow screens and appears on the moves and what-if sheets too. Then the lead, the step controls (outline buttons: Previous step, Next step, Play the path / Stop; disabled ones drop to rule colour and muted text), and the numbered stops: a hairline-ruled list, each stop a balloon beside its name (caps, a button that makes it the current step, underlined in rule-strong, ink on hover), one or two sentences, and a small muted "Lesson:" line linking its lesson ("Lessons:" for several parts; "More in What is an FPV drone?" for the radio and goggles). The step controls are pinned to the top of the sheet's scroll area on a ground fill with a hairline under them, so they and the keyboard focus stay in view while the stops scroll under them. When larger text on a small screen grows them past a quarter of the window, they scroll with the stops instead, so they never cover a focused link. While the drawing is out of view (scrolled away on a phone, or the tab hidden), the leader's dashes stop flowing, so the canvas draws nothing. The current stop's balloon is filled redline and its text turns ink; passed balloons keep a redline ring; stops ahead stay muted. A changed step scrolls into view (nearest edge; instant under reduced motion), and a polite live region names it. The step lives in the address (`/paths/control/3`), replaced rather than pushed. On a path sheet a click on the drawing opens that part's stop (parts off the path do nothing). Then the usual lesson footer, which marks the chapter crossing: from Extras the next cell reads "End of the parts" and names "How it works together, sheet 1: Control path"; from Control the previous cell reads "Back to the parts". A lesson opened from a stop shows a "Back to {path}, step n" link under its heading.

### Moves Sheet

Sheet 4 of How it works together ("4 of 4"): the path sheet's frame and stop list, with five steps (Throttle, Roll, Pitch, Yaw, Gyro loop), a title block with Mode (Acro), Motors and Speed (about 7× slower than real), and step controls Previous step, Next step, Show me, Gust and Level. The gyro loop step adds a small table, "What the flight controller compares": per axis, what you ask for and what the gyro measures, in °/s. The step lives in the address (`/moves/2`). Opening a step plays its demo once (none under reduced motion; Show me always plays it). Clicking the drawing does nothing here, and its hint is hidden. The camera starts behind and above the drone, as a pilot sees it, so a stick pushed right tips the drone right on screen. On stacked layouts the drawing alone is pinned at the top (46svh, at least 240px, sized in px so larger text leaves the steps the room), with a band under the drone for the sticks, whose pads are framed and crossed by muted lines (3:1 against the ground); the step controls scroll with the steps (pinning both would leave no room to read with larger text), and anything focused or scrolled to keeps clear of the drawing. The parts list is not shown on this sheet.

### Stick Pad

A mode 2 radio's gimbals in the drawing field's lower corners: left Throttle · Yaw, right Pitch · Roll (caps muted label under each). A square hairline pad (rule-strong, ground at 82 % over the drawing) with centre lines and a 1.25rem ink-ringed thumb; 5.5rem; on stacked layouts min(4.5rem, 24vw), level with each other at the top of the band under the drone, labels kept small so two sticks always fit side by side. Each axis is a visually hidden native slider (keyboard and screen readers, value text such as "Roll 40 % right"); the pad shows the focus ring and draws the focused axis' line in ink. Everything but throttle springs back to centre on release, key up, blur or a cancelled pointer.

### Motor Readout

On the moves sheet, a pill per motor beside it on screen: its number in a 1.5rem cell, then its speed ("55 %") in tabular figures. Motors working harder than the others get the redline ring and a filled redline number (this is the current selection's meaning: the motors doing the move); slower ones go muted. Pills keep clear of the sticks and of each other, moving to the nearest free spot in any direction. Each prop carries its spin arrow, whose length is its motor's speed (short at idle, most of a turn at full); the arrows never animate on their own.

### What If Sheet

Sheet 5 of How it works together ("5 of 5"), the moves sheet's frame and pinned phone drawing with four numbered mistakes (Link lost: failsafe, Prop on backwards, Wrong battery, VTX without antenna). Each mistake's text has three parts under small muted caps labels: What happens, Why, How to avoid it. The step controls are Previous step, Next step, **Try it** (disabled while its mistake is on) and **Reset**; on the battery step a 6S / 4S switch takes Try it's place (framed like the chapter switcher, the pressed option in ink with a redline underline). Only one mistake is on at a time: opening another step or leaving the sheet starts over with a healthy drone. Nothing plays by itself. The sticks stay live; with the link lost they move but nothing answers.

### Flight Status

On the what-if sheet, a caps status line at the drawing's top left: "Link OK · 6S", then "Link lost", "4S", "VTX: Warm / Hot / Damaged" as they happen. A lost link and a damaged VTX are in redline (the current mistake); the rest muted.

### Gear Sheet

The third chapter, "The gear you hold and wear" (`/gear/radio`, `/gear/goggles`, `/gear/charger`, sheets 1–3), reached by Next from What if, the masthead's "The gear" link, the ends of the control and video paths, and the intro's radio and goggles. Each sheet is a lesson sheet: title block (chapter, sheet, key numbers), the chapter switcher, a real photo labelled "Real gear", and the four numbered questions. Under question 1, a **Try it** box (sheet fill, rule hairline) holds the sheet's switches, framed like the battery switch (the pressed option in ink with a redline underline): the radio's arm switch (Disarmed / Armed) and mode switch (Acro / Angle); the goggles' Analog / Digital; the charger's Charge / Storage. A line under them says what that setting does and is announced politely. Under question 2, "On the drawing" lists each drawn part as a caps underlined name over its muted note; pointing at, focusing or tapping a name lights its part. Switches and highlight start afresh each time a sheet opens.

### Check a Build Sheet

Held back from the first release (switched off by default; see `src/shared/features.ts`). The fourth chapter, "Plan a build", one sheet (`/check`, sheet 1 of 1, no chapter switcher), reached by the masthead's "Check a build" link and Next from the Charger. Title block (chapter, sheet), a lead, then two numbered questions. **1 Your parts:** a caps summary line ("5 fit · 1 doesn't · 1 to check", announced politely when it changes) beside a caps "See the results" link that moves focus to the results' heading; then hairline fieldsets per part (caps muted legend) in a grid of at least 13rem columns, each field a label over a native select (ground fill, muted edge so it shows at rest, ink on hover); the KV is a typed field with a muted hint; the two video fields are radio choices so "Digital with an analog receiver" wraps instead of being cut; then an outline Reset button. **2 Results:** ruled rows, one per check: the status (a drawn mark and a caps word, **Fits** muted with a tick, **Check this** in ink with a ringed exclamation mark, **Doesn't fit** in redline with a cross: the only redline on the sheet), then the check's caps name, one line of why with the numbers involved, and a sheet reference to the lesson behind it. The status sits beside the text and drops above it when the row is narrow. Pointing at or focusing a row fills it with sheet tone and opens its parts on the 3D drawing (the rest faded, the view not turned). Then the footer.

### Status Marks

Drawn 16 px icons in the drawing's line weight, beside the word that names the status (never colour alone): tick (Fits), ring with an exclamation mark (Check this), cross (Doesn't fit).

### Gear Drawing

On a gear sheet the drawing field shows a flat front view of the gear in place of the 3D drone (no 3D canvas is drawn). Hairline ink outlines (rule-strong for the bodies, muted for detail), each part named by a caps label on a muted leader ending in a dot. The highlighted part, its leader and label turn redline, the only redline on the drawing. The drawing answers the switches: the radio's levers lean the other way, the goggles' screens show a simple view ahead or "No signal", the charger's six cell bars fill to 4.2 V or settle at 3.8 V (muted fill, scaled from 3.3 V) with the pack's voltage on its screen. Changes are instant, not animated. Hidden from assistive technology: the sheet says it all in words. On phones the drawing is pinned above the sheet like the flight sheets' (no stick band) with a narrow margin, and below 30rem of viewport its labels are drawn larger (at least 11 px at 320 px, the screens' words at least 10 px); like the zone markers there, they keep that size when the text is enlarged. Bottom labels sit on two staggered rows so they never meet; "No signal" takes two lines on its small screen.

### Ground and VTX Gauge

On the what-if sheet the camera frames the drone and its fall, and a hairline square (rule-strong) on the floor under the drone marks the ground, drawn in perspective like a datum plane; a disarmed or flipped drone falls (slowed down, like the turns) and rests on it, upside down if it flipped. Over the VTX, while it runs without its antenna, a small gauge of three hairline cells fills with ink as it heats; at Damaged the gauge turns redline. The wrong prop's motor pill (motor 2) carries the redline ring and filled number whatever its speed.

### Path Leader

On a path sheet the drawing opens the frame, lights the current stop's parts in the open look, keeps the path's other parts in Connected Grey and fades the rest. A redline line joins the stops in order, drawn over the model (never hidden behind a part): stretches already passed solid at 45 % opacity (`MODEL_LOOK.leaderPassedOpacity`), the stretch out of the current stop dashed (4 mm dashes) and running toward every stop it feeds (the power path fans out at the ESC and the flight controller), nothing ahead. Each stop reached carries a numbered balloon over the canvas: ground fill with a rule-strong ring, the current one filled redline. Balloons never cover one another: the current one is placed first, then the stops passed, and a balloon that would cover another moves to the nearest free spot with a hairline tail back to its stop. The off-drone ends (Your radio, Your goggles) carry a caps label in a sheet-filled, rule-strong box above their balloon, shown from the start and placed beside the drone's outline on screen (left, else right, above or below), so they never read as a part on board; the leader follows them as the view turns. With reduced motion the dashes hold still; Play still steps. The view turns to the current stop's part as on part sheets.

### Spec Table

A hairline table (rule-strong top, rule between rows) with muted caps headers, caps row labels and Barlow values; stacks into blocks in narrow sheets.

### The 3D Drawing (signature)

The reference quad drawn as linework on carbon. With no sheet open (the overview), every part is drawn plainly: dark tonal fill (sheet, model-motors, model-props) with ink drafting edges (edge threshold 20°), and nothing else is drawn. With a sheet open, each part takes one of three looks:

- **Open:** redline fill with ground edges, the same redline as the selected list row, lit in both places at once.
- **Connected** (the parts its lesson's "What is it connected to?" names): Connected Grey fill (`MODEL_LOOK.connected`, #4a525a) with ink edges.
- **Faded** (everything else): ground fill at 25 % opacity (`MODEL_LOOK.fadedOpacity`) that writes no depth, with rule-strong edges, so it reads as a faint drawing behind the open part. Faded parts stay clickable.

Looks switch at once, without animation. On the Propellers sheet an ink arc with an open arrowhead over each prop shows its spin direction (props in), inside the blade tips. Hovering a part with a mouse gives its parts-list row the row hover look (never redline); touch never hovers.

The camera is fitted to the drone's outline (blade tips, motors, body, battery, antennas; closed and with the stack lifted) for the canvas's shape, looking at the closed drone's middle, so the drone fills the drawing field with the lifted stack still inside it. Each view the camera turns to has its own fitted distance, eased with the turn; a resize keeps the visitor's angle and scales the distance; zoom runs from half to twice the fitted distance. The canvas renders on demand; nothing moves unless the visitor turns it, the selection changes, or a path leader's dashes are running. The viewer sits inside the drawing frame, inset 1.5rem.

## Do's and Don'ts

### Do:

- **Do** take every colour from `tokens.ts` / `tokens.css`, including three.js materials and lights.
- **Do** keep redline to selection, the current sheet, focus and the wordmark's "QUAD".
- **Do** show selection the same way in the list and the model at once, and make it legible without colour (fill, bold, filled balloon).
- **Do** set labels, titles, values and numerals in Barlow Condensed caps, and reading text in Atkinson Hyperlegible at up to 68ch.
- **Do** use structure as ornament: hairline frames, zone markers, numbered balloons, title-block cells.
- **Do** keep a number with its unit (no-wrap groups, U+2011 non-breaking hyphen).
- **Do** keep motion to 180ms ease-out state transitions, collapsed under reduced motion (followed live: switching it on mid-visit applies at once).

### Don't:

- **Don't** use redline for hover, links, headings, warnings or decoration.
- **Don't** select 3D parts with an outline; use the redline fill with ground edges.
- **Don't** let the parts list or any overlay cover the drone on wide screens.
- **Don't** round corners on frames, panels, rows or buttons; the balloon is the only circle.
- **Don't** add shadows, glows, gradients or blur.
- **Don't** box the 3D model in a card beside a docs sidebar, or style it as a neon-on-black HUD.
- **Don't** animate anything on load.
