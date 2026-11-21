# Deploying

How release 1 goes live: the Coolify app (the origin, ADR 0003), the Bunny pull zone in front of
it (ADR 0005), and the visit counter. These are steps in other services' dashboards; nothing here
changes the repository.

## 1. Coolify: the origin

1. New resource → the GitHub repository, branch `main`, build pack **Dockerfile**, port **80**.
2. Health check: path `/healthz` (the image's own `HEALTHCHECK` does the same).
3. Build setting (a build variable, not only a runtime one): `VITE_SITE_URL` = the address
   visitors will use, for example `https://insidethequad.b-cdn.net` until the domain exists. It is
   read at build time for link previews; leave it empty and previews have no image. A malformed
   address fails the build on purpose.
4. Deploy. Check `https://<coolify address>/healthz` says `ok` and the app opens.

## 2. Bunny: the pull zone

1. Billing: add a little credit (the minimum is $1 a month, shared by all zones). Leave
   **auto-recharge off**.
2. CDN → Add pull zone: a name like `insidethequad`; origin URL = the Coolify address from step 1;
   tier **Standard**; pricing zones: keep Europe and North America on (the cheapest), and turn on
   others only if you want them faster there.
3. Pull zone → **Limits**: a monthly bandwidth limit, for example 50 GB.
4. Pull zone → **Caching**: cache expiration **respect origin cache-control** (the image sets
   one-year caching for `/assets/` and `no-cache` for the page).
5. Open `https://insidethequad.b-cdn.net`: the app should load, and the response headers should
   include the `Content-Security-Policy` from the origin.

After a later deploy nothing needs purging, except when a file in `public/` changed (the preview
image, `robots.txt`): then **Purge cache** on the pull zone.

## 3. The domain, when bought

1. Pull zone → Hostnames → add `insidethequad.<tld>`; at the registrar, a `CNAME` to the
   pull zone's `…b-cdn.net` host. Turn on the free SSL certificate and force HTTPS.
2. Change `VITE_SITE_URL` in Coolify to `https://insidethequad.<tld>` and redeploy, then purge the
   pull zone.

## 4. GoatCounter

The site `insidethequad` already exists on the owner's account
(https://insidethequad.goatcounter.com). The app counts only on a real address, so the first
visit to the deployed site should show up in the dashboard within a minute. If you want your own
visits left out, GoatCounter's settings can ignore them.

## 5. After going live

- Share a link once in a preview checker (or a chat app) to see the preview image.
- Tag the release: `git tag v1.0.0` on the merged `main`, push the tag, and make a GitHub release
  from `CHANGELOG.md`.
