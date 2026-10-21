---
name: workflow
description: Carry out a repeatable task in fixed steps, with a check after each step, and report the result with the output of every check. Use when the user names this task or asks you to run it. Do not use for one-off work or for a question.
argument-hint: [input]
model: sonnet
effort: medium
---
Input: $ARGUMENTS

1. State the goal and the done condition in at most 5 lines. If you do not know either one, stop and ask the user.
2. Read the files and the output you need. Do not change anything yet.
3. For each step, find or write a check first. A check is a command or a test that shows the step is done. Run it. Confirm that it fails for the right reason.
4. Make the smallest change that makes the check pass.
5. Run the check again. Then run the checks of the earlier steps. Report each result with its output.
6. Stop if the same check fails twice. Report what failed and what you tried.

## Rules

- Stay inside the task. If you notice other problems, list them at the end. Do not fix them.
- Do not change a check to make it pass.

## Gotchas

- A check that never failed proves nothing. Run it first and watch it fail.
