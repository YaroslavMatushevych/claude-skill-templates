# `implementer` agent

**Purpose:** Build an approved plan, one small step at a time. It is the only agent here that can edit files.
**Use when:** you approved a plan and want it built without watching every step.

**Change:** max turns, the branch rule if your team allows pushes, and the test command if it is not in `package.json`, the Makefile or the README. To use your own steps, put them in a skill (for example a `workflow` skill) and add it under "Skills it follows".
**Keep:** "write the check first", "stay inside the plan", "never change a test to make it pass" and the stop rule. They keep an unattended run safe.
**Test:** give it a plan with one step that cannot pass. It should stop after two tries and report, not keep looping.
