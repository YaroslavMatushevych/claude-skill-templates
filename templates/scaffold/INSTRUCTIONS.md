# Instructions for Claude: write a `scaffold` skill

Claude creates things with a fixed shape, such as a component, a package or a migration. A bundled script builds the shape. Claude fills in the parts that need thought.

**Use when:** the user creates the same kind of thing often, and the files always look the same.
**Not when:** the shape changes each time (`task-workflow`), or the output is a document (`write-doc`).

## Steps

1. Write the script first. It takes the name as an argument, checks it, and creates the files. Mark the parts that need thought with `TODO`.
2. Make the script fail with a clear message when the input is wrong or the target exists.
3. Put it in `scripts/`. Call it from `SKILL.md` with `${CLAUDE_SKILL_DIR}/scripts/<name>.mjs`.
4. Write "Run it. Do not read it." A run costs only the output. A read costs the whole file.
5. Add a rule: if the script fails, fix the input and run it again. Do not build the files by hand.
6. End with the check command for the new thing.

## Check

- The script runs on a clean project with one command.
- It refuses a bad name and an existing target.
- The check command passes on the generated files.
