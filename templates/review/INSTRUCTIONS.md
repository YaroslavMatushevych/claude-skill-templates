# Instructions for Claude: write a `review` skill

A review skill reads a change and returns a ranked list of problems. It runs in a separate context and it cannot edit files.

## Use this type when

- The user wants a second look at a pull request, a diff, a plan or a document.
- The check list is stable: the same few things matter each time.

## Do not use it when

- The user wants the problems fixed. The author or a `procedure` skill does the fix.
- The check can be done by a linter or a test. Automate it.

## How to write it

1. Add `context: fork` so the review runs in its own context and the main session stays small.
2. Set `allowed-tools` to read-only tools. Example: `Read Grep Glob Bash(git diff *)`. The tool list is the guard. A sentence "do not edit files" is only a request.
3. Write the checks in order of cost of a miss. Put correctness first. Put taste last, or leave it out.
4. Write the output format: a limit on the number of findings, and for each finding the severity, the place, the problem and the action.
5. Write the verdict line. A reviewer with no verdict is a list nobody acts on.
6. Write a rule: report only problems you can point to in the code. Say what to do when there are none: say so. Do not pad the list.
7. Add the false alarms you saw to Gotchas. A reviewer that cries wolf gets ignored.
8. If the review needs data, load it with a `!` command line in the skill, for example `!`gh pr diff $0``. Then Claude starts with the data.

## Check before you finish

- Can the skill edit a file? It must not.
- Is the number of findings capped?
- Does every finding point to a file and a line?
- Did you run it on a change you know has a bug, and did it find the bug?

## Common failures

- A long review of style opinions. Cap the list and rank by severity.
- A reviewer that approves everything. Test it with a known bad change.
- The review output is too long for the main session. Cap it and use `context: fork`.
