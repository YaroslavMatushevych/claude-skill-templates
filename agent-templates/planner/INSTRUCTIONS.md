# `planner` agent

**Purpose:** Turn a task into a plan you can approve. It only reads.
**Use when:** a change touches more than one file, or you want to approve the approach before any code is written. Planning needs judgment, so it runs on `sonnet`.
**Examples:** Plan a feature that touches five files; Plan a rename across the whole code base; Plan a bug fix and its failing test

**Change:** the plan length (10 steps) and the format of the plan. To use your own format, put it in a skill and add that skill under "Skills it follows".
**Keep:** the tool list `Read, Grep, Glob`, the rule "each step has a check" and "do not start the work".
**Test:** give it a task that touches two files. Every step must have a check, and every file it names must exist.
