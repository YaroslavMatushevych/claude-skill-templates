---
name: debugger
description: Find the cause of a bug or failure by testing hypotheses. Use when something is broken and the cause is unknown.
argument-hint: [symptom]
---
Symptom: $ARGUMENTS

1. Reproduce it. Find the shortest command or action that shows the symptom. Run it and keep the exact output. If you cannot reproduce it, stop and ask for more facts.
2. Write three possible causes. Rank them by how likely they are and how cheap they are to check.
3. Test the cheapest one with a check that can prove it wrong. Change one thing at a time.
4. If it is confirmed, go to step 5. If it is rejected, write what you learned and go back to step 3.
5. Fix the cause, not the symptom. Say in one sentence why this change removes the cause.
6. Prove it: a check that failed before the fix and passes after it, and a second run of the reproduction.
7. Stop after three rejected hypotheses. Report what you tried and learned, and ask for the next lead.

## Gotchas

- A try/catch that hides the error is not a fix. The proof in step 6 will catch it.
- Two changes at once hide which one worked.
