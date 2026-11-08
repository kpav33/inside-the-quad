# Inside the Quad — agent guide

Interactive web app that teaches complete beginners how a 5" FPV drone works, part by part, around
an interactive 3D model. Read this file first, then the docs it points to for the task at hand.

## Commands

| Task                      | Command                                        |
| ------------------------- | ---------------------------------------------- |
| Install                   | `pnpm install`                                 |
| Dev server                | `pnpm dev`                                     |
| All fast checks           | `pnpm check`                                   |
| Typecheck / lint / format | `pnpm typecheck` · `pnpm lint` · `pnpm format` |
| Unit tests                | `pnpm test` (`pnpm test:watch`)                |
| End-to-end tests          | `pnpm test:e2e`                                |
| Production build          | `pnpm build`                                   |
| Docker image              | `docker build -t inside-the-quad .`            |

Use **pnpm only**. Never use npm or yarn, and never commit another lockfile.

## Where things are

- `docs/README.md`: index of all docs. Start there when you need context.
- `docs/product/scope.md`: what the app teaches. The source of truth for content.
- `docs/roadmap.md`: sections (milestones) and their status. Pick work from here.
- `docs/architecture/overview.md`: code structure and the rules that keep it clean.
- `docs/decisions/`: architecture decision records (ADRs). Don't reverse one without a new ADR.
- `docs/workflow/`: git, commit messages, testing, definition of done, section reviews.
- `docs/plans/`: one implementation plan per section, written before coding starts.
- `docs/reviews/`: the independent review report for each completed section.

## Rules

1. **Git:** work on a section branch, never on `main`. Commit small, focused, Conventional Commits
   (`docs/workflow/git.md`). Never push to `main`: a section reaches `main` only through a pull
   request, after its independent review and a green CI run.
2. **Done means verified:** a task is done only when `pnpm check` passes and the behaviour has been
   seen working (`docs/workflow/definition-of-done.md`). Report failures honestly.
3. **Tests:** new logic gets unit tests; new user-visible flows get an e2e test
   (`docs/workflow/testing.md`).
4. **Scope:** content comes from `docs/product/scope.md`. Product recommendations, Betaflight
   tuning and flight training are out of scope.
5. **3D model:** the drone is built procedurally in code, one component per part
   (ADR 0002). No external model files without a new ADR.
6. **Design:** visual design is deferred; keep styling minimal and structural until the design
   pass (see roadmap).
7. **Keep docs current:** if you change a convention, structure or decision, update the matching
   doc in the same branch.
