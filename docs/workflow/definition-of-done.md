# Definition of done

## A task (one commit or a few)

- [ ] `pnpm check` passes (typecheck, lint, format, unit tests).
- [ ] New logic has unit tests; changed UI has component or e2e coverage.
- [ ] The behaviour was seen working in the running app (`pnpm dev`), not only in tests.
- [ ] Docs affected by the change are updated in the same branch.
- [ ] Commits follow [git.md](git.md).

## A section (before merging to main)

- [ ] Every task in `docs/plans/NN-*.md` is done or explicitly moved to a later section.
- [ ] `pnpm check`, `pnpm test:e2e` and `pnpm build` pass; `docker build .` succeeds.
- [ ] Keyboard-only use works for every new interaction.
- [ ] The independent review is written to `docs/reviews/NN-*.md` and every blocking finding is
      fixed or has a written reason why not.
- [ ] Roadmap status is updated.
