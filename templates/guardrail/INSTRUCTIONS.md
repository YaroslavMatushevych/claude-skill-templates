# `guardrail`

**Purpose:** Make Claude prove its work before it says it is done.
**Use when:** Claude says "done" or "fixed" without showing proof, or it skips a step when it is in a hurry. Claude loads the skill on its own before it makes such a claim.
**Do not use when:** the task needs a full sequence of steps (use `workflow`), or the rule must hold every single time. A skill is still only an instruction. For a rule that must always hold, add a hook as well.
**Examples:** Never say "done" without a test run; Always show the type-check output; Run the build before saying a fix works
**How it works:** Before Claude makes a claim, it names the claim and names the proof. Then it runs the proof command and compares the output with the claim. If the same check fails twice, Claude stops and reports. The table lists the excuses Claude gives, each with an answer.
**Change:** the rule line at the top, and the command that proves the work in your project. Example: change the rule to `NO "DONE" WITHOUT A PASSING npm test FROM THIS MESSAGE`, and put `npm test` in step 2. Add the excuses Claude really gives you to the table, in its own words.
**Keep:** one rule per skill, because a skill with two rules gets neither one right. Keep the steps (name the claim, get the proof, compare), and keep the table of excuses, because it answers the excuses before Claude uses them.
**Test:** ask Claude to fix a small bug and tell you when it is done. Pass: the answer shows a test run that happened after the fix. Fail: the answer says "done" with no output.
