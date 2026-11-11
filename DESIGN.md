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

## Colors

A near-monochrome carbon palette with a single warm redline; every colour is a token.

### Primary

- **Redline** (accent): the drafter's correction red. Selected parts-list row (3px left rule and filled balloon), the selected part's fill in the 3D drawing, the focus ring, text selection, and the "QUAD" of the wordmark. Nothing else.

### Neutral

- **Carbon Ground** (ground): page and masthead background; also the text colour on redline fills and the edge colour of the selected 3D part.
- **Lifted Sheet** (sheet): panels that sit on the drawing: parts list, title block. Also the 3D frame's fill.
- **Hairline** (rule): internal rules between rows and cells, the masthead underline, and the selected row's fill.
- **Frame Line** (rule-strong): outer frames (drawing frame, parts list, title block, spec table top), outline-button border, unselected balloon ring, scrollbar thumb.
- **Drafting Ink** (ink): reading text, values, and the 3D model's edge lines; also the hover border colour.
- **Graphite** (muted): secondary text: column headers, cell labels, hints, zone markers, tagline, question balloon numerals, link underlines at rest.
- **Part Fills** (model-motors, model-props, model-esc, model-fc, model-battery, model-strap, model-receiver, model-camera, model-vtx, model-extras): 3D-only fills, small tonal steps around the sheet so parts separate without colour.
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

**The Unbroken Value Rule.** A number is never split from its unit. Title-block spec values are each a no-wrap group joined by " · ", and copy uses U+2011 (non-breaking hyphen) for "5-inch".

## Layout

Spacing is a 7-step scale (0.25, 0.5, 0.75, 1, 1.5, 2, 3rem); touch targets are at least 2.75rem, parts-list rows 3rem.

**Wide (when the main area is at least 56rem wide, a container query, so enlarged text falls back to the stacked layout):** a two-column grid filling the viewport under a thin masthead: the drawing field on the left (flexible) and the sheet column on the right (20 to 36rem, and at most 44 % of the width so mid-size windows keep a two-column parts list), which scrolls on its own with a stable gutter. The drawing frame fills the field as a grid: the canvas (zone markers 1 to 4 along its top, A to C down its left edge, drawing hint at its lower right) fills the space above, and the parts list sits in its own row across the bottom.

**Narrow:** a single scrolling column: masthead, a drawing frame of 40svh (min 15rem), the parts list full width, then the sheet. One finger scrolls the page over the drawing; two fingers turn it. The hint text switches to touch wording under `(hover: none) and (pointer: coarse)`.

**Parts list columns:** the parts list runs down two columns when the drawing field (a container query on the field, not the page) is at least 28rem wide, and three from 40rem, filled top to bottom, each column with its own headings and a hairline between them. Narrower fields keep one column. With a fine pointer the rows are 2.5rem; touch keeps 3rem.

**Sheet column:** title block, part title with the close button, then the four questions as a 2rem balloon gutter plus body, 2rem apart. The spec table becomes stacked label/value/meaning blocks when the sheet is narrower than 32rem (container query).

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

### Text links (in-lesson connections)

Ink text with a muted underline (0.2em offset) that turns ink on hover. Never redline.

### Navigation: Parts List

The drawing's parts list is the part picker.

- **Frame:** sheet fill, rule-strong frame; muted caps heading and ITEM / PART / QTY column header row, each over a hairline.
- **Rows:** a 2.5rem / 1fr / 3rem grid, 3rem tall, hairline between rows. Two or three columns on wider drawing fields, 2.5rem tall with a mouse (see Layout). Balloon item number, part name in body, quantity right-aligned.
- **Hover:** faint rule-tinted fill (45% rule) and the balloon ring turns ink.
- **Selected:** rule fill, 3px redline left rule, redline-filled balloon with ground numeral, bold name. Exposed as `aria-pressed`.

### Title Block

The sheet's identity in a strict hairline module grid: three cells (Part, Sheet "n of N", Qty) over a full-width Spec cell. Sheet fill, rule-strong frame, rule dividers, 0.5rem 0.75rem cell padding; muted caps label over a Barlow value. Spec values are no-wrap groups separated by " · ". On the overview it shows the reference quad and "Overview".

### Balloons and Questions

Each lesson answers four questions, numbered 1 to 4 in muted ring balloons, heading in title caps beside it, body indented under the heading.

### Spec Table

A hairline table (rule-strong top, rule between rows) with muted caps headers, caps row labels and Barlow values; stacks into blocks in narrow sheets.

### The 3D Drawing (signature)

The reference quad drawn as linework on carbon. Unselected parts: dark tonal fill (sheet, model-motors, model-props) with ink drafting edges (edge threshold 20°). Selected part: redline fill with ground edges, the same redline as the selected list row, lit in both places at once. The canvas renders on demand; nothing moves unless the visitor turns it or the selection changes. The viewer sits inside the drawing frame, inset 1.5rem.

## Do's and Don'ts

### Do:

- **Do** take every colour from `tokens.ts` / `tokens.css`, including three.js materials and lights.
- **Do** keep redline to selection, the current sheet, focus and the wordmark's "QUAD".
- **Do** show selection the same way in the list and the model at once, and make it legible without colour (fill, bold, filled balloon).
- **Do** set labels, titles, values and numerals in Barlow Condensed caps, and reading text in Atkinson Hyperlegible at up to 68ch.
- **Do** use structure as ornament: hairline frames, zone markers, numbered balloons, title-block cells.
- **Do** keep a number with its unit (no-wrap groups, U+2011 non-breaking hyphen).
- **Do** keep motion to 180ms ease-out state transitions, collapsed under reduced motion.

### Don't:

- **Don't** use redline for hover, links, headings, warnings or decoration.
- **Don't** select 3D parts with an outline; use the redline fill with ground edges.
- **Don't** let the parts list or any overlay cover the drone on wide screens.
- **Don't** round corners on frames, panels, rows or buttons; the balloon is the only circle.
- **Don't** add shadows, glows, gradients or blur.
- **Don't** box the 3D model in a card beside a docs sidebar, or style it as a neon-on-black HUD.
- **Don't** animate anything on load.
