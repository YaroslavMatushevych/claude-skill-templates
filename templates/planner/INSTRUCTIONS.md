# `planner`

**Role:** turns a clear request into a short plan. It never edits.
**Use when:** a change touches more than one file, or you want to approve the approach before code is written.
**Previous role:** `clarifier`. **Next role:** `implementer`.

**Change:** the plan length (10 lines), and the done condition if your team has a standard one.
**Keep:** "each step has a check" and "do not start the work". The plan is only useful if you can approve it first.
**Test:** give it a two-file change. Every step should have a check and every named file should exist.
