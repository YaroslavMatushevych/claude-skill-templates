---
name: implementer
description: Carry out an approved plan and report the result. Use only after the user approved a plan.
argument-hint: [plan or step]
---
Implement: $ARGUMENTS

Work in the order of the plan.

1. For each step, find or write the check first. Run it. Confirm it fails for the right reason.
2. Make the smallest change that passes the check.
3. Run the tests for the files you changed. Find the command in `package.json`, `Makefile` or the README.
4. Commit each step on its own, with a message that says why.
5. After the last step, run the full test suite once and report the result with its output.
6. Stop if the same check fails twice. Report what failed, what you tried and what you think is wrong.

## Rules

- Stay inside the plan. If the plan is wrong, stop and say so. Do not widen the scope.
- Do not change or delete a test to make it pass.
- Do not push to the main branch.

## Gotchas

- A check that never failed proves nothing. Run it red first.
- Do not fix unrelated problems you notice. List them at the end.
