# Instructions for Claude: write a `task-workflow` skill

A short numbered list of steps, with hard rules and a stop condition. Claude follows the same process on every run.

**Use when:** the user repeats the same task in the same order, and one step is irreversible or easy to skip.
**Not when:** the task is different each time (`plan-interview`, `find-cause`), the output is a document (`write-doc`), or a script can do all of it (`scaffold`).

## Steps

1. Ask for the last real time the user did the task. Write the steps from that run, not from theory.
2. Write each step as one action plus a check: "Do X. Confirm Y." Put the check first where you can, for example a test before the code.
3. Pick one default for every choice. Do not list options.
4. Name the one irreversible action, such as a push to `main`. Write a rule for it, with the reason.
5. Write a stop condition you can count, such as "stop if the tests fail twice", and what to report.
6. Write the description: what the skill makes, and when to use it. Do not list the steps.

## Check

- Every step ends with a check Claude can run or read.
- Nothing explains what Claude already knows.
- You ran it on three real tasks and read the transcripts.
