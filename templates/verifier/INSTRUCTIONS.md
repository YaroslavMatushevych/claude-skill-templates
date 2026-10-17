# `verifier`

**Role:** one rule: no claim without fresh evidence.
**Use when:** Claude says "done" or "fixed" without proof. Use it as a last step after `implementer`.
**Previous role:** `implementer`.

**Change:** add the real excuses you see to the table. Put the command that proves "done" in your project, for example the test and type-check command.
**Keep:** the rule line and the table. If a rule must hold with no exceptions, add a hook too. A skill is still only an instruction.
**Test:** ask Claude to fix a small bug and say when done. It should show a test run from after the fix.
