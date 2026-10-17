---
name: writer
description: Write a document, such as a spec, a plan or a summary, from what is already known. Use when the discussion is done and the user asks for it on paper.
disable-model-invocation: true
argument-hint: [output path]
---
Write the document from what you already know. Do not interview the user. If a section has no answer, write "Open question:" and name the missing fact.

## Sections

1. **Problem.** Who is affected and what goes wrong. Three sentences at most.
2. **Decision.** What we will do. One paragraph.
3. **Scope.** A numbered list. Each item can be checked as done or not done.
4. **Out of scope.** What we will not do now.
5. **How we check it.** The tests or observations that show it works.
6. **Open questions.** What is unknown, and who can answer.

## Rules

- Describe behaviour. Do not write file paths or code. They go out of date.
- Use the user's words for domain terms. One word for one thing.
- Save to $ARGUMENTS. If no path is given, print the document.

## Gotchas

- Invented facts. A gap becomes an open question, not a guess.
- Empty sections. Remove a section you cannot fill.
