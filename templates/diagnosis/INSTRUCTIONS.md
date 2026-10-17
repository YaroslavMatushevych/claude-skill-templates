# Instructions for Claude: write a `diagnosis` skill

A diagnosis skill finds the cause of a failure by testing hypotheses one at a time. It is a runbook for the unknown.

## Use this type when

- Something is broken and the cause is not known: a bug, a failing build, a production error.
- Claude tends to guess a fix and change many things at once.

## Do not use it when

- The cause is known. Use `procedure` for the fix.
- The failure is the same each time and has a known fix. Write a `reference` skill with the trap.

## How to write it

1. Keep the order from the template: reproduce, list hypotheses, test one, decide, fix the cause, prove it.
2. Make step 1 strict. Without a reproduction, stop and ask for facts. A fix without a reproduction cannot be checked.
3. Ask for three hypotheses, ranked by likelihood and by cost to check. This stops Claude from locking on the first idea.
4. Allow one change at a time. Say why: two changes at once hide which one worked.
5. Require a proof: a check that failed before the fix and passes after, and a second run of the reproduction.
6. Add a stop condition. Example: three rejected hypotheses. Say what to report: what was tried, what was learned.
7. Add a "Where to look first" list for your system: log places, the command for recent changes, the dashboard. This is the part only you know. Keep it short.

## Check before you finish

- Does the skill force a reproduction before any fix?
- Does it say "fix the cause, not the symptom"?
- Is there a stop condition?
- Did you run it on a bug you already solved, and did it reach the same cause?

## Common failures

- Claude edits code before it reproduces the failure. Make step 1 a gate.
- A fix that hides the error, for example a try/catch. The proof step must catch this.
- No stop. The run burns tokens on guesses. Count the hypotheses.
