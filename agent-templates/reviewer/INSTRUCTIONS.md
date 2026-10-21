# `reviewer` agent

**Purpose:** A second opinion on a change, from an agent that cannot change anything. It has no shell. You pass it the diff in your message.
**Use when:** the implementer finishes, or before any merge. A missed problem costs more than a few cents, so the agent runs on `sonnet`. Get the diff with `git diff main...HEAD` and put it in your message.
**Do not use when:** you want a review that can run `git` itself (use the `review` skill), or you want the problems fixed (use the `implementer` agent).
**Examples:** Review the diff before you merge; A second look at a risky change; Check a change against your rules
**How it works:** The agent reads the diff and the code around it. It checks four things in order and returns at most 10 findings. Each finding has a severity, a place and a fix. The last line is the verdict: approve or changes needed.
**Change:** the four checks, in the order that matters for your team. Example for a public API: put "Breaking changes for callers" first.
**Keep:** no `Edit`, `Write` or `Bash` in the tool list, because the list is what makes the agent read-only. A pattern such as `Bash(git diff *)` does NOT limit Bash. If you add `Bash`, the agent can run any command. Keep the limit of 10 findings, and keep the verdict line.
**Test:** run it on a change where you know there is a bug. Pass: the bug is in the findings, with the right file and line. Fail: the agent approves the change, or it lists only style points.
