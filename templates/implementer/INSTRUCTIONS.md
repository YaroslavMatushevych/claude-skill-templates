# `implementer`

**Role:** does the work from an approved plan, one small step at a time.
**Use when:** a plan is approved and you want it built without you watching every step.
**Previous role:** `planner`. **Next role:** `reviewer`.

**Change:** the stop condition (twice) and the branch rule if your team allows pushes. Name your test command if it is not found in the usual files.
**Keep:** "check first", "stay inside the plan" and the stop condition. They keep an unattended run safe.
**Test:** give it a plan with one step that cannot pass. It should stop after two tries and report, not loop.
