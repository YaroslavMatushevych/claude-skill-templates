# `implementer` agent

**Purpose:** build an approved plan. It is the only agent here that can edit.
**Use when:** a plan is approved and you want it built without watching every step.

**Change:** `maxTurns`, the branch rule if your team allows pushes, and the test command if it is not in `package.json`, `Makefile` or the README. Add `skills:` with the skill that defines your steps, for example a `workflow` skill.
**Keep:** "check first", "stay inside the plan", "do not change a test to make it pass" and the stop condition. They keep an unattended run safe.
**Test:** give it a plan with one step that cannot pass. It should stop after two tries and report.
