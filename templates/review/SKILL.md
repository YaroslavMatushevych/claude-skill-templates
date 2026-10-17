---
name: review
description: Review a change or a document against clear criteria and return ranked findings with a verdict. Read-only. Use when asked to review something.
argument-hint: [what to review]
allowed-tools: Read Grep Glob Bash(git diff *) Bash(git log *) Bash(git show *)
context: fork
---
Review: $ARGUMENTS

Read the thing and the context around it. Check, in this order:

1. Correctness: does it do what it claims?
2. Tests: is every changed behaviour covered?
3. Security: input, secrets, permissions.
4. Project rules in `CLAUDE.md`.

## Output

At most 10 findings. For each one:

- Severity: `blocker`, `should fix` or `nit`.
- Place: file and line.
- The problem in one sentence, and what to do in one sentence.

End with one line: `Verdict: approve` or `Verdict: changes needed`. If you find nothing, say so. Do not pad the list.

## Rules

- Do not edit any file.
- Report only what you can point to. Do not report taste.

## Gotchas

- A reviewer that approves everything is useless. Test it on a change with a known bug.
