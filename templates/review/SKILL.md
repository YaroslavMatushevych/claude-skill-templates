---
name: my-review
description: Review [artifact] and return a ranked list of problems. Use when asked to review [artifact]. Read-only.
argument-hint: [artifact id or path]
allowed-tools: Read Grep Glob Bash(git diff *) Bash(git log *)
context: fork
---
TEMPLATE: Replace every <...>. Delete every TEMPLATE line. Keep the tool list as short as you can. The tool list is the guard. Do not add Edit or Write.

Review: $ARGUMENTS

Read the change and the code around it. Check, in this order:

1. <Correctness: does it do what it claims?>
2. <Missing tests for changed behaviour.>
3. <Security: input, secrets, permissions.>
4. <Project rules from `CLAUDE.md`.>

## Output

Return at most <N> findings. For each one:

- Severity: `blocker`, `should fix` or `nit`.
- Where: file and line.
- What is wrong, in one sentence.
- What to do, in one sentence.

End with one line: `Verdict: approve` or `Verdict: changes needed`.
If you find nothing, say so. Do not invent findings to fill the list.

## Rules

- Do not edit any file.
- Report only problems you can point to in the code. Do not report style taste.

## Gotchas

- <A false alarm this reviewer raised, and how to avoid it.>
