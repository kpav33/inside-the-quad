# Section review

Every completed section is reviewed by an **independent agent** before it merges into `main`. The
reviewer did not write the code and starts with no context except the repository.

## How to run it

1. Make sure the branch is complete per the [definition of done](definition-of-done.md).
2. Start a fresh agent (a new session or a subagent with no shared context) and give it the prompt
   below, with the placeholders filled in.
3. The reviewer writes its report to `docs/reviews/NN-section-name.md` and commits it as
   `docs(reviews): add review for section NN`.
4. Fix findings in separate commits on the branch. Note each fix (or the reason for not fixing)
   in the report's "Resolution" column.

## Reviewer prompt

```
You are reviewing section NN "<section name>" of the Inside the Quad project, on branch
<branch>, compared with main. You did not write this code.

Read CLAUDE.md, docs/workflow/definition-of-done.md, docs/architecture/overview.md and
docs/plans/NN-<name>.md. Then review `git diff main...<branch>` and the files it touches.

Check:
1. Correctness: bugs, edge cases, error handling, broken behaviour.
2. The plan: is everything it promised done? Anything done that wasn't planned?
3. Architecture rules and ADRs: are they followed?
4. Tests: is new logic tested, and do the tests test real behaviour?
5. Accessibility: keyboard use, roles and labels, and parity with the 3D view.
6. Content accuracy against docs/product/scope.md (FPV facts must be correct).
7. Commit history: Conventional Commits, one logical change per commit, clear messages.
8. Run pnpm check, pnpm test:e2e, pnpm build and docker build . and report the results.

Write the report to docs/reviews/NN-<name>.md using the template in docs/reviews/README.md.
Classify each finding as blocking, should-fix or nit. Only report what you verified; mark anything
uncertain as such. Do not fix code yourself. Put any temporary scripts or files outside the
repository (e.g. a temp directory); the only file you may write in the repo is the report.
```
