# `knowledge`

**Purpose:** Tell Claude what it cannot know: the traps and rules for one tool, library or part of your code. It has no steps.
**Use when:** Claude makes the same mistake with this topic in more than one session, or the tool changed after Claude was trained. Claude loads the skill on its own when your task touches the topic.
**Do not use when:** you want Claude to follow steps (use `workflow`), or a rule must hold every single time (use `guardrail`, and add a hook, because a skill is only an instruction).
**Examples:** The traps of your date library, such as time zones and month numbers; Why your build must run with a special flag; Naming rules for your API
**How it works:** Claude reads the page when its task touches the topic. It does not run anything. It uses the table to pick an approach, and the traps and rules to avoid known mistakes. The template is a skeleton: headings and a guidance comment under each one. See `docs/example-knowledge.md` for a filled-in example about JavaScript dates.
**Change:** the description, and every section. Replace each guidance comment with your own content, and delete the comment. Fill it from real mistakes. Open past chats or pull request comments. For each mistake write one line: what Claude did, what was right, and why. Example trap: "**Month numbers:** `new Date(2024, 1, 1)` is February, not January. Months start at 0." Put long documents in references, and say exactly when Claude must read each one.
**Keep:** the first line ("Claude knows the basics"), because it stops Claude from explaining basics. In each trap, keep how the failure looks, because that is how Claude recognises it. Delete every line that does not change what Claude does.
**Test:** repeat a task where Claude made a mistake before. Pass: Claude does not make the mistake. Fail: it makes the same mistake. Then make the trap line more specific.
