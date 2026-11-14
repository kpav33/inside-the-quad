# Section 03c — Real parts: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (or
> superpowers:subagent-driven-development) to implement this plan task-by-task, and the
> `impeccable:impeccable` skill for every UI edit (read its `reference/craft-floor.md` immediately
> before editing UI). Steps use checkbox (`- [ ]`) syntax. Branch: `feat/real-parts`.

**Goal:** Every part's lesson sheet shows one real, freely licensed photo under the title block,
with an honest caption and a full credit, stored in the app.

**Architecture:** A hand-run script turns a committed manifest (Commons title, expected licence,
crop) into WebP files in `src/assets/photos/` and a generated `credits.json`. A typed
`PART_PHOTOS` record in `src/content/photos/` joins those with hand-written captions and alt text.
A `PartPhoto` figure in `features/part-explorer` renders it between the title block and question 1.

**Tech Stack:** Node script with `sharp` (dev dependency), TypeScript, React 19, Vite asset imports,
Vitest + Testing Library, Playwright, nginx.

**Spec:** [03c-real-parts-design.md](03c-real-parts-design.md). Read it first; its photo table is
binding.

## Global Constraints

- Node 22: prefix node/pnpm commands with `source ~/.nvm/nvm.sh && nvm use >/dev/null &&`.
- Licences allowed: `CC BY 3.0`, `CC BY 4.0`, `CC BY-SA 3.0`, `CC BY-SA 4.0`, `CC0`,
  `Public domain`. Nothing non-commercial. A fetched licence or author that differs from the
  spec's table stops the work: report it, do not substitute.
- No request to a third party at runtime: every image is a hashed Vite asset served by our nginx.
- Captions say the photo is one example; text lives in `src/content/`; tokens only; no redline in
  the figure.
- Wikimedia API: one batched request for all titles, a generic User-Agent naming no person, back off
  and retry on HTTP 429.
- Each task ends with `pnpm check` passing and a Conventional Commit (header ≤ 72 chars, body
  lines ≤ 100).

## Review Focus

1. **A photo that is slow or fails to load** keeps its space (no layout jump) and shows its alt
   text. Pinned in Task 3's component test (width and height attributes on the image).
2. **Very wide or tall photos** (the VTX strip, a tall crop) never dominate the sheet: the image is
   capped at 22rem tall and scales down whole. Pinned in Task 3's e2e (figure image height ≤ 22rem
   at 390 and 1280 px for every part).
3. **320 px with 200 % text:** caption and credit wrap; no sideways page scroll. Pinned by running
   `e2e/reflow.spec.ts` in Task 3.
4. **Screen readers** hear a description of the picture, not the caption twice. Pinned in Task 2's
   test (alt differs from caption, both non-empty).
5. **The production image** serves the WebP files with the year-long immutable cache and the
   security headers. Pinned in Task 3's addition to `e2e/server.spec.ts`.

---

### Task 1: Photo pipeline and the 11 photos

