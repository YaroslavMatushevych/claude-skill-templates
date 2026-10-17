# Instructions for Claude: write a `reference` skill

A reference skill teaches Claude the traps of one library, API or tool. Claude starts it on its own when the topic comes up.

## Use this type when

- Claude makes the same mistake with a library, in more than one session.
- The right way is not obvious from the public docs, or the library changed after the model was trained.

## Do not use it when

- Claude already does it right. Do not write what the model knows.
- The rule applies to the whole project. Put it in `CLAUDE.md`.
- The fix can be enforced by a linter. Add the lint rule.

## How to write it

1. Collect the real mistakes first. Read the transcripts or the pull request comments. Write each mistake as a short line: what Claude did, and what was right.
2. Start the body with "Claude knows the API. These are the traps." This keeps the skill from turning into a copy of the docs.
3. Add a table that maps a task to one approach. One row, one default.
4. Write each trap as: the name, the right way, the wrong way and the reason it breaks. Include what the failure looks like, so Claude can recognise it.
5. Because Claude starts this skill on its own, the description is loaded in every turn. Keep it short. Name the library and the trigger words a user would write.
6. Move long material to files in a `reference/` folder. Link each file with a line that says when to read it. Keep the links one level deep. Start a file over 100 lines with a table of contents.
7. Keep the body under 100 lines.

## Check before you finish

- Does every line change what Claude does? Delete the lines that do not.
- Does each trap say how to see the failure?
- Is the "when to read" wording of each file link exact? A vague pointer means Claude never opens the file.

## Common failures

- A copy of the official docs. Link to them. Do not copy them.
- Facts that go out of date, such as version numbers. Say where to look them up.
- A description like "Helps with <library>". Name the trigger.
