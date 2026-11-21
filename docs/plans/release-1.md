# Release 1: Implementation Plan

**Goal:** everything release 1.0.0 needs that can be done in the repository, so that what remains
is connecting the outside services (Coolify, Bunny, the domain) and testing on real devices.

**Branch:** `chore/release-1`. New logic gets a test that fails first.

## Global constraints

- Node 22: prefix node/pnpm commands with `source ~/.nvm/nvm.sh && nvm use >/dev/null &&`.
- No new runtime dependencies. No cookies and nothing stored for analytics.
- Interface text in `src/content/ui.ts`; colours only from the tokens.
- The site's address is not known yet: nothing may hard-code it. It comes from one build setting,
  `VITE_SITE_URL`, and the build must work without it.

## Tasks

1. **Hosting decision.** ADR 0005: Bunny CDN (a pull zone, EU) in front of the Coolify origin.
   It supersedes nothing in ADR 0003 (the image stays) but adds the CDN; 0003 gets a pointer. A
   deploy runbook (`docs/deploy.md`) lists the steps the owner does by hand: the Coolify app,
   the build setting, the pull zone and its limits, the domain, GoatCounter.
2. **Visit counts.** `src/shared/analytics.ts`, following the owner's kajsegradi integration:
   GoatCounter site `insidethequad`, the script from `https://gc.zgo.at/count.js` with
   `no_onload`, the app counting each new path itself (path only, never the query; the same path
   twice counts once), counts made before the script loads held and sent when it does. Only in
   a production build and never on a local address (`localhost`, `127.0.0.1`, `[::1]`), so dev,
   preview and the e2e runs neither load the script nor count.
   - CSP: `script-src` adds `https://gc.zgo.at`; `img-src` and `connect-src` add
     `https://insidethequad.goatcounter.com`.
   - The overview says, in one plain line: visits are counted with GoatCounter, without cookies.
   - Tests: unit tests for the counter, the local-address rule and the loader; an e2e that maps
     a non-local host name to the server, stubs the script and checks the paths counted; the
     Docker run checks the CSP lets the script run.
3. **Link previews and icons (review M3).** A Vite plugin adds Open Graph and Twitter tags to
   `index.html`: title, description and type always; `og:url`, `og:image` and
   `twitter:card=summary_large_image` only when `VITE_SITE_URL` is set, with absolute URLs.
   `public/og-image.png` (1200 × 630) and `public/apple-touch-icon.png` (180 × 180), drawn from
   the app's own drawing-sheet look. `public/robots.txt` allows everything. The Dockerfile takes
   `VITE_SITE_URL` as a build argument. Tests: a unit test of the tag builder with and without
   the address; an e2e that the built page has the tags and the files are served.
4. **Licence and version.** MIT `LICENSE` for the code; `package.json` `license` and version
   `1.0.0`; README says what the licence covers (not the photos or fonts). `CHANGELOG.md` with
   the 1.0.0 release notes.
5. **Docs.** Roadmap: 07 done (held back), a release row. Architecture overview: analytics.
6. **Review.** A Codex check of the branch into `docs/reviews/release-1-branch.md`, then one fix
   pass.

The tag `v1.0.0` and the GitHub release are made after the merge, with the owner's go-ahead.
