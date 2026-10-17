# `workflow`

**Purpose:** Do a repeatable task step by step, with a check after each step.
**Use when:** you do the same task in the same order again and again, for example ticket to pull request, a release, a migration or a dependency update.
**Examples:** Turn a ticket into a draft pull request; Cut a release: bump the version, write the changelog, tag it; Update a dependency and fix what breaks

**Change:** the steps. Replace steps 2 to 4 with your real steps, written from the last time you did the task. Add one rule for the step that cannot be undone, such as pushing to `main`, with the reason.
**Keep:** a check after every step, the stop rule ("stop if the same check fails twice") and "stay inside the task".
**Test:** run it on a task where one step cannot pass. It should stop after two tries and tell you what failed, not keep looping.
