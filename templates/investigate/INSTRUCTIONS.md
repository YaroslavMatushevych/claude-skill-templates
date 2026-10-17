# `investigate`

**Purpose:** Answer a question about the code, or find why something fails, and show the proof.
**Use when:** you ask "where is X?", "how does Y work?" or "why does Z fail?". It runs in its own context, so the search does not fill your session.

**Change:** the length limit ("at most 20 lines") if you want longer answers. For failures in your system, add two lines at the end: where the logs are, and the command that shows recent changes.
**Keep:** the blocked tools (`Write`, `Edit`, `NotebookEdit`) and the rule "every claim has proof". Blocking those tools stops Claude from editing files. A shell command can still write a file. For a hard guarantee, use the `explorer` agent, which has no shell.
**Test:** ask where a feature you know lives. Check that every file path in the answer exists.
