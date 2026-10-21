# `explorer` agent

**Purpose:** Find where things are in the code, quickly and cheaply. It only reads.
**Use when:** you or another agent need the right files before you answer a question or plan a change. Searching is cheap work, so the agent runs on the small, fast model (`haiku`). Only a short list comes back, so your chat stays small.
**Do not use when:** you want the question answered with proof (use the `investigate` skill), or you want a plan (use the `planner` agent).
**Examples:** Find every place that calls an API; Which files handle checkout?; Where are the tests for this module?
**How it works:** The agent searches by name, then by usage. It returns file paths with line numbers, function names and the tests that cover them, in at most 20 lines. It also says what it did not find. It does not explain or judge.
**Change:** the line limit (20 lines), and `maxTurns` (15) if your code base is large. At `maxTurns` Claude Code cuts the agent off and marks its output as partial. So the prompt says "stop by turn 12". If you change `maxTurns`, change that number to about 80 percent of it. Example for a monorepo: set `maxTurns` to 25 and add the sentence "Start in the package that the task names."
**Keep:** the tool list `Read, Grep, Glob`. The list is what stops the agent from editing. A line in the prompt that says "do not edit" is only a request. Keep "do not answer the question", so that your main chat stays in charge of the answer.
**Test:** ask for a feature you know. Pass: every path it returns exists and is the right one. Fail: a path is invented, or the agent answers the question instead of listing places.
