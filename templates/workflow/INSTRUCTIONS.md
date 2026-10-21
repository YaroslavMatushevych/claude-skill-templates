# `workflow`

**Purpose:** Do a repeatable task step by step, with a check after each step.
**Use when:** you do the same task in the same order each time, and you can check every step. Typical tasks are a release, a ticket to a pull request, a dependency update and a database migration. Type `/workflow` to start it. Claude can also start it when your words match the description.
**Do not use when:** the task is a one-off (ask Claude directly), you only want an answer (use `investigate`), or you want a document in a fixed shape (use `generate`). To give a whole approved plan to a separate worker, use the `implementer` agent.
**Examples:** Turn a ticket into a draft pull request; Cut a release: bump the version, write the changelog, tag it; Update a dependency and fix what breaks
**How it works:** Claude states the goal and reads the code. Then it repeats one loop for each step: write a check, watch it fail, make the smallest change, watch it pass. If the same check fails twice, Claude stops and reports what it tried.
**Change:** steps 2 to 4 in the file. Replace them with your real steps, written from the last time you did the task. Example for a release: "Bump the version in `package.json`", "Run `npm test`", "Write the changelog entry from `git log`". Then add one rule for the step that cannot be undone, such as pushing to `main`, with the reason. Example: "Do not push. A person pushes after the review."
**Keep:** a check after every step, because a step with no check looks the same as a step that failed. Keep the stop rule ("stop if the same check fails twice"), because it ends a loop that cannot succeed. Keep "stay inside the task", because otherwise Claude fixes things you did not ask for.
**Test:** run the skill on a task where one step cannot pass, for example a test that always fails. Pass: Claude stops after two tries and tells you which check failed. Fail: Claude keeps trying, or changes the check.
