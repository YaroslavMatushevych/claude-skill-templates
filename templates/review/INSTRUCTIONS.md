# `review`

**Purpose:** A second opinion on a change: ranked findings and a verdict. It does not edit.
**Use when:** you want a review before you merge, or a check of a plan or a document against a list of criteria. The skill runs in its own context, so the review does not fill your chat.
**Do not use when:** you want the problems fixed (use `workflow`), or you need a review that cannot run any command (use the `reviewer` agent).
**Examples:** Review a pull request before you merge; Check a plan against your team's rules; Look for risks in a database migration
**How it works:** Claude reads the target and the code around it. If you give no input, it reviews `git diff`. It checks four things in order and lists at most 10 findings. Each finding has a severity, a place and a fix. The last line is the verdict: approve or changes needed.
**Change:** the four checks in the numbered list. Put what matters most for your team first. Example for a payments service: replace check 3 with "Money: rounding, currency and double charges", and move it above "Tests".
**Keep:** `context: fork` with `background: false`, so the review stays out of your chat and the result comes back in the same turn. A forked skill has no chat history, so name what to review. Keep the blocked edit tools, because they stop Claude from editing files. They do not stop shell commands. For a hard guarantee, use the `reviewer` agent, which has no shell. Keep the limit of 10 findings, because a long list hides the serious ones. Keep the verdict line, because it gives you one clear answer.
**Test:** run it on a change where you know there is a bug. Pass: the bug is in the findings, with the right file and line. Fail: Claude approves the change, or lists only style points.
