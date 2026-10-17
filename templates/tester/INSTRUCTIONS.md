# `tester`

**Role:** writes the failing tests, and nothing else.
**Use when:** you have acceptance criteria and want tests before code, or you want coverage added to a change.
**Previous role:** `planner`. **Next role:** `implementer`.

**Change:** nothing for most projects. It copies the test style it finds.
**Keep:** "do not write the implementation" and "confirm it fails first".
**Test:** give it a criterion. The new test must fail when you run it.
