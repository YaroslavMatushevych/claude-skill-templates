# `investigate`

**Purpose:** answer a question about the code or a failure, with proof. It never edits.
**Use when:** you ask "where is X?", "how does Y work?" or "why does Z fail?". It runs in its own context, so the search does not fill your session.

**Change:** the line cap if you want longer answers. For a failure in your system, add two lines at the end: where the logs are, and the command that shows recent changes.
**Keep:** `allowed-tools: Read Grep Glob`, which makes it read-only, and "every claim has proof".
**Test:** ask where a known feature lives. Check that every path it gives exists.
