# `workflow`

**Purpose:** do a repeatable task in fixed steps, with a check on each step.
**Use when:** you do the same task in the same order again and again. Examples: ticket to pull request, release, migration, dependency update.

**Change:** the steps. Replace steps 2 to 4 with your real steps, from the last time you did the task. Add one rule for the irreversible step, such as a push to `main`, with the reason.
**Keep:** a check on every step, the stop condition (twice) and "stay inside the task".
**Test:** run it on a task where one step cannot pass. It should stop after two tries and report, not loop.
