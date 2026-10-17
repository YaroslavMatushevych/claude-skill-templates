# `reviewer`

**Role:** a read-only second opinion on a change.
**Use when:** you want a review before merge, or you want a different pair of eyes on what `implementer` made.
**Previous role:** `implementer`.

**Change:** the checks (step list) to match what matters in your team. For a pull request by number, add `Bash(gh pr view *) Bash(gh pr diff *)` to `allowed-tools`.
**Keep:** read-only tools, the cap on findings and the verdict line.
**Test:** run it on a change with a known bug. It must find the bug.
