---
name: generate
description: Produce one document or message in a fixed shape (goal, details, check, open questions) from what Claude already knows, without asking questions. Use when the user asks for this output by name, usually after a discussion. Do not use when the facts are not known yet.
disable-model-invocation: true
argument-hint: [subject or output path]
model: sonnet
effort: low
---
Subject: $ARGUMENTS

Write the output from what you already know. Do not interview the user. Read the code or files you need first.

## Shape

Use these labels, in this order, each at the start of its own line:

- **Goal:** one sentence.
- **Details:** at most 5 short items.
- **Check:** how we know it is done or true.
- **Open questions:** what is unknown, or "none".

## Rules

- Use only facts you read or were told. Put a gap under Open questions. Never guess.
- Describe behaviour. Do not write code or file paths that will go out of date, unless the output needs them.
- Keep it under 15 lines. Save it to the path in the input. If there is no path, print it.

## Gotchas

- Empty labels. Remove a label you cannot fill, or write "none".
