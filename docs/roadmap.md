# Roadmap

Each section is one branch, one plan in `plans/`, one review in `reviews/`.
Status: `planned` · `in progress` · `in review` · `done`.

| #   | Section                                                                                                                                                             | Branch                       | Status    |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | --------- |
| 00  | Project scaffold and engineering setup                                                                                                                              | `chore/project-scaffold`     | done      |
| 01  | First slice: 3D viewer + frame, motors, props lessons                                                                                                               | `feat/first-slice`           | done      |
| 02  | Design pass (visual design review)                                                                                                                                  | `feat/design-pass`           | done      |
| 02b | Model that teaches: dimensions, callouts, front marker, spin arcs in 3D; drone fills the drawing field; zone markers used or removed; 3D hover mirrored in the list | —                            | planned   |
| 02c | Lookup and navigation: part URLs, next/previous, progress, onboarding; connection links name their target; no duplicated part name                                  | `feat/lookup-and-navigation` | done      |
| 02d | Phones and keyboard: masthead intro link, focus follows the opened sheet, narrow sheets reflow with large or long text, live reduced motion                         | `feat/phones-and-keyboard`   | in review |
| 03a | Power and control parts: ESC, flight controller, battery; exploded stack                                                                                            | `feat/power-and-control`     | done      |
| 03b | Radio and video parts: receiver, camera, VTX and antennas, extras                                                                                                   | `feat/radio-and-video`       | done      |
| 03c | Real parts: a photo of each part (CC-licensed, with attribution) beside its lesson                                                                                  | —                            | planned   |
| 04  | "What is an FPV drone?" intro (Module 1)                                                                                                                            | `feat/intro`                 | done      |
| 05  | How it all works together: simulator (Module 3)                                                                                                                     | —                            | planned   |
| 06  | Gear you hold and wear (Module 4)                                                                                                                                   | —                            | planned   |
| 07  | Compatibility checker                                                                                                                                               | —                            | planned   |

## 01 — First slice (summary)

Goal: prove the whole approach end to end on a small scope.

- Procedural 3D model of the reference 5" quad with frame, motors and props as separate parts.
- Click or tap a part to select and highlight it.
- A lesson panel answering the four questions from the scope (what it does, how it works, what the
  numbers mean, what it connects to) for frame, motors and props.
- Lesson content stored as typed data, separate from components.
- Keyboard-accessible part selection (not only clicking in the 3D view).

The detailed plan goes in `plans/01-first-slice.md` before work starts.
