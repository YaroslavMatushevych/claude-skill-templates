# Choosing a type

Start with one question: is a skill the right tool?

## Skill or something else

| You need | Use |
|---|---|
| A fact or rule that is always true for the project, under 200 lines | `CLAUDE.md` or `.claude/rules/` |
| A procedure or reference that you need sometimes | A skill |
| A rule that must hold every time, with no exceptions | A hook. Instructions are requests. Hooks enforce. |
| A side task that floods the context, or parallel work | A subagent, or a skill with `context: fork` |
| Access to an outside system or its data | An MCP server. A skill can teach how to use it. |
| The same setup in many repos | A plugin |
| The tone or format of every answer | An output style |

Rule of thumb: the third time you paste the same playbook into a prompt, make it a skill.

Do not write a skill for:

- A one-off task.
- A standard practice that is well documented elsewhere.
- A project convention. Put it in `CLAUDE.md`.
- A rule a script can check. Automate it with a script or a hook. Use the skill only for judgment calls.

## Pick the type

Read the situation in the left column. Take the first row that fits.

| Situation | Type |
|---|---|
| "I keep pasting the same list of steps." | [`procedure`](../templates/procedure/) |
| "Claude acts before it understands what I want." | [`interview`](../templates/interview/) |
| "I want a spec, plan or summary from this conversation." | [`synthesis`](../templates/synthesis/) |
| "I want a second opinion on a change, and it must not edit." | [`review`](../templates/review/) |
| "Claude gets this library or API wrong in the same way each time." | [`reference`](../templates/reference/) |
| "Claude skips this step when it is in a hurry." | [`discipline`](../templates/discipline/) |
| "The session is long and I want a clean restart." | [`handoff`](../templates/handoff/) |
| "Something is broken and I do not know why." | [`diagnosis`](../templates/diagnosis/) |
| "The output always has the same shape." | [`generator`](../templates/generator/) |
| "I have many skills and cannot remember their names." | [`router`](../templates/router/) |

If two types fit, pick the one with the stronger check. A skill with a check Claude can run beats a skill with advice.

## Who starts the skill

- Claude starts it: leave `disable-model-invocation` out. The description is loaded every turn, so keep it short and exact.
- You start it: set `disable-model-invocation: true`. The skill costs no context until you call it. You must remember its name, so list it in a [`router`](../templates/router/).
