# Review: release 1 branch

- Branch: `chore/release-1`
- Reviewed commit: `aff147f99d005a3b9fe3b745c064e13354f8b201`
- Comparison: `git diff main...HEAD`
- Date: 2026-11-21

## Summary

Not ready to merge: the analytics integration transmits queries despite the privacy requirement,
and the hosting documentation gives an incorrect billing guarantee and an unusable apex-domain
instruction for ordinary DNS providers. There are **3 Important, 4 Minor and 1 Nit** findings below.
The release build and existing checks pass; path counting and the production CSP worked in the
additional browser probes, but the committed tests miss several integration failures.

## Important

### I1. A clean `path` does not prevent query strings or sensitive referrers being sent

**Location:** `src/app/analytics.ts:100` (also the privacy claims at lines 8–14 and
`docs/architecture/overview.md:119`).

**What is wrong:** `count({ path })` only overrides GoatCounter's `p` field. The live
[count.js](https://gc.zgo.at/count.js), fetched during this review, independently sets
`q: location.search` in `get_data()` and defaults `r` to `document.referrer`. Both fields are
serialized into the count request. The query is therefore transmitted even though it is absent
from `p`; a same-origin referrer can contain its own query too. The response's Referrer-Policy
does not sanitize an explicit `r` payload field.

**Verified failure:** loaded `/paths/control?email=alice%40example.test` with the same-origin
referrer `/intro?secret=review-only`, using the real script and the repository CSP. The intercepted
beacon contained:

```text
p=/paths/control
q=?email=alice%40example.test
r=http://itq.test:4174/intro?secret=review-only
```

The forced image fallback also included `q`. This violates “query never sent” and can send
personal information present in a shared URL. No requests reached the real counting service.

**Suggested fix:** control the final payload, rather than just the path argument. Use a reviewed
adapter/custom sender that omits `q` and removes sensitive path/query/fragment information from
referrers, or disables referrers. If retaining the upstream script, sanitize its `get_data()`
result before any pending counts flush. Add request-level assertions for both transports,
including a query on the current URL and a same-origin referrer with a query. Changing dashboard
retention settings would not satisfy the requirement that these values never leave the browser.

### I2. Prepaid billing does not guarantee “never a bill” or immediate shutdown at zero credit

**Location:** `docs/decisions/0005-bunny-cdn.md:30` and `docs/decisions/0005-bunny-cdn.md:42`.

**What is wrong:** the ADR promises that disabling auto-recharge makes the worst case a paused
zone, “never a bill.” Bunny explicitly documents negative balances, responsibility for charges
while negative, and delayed account suspension. Its $1 account minimum can continue even while
the account is disabled. A monthly bandwidth limit is useful, but does not turn prepaid credit
into a hard account spending cap. See Bunny's
[negative-balance policy](https://bunny.net/docs/billing/negative-balance.md).

**Concrete failure:** the shared account has little credit left and traffic consumes more before
the next billing calculation, or the monthly minimum accrues. The balance becomes negative with
auto-recharge off; service need not stop immediately, and the owner remains responsible for the
amount. Other zones on the shared account also consume its balance.

**Suggested fix:** remove the unconditional guarantee, document the negative-balance/suspension
behavior and continuing minimum, and distinguish the pull-zone bandwidth limit from an account
budget. Keep the limit and low-balance monitoring as cost controls. This was verified against
provider documentation, not by incurring charges.

### I3. The documented custom hostname is an apex, where an ordinary CNAME is invalid

**Location:** `docs/deploy.md:35`.

**What is wrong:** the example `insidethequad.<tld>` is the root of the purchased domain, but the
runbook tells the owner to create a normal CNAME there. Bunny's own
[custom-hostname guide](https://bunny.net/docs/cdn/custom-hostname.md#root-domains) explains the
apex restriction and provides supported alternatives. A pull zone also has no stable IP for an
A-record workaround.

**Concrete failure:** at a DNS provider without apex flattening/ALIAS support, the registrar
rejects that CNAME because the apex already has required SOA/NS records. The documented public
hostname cannot be connected and SSL activation cannot complete as instructed.

**Suggested fix:** specify a supported apex setup, such as Bunny DNS with CNAME flattening, or
use `www.insidethequad.<tld>` with a CNAME and an apex HTTP redirect. Include DNS propagation and
certificate activation, and set `VITE_SITE_URL` to the resulting public origin. Verified against
the provider guide; no domain or dashboard settings were changed.

## Minor

### M1. Analytics accesses storage, can write it, and throws when storage is blocked

**Location:** `src/app/analytics.ts:104` and `src/app/analytics.ts:100`.

**What is wrong:** the loaded script reads `localStorage.getItem('skipgc')` in its count filter.
It also handles `#toggle-goatcounter` by writing/removing that key. Those operations are outside
this module's control, contrary to the plan's “nothing stored for analytics.” The filter's
storage access is unguarded.

**Verified failure:** with a throwing `window.localStorage` getter, a normal `/intro` visit
produced an uncaught `SecurityError` and no count request. Loading `/intro#toggle-goatcounter`
wrote `skipgc=t`, displayed the upstream alert, and suppressed counting. Ordinary visits read
the key on every count. The app's intentional progress storage is separate from this finding.

**Suggested fix:** use a storage-free analytics sender or a reviewed script variant that removes
the opt-out storage/hash behavior and handles unavailable browser APIs. Add a real-script test
with storage disabled, and verify that analytics makes no storage reads or writes. Simply
catching the exception would contain the error but would not meet the storage-free requirement.

### M2. SPA counts carry the previous sheet's title

**Location:** `src/app/analytics.ts:100` and `src/app/analytics.ts:117`.

**What is wrong:** analytics subscribes before React mounts (`src/main.tsx:19`) and sends
synchronously on history changes. GoatCounter fills in the missing title from `document.title`,
while the new title is only installed by the explorer's effect
(`src/features/part-explorer/PartExplorer.tsx:205`).

**Verified failure:** navigating from Control path to the overview sent `p=/` with
`t=Control path · Inside the Quad`; opening the intro next sent `p=/intro` with
`t=Inside the Quad`. Back/Forward produced the same mismatch. Request paths were correct, but
page labels sent to analytics were wrong. Pending counts can likewise read a later title when
the script finally loads.

**Suggested fix:** derive and capture an explicit title alongside each counted path, or count
from a route/title lifecycle that has committed the destination. Preserve the existing
deduplication. Assert the path/title pairs on navigation and delayed-script flushes.

### M3. The configured build never emits the promised `og:url`

**Location:** `scripts/share-tags.mjs:45`.

**What is wrong:** the site-configured branch emits image metadata but no `og:url`, although the
plan explicitly requires it (`docs/plans/release-1.md:35`). The
[Open Graph specification](https://ogp.me/#metadata) includes it in the required basic metadata
as the object's permanent identity.

**Verified failure:** `VITE_SITE_URL=https://release.example pnpm build --outDir
/tmp/itq-review-site` generated the absolute image URL and large Twitter card but no `og:url`.
A crawler receives incomplete basic metadata even after the operator configures the site.
Consumers must infer the identity from the fetched address; this is not evidence that every
consumer will refuse the preview.

**Suggested fix:** emit the agreed canonical `og:url` when the site is configured, and assert its
presence/value and its absence when unset. Add a build integration check: the present unit tests
only exercise the pure helpers and the e2e build normally has no configured URL.

### M4. The CSP test proves script execution, not count delivery or privacy

**Location:** `e2e/analytics.spec.ts:12` and `e2e/analytics.spec.ts:33`.

**What is wrong:** the stub only records `vars.path`. It never makes a beacon/image request,
reads the real settings, adds the upstream payload fields, or accesses storage. The assertion
can establish that `script-src` permits loading the stub, but cannot establish that endpoint
requests are permitted. The unit loader test (`src/app/analytics.test.ts:108`) uses the same
kind of fake counter. The analytics e2e also omits Back/Forward and unknown-address replacement.

**Verified failure:** ran the existing two analytics tests against a temporary proxy that supplied
the production CSP with the GoatCounter host deliberately removed from **both** `connect-src`
and `img-src`. Both tests still passed, including “the CSP lets the counter run.” The same suite
also passes with the actual privacy/title/storage bugs above.

**Suggested fix:** keep the small stub tests for routing, but add a deterministic integration
test using a reviewed copy of the real script with locally intercepted count endpoints. Assert
a beacon request and a forced image fallback under the production headers, and inspect their
payloads. Add Back/Forward, canonical/unknown replacements, blocked storage and delayed loading.
Do not send test visits to the hosted counter.

## Nit

### N1. The preview generator duplicates the design palette

**Location:** `scripts/share-images.mjs:18`.

**What is wrong:** seven hex colors are copied into `COLORS`, despite the repository rule that
colors come from `src/shared/design/tokens.ts`. They currently match, but this copy is outside
the existing token-mirroring test.

**Concrete failure:** updating a source token and running the documented image-regeneration
command leaves the preview card in the old palette. Verification here was source comparison;
there is no current color mismatch.

**Suggested fix:** have the generator obtain the palette from the source tokens or read the
app's computed CSS custom properties, rather than maintaining another literal palette.

## Verification and limits

Read `CLAUDE.md` and the architecture overview first, then the release plan, workflow/testing
docs, diff, routing implementation, analytics and sharing code/tests, nginx/Docker/CI setup,
release notes and relevant lesson/content data. Implementation files were not edited.

| Check                                                                            | Result                                                                                                                                                                 |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm check`                                                                     | Passed: typecheck, lint, format, 86 test files / 864 tests.                                                                                                            |
| `pnpm test:e2e`                                                                  | Passed against Vite preview: 174 passed, 16 skipped. Includes the new analytics/share tests.                                                                           |
| Production build, URL unset                                                      | Passed as part of the e2e server build; summary card, no image metadata.                                                                                               |
| `VITE_SITE_URL=https://release.example pnpm build --outDir /tmp/itq-review-site` | Passed; inspected generated HTML.                                                                                                                                      |
| `VITE_SITE_URL=not-a-url pnpm exec vite build --outDir /tmp/itq-review-invalid`  | Failed as intended during config loading with the explicit URL validation error.                                                                                       |
| `loadEnv` / URL parsing probes                                                   | `.env.production` is read; process environment takes precedence. Empty/unset works, trailing slash normalizes; non-URLs, subpaths, queries and fragments are rejected. |
| PNG metadata                                                                     | Verified with sharp: preview 1200 × 630, touch icon 180 × 180.                                                                                                         |
| Real GoatCounter browser probes                                                  | Confirmed beacon and forced image fallback, payloads, navigation, stale titles, blocked storage and hash opt-out behavior.                                             |
| Existing analytics tests with deliberately broken endpoint CSP                   | Both passed, confirming M4.                                                                                                                                            |
| Docker build/runtime                                                             | Not run: Docker unavailable. ARG wiring assessed from code and official Docker/Coolify docs.                                                                           |

The live script was fetched from [gc.zgo.at/count.js](https://gc.zgo.at/count.js) on the review
date; SHA-256 `792b7abd26c1fb6ae62906833e09a301251e2641816e69e4f95aba518f3fe3f0`.
Temporary probes and logs were written under `/tmp/itq-review-*` (script snapshot:
`/tmp/itq-count.js`). Browser probes served the production assets locally with the literal nginx
CSP supplied as an HTTP response header and the fetched script fulfilled locally. They
intercepted all count requests, so they verify browser behavior, not hosted dashboard ingestion.

Additional checked conclusions:

- **CSP is correct for the current script.** It calls `navigator.sendBeacon(url)` first, then
  creates an image when the beacon is unavailable/refused; it does not use fetch for counting.
  `script-src` allows `gc.zgo.at`, `connect-src` allows the beacon endpoint and `img-src` allows
  the fallback. Both transports produced intercepted requests without CSP errors under the
  repository policy. No CSP relaxation is needed to fix the findings.
- **Path counting works for the exercised navigation paths.** The real-script sequence was
  `['/paths/control', '/', '/intro', '/', '/intro']` for initial load, two replaced steps,
  close, intro, Back and Forward. `/parts/motors/` canonicalized with one `/parts/motors` count;
  `/moves/999` clamped to `/moves/5` with one `/moves` count. An unknown address was replaced by
  `/` and counted once under `/`, without sending the unknown pathname. A localhost visit loaded
  no analytics script. No path-counting defect was found in these cases.
- **Build-variable plumbing is sound on inspection.** `ARG VITE_SITE_URL` is in the build stage
  before `RUN pnpm build`; it does not need an extra `ENV` to reach that build command. Coolify
  supports passing build variables as Docker build arguments, matching the runbook's build-time
  instruction. Actual Coolify deployment was not performed. Sources:
  [Docker ARG](https://docs.docker.com/reference/dockerfile/#arg),
  [Coolify Dockerfile builds](https://coolify.io/docs/applications/builds/dockerfile), and
  [Vite environment precedence](https://vite.dev/guide/env-and-mode#env-files).
- **No stale-index defect was established from the prescribed cache policy.** nginx assigns
  `no-cache` to the HTML/SPA fallback and one-year immutable caching to hashed `/assets/`.
  `no-cache` requires revalidation; it does not forbid storing a response. Bunny documents
  following origin cache headers, and Smart Cache can explicitly exclude `text/html`. The
  runbook should verify actual edge/browser headers and freshness after a deploy; live CDN
  configuration was not available to inspect. Source:
  [Bunny Smart Cache and origin headers](https://bunny.net/docs/cdn/smart-cache).
- **The other pull-zone basics match provider docs.** Standard pricing for Europe/North America,
  the shared account minimum, routing visitors through enabled regions, the origin hostname
  default and the monthly GB limit/zone disable behavior are documented. Sources:
  [quickstart](https://bunny.net/docs/cdn/quickstart.md),
  [pricing](https://bunny.net/docs/cdn/pricing.md),
  [account minimum](https://bunny.net/docs/billing/add-funds.md#minimum-monthly-usage), and
  [network limits](https://bunny.net/docs/cdn/performance/network-limits.md).
- **Release notes:** the eleven parts, intro, paths/moves/what-if, gear and held-back checker
  agree with the implementation; no additional feature overclaim was found. The cookie-free
  line is consistent with the inspected script, but does not imply storage-free behavior or
  query-free requests. Existing accessibility/reflow tests pass; this review did not certify
  real-device behavior or perform an independent screen-reader audit. MIT scope and the
  README's separate treatment of photos/fonts/packages are consistent on inspection.

## Resolutions

Fixed on the branch after the review; each claim was checked first (the live `count.js` sends
`q: location.search` and the full `document.referrer`, and reads and writes `localStorage`;
Bunny's billing and custom-hostname docs say what I2 and I3 say).

| Finding | Resolution                                                                                                                                                                                                                                                                                  |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I1      | Fixed. GoatCounter's script is gone; the app sends counts itself (`countUrl`, `sendCount`): path, screen size, and only another site's origin as referrer. `script-src` no longer allows `gc.zgo.at`. Unit tests on the address; e2e asserts each count's keys are exactly `p`, `rnd`, `s`. |
| I2      | Fixed. ADR 0005 and `docs/deploy.md` say prepaid isn't a hard cap: negative balance, the continuing minimum, the four-day disable; the bandwidth limit is what caps traffic.                                                                                                                |
| I3      | Fixed. `docs/deploy.md` gives the two supported setups: Bunny DNS with CNAME flattening, or `www.` with a redirect; then certificate, `VITE_SITE_URL`, redeploy, purge.                                                                                                                     |
| M1      | Fixed by I1: no script, so no storage access and no `#toggle-goatcounter`. A unit test checks the sender touches no storage.                                                                                                                                                                |
| M2      | Fixed by I1: counts carry no title, so none can be stale. The dashboard shows paths, which name the sheet.                                                                                                                                                                                  |
| M3      | Fixed. `og:url` is the site's root when `VITE_SITE_URL` is set (one page serves every address); tested both ways.                                                                                                                                                                           |
| M4      | Fixed. The e2e catches the real count requests and covers Back/Forward and an unknown address. Against the Docker image with the count address removed from `connect-src` and `img-src`, the three counting tests fail; with the real CSP they pass.                                        |
| N1      | Fixed. `share-images.mjs` reads the palette from `tokens.css`; the regenerated images are byte-identical.                                                                                                                                                                                   |
