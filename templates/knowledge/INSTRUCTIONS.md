# `knowledge`

**Purpose:** Tell Claude what it cannot know: the traps and rules for one tool, library or part of your code. It has no steps. Claude loads it on its own when the topic comes up.
**Use when:** Claude makes the same mistake with it in more than one session, or the tool changed after Claude was trained.
**Examples:** The traps of your date library, such as time zones and month numbers; Why your build must run with a special flag; Naming rules for your API

**Change:** all the tables. Start from real mistakes: look at past chats or pull request comments, and write one line each saying what Claude did and what was right. Add long documents as references, and say exactly when Claude should read each one.
**Keep:** the first line ("Claude knows the basics") and, in each trap, how the failure looks. Delete every line that does not change what Claude does.
**Test:** repeat a task where Claude made a mistake before. It should not make the same mistake again.
