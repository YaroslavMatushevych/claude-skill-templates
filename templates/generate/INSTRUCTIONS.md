# `generate`

**Purpose:** Produce a document or message in the same format every time, using only what Claude already knows.
**Use when:** you want the same kind of output again and again, after a discussion where the facts are settled. Typical outputs are a plan, a spec, a summary, a pull request description and a status message. Only you start this skill (type `/generate`), because only you know when the discussion is finished.
**Do not use when:** the facts are not known yet (talk first), you want Claude to inspect code and report (use `investigate`), or you want a second opinion (use `review`).
**Examples:** A pull request description from your branch; A spec after a planning chat; A weekly status update
**How it works:** Claude reads the files it needs. Then it fills the labels in order: Goal, Details, Check, Open questions. It does not ask you questions. A fact it does not have goes under Open questions.
**Change:** the list under the **Shape** heading. Replace the labels (Goal, Details, Check, Open questions) with the sections your output needs, and change the line limit. Example for a pull request: "Summary", "Why", "How to test", "Risks".
**Keep:** the rule "do not interview", because the skill must finish in one run. Keep "never guess: put gaps under Open questions", because a guess in a document looks like a fact. Keep a Check line, because it says how to tell that the output is right.
**Test:** finish a chat with Claude where you agreed on something, then run the skill. Give the result to a colleague who did not see the chat. Pass: they understand it without asking you anything. Fail: they ask what a line means.
