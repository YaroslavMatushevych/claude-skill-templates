# Instructions for Claude: write a `write-doc` skill

Claude turns what it already knows into a document, for example a spec, a plan or a summary. It does not ask questions.

**Use when:** a discussion is finished and the document has the same sections every time.
**Not when:** the facts are not known yet (`plan-interview` first), or the output is code or files (`scaffold`).

## Steps

1. Set `disable-model-invocation: true`. The user knows when the discussion is done.
2. Write a short list of sections. Remove a section if you cannot say what goes in it.
3. For each section, say what it contains and how long it is. Example: "Problem: 3 sentences."
4. Say how to handle a gap: write "Open question:" and name the missing fact. Do not guess.
5. Describe behaviour, not file paths or code. They go out of date.
6. Add a section "How we check it". A document with no check is a wish.
7. Say where to save the file. Use `$ARGUMENTS` for the path.

## Check

- A new person can read the output and know what to build.
- Every scope item can be checked as done or not done.
- Gaps are marked, not invented.
