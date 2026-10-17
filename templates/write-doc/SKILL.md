---
name: my-write-doc
description: Write a [document type] from the current conversation. Use when the user asks for the [document type] after the discussion is done.
disable-model-invocation: true
argument-hint: [output path]
---
TEMPLATE: Replace every <...>. Delete every TEMPLATE line. Keep the section list short. Every section must earn its place.

Write the document from what you already know. Do not interview the user. If a section has no answer in the conversation, write "Open question:" and name the missing fact.

## Sections

1. **Problem.** Who is affected, and what goes wrong. <N> sentences.
2. **Decision.** What we will do. One paragraph.
3. **Scope.** A numbered list. Each item is something a person can check as done or not done.
4. **Out of scope.** What we will not do now.
5. **How we check it.** The tests or the observations that show it works.
6. **Open questions.** What is still unknown, and who can answer.

## Rules

- Describe behaviour. Do not write file paths or code snippets. They go out of date.
- Use the user's own words for the domain terms. Use one word for one thing.
- Save the document to $ARGUMENTS. If no path is given, print it.

## Gotchas

- <A section that came out vague in a past run, and the fix.>
