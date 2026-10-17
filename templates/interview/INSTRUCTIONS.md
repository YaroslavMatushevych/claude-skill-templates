# Instructions for Claude: write an `interview` skill

An interview skill makes Claude ask questions until a plan is clear. The user starts it. It ends with a list of agreed decisions.

## Use this type when

- Claude tends to start work before it understands what the user wants.
- A plan or a design has many connected decisions.

## Do not use it when

- The user already knows the answer. Use `synthesis`.
- The task is a fixed list of steps. Use `procedure`.

## How to write it

1. Set `disable-model-invocation: true`. The user decides when to be questioned. This also means the skill costs no context until it is called.
2. Keep the round structure from the template: build a tree of decisions, ask one whole level per round, wait, go deeper.
3. Require a recommended answer with every question. The user can then reply "agree". This makes the interview fast.
4. Tell Claude to read the code and the docs for facts. The user answers decisions. Claude finds facts.
5. Define when the interview is done: no open decision is left, and the user confirmed the list. A vague end ("when you understand") makes Claude stop too early.
6. Forbid work before the confirmation. Write it as a step, not as a warning.
7. Add the topic of your user's domain in the Gotchas section after you see the first real run.

## Check before you finish

- Does the skill ask many questions in one round, not one at a time?
- Does every question carry a recommended answer?
- Is the end condition checkable?
- Does the skill say what Claude writes at the end?

## Common failures

- One question per turn. The interview takes an hour. Ask a whole level at once.
- Questions about facts that are in the repo. Tell Claude to look first.
- Claude starts to build while the user is still answering. Keep the "start no work" step.
