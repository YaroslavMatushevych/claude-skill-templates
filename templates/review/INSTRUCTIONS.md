# `review`

**Purpose:** a read-only second opinion, with ranked findings and a verdict.
**Use when:** you want a review before merge, or a check of a plan or a document against criteria.

**Change:** the four checks. Put what matters for your team first. For a pull request by number, add `Bash(gh pr view *) Bash(gh pr diff *)` to `allowed-tools`.
**Keep:** read-only tools, the cap on findings and the verdict line.
**Test:** run it on a change with a known bug. It must find the bug.
