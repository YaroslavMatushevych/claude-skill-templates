---
name: my-generator
description: Create a new [thing] in the standard shape with the bundled script. Use when asked to add a new [thing].
argument-hint: [name]
---
TEMPLATE: Replace every <...>. Delete every TEMPLATE line. Change `scripts/scaffold.mjs` to build your own shape. Keep it small and make it fail with a clear message.

Create a new <thing> named `$ARGUMENTS`.

1. Run the script. Do not read it.
   ```bash
   node ${CLAUDE_SKILL_DIR}/scripts/scaffold.mjs $ARGUMENTS
   ```
2. If the script prints an error, fix the input and run it again. Do not create the files by hand.
3. Open the new files. Fill in the parts that are marked `TODO`.
4. Run <the check command>. It must pass before you finish.

## Rules

- The script owns the shape. Do not change the folder layout in the output.
- Name must be lowercase, with hyphens. The script rejects other names.

## Gotchas

- <A case where the script output was wrong, and what to do.>
