---
name: my-plan-interview
description: Interview the user until a plan or design is clear. Use only when the user asks to stress-test a plan before any work starts.
disable-model-invocation: true
argument-hint: [plan or topic]
---
TEMPLATE: Replace every <...>. Delete every TEMPLATE line. Keep the rounds. Change the wording only if you have a reason.

Interview the user about: $ARGUMENTS

1. List the open decisions as a tree. Each decision lists the decisions that depend on it.
2. Ask the whole top level of the tree in one round. Number each question. Give your recommended answer with each question, so the user can reply "agree".
3. If the code or the docs can answer a question, read them. Do not ask the user for a fact you can find.
4. Wait for the answers. Then ask the next level that the answers opened.
5. The interview is done when no open decision is left. Write the agreed decisions as a short list. Ask the user to confirm the list.
6. Start no work until the user confirms the list.

## Gotchas

- <A question that wasted the user's time, and what to ask instead.>
