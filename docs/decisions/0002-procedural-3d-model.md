# 0002. Build the 3D drone procedurally in code

- Status: accepted
- Date: 2026-11-08

## Context

The app's lessons depend on a 3D model of a 5" quad where every part can be selected, highlighted,
exploded apart and animated (motors spinning, signal paths). The two options were modelling it in
Blender and exporting glTF, or building it from three.js geometry in code.

## Decision

Build the model **procedurally in code**: one React component per part (frame, motor, prop, stack,
battery, camera, VTX, receiver, antennas), positioned from a single typed spec of the reference
drone (wheelbase, motor size, prop diameter, stack mount pattern, ...).

Why:

- **Every part is addressable** by construction: selection, highlighting, labels and animation need
  no mesh-name conventions in an exported file.
- **Parametric:** the planned whoop, 3" and 7" drones become new spec objects, not new models.
- **Reviewable:** changes are code diffs that agents and reviewers can read; no binary files.
- **No extra tool:** Blender is not part of the toolchain, and agents can't work in it reliably.

## Consequences

- Visual detail is limited to what simple geometry (boxes, cylinders, extrusions, lathe shapes)
  can express. This suits a teaching model, where clarity beats realism.
- If a part later needs more realism, it can be swapped for a glTF model behind the same component
  interface. That requires a new ADR (file size, licence, asset pipeline).
