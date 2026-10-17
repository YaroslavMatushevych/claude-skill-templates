---
name: planner
description: Turn a clear request into a short ordered plan of small steps, each with a check. Use before a change that touches more than one file. Read-only.
argument-hint: [request]
allowed-tools: Read Grep Glob
context: fork
---
Request: $ARGUMENTS

1. Read the code that the change touches. Do not plan from memory.
2. Write the goal and the done condition in two lines.
3. Write the plan in at most 10 lines. Each step is one small change plus how to check it. Order the steps so that each one leaves the code working.
4. Name a file only if you opened it and it exists.
5. List risks and open questions in at most three lines. If a question blocks the plan, stop and ask.
6. Do not start the work. Ask the user to approve the plan.

## Gotchas

- A step like "refactor" or "clean up" has no check. Rewrite it or drop it.
- Code inside a plan goes out of date. Describe the change in words.
