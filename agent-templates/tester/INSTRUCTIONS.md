# `tester` agent

**Purpose:** Write the failing tests before the code exists.
**Use when:** you have acceptance criteria (what the finished work must do) and you want the tests first, or you want tests added to a change.
**Do not use when:** you want the feature built (use the `implementer` agent), or you want a review of existing tests (use the `reviewer` agent).
**Examples:** Write failing tests for acceptance criteria; Add tests to a function that has none; Cover a bug with a test before you fix it
**How it works:** The agent turns each criterion into one test case in plain words. It reads two existing tests and copies their style. Then it writes one test, runs it and confirms that it fails for the right reason. Then it writes the next one. It reports the cases and the output of the run.
**Change:** the test command and the test style rules for your project. Example: "Use `vitest`. Put tests next to the code in `*.test.ts` files."
**Keep:** "do not write the implementation", so the tests stay independent of the code. Keep "confirm each test fails first", because a test that never failed proves nothing.
**Test:** give it one criterion. Pass: the new test exists, and it fails when you run it. Fail: the test passes at once, or the agent also wrote the feature.
