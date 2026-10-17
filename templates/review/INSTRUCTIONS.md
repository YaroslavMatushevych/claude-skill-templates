# `review`

**Purpose:** a second opinion that does not edit, with ranked findings and a verdict.
**Use when:** you want a review before merge, or a check of a plan or a document against criteria.

**Change:** the four checks. Put what matters for your team first.
**Keep:** `disallowed-tools: Write Edit NotebookEdit`, the cap on findings and the verdict line. The disallowed list blocks the edit tools. It does not stop a shell command from writing a file. For a hard guarantee, use the `reviewer` agent, which has no `Bash`.
**Test:** run it on a change with a known bug. It must find the bug.
