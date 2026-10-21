# `investigate`

**Purpose:** Answer a question about the code, or find why something fails, and show the proof. It does not edit.
**Use when:** you ask "where is X?", "how does Y work?" or "why does Z fail?". The skill runs in its own context, so a long search does not fill your chat. Only a short answer comes back, and your chat waits for it.
**Do not use when:** you want the problem fixed (use `workflow`), or you only need a list of files for the next step (use the `explorer` agent).
**Examples:** Where is the price formatted, and who uses it?; Why does this test fail?; How does login work in this repo?
**How it works:** Claude searches by name, then by usage. For a failure it gets the exact error first. Then it ranks three possible causes and tests the cheapest. The answer comes first and the proof follows: a file and line, or command output.
**Change:** the limit "at most 20 lines" if you want longer answers. For failures in your own system, add a line to step 2 that says where the logs are and which command shows recent changes. Example: "Logs are in `logs/app.log`. Run `git log --since=2.days` to see recent changes."
**Keep:** `context: fork` with `background: false`, because the search stays out of your chat and you still get the answer in the same turn. A forked skill has no chat history, so put the whole question in the input. Keep the blocked tools (`Write`, `Edit`, `NotebookEdit`), because they stop Claude from editing files. A shell command can still write a file. For a hard guarantee, use the `explorer` agent, which has no shell. Keep "every claim has proof", because it lets you check the answer yourself.
**Test:** ask where a feature you know lives. Pass: every file path in the answer exists and the line numbers are right. Fail: a path is missing or invented.
