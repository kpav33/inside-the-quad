# Git workflow and commit messages

## Branches

- `main` is always releasable and is what Coolify deploys. Nobody commits to it directly.
- Each **section** from [../roadmap.md](../roadmap.md) gets one branch, named
  `<type>/<short-kebab-name>`, e.g. `feat/first-slice`, `chore/project-scaffold`.
- Commit early and often on the section branch. Pushing the section branch is fine (it backs the
  work up and lets CI run); pushing to `main` is not.

## Finishing a section

1. All tasks in the section's plan are done and `pnpm check` and `pnpm test:e2e` pass.
2. Run the independent review ([review.md](review.md)). Fix the findings in new commits.
3. Merge into `main` with a merge commit so the section stays visible in history:
   `git switch main && git merge --no-ff <branch>`. The merge commit message is
   `<type>: <section summary>` and the body lists the section's main changes.
4. Push: `ALLOW_MAIN_PUSH=1 git push origin main`. The pre-push hook blocks pushes to `main`
   without that variable, so it can't happen by accident.
5. Update the section's status in the roadmap.

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

**Scopes** (optional, kebab-case) name the area: `drone-viewer`, `drone-model`, `content`,
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

| Hook         | Runs                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| `pre-commit` | lint-staged: ESLint and Prettier on staged files                           |
| `commit-msg` | commitlint                                                                 |
| `pre-push`   | blocks pushes to `main` unless `ALLOW_MAIN_PUSH=1`, then runs `pnpm check` |

Don't bypass hooks with `--no-verify`. If a hook is wrong, fix the hook in its own commit.
