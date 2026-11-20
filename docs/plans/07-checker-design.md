# Section 07 — Check a build: Design

Design agreed in conversation on 2026-11-20. The implementation plan will be `07-checker.md`.
Branch: `feat/checker`. The "Later: compatibility checker" part of `docs/product/scope.md`.

## Intent

A beginner planning a first build has a shortlist of parts from shop pages and wants to know,
before buying, whether they fit together (user's words: "beginners planning their first build, to
see which parts fit"). The part sheets already teach the numbers that decide it; this sheet puts
them side by side and checks them, explaining each result and linking back to the lesson.

## Goals

1. One new sheet, **Check a build**, at `/check`, in its own chapter after the gear
   ("Plan a build", one sheet), reachable from a masthead link **Check a build** and by Next from
   the Charger.
2. **A list of parts, each with its key numbers picked from pick lists (user decision)** of the
   common values the lessons teach; only the motor KV is typed (a whole number, 500–5000). It
   starts filled in with the reference drone, so every check passes; **Reset** brings it back.
3. **Seven checks**, each showing **Fits**, **Doesn't fit** or **Check this**, one line saying why
   with the numbers involved, and a link to the lesson that explains it. Only Doesn't fit uses
   redline. A summary line says how many checks fit / don't / need checking.
4. While a check is pointed at or focused, the 3D drawing beside the sheet lights the parts it
   involves (open parts), the rest faded, as the part sheets do.
5. The build lives in the address (query string), so a reload or a bookmark keeps it and it can be
   shared. Nothing is stored on a server or in localStorage. An address with an unknown or
   out-of-list value falls back to the reference value for that field.
6. Phones: works at 320 px with 200 % text, no sideways scroll; pick lists are native `<select>`s.

## Non-goals and anti-goals

- No products, brands, prices or shop links (scope: out of scope); kinds of parts and numbers only.
- No weight, thrust, flight-time or current-draw maths; no Betaflight setup; no wiring diagram.
- No free numbers except KV (user decision: pick lists).
- **Anti-goal:** a verdict that teaches something wrong. Every rule and threshold agrees with the
  lessons (frame, motors, props, ESC, FC, battery, camera, VTX, goggles) and the spec.
- **Anti-goal:** a builder's wizard that recommends parts. The sheet checks what you entered; it
  never proposes a part.

## Approaches

- **A "your build" sheet with all checks at once (user decision)**: matches what a beginner does,
  comparing spec numbers from shop pages; every result has a lesson behind it.
- Swapping parts on the 3D model: very visual, but needs a model of every size of every part and
  covers voltage, KV and video poorly.
- A step-by-step wizard (frame first): teaches build order, but can't answer "does this list
  work?" at once, and its filtered choices read as recommendations. Its order is kept: the list
  runs frame first.

## The parts and their pick lists

Reference values in **bold** (from `REFERENCE_5_INCH`; the new spec values are marked _new_).

| Part         | Field               | Values                                                |
| ------------ | ------------------- | ----------------------------------------------------- |
| Frame        | Size (largest prop) | 3″, **5″**, 7″                                        |
|              | Stack holes         | **30.5**, 25.5, 20 mm                                 |
|              | Camera mount        | 28, 21, **19**, 14 mm                                 |
|              | Motor mount         | **16**, 12, 9 mm                                      |
| FC/ESC stack | Hole spacing        | **30.5**, 25.5, 20 mm                                 |
|              | ESC rated for       | 1–2S, 2–4S, **3–6S**, 3–8S (_new_ `esc.batteryCells`) |
|              | FC rated for        | 1–2S, 2–4S, **3–6S**, 3–8S (_new_ `fc.batteryCells`)  |
| Motors       | Mount               | **16**, 12, 9 mm                                      |
|              | KV                  | typed, **1950**                                       |
| Props        | Size                | 3″, 4″, **5″**, 6″, 7″                                |
| Battery      | Cells               | 2S, 3S, 4S, 5S, **6S**                                |
| Camera       | Width               | 28, 21, **19**, 14 mm                                 |
| VTX          | Video               | **Analog**, Digital                                   |
| Goggles      | Video               | **Analog**, Digital, Digital with an analog receiver  |

## The seven checks

Lights = the parts lit. Three facts from the lessons shape the checks:

- **The voltage check covers the ESC and FC ratings only** (amended after review 07, finding 1).
  On the reference drone the receiver, camera and VTX run from the FC's regulated power, but some
  builds power the VTX straight from the battery, and how they are powered isn't an input. So the
  reason line scopes the result to the ESC and FC and tells the reader to check what their camera
  and VTX need. (This narrows the scope's list, which also named camera and VTX ratings.)
- **A digital VTX comes with its own matched camera** (camera lesson), so with Digital selected the
  camera is that matched one; its width is still checked against the frame.
- **"Digital with an analog receiver" describes what the goggles can do**: their own digital system
  and analog.

| Check          | Fits                                                                                 | Check this                                                                                                                                                                                                                      | Doesn't fit                                                                                   | Lights           |
| -------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------- |
| Stack mounting | stack holes = frame stack holes                                                      | —                                                                                                                                                                                                                               | they differ                                                                                   | frame, fc, esc   |
| Camera width   | camera = frame mount                                                                 | camera narrower (needs adapter brackets)                                                                                                                                                                                        | camera wider                                                                                  | frame, camera    |
| Motor mount    | motor mount = frame motor mount                                                      | —                                                                                                                                                                                                                               | they differ                                                                                   | frame, motors    |
| Prop size      | prop = frame size, or 1″ smaller                                                     | prop 2″ or more smaller (works; frame bigger than it needs)                                                                                                                                                                     | prop larger than the frame size                                                               | frame, props     |
| Voltage        | cells within both the ESC's and the FC's rating                                      | —                                                                                                                                                                                                                               | either rating misses the battery's cells (the line names which)                               | battery, esc, fc |
| Motor KV       | 5″ props: 6S 1750–1950 KV, 4S 2400–2700 KV (the motors lesson's numbers)             | anything else that isn't a Doesn't fit, including other prop sizes and cell counts (the line says the lessons give 4S/6S numbers for 5″ props only; amended after review 07, finding 2: judged on the prop size, not the frame) | 5″ props on 6S with KV ≥ 2400 (they overheat)                                                 | motors, battery  |
| Video system   | analog VTX with analog goggles, or with digital goggles that have an analog receiver | digital VTX with digital goggles, with or without an analog receiver (they must be the same digital system: the line says so, no brands)                                                                                        | analog VTX with digital goggles that have no analog receiver; digital VTX with analog goggles | vtx, camera      |

## Decided calls (mine, for review)

- **Logic** is plain TypeScript in `src/shared/domain/build-check.ts` (types `Build`, `CheckResult`,
  `checkBuild(build): CheckResult[]`, `REFERENCE_BUILD` from the spec), with the reasons' words in
  `src/content/checker.ts`. The query string ↔ `Build` codec lives in the routing layer.
- **Sheet layout:** title block, chapter, a short lead ("Pick your parts' numbers from their
  shop pages…"), the summary line, the results (each a row with its status word and why), then
  the parts list grouped by part, then Reset and the footer. Results come before the parts so the
  answer is in view; on phones the parts follow.
- **Address:** `/check?frame=5&stack=30.5&…`; only fields that differ from the reference are
  written, replaced (not pushed) on each change, so Back leaves the sheet instead of undoing picks.
- **Status words** are text plus a small mark (✓ / ✕ / !) drawn as SVG icons, not colour alone.
  Results announce politely when they change.
- **Read marks:** the sheet can be marked as read like any sheet; the overview counts it.

## What's left to the builder

- Exact wording of each reason, within the facts above; field labels.
- Grouping and look of the parts list and the results, within DESIGN.md.
- The chapter's name, if "Plan a build" reads wrong next to the others.
