# `guardrail`

**Purpose:** one rule that Claude tends to skip when it is in a hurry.
**Use when:** Claude says "done" or "fixed" without proof, or skips one step under pressure.

**Change:** the rule line and the command that proves it in your project, for example the test and type-check command. Add the real excuses you see to the table.
**Keep:** one rule per skill, the steps as a gate, and the excuses table. If a rule must hold every time, add a hook too. A skill is still only an instruction.
**Test:** ask Claude to fix a small bug and say when done. It should show a test run from after the fix.
