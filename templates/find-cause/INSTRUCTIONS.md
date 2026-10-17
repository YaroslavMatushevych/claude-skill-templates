# Instructions for Claude: write a `find-cause` skill

Claude finds the cause of a failure by testing hypotheses one at a time.

**Use when:** something is broken and the cause is unknown, and Claude tends to guess a fix and change many things at once.
**Not when:** the cause is known (`task-workflow` for the fix), or the failure always has the same known fix (`library-traps`).

## Steps

1. Keep the order from the template: reproduce, list hypotheses, test one, decide, fix the cause, prove it.
2. Make the reproduction a gate. Without one, Claude stops and asks for facts.
3. Ask for three ranked hypotheses, so Claude does not lock on the first idea.
4. Allow one change at a time. Two changes at once hide which one worked.
5. Require proof: a check that failed before the fix and passes after, plus a second run of the reproduction.
6. Add a stop condition, such as three rejected hypotheses, and what to report.
7. Fill in "Where to look first" for the user's system: logs, recent changes. Keep it short.

## Check

- No fix is allowed before a reproduction.
- The skill says "fix the cause, not the symptom".
- You ran it on a bug you already solved, and it reached the same cause.
