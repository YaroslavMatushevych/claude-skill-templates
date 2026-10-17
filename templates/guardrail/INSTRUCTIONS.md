# `guardrail`

**Purpose:** Make Claude prove its work before it says it is done.
**Use when:** Claude says "done" or "fixed" without showing proof, or it skips a step when it is in a hurry.
**Examples:** Never say "done" without a test run; Always show the type-check output; Run the build before saying a fix works

**Change:** the rule line at the top, and the command that proves the work in your project, for example your test and type-check command. Add the excuses Claude really gives you to the table.
**Keep:** one rule per skill, the steps (name the claim, get the proof, compare), and the table of excuses. A skill is still only an instruction. If a rule must hold every single time, add a hook as well.
**Test:** ask Claude to fix a small bug and tell you when it is done. It should show a test run that happened after the fix.
