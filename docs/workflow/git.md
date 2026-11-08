# Git workflow and commit messages

## Branches

- `main` is always releasable and is what Coolify deploys. Nobody commits or pushes to it
  directly; it only changes by merging a reviewed section's pull request.
- Each **section** from [../roadmap.md](../roadmap.md) gets one branch, named
  `<type>/<short-kebab-name>`, e.g. `feat/first-slice`, `chore/project-scaffold`.
- Commit early and often on the section branch, and push it whenever useful: every push runs CI.
- Never rewrite `main`'s history. Rewriting an unmerged section branch (e.g. to fix commits that
  fail `pnpm check`) is fine; push it with `git push --force-with-lease`.

## Finishing a section

1. All tasks in the section's plan are done; `pnpm check` and `pnpm test:e2e` pass locally.
2. Run the independent review ([review.md](review.md)). Fix the findings in new commits.
3. Push the branch and open a pull request into `main`:
   `gh pr create --base main --title "<type>: <section summary>"`. The PR body lists the
   section's main changes and links the plan and review.
4. When CI is green, merge with a **merge commit** (not squash or rebase) so the section's commits
   and its boundary both stay visible: `gh pr merge --merge --delete-branch`.
5. Update local `main` (`git switch main && git pull`) and the section's status in the roadmap.

Coolify deploys `main` after the merge, so only CI-tested code is deployed.

### Enforcement

GitHub branch protection is **not enabled** on this repository, so the rules above are kept by
following this process, not enforced by GitHub. Agents must never merge a PR whose checks are
failing or still running: check with `gh pr checks --watch` before `gh pr merge`.

The `pre-push` hook is a local backstop: it blocks any push to `main` unless `ALLOW_MAIN_PUSH=1`
is set. That variable is only for emergencies, such as bootstrapping a new remote.

If protection is turned on later (Settings → Rules → Rulesets), require a pull request, require
the `Typecheck, lint, format, unit tests` and `End-to-end tests (production Docker image)` checks,
block force pushes, and allow merge commits only.

## Commit messages

Commits follow [Conventional Commits](https://www.conventionalcommits.org/). The `commit-msg` hook
runs commitlint and rejects anything that doesn't match.

```
<type>(<optional scope>): <subject>

<body: what changed and why, wrapped at 100 characters>

<footer: BREAKING CHANGE: ..., Refs: #12>
```

**Types:** `feat` (user-visible feature) · `fix` (bug fix) · `docs` · `style` (formatting only) ·
`refactor` (no behaviour change) · `perf` · `test` · `build` (dependencies, bundler, Docker) ·
`ci` · `chore` (tooling, config, housekeeping) · `revert`.

**Scopes** (optional, lower case, words joined with hyphens) name the area: `drone-viewer`, `drone-model`, `content`,
`lesson`, `deps`, `docker`, `ci`, `docs`.

**Subject rules:**

- Imperative mood, lower case, no full stop: `add motor lesson`, not `Added motor lesson.`
- At most 72 characters for the whole header.
- Says what the commit does, specifically: `fix(drone-viewer): stop camera clipping into frame`,
  not `fix stuff` or `update files`.

**Body:** required whenever the reason isn't obvious from the subject. Explain _why_ and any
trade-offs, not a line-by-line list of the diff.

**One logical change per commit.** Formatting, refactors and behaviour changes go in separate
commits. Every commit should pass `pnpm check` on its own.

### Good examples

```
feat(drone-model): add procedural motor with stator and bell

The bell is a separate mesh so the lesson can spin it independently
of the stator when explaining how brushless motors work.
```

```
build(deps): pin typescript to 6.0

typescript-eslint does not support TypeScript 7 yet.
```

### Hooks

| Hook         | Runs                                                                                                                          |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `pre-commit` | lint-staged: ESLint and Prettier on staged files                                                                              |
| `commit-msg` | commitlint                                                                                                                    |
| `pre-push`   | blocks pushes to `main` unless `ALLOW_MAIN_PUSH=1`, then runs `pnpm check` on the working tree (CI checks the pushed commits) |

Don't bypass hooks with `--no-verify`. If a hook is wrong, fix the hook in its own commit.
