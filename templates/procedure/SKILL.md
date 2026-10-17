---
name: my-procedure
description: Turn [input] into [output]. Use only when asked to [trigger].
argument-hint: [input]
---
TEMPLATE: Replace every <...>. Delete every TEMPLATE line. Keep this file under 60 lines.

1. Restate the goal and the done condition in <N> lines.
2. <Write the check first.> Run it. Confirm it fails for the right reason.
3. <Make the smallest change that passes the check.>
4. <Save the work in the agreed place, for example a branch named `<prefix>/<id>`.>
5. <Hand the result to the user in the agreed form, for example a draft pull request.>
6. Stop if <the check> fails twice. Tell the user what failed and what you tried.

## Rules

- <Hard rule 1, with the reason in half a sentence.>
- <Hard rule 2.>

## Gotchas

- <A failure that really happened. Say what to do instead.>
