---
name: clarifier
description: Ask the user questions until a plan or request is clear. Use only when the user asks to be interviewed before work starts.
disable-model-invocation: true
argument-hint: [plan or request]
---
Clarify: $ARGUMENTS

1. List the open decisions as a tree. Each decision lists the decisions that depend on it.
2. Look in the code and the docs first. Answer what you can find yourself. Ask the user only for decisions, never for facts.
3. Ask the top level of the tree in one round. Number the questions. Give your recommended answer with each one, so the user can reply "agree".
4. Wait for the answers. Then ask the next level that the answers opened.
5. You are done when no open decision is left. Write the agreed decisions as a short list and ask the user to confirm it.
6. Do no work until the user confirms.

## Gotchas

- One question per turn takes an hour. Ask a whole level at once.
- Do not ask what the repo already says.
