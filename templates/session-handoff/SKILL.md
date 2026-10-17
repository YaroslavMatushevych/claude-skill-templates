---
name: my-session-handoff
description: Write a handoff note so a fresh session can continue the work. Use when the user wants to end or restart a long session.
disable-model-invocation: true
argument-hint: [what the next session will do]
---
TEMPLATE: Replace every <...>. Delete every TEMPLATE line. Keep the sections. A good handoff is short.

Write a handoff note for a fresh session. The next session will do: $ARGUMENTS

Save it as `handoff-<date>-<topic>.md` in the system temp folder, not in the project. Print the full path.

## Sections

1. **Goal.** What we are trying to achieve, in two sentences.
2. **State.** What is done. What is half done. What is not started.
3. **Decisions.** Each decision, with the reason, in one line.
4. **Next steps.** A numbered list. The first step must be something the next session can start now.
5. **Where things are.** Paths, branch names, ticket or pull request links.
6. **Traps.** What looked right and was wrong. What to avoid.

## Rules

- Do not copy what other files already say. Point to the spec, the plan, the issue, the commit or the diff by path or link.
- Write facts only. Do not write a story of the session.
- End with the first message to paste into the new session. It is one or two sentences.

## Gotchas

- <A handoff that failed, and what was missing.>
