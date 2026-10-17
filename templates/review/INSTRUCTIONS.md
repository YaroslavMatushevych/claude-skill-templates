# `review`

**Purpose:** A second opinion on a change: ranked findings and a verdict. It does not edit.
**Use when:** you want a review before you merge, or a check of a plan or a document against a list of criteria.

**Change:** the four checks in the file. Put what matters most for your team first.
**Keep:** the blocked edit tools, the limit on the number of findings, and the verdict line (approve or changes needed). Blocking stops Claude's edit tools, not shell commands. For a hard guarantee, use the `reviewer` agent, which has no shell.
**Test:** run it on a change where you know there is a bug. It must find the bug.
