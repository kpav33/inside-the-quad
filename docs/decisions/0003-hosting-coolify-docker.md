# 0003. Host as a static Docker image on Coolify

- Status: accepted
- Date: 2026-11-08

## Context

The project owner runs a self-hosted Coolify server. The app is fully static.

## Decision

A multi-stage `Dockerfile`: Node 22 + pnpm builds `dist/`, then `nginx:alpine` serves it on port 80. nginx (config in `nginx/`) adds an SPA fallback, long-term caching for hashed assets,
`no-cache` for `index.html`, security headers including a Content-Security-Policy, and a `/healthz`
endpoint used by the Docker health check. CI runs the end-to-end tests against this image.

Coolify builds from the repository using the Dockerfile build pack, deploying `main`.

## Consequences

- Deploys happen when `main` changes. Because `main` only changes through pull requests that
  need green CI (see `docs/workflow/git.md`), every deployed commit has passed CI.
- The official nginx image starts its master process as root and serves requests from
  unprivileged worker processes. Moving to a fully rootless image (listening on a high port) is
  possible later if the server's security policy requires it.
- HTTPS and the domain are handled by Coolify's proxy, not by this image.
