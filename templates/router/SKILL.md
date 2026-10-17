---
name: my-router
description: Show the user-started skills and pick the right one. Use when the user asks which skill to use or what skills exist.
disable-model-invocation: true
argument-hint: [what you want to do]
---
TEMPLATE: Replace every <...>. Delete every TEMPLATE line. The table must list every user-started skill on disk, and no others. A router that lists a skill that is gone, or misses a new one, gives wrong answers.

The user wants to: $ARGUMENTS

## Skills

| Skill | Use it when |
|---|---|
| `/<skill-1>` | <One line. A situation, not a feature.> |
| `/<skill-2>` | <One line.> |
| `/<skill-3>` | <One line.> |

## Steps

1. Read the user's goal. Pick the one skill from the table that fits best.
2. If two skills fit, ask one question that tells them apart. Do not list both.
3. Say the name of the skill and why, in one line. Then call it.
4. If no skill fits, say so. Do not force a match.

## Gotchas

- <Two skills that users confuse, and the question that separates them.>
