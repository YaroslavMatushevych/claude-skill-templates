# `explorer`

**Role:** finds things in the code and reports short, with proof.
**Use when:** you ask "where is X?" or "how does Y work here?". It runs in its own context, so the search does not fill your session.
**Next role:** `planner`.

**Change:** the line cap, if you want longer answers. You can also set `model: haiku` in an agent that uses this skill, because searching is cheap work.
**Keep:** `allowed-tools: Read Grep Glob`. This is what makes it read-only.
**Test:** ask where a known feature lives. Check that every path it gives exists.
