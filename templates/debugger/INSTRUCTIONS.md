# `debugger`

**Role:** finds the cause of a failure. It does not guess a fix.
**Use when:** something is broken and you do not know why: a failing test, a red build, a production error.
**Next role:** `implementer` for a larger fix, or `reviewer`.

**Change:** add two lines at the end for your system: where the logs are, and the command that shows recent changes.
**Keep:** the reproduction first and the stop after three hypotheses.
**Test:** run it on a bug you already solved. It should reach the same cause.
