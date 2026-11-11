# 0004. Path URLs through our own routing hook

- Status: accepted
- Date: 2026-11-11

## Context

Section 02c gives every part's lesson its own address, so a lesson can be bookmarked, shared and
reached with the browser's Back and Forward. The app has two kinds of page: the overview and one
lesson per part. The options were a router library (React Router, TanStack Router, wouter) or a
small hook over the browser's History API, and hash URLs (`/#vtx`) or path URLs (`/parts/vtx`).

## Decision

Use **path URLs** (`/` and `/parts/<id>`) and **our own hook**, `usePartRoute` in
`src/shared/routing/`, instead of a router library.

Why:

- **Two kinds of page** need no route tree, loaders or nested layouts. The hook is a pure path
  parser plus a store over `pushState` and `popstate`, read with `useSyncExternalStore`, and fully
  unit tested.
- **No new dependency** and nothing more in the first page load.
- **Paths read well** and leave room for later pages (`/intro`, `/simulator`). nginx already serves
  `index.html` for every path, and Vite's base is `/`, so deep links work without server changes.
- **The URL is the selection:** the part explorer reads the open part from the address, so there
  is one source of truth and Back retraces the learner's steps.

## Consequences

- Links are real `<a href>` elements (`PartLink`), handled in the app on a plain click and by the
  browser otherwise, so "open in new tab" works.
- An unknown address is replaced by the overview with a notice, without adding a history entry.
- Revisit this when a page needs nested routes, data loaders or route-level code splitting; at
  that point a router library earns its place, and this ADR is superseded by a new one.
