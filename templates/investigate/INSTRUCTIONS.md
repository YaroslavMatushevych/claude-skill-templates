# `investigate`

**Purpose:** answer a question about the code or a failure, with proof. It does not edit files.
**Use when:** you ask "where is X?", "how does Y work?" or "why does Z fail?". It runs in its own context, so the search does not fill your session.

**Change:** the line cap if you want longer answers. For a failure in your system, add two lines at the end: where the logs are, and the command that shows recent changes.
**Keep:** `disallowed-tools: Write Edit NotebookEdit` and "every claim has proof". The disallowed list blocks the edit tools. It does not stop a shell command from writing a file. For a hard guarantee, use the `explorer` agent, which has no `Bash`.
**Test:** ask where a known feature lives. Check that every path it gives exists.
