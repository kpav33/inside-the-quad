# Architecture decision records

One file per decision: `NNNN-short-title.md`. ADRs are not edited after acceptance except to
change their status; a changed decision gets a new ADR that supersedes the old one.

Template:

```md
# NNNN. Title

- Status: proposed | accepted | superseded by NNNN
- Date: YYYY-MM-DD

## Context

## Decision

## Consequences
```

| ADR                                    | Title                                    | Status   |
| -------------------------------------- | ---------------------------------------- | -------- |
| [0001](0001-tech-stack.md)             | Tech stack                               | accepted |
| [0002](0002-procedural-3d-model.md)    | Build the 3D drone procedurally in code  | accepted |
| [0003](0003-hosting-coolify-docker.md) | Host as a static Docker image on Coolify | accepted |
