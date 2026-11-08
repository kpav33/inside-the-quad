# Reviews

Independent review reports, one per section, named like the section's plan. See
[../workflow/review.md](../workflow/review.md) for how reviews are run.

Template:

```md
# Review: section NN — <name>

- Branch: <branch> · Reviewed commit: <sha> · Date: YYYY-MM-DD

## Summary

<two or three sentences: overall state and whether it's ready to merge>

## Checks

| Command       | Result |
| ------------- | ------ |
| pnpm check    |        |
| pnpm test:e2e |        |
| pnpm build    |        |

## Findings

| #   | Severity                    | Area      | Finding | Resolution |
| --- | --------------------------- | --------- | ------- | ---------- |
| 1   | blocking / should-fix / nit | file:line | ...     |            |
```
