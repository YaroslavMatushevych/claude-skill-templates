# `planner` agent

**Purpose:** turn a task into a plan that a person can approve. It only reads.
**Use when:** a change touches more than one file, or you want to approve the approach before code is written. Planning is judgment, so it runs on `sonnet`.

**Change:** the plan length (10 steps) and the format of the plan. Add `skills:` with a skill that defines your plan format.
**Keep:** `tools: Read, Grep, Glob`, "each step has a check" and "do not start the work".
**Test:** give it a two-file change. Every step should have a check and every named file should exist.
