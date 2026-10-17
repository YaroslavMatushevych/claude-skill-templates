---
name: workflow
description: Carry out a repeatable task in fixed steps and report the result. Use when the user asks for this task by name.
argument-hint: [input]
---
Input: $ARGUMENTS

1. Restate the goal and the done condition in at most 5 lines. If anything is missing, stop and ask.
2. Read what you need before you change anything.
3. For each step, find or write the check first. Run it. Confirm it fails for the right reason.
4. Make the smallest change that passes the check.
5. Run the checks again. Report the result with the output.
6. Stop if the same check fails twice. Report what failed and what you tried.

## Rules

- Stay inside the task. List other problems you notice at the end. Do not fix them.
- Do not change a check to make it pass.

## Gotchas

- A check that never failed proves nothing. Run it red first.
