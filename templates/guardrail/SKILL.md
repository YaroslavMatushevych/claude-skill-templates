---
name: guardrail
description: Make sure one rule is followed before a claim or an action. Use before you say that work is done, fixed or safe.
---
```
NO "DONE" WITHOUT EVIDENCE FROM THIS MESSAGE
```

1. Name the claim you are about to make.
2. Name the evidence that proves it. Example: the output of the test command.
3. Run the command now, in full. Read the whole output.
4. Compare the output with the claim.
   - It matches: make the claim and show the output.
   - It does not match: say what really happened, with the output.

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
