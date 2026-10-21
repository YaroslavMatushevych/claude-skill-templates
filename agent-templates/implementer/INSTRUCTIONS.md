# `implementer` agent

**Purpose:** Build an approved plan, one small step at a time. It is the only agent here that can edit files and run commands.
**Use when:** you approved a plan and you want it built without watching every step.
**Do not use when:** there is no approved plan yet (use the `planner` agent), or the task is a routine that you run in your own chat (use the `workflow` skill).
**Examples:** Build the plan you just approved; Apply a plan on a branch and open a draft pull request; Carry out a refactor step by step
**How it works:** For each step of the plan, the agent writes a check, watches it fail, makes the smallest change, watches it pass and commits. After the last step it runs the full test suite and reports the output. If the same check fails twice, it stops.
**Change:** `maxTurns` (30) for long plans. At `maxTurns` Claude Code cuts the agent off and marks its output as partial. So the prompt says "stop by turn 26". If you change `maxTurns`, change that number to about 80 percent of it. Change the branch rule if your team allows pushes. Add the test command if it is not in `package.json`, the Makefile or the README. Example: "Run tests with `make test`." To use your own steps, put them in a skill, for example a `workflow` skill, and add it under "Skills it follows".
**Keep:** "write the check first", "stay inside the plan", "never change a test to make it pass" and the stop rule. Together they keep an unattended run safe: the agent cannot make a failing test pass by editing it, and it cannot loop for ever.
**Test:** give it a plan where one step cannot pass. Pass: it stops after two tries and tells you what failed. Fail: it keeps looping, or it edits the test.