**Files:** Create `scripts/photos/manifest.json`, `scripts/photos/fetch-photos.mjs`,
`src/assets/photos/<part>-640.webp` and `<part>-1280.webp` (22 files),
`src/content/photos/credits.json`. Modify `package.json` (`sharp` dev dependency, a
`photos:fetch` script, and allowing sharp's build if pnpm asks), `.gitignore`
(`scripts/photos/.cache/`).

**Interfaces:**

- Produces `credits.json`: `Record<PartId, { title: string; author: string; licence: Licence;
licenceUrl: string; sourceUrl: string; cropped: boolean; width: number; height: number }>`,
  width and height of the 1280 file (or of the largest written, if the source is smaller).
- Manifest entry: `{ part, title, licence (expected), crop?: { left, top, width, height } }` in the
  original's pixels.

- [ ] **Step 1:** Write the manifest from the spec's table (exact Commons titles and licences).
- [ ] **Step 2:** Write the script: one batched `imageinfo` request (`extmetadata|url|size`);
      author from `Artist` (HTML stripped; fall back to `Credit`), licence from `LicenseShortName`,
      licence URL from `LicenseUrl` (none for public domain), source = the file's description URL.
      Abort with a clear message if a licence is outside the allowed set or differs from the
      manifest. Download originals into the git-ignored cache, crop, resize to 640 and 1280 px wide
      (never upscale), WebP quality 80, write the files and `credits.json` (sorted keys).
- [ ] **Step 3:** Run it. Expected: 22 WebP files, each under 150 KB; `credits.json` with 11
      entries whose licences match the spec. On a mismatch: stop and report.
- [ ] **Step 4:** Look at all 11 crops at 1280 px (a contact sheet in the scratchpad) and adjust crop
      rectangles until each part fills its frame with no watermark or handwriting where avoidable;
      rerun. Record each crop's reason in the manifest's `note`.
- [ ] **Step 5:** `pnpm check`. `chore(photos): add the real part photos and their fetch script`

### Task 2: Photo records

**Files:** Create `src/content/photos/index.ts`, `types.ts`, `photos.test.ts`. Modify
`src/content/ui.ts` if the figure label is shared.

**Interfaces:**

- Produces: `type Licence = 'CC BY 3.0' | 'CC BY 4.0' | 'CC BY-SA 3.0' | 'CC BY-SA 4.0' | 'CC0' |
'Public domain'`; `interface PartPhoto { src: string; srcLarge: string; width: number;
height: number; alt: string; caption: string; credit: { author: string; licence: Licence;
licenceUrl?: string; sourceUrl: string; cropped: boolean } }`;
  `PART_PHOTOS: Record<PartId, PartPhoto>` (images imported from `src/assets/photos/`, credit
  fields from `credits.json`, caption and alt written here).
- Captions (the ESC and flight controller wording is fixed by the spec):
  ESC: `'One example: a single ESC, one per motor. On most 5″ builds the four sit together on one
4-in-1 board.'`; flight controller: one example, an older board doing the same job. Every caption
  starts `'One example: '`.

- [ ] **Step 1: Failing tests** in `photos.test.ts`: for every id in `PART_IDS` there is a record;
      `alt`, `caption`, `credit.author` are non-empty and `alt !== caption`; every caption starts
      `'One example: '`; `credit.licence` is in the allowed set; `licenceUrl` starts `https://` for
      every licence except `'Public domain'`; `sourceUrl` starts
      `'https://commons.wikimedia.org/wiki/File:'`; width and height are positive integers;
      `cropped` is true exactly for the parts the manifest crops.
- [ ] **Step 2:** Run; fail. Implement; run; pass. `pnpm check`.
- [ ] **Step 3:** `feat(content): describe a real photo for every part`

### Task 3: The figure on the lesson sheet

**Files:** Create `src/features/part-explorer/PartPhoto.tsx`, `PartPhoto.test.tsx`. Modify
`LessonPanel.tsx`, `LessonPanel.test.tsx`, `src/content/ui.ts`, `src/styles/global.css`,
`e2e/explorer.spec.ts`, `e2e/server.spec.ts`. UI via impeccable.

**Interfaces:**

- Consumes: `PART_PHOTOS`, `PartPhoto` type (Task 2).
- Produces: `<PartPhoto photo={PartPhoto} />` → `<figure className="part-photo">` with a muted caps
  label (`UI.photo.label` = `'Real part'`), `<img src srcSet="… 640w, … 1280w"
sizes="(min-width: 56rem) 36rem, 100vw" width height alt loading="lazy" decoding="async">`, and
  a `<figcaption>` holding the caption and the credit line
  `UI.photo.credit({ author, licence, cropped })` with two links: the licence (when it has a URL)
  and "Wikimedia Commons" (the source page). Links carry `rel="noreferrer"`.

- [ ] **Step 1: Failing tests.** `PartPhoto`: renders the img with the record's alt, width, height
      and a `srcset` naming both sizes; the caption text; a link to the licence URL and one to the
      source URL, both `rel="noreferrer"`; "cropped" appears only when cropped; public domain shows
      no licence link. `LessonPanel`: the figure comes after the title block and before the first
      question heading (DOM order); the overview and intro sheets render no `.part-photo`.
- [ ] **Step 2:** Run; fail. Implement. CSS: sheet fill, rule-strong 1px border, padding, image
      `max-height: 22rem; width: 100%; object-fit: contain`, caption in label type, credit muted and
      small, links muted with the existing underline style. No redline.
- [ ] **Step 3:** e2e in `e2e/explorer.spec.ts`: for each of the 11 parts, open its sheet; the
      figure's image has `naturalWidth > 0` and a rendered height ≤ 22rem, at 1280 × 720 and at
      390 × 844. In `e2e/server.spec.ts`: a photo's `/assets/*.webp` URL from a lesson page returns
      200 with `immutable` cache and the security headers (runs against the Docker image in CI).
- [ ] **Step 4:** Run `e2e/reflow.spec.ts`, `e2e/design.spec.ts`; pass. Look at the ESC, VTX and
      Frame sheets at 390, 768 and 1280 px with impeccable; `pnpm check`.
- [ ] **Step 5:** `feat(part-explorer): show a real photo on every lesson sheet`

### Task 4: Docs

**Files:** `PRODUCT.md` (imagery: real part photos, credited, free licences only),
`DESIGN.md` (the Real Part Photo component), `.impeccable/surfaces/…` brief and
`.impeccable/design.json` (component entry), `docs/roadmap.md` (03c `in review`, branch),
`README.md` (photos are third-party works under their own licences; how to refetch with
`pnpm photos:fetch`), `docs/architecture/overview.md` (photo records in `content/photos`, the
script in `scripts/photos`).

- [ ] **Step 1:** Update; `pnpm check`.
- [ ] **Step 2:** `docs: describe the real part photos`

## Acceptance

- `pnpm check`, `pnpm test:e2e` and CI (including e2e against the Docker image) are green.
- Every Review Focus item has its test.
- The user has seen the 11 final crops (contact sheet) before the PR.
- The independent review (Codex gpt-6.1-sol) is written to `docs/reviews/03c-real-parts.md`, each
  finding resolved or deferred, before the PR is opened.
