# 0003. Host as a static Docker image on Coolify

- Status: accepted
- Date: 2026-11-08

## Context

The project owner runs a self-hosted Coolify server. The app is fully static.

## Decision

A multi-stage `Dockerfile`: Node 22 + pnpm builds `dist/`, then `nginx:alpine` serves it on port 80. nginx adds an SPA fallback, long-term caching for hashed assets, `no-cache` for `index.html`,
basic security headers and a `/healthz` endpoint used by the Docker health check.

Coolify builds from the repository using the Dockerfile build pack, deploying `main`.

## Consequences

- Deploys happen when `main` changes, which matches the rule that `main` only receives reviewed
  sections.
- HTTPS and the domain are handled by Coolify's proxy, not by this image.
