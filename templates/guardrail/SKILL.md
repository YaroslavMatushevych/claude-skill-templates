---
name: guardrail
description: Makes Claude run a proof and compare it with its claim before it says that work is done, fixed or safe. Use before reporting that work is complete: before saying done, fixed, passing or safe. Do not use for work that has no check to run.
---
```
NO "DONE" WITHOUT EVIDENCE FROM THIS MESSAGE
```

1. Name the claim you are about to make.
2. Name the evidence that proves it. Example: the output of the test command.
3. Run the command now, in full. Read the whole output. If no command can prove the claim, say what you could not check.
4. Compare the output with the claim.
   - It matches: make the claim and show the output.
   - It does not match: say what really happened, and show the output.
5. If the same check fails twice, stop. Report what failed and what you tried.

## Excuses and answers

| Excuse | Answer |
|---|---|
| "It should work." | "Should" is a guess. Run it. |
| "I ran it before my last change." | The last change can break it. Run it again. |
| "It is a small change." | Small changes break things. The run is short. |

## Stop and run the check if you notice

- You are about to write "done", "fixed" or "works".
- You are about to say "should" or "probably".

## Gotchas

- Evidence must be from after the last change. A green result from an earlier step does not count.
