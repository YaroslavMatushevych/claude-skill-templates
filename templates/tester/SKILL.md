---
name: tester
description: Write failing tests from acceptance criteria and run them. Use when a change has criteria but no tests yet, or when asked to add test coverage.
argument-hint: [acceptance criteria]
---
Write tests for: $ARGUMENTS

1. Turn each criterion into one test case in plain words. Show the list. Remove a case that cannot fail.
2. Find the project's test style. Read two existing tests next to the code. Copy their structure and naming.
3. Test behaviour through the public interface. Do not test private functions or the order of internal calls.
4. Write one test. Run it. Confirm it fails for the right reason. Then write the next one.
5. Report the cases, which ones fail, and the output of the run.

## Rules

- Do not write the implementation.
- One behaviour per test. The test name says the behaviour.
- Use the real thing before a mock.

## Gotchas

- A test that passes before any code exists tests nothing. Check that it fails first.
- Tests tied to the implementation break on every refactor.
