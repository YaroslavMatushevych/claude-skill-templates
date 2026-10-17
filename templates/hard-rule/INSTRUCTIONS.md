# Instructions for Claude: write a `hard-rule` skill

One rule that Claude tends to skip when it is in a hurry. Example: "no claim of done without a test run".

**Use when:** Claude knows the rule and breaks it anyway, and you have seen it happen.
**Not when:** the rule must hold every time with no exceptions (use a hook, because a skill is still only an instruction), or you have two rules (write two skills).

## Steps

1. Run the task once without the skill. Write down the reasons Claude gives for skipping the rule, word for word.
2. Write the rule as one line in a code block: "NO <claim> WITHOUT <evidence>".
3. Write the steps as a gate: name the claim, name the evidence, get the evidence now, compare, then speak.
4. Make a table of excuses and answers. Use the real excuses from step 1.
5. Write the description as a moment: "Use when <moment>, before you <claim>."
6. Test it under pressure: a deadline, a long session, a small change. If Claude finds a new excuse, add it to the table and test again.

## Check

- The rule fits on one line.
- Every excuse in the table really happened.
- The skill held in the pressure test.
