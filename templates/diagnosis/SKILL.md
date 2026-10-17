---
name: my-diagnosis
description: Find the cause of a bug or failure by testing hypotheses. Use when something is broken and the cause is unknown.
argument-hint: [symptom]
---
TEMPLATE: Replace every <...>. Delete every TEMPLATE line. Add the first checks for your own system under "Where to look".

Symptom: $ARGUMENTS

1. **Reproduce.** Find the shortest command or action that shows the symptom. Run it. Write down the exact output. If you cannot reproduce it, stop and ask for more facts.
2. **List hypotheses.** Write three possible causes. Rank them by how likely they are and how cheap they are to check.
3. **Test one hypothesis.** Pick the cheapest. Run one check that can prove it wrong. Change only one thing at a time.
4. **Decide.** Confirmed: go to step 5. Rejected: cross it out and write what you learned. Go back to step 3.
5. **Fix the cause.** Do not fix the symptom. Explain in one sentence why this change removes the cause.
6. **Prove it.** Write a check that failed before the fix and passes after it. Run the reproduction from step 1 again.
7. Stop after three rejected hypotheses. Report what you tried and what you learned. Ask the user for the next lead.

## Where to look first

- <Log location for this system.>
- <The command that shows recent changes.>

## Gotchas

- <A cause that looked like the problem and was not.>
