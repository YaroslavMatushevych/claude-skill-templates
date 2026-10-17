# `explorer` agent

**Purpose:** Find where things are in the code, quickly and cheaply. It only reads.
**Use when:** you or another agent need the right files before answering a question or planning a change. Searching is cheap work, so it runs on the small, fast model (`haiku`).
**Examples:** Find every place that calls an API; Which files handle checkout?; Where are the tests for this module?

**Change:** the length limit (20 lines), and max turns if your code base is large.
**Keep:** the tool list `Read, Grep, Glob`. That list is what stops it from editing. A line in the prompt that says "do not edit" would only be a request. Also keep "do not answer the question", so the main session stays in charge.
**Test:** ask for a feature you know. Every path it returns must exist.
