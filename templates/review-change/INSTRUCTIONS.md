# Instructions for Claude: write a `review-change` skill

Claude reads a change and returns a ranked list of problems. It runs in its own context and cannot edit files.

**Use when:** the user wants a second look at a pull request, a diff, a plan or a document, and the checks are the same each time.
**Not when:** the user wants the problems fixed (`task-workflow`), or a linter or test can do the check.

## Steps

1. Add `context: fork`, so the review does not fill the main session.
2. Set `allowed-tools` to read-only tools, for example `Read Grep Glob Bash(git diff *)`. The tool list is the guard. "Do not edit" in the text is only a request.
3. List the checks in order of what a miss costs. Correctness first, taste last or not at all.
4. Write the output format: a cap on findings, and for each one the severity, the place, the problem and the action.
5. End with a verdict line, for example `Verdict: approve` or `Verdict: changes needed`.
6. Say what to do when nothing is wrong: say so. Do not pad the list.

## Check

- The skill cannot edit a file.
- Every finding points to a file and a line.
- You ran it on a change with a known bug, and it found the bug.
