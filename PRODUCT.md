# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Complete beginners to FPV drones: no electronics or RC background assumed. They arrive at three
moments, all equally important:

- **Before buying:** curious and researching, deciding whether and what to buy; often on a phone,
  low commitment.
- **While building:** parts on the bench and a laptop open beside them, looking things up mid-build.
- **After a problem:** something broke or won't work, and they need to understand one specific part
  quickly.

The app must serve both learning (reading a lesson start to finish) and reference use (jumping
straight to one part or one number).

## Product Purpose

Teach beginners how a typical 5" freestyle FPV drone works, part by part, so they understand the
hardware they are buying, building or repairing. Success: a beginner can name each part, say what
it does, read the numbers printed on it, and explain what it connects to.

## Positioning

Learning happens around an interactive 3D model of one reference drone, built procedurally from a
single spec, so every lesson number matches the model and every part can be selected, highlighted
and (later) animated. Each part lesson answers the same four questions: what does it do, how does
it work, what do the numbers mean, what is it connected to.

## Operating Context

- Used on phones while browsing and on laptops next to a workbench.
- Read in short bursts (look up one part) and in longer sessions (work through the lessons).
- Lives alongside community guides (e.g. Oscar Liang's guides) that are deeper and denser.

## Capabilities and Constraints

- Static single-page web app (Vite, React, TypeScript, react-three-fiber), self-hosted on Coolify.
  No backend, accounts or tracking.
- Built so far: every Module 2 part of the 3D reference drone (frame, motors, props, ESC, flight
  controller, battery, battery strap, receiver, camera, VTX and extras), with analog video; select
  a part by clicking it in 3D or with keyboard-accessible part buttons; four-question lesson panel
  per part. Selecting a board under the top plate (ESC, flight controller, receiver, VTX) opens the
  frame as an exploded view. Every lesson has its own address (`/parts/<id>`) for bookmarks and
  sharing, Back and Forward move between lessons, lessons run in sheet order with previous/next,
  and learners can mark lessons as read (kept in this browser only); the overview offers where to
  start or continue. An intro sheet ("What is an FPV drone?", `/intro`) comes before sheet 1: FPV
  vs camera drones, the drone–radio–goggles system with its two links (drawn as a flat diagram),
  sizes drawn to scale, and why 5-inch is the reference. The overview offers it to newcomers.
- A real photo of each part on its lesson sheet: one example of that kind of part, freely licensed
  (CC BY, CC BY-SA, CC0 or public domain only, never non-commercial), credited, stored in the app.
- A second chapter after the parts, "How it works together": three path sheets
  (`/paths/control`, `/paths/power`, `/paths/video`, numbered 1–3) that walk the stops a signal or
  current passes, on the 3D drawing with a redline leader from part to part, step by step or played
  through. The step is in the address, so a lesson opened from a stop leads back to it; clicking
  the drawing picks a stop. The masthead links the chapter as "How it works together".
- Sheet 5 of that chapter, "What if" (`/what-if`): four common mistakes acted out on the drawing
  with live sticks (a lost link and failsafe, a prop on backwards, a 4S pack on this 6S drone, a
  VTX without its antenna), each saying what happens, why, and how to avoid it; Try it, Reset.
- Sheet 4 of that chapter, "How a quad moves" (`/moves`): five guided steps (throttle, roll,
  pitch, yaw, gyro loop) with two virtual sticks like a mode 2 radio, each motor's speed on the
  drawing, and the drone turning in place like an acro quad (slowed down; never flying around).
  Each step plays a short demo (Show me replays it; reduced motion waits for it); Gust knocks the
  drone so the gyro loop can bring it back. On phones the drawing stays pinned above the steps.
- Planned (see `docs/roadmap.md`): how a quad moves (virtual sticks, motor speeds, the gyro loop)
  and "what if" faults, then the gear you hold and wear, and a compatibility checker; later other
  drone sizes and types.
- Content source of truth: `docs/product/scope.md`. Product recommendations, Betaflight tuning and
  flight training are out of scope.
- Terminology: "5-inch", "quad", "FC", "ESC", "VTX", "props in/out", "KV", "S" (battery cells).
  Every term is explained in plain language the first time a lesson uses it.

## Brand Commitments

- Name: **Inside the Quad**.
- Voice: plain, friendly, precise teaching language for complete beginners; no jargon without an
  explanation; no hype.
- Free, non-commercial personal project: no ads, no affiliate links, no sign-up.

## Evidence on Hand

- Lesson content for frame, motors and propellers (`src/content/lessons/`), checked against the
  scope and real-world FPV facts.
- Reference drone spec (`src/shared/domain/drone-spec.ts`).
- No logo, testimonials, user numbers or press exist. Do not fabricate any. The only imagery is
  the real part photos: real photographs from Wikimedia Commons, never shop, manufacturer or
  AI-generated images.

## Product Principles

1. **Understanding over information.** Explain why a part matters before listing its specs.
2. **One drone, consistent truth.** The model and the text always come from the same spec.
3. **The 3D model is a way in, not the only way.** Everything it offers works without it.
4. **Serve the quick lookup as well as the full lesson.** Any part and any number is a few taps away.
5. **Honest and current.** No product recommendations that go stale; link out for buying advice.

## Accessibility & Inclusion

- **WCAG 2.2 AA** throughout: contrast, keyboard operation, focus visibility, screen-reader
  semantics. The part list and lessons are the accessible equivalent of the 3D view.
- **Translation is planned:** copy stays in content data (not in components), and layouts must
  tolerate text 30–40% longer than English.
- Reduced motion was not made a binding commitment; it is still expected as good practice once
  animation is added.
