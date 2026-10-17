# Instructions for Claude: write a `plan-interview` skill

Claude asks questions until a plan is clear. The user starts it. It ends with a list of agreed decisions.

**Use when:** Claude starts work before it understands what the user wants, or a plan has many connected decisions.
**Not when:** the user already knows the answers (`write-doc`), or the task is a fixed list of steps (`task-workflow`).

## Steps

1. Set `disable-model-invocation: true`. The user decides when to be questioned, and the skill costs no context until then.
2. Keep the rounds from the template: list the decisions as a tree, ask one whole level per round, wait, go deeper.
3. Require a recommended answer with each question, so the user can reply "agree".
4. Tell Claude to read the code and docs for facts. The user answers decisions only.
5. Define the end: no open decision is left, and the user confirmed the list.
6. Add a step that forbids work before the confirmation.

## Check

- Claude asks a whole level at once, not one question per turn.
- Every question has a recommended answer.
- The end condition is checkable.
