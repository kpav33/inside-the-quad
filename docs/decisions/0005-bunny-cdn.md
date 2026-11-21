# 0005. Serve through Bunny CDN in front of Coolify

- Status: accepted
- Date: 2026-11-21

## Context

ADR 0003 hosts the app as a static Docker image on the owner's Coolify server, in one place. A
first visit downloads several hundred kilobytes, compressed (most of it three.js), and visitors may
be anywhere, so serving everything from one server makes a first visit slow far from it. The owner wanted a
European provider, a cost that stays small at low traffic, and no surprise bills.

Options considered:

- **Coolify alone:** simplest, no extra account; every byte comes from one server.
- **Cloudflare Pages or a similar global static host:** free and fast, but a US company and a
  second place to build and deploy the app.
- **Bunny CDN (BunnyWay, Slovenia):** a European CDN that pulls from an existing server. Prepaid
  credit, about $0.01 per GB in Europe and North America, with a $1 monthly minimum per account
  (shared by all of the owner's sites).

## Decision

A Bunny **pull zone** in front of the Coolify app. Coolify still builds and runs the Docker image
from ADR 0003 (the origin); Bunny fetches from it and caches at its edge locations. Visitors use
the pull zone's address (`…b-cdn.net`) until the `insidethequad` domain is bought, then the domain
as a custom hostname on the pull zone, with Bunny's free certificate.

The pull zone respects the origin's cache headers, which the image already sets: hashed assets are
cached for a year, `index.html` is revalidated on every visit. Billing is prepaid without
auto-recharge, with a monthly bandwidth limit on the pull zone, so the worst case is the zone
pausing, never a bill. The steps are in `docs/deploy.md`.

## Consequences

- No change to the image or the build: the CDN is configuration outside the repository.
- The origin (Coolify's own address) stays reachable directly; it serves the same app.
- A deploy needs no CDN step for code: new builds have new asset names, and `index.html` isn't
  cached. Files in `public/` keep their names (`og-image.png`, `robots.txt`), so a changed one
  needs a purge of the pull zone.
- Security headers come from the origin and pass through the CDN unchanged.
- If the zone hits its limit or the credit runs out, the site stops being served until it is
  topped up or the limit raised; the origin address still works as a fallback.
