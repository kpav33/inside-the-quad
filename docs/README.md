# Docs

| Folder / file                        | What it holds                                              | When to read it                       |
| ------------------------------------ | ---------------------------------------------------------- | ------------------------------------- |
| [product/scope.md](product/scope.md) | What the app teaches, module by module                     | Any content or feature work           |
| [roadmap.md](roadmap.md)             | Sections (milestones), their order and status              | Choosing what to work on next         |
| [architecture/](architecture/)       | How the code is organised and why                          | Before adding or moving code          |
| [decisions/](decisions/)             | Architecture decision records (ADRs)                       | Before changing a tool or approach    |
| [workflow/](workflow/)               | Git, commit messages, testing, definition of done, reviews | Before committing, testing, merging   |
| [plans/](plans/)                     | One implementation plan per section                        | When starting or continuing a section |
| [reviews/](reviews/)                 | Independent review report per completed section            | When merging a section, or auditing   |

## Lifecycle of a section

1. The section is listed in `roadmap.md`.
2. A plan is written in `plans/NN-section-name.md` and agreed before coding.
3. The work happens on a section branch with small Conventional Commits.
4. An independent agent reviews the branch and writes `reviews/NN-section-name.md`.
5. Findings are fixed, the branch merges into `main`, and `main` is pushed.
6. `roadmap.md` is updated.
