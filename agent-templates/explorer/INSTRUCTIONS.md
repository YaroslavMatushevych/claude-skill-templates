# `explorer` agent

**Purpose:** find where things are in the code, cheaply and fast. It only reads.
**Use when:** another agent or you need the right files before you answer a question or plan a change. Searching is cheap work, so this agent runs on `haiku`.

**Change:** the line cap (20) and `maxTurns` if your code base is large.
**Keep:** `tools: Read, Grep, Glob`. The tool list is the guard. "Do not edit" in the prompt is only a request. Keep "do not answer the question", so the main session stays in charge.
**Test:** ask for a known feature. Every path it returns must exist.
