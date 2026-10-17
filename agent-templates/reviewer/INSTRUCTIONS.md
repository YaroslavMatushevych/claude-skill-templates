# `reviewer` agent

**Purpose:** A second opinion on a change. It has no shell, so it cannot change anything. You pass it the diff in your message, for example the output of `git diff main...HEAD`.
**Use when:** after the implementer finishes, or before any merge. Review needs judgment, and a missed problem costs more than a few cents, so it runs on `sonnet`.
**Examples:** Review the diff before you merge; A second look at a risky change; Check a change against your rules

**Change:** the checks, in the order that matters for your team.
**Keep:** no `Edit`, `Write` or `Bash` in the tool list, the limit on findings and the verdict line. A pattern such as `Bash(git diff *)` inside an agent's tools line does NOT limit Bash. If you add `Bash`, the agent can run any command and is no longer read-only.
**Test:** run it on a change where you know there is a bug. It must find the bug.
