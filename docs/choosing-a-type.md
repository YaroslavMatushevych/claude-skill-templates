# Choosing a template

First ask: is a skill the right tool?

| You need | Use |
|---|---|
| A fact or rule that is always true for the project | `CLAUDE.md` or `.claude/rules/` |
| A procedure or reference you need sometimes | A skill |
| A rule that must hold every time, with no exceptions | A hook. Instructions are requests. Hooks enforce. |
| A side task that floods the context, or parallel work | A subagent, or a skill with `context: fork` |
| Access to an outside system | An MCP server. A skill can teach how to use it. |
| The same setup in many repos | A plugin |
| The tone or format of every answer | An output style |

Rule of thumb: the third time you paste the same playbook into a prompt, make it a skill.

Do not write a skill for a one-off task, a well-known practice, a project convention (use `CLAUDE.md`), or a rule that a script can check.

## Pick the template

Take the first row that fits.

| Situation | Template |
|---|---|
| "I keep pasting the same steps." | `task-workflow` |
| "Claude acts before it understands me." | `plan-interview` |
| "I want a spec or summary from this conversation." | `write-doc` |
| "I want a second opinion, and it must not edit." | `review-change` |
| "Claude gets this library wrong every time." | `library-traps` |
| "Claude skips this step when it is in a hurry." | `hard-rule` |
| "The session is long and I want a clean restart." | `session-handoff` |
| "Something is broken and I do not know why." | `find-cause` |
| "The files always have the same shape." | `scaffold` |
| "I have many skills and forget their names." | `skill-index` |

If two fit, pick the one with the stronger check.

## Who starts the skill

- Claude starts it: leave `disable-model-invocation` out. The description loads in every turn, so keep it short.
- You start it: set `disable-model-invocation: true`. It costs no context until you call it. List it in a `skill-index`.
