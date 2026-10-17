# Instructions for Claude: write a `synthesis` skill

A synthesis skill turns what Claude already knows into a document: a spec, a plan, a summary, a report. It does not ask questions.

## Use this type when

- A discussion is finished and the user wants the result on paper.
- The document has the same sections every time.

## Do not use it when

- The facts are not known yet. Run an `interview` first.
- The output is code or a folder of files. Use `generator`.

## How to write it

1. Set `disable-model-invocation: true`. The user knows when the discussion is done.
2. Write the section list. Keep it short. Remove a section if you cannot say what goes in it.
3. For each section, say what it must contain and how long it is. Example: "Problem: 3 sentences."
4. Write "Do not interview the user" in the skill. Say what to do with a gap: write "Open question:" and name the missing fact.
5. Describe behaviour in the document, not file paths or code. They go out of date fast.
6. Add one section that says how we check it works. A spec with no check is a wish.
7. Say where to save the file. Use `$ARGUMENTS` for the path.
8. Add a rule for words: use the user's domain terms, and one word for one thing.

## Check before you finish

- Can a new person read the output and know what to build?
- Does every scope item have a way to check it is done?
- Are the gaps marked as open questions, not guessed?

## Common failures

- A long numbered list of sections that are all empty. Cut the sections.
- Invented facts. The skill must say that gaps become open questions.
- Code snippets in the document. They are wrong after the next commit.
