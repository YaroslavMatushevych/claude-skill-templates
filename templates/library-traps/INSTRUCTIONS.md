# Instructions for Claude: write a `library-traps` skill

Claude learns the traps of one library, API or tool. Claude starts it on its own when the topic comes up.

**Use when:** Claude makes the same mistake with a library in more than one session, or the library changed after the model was trained.
**Not when:** Claude already does it right, the rule applies to the whole project (`CLAUDE.md`), or a lint rule can catch it.

## Steps

1. Collect the real mistakes first, from transcripts or pull request comments. One line each: what Claude did, what was right.
2. Open the body with "Claude knows the API. These are the traps." Write only what the model does not know.
3. Add a table: task, then one approach.
4. Write each trap as: name, right way, wrong way, and what the failure looks like.
5. Keep the description short and name the library. It is loaded in every turn.
6. Put long material in `reference/` files. For each link, say exactly when to read the file. A vague pointer means Claude never opens it.

## Check

- Every line changes what Claude does. Delete the lines that do not.
- Each trap says how to recognise the failure.
- The body is under 100 lines.
