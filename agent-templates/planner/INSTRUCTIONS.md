# `planner` agent

**Purpose:** Turn a task into a plan you can approve. It only reads.
**Use when:** a change touches more than one file, or you want to approve the approach before anyone writes code. Planning needs judgment, so the agent runs on `sonnet`.
**Do not use when:** the change is one small edit (make it directly), or the plan is already approved and you want it built (use the `implementer` agent).
**Examples:** Plan a feature that touches five files; Plan a rename across the whole code base; Plan a bug fix and its failing test
**How it works:** The agent reads the code that the change touches. It writes the goal and the done condition, then at most 10 steps. Each step is one small change and a check. It lists risks and open questions, and it returns only the plan.
**Change:** the limit of 10 steps and the format of the plan. Example: add the sentence "Each step names the files it changes." To use your own plan format, put it in a skill and add that skill under "Skills it follows".
**Keep:** the tool list `Read, Grep, Glob`, because it stops the agent from editing. Keep "each step has a check", because a step with no check cannot be tested. Keep "do not start the work", so that you approve the plan before any code changes.
**Test:** give it a task that touches two files. Pass: every step has a check and every file it names exists. Fail: a step has no check, or a file is invented.
