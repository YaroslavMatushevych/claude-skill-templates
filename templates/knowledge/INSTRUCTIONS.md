# `knowledge`

**Purpose:** give Claude what it cannot know: your traps and rules for one tool, library or area. It has no steps. Claude starts it on its own when the topic comes up.
**Use when:** Claude makes the same mistake in more than one session, or a tool changed after the model was trained.

**Change:** everything in the tables. Start from real mistakes in transcripts or pull request comments. One line each: what Claude did, and what was right. Add long material with `add-reference ... --when "..."` and name the exact moment.
**Keep:** "Claude knows the basics" at the top, and the failure description in each trap. Delete every line that does not change what Claude does.
**Test:** repeat a task where Claude failed before. It should not repeat the mistake.
