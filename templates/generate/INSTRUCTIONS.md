# `generate`

**Purpose:** Produce a document or message in the same format every time, using only what Claude already knows.
**Use when:** you want the same kind of output again and again: a plan, a spec, a summary, a pull request description or a status message.

**Change:** the list under the **Shape** heading in the file. Replace its labels (Goal, Details, Check, Open questions) with the sections your output needs, and change the length limit.
**Keep:** the rules "do not interview" and "never guess: put gaps under Open questions", and the **Check** line. A Check line says how to tell the output is right, so you do not end up with a wish.
**Test:** finish a chat with Claude where you agreed on something, then run the skill. Give the result to a colleague who did not see the chat. If they understand it without asking you anything, it works.
