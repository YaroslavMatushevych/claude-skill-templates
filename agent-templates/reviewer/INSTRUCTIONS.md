# `reviewer` agent

**Purpose:** a second opinion on a change. It has no shell, so it cannot change anything. The caller passes the diff in the prompt, for example the output of `git diff main...HEAD`.
**Use when:** after `implementer`, or before any merge. Review is judgment, and a missed problem costs more than a few cents, so it runs on `sonnet`.

**Change:** the checks, in the order that matters for your team.
**Keep:** no `Edit`, `Write` or `Bash` in `tools`, the cap on findings and the verdict line. A pattern such as `Bash(git diff *)` in an agent's `tools` line does NOT limit Bash. If you add `Bash`, the agent can run any command, and it is no longer read-only.
**Test:** run it on a change with a known bug. It must find the bug.
