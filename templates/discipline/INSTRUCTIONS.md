# Instructions for Claude: write a `discipline` skill

A discipline skill holds one rule that Claude tends to skip under pressure. Example: "no claim of done without a test run".

## Use this type when

- Claude knows the rule and breaks it anyway, because it is in a hurry, or because the case looks small.
- You have seen the failure at least once.

## Do not use it when

- The rule must hold every time with no exceptions. Use a hook. A skill is still an instruction.
- You have two rules. Write two skills.

## How to write it

1. Run the task once without the skill. Write down, word for word, the reasons Claude gives for skipping the rule. These are the excuses.
2. Write the rule as one line in a code block, in the form "NO <claim> WITHOUT <evidence>".
3. Write the steps as a gate: name the claim, name the evidence, get the evidence now, compare, then speak.
4. Make a table of excuses and answers. Use the real excuses from step 1. Each answer is one sentence.
5. Write a short list of signals that mean "stop and run the check": words like "should", "probably", "done".
6. Write the description as a moment: "Use when <moment>, before you <claim>."
7. Run the skill again under pressure: a deadline, a long session, a small change. Read the transcript. If Claude finds a new excuse, add it to the table, then run again.
8. Test the wording five times. If five runs give five different readings, the wording is not binding. Rewrite it.

## Check before you finish

- Does the rule fit in one line?
- Is every excuse in the table a real one?
- Did the skill hold under a deadline in the test?

## Common failures

- A rule with no reason. Claude drops it when the case looks different. Add the reason.
- Only prohibitions. Add what to do instead.
- A table of imagined excuses. Use the ones that really happened.
