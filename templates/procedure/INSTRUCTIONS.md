# Instructions for Claude: write a `procedure` skill

A procedure skill is a short, numbered list of steps with hard rules and a stop condition. Claude follows the same process on every run.

## Use this type when

- The user does the same task again and again, in the same order.
- The task has steps that must not be skipped, and one irreversible step that needs a rule.

## Do not use it when

- The task is different each time. Use `interview` or `diagnosis`.
- The output is a document. Use `synthesis`.
- A script can do the whole task. Use `generator`.

## How to write it

1. Ask the user for the last real time they did this task. Write the steps from that run. Do not invent steps from theory.
2. Write each step as one action with a check. Use this form: "Do X. Confirm Y."
3. Put the check before the work where you can. A test first is the best check.
4. Pick one default for each choice. Do not list options like "use git, gh or hub". If an escape hatch is needed, write it as one extra line.
5. Name the one irreversible action, such as a push to `main`. Write a rule for it, with the reason.
6. Write a stop condition. Example: "Stop if the tests fail twice." Say what to report when it stops.
7. Write the description. It says what the skill makes and when to use it. It does not list the steps.
8. Keep `SKILL.md` under 60 lines. If a step needs more text, put the text in a file and link it from the step.

## Check before you finish

- Can you point to the check at the end of every step?
- Is there exactly one default for every choice?
- Does the skill say what to do when it fails?
- Did you run it on three real tasks and read the transcripts?

## Common failures

- Steps that explain what Claude already knows, such as what a ticket is. Delete them.
- Rules in capital letters with no reason. Write the reason.
- A stop condition that says "if it is hard". Use something countable, such as "twice".
