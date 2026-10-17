# Instructions for Claude: write a `generator` skill

A generator skill creates things with a fixed shape, such as a component, a package or a migration. A bundled script builds the shape. Claude fills in the parts that need thought.

## Use this type when

- You create the same kind of thing often, and the files always look the same.
- You want the shape to be the same every time, with no drift.

## Do not use it when

- The shape changes each time. Use `procedure`.
- The output is a document. Use `synthesis`.

## How to write it

1. Write the script first. It takes the name as an argument, checks it, and creates the files. Mark the parts that need thought with `TODO`.
2. Make the script fail with a clear message when the input is wrong or the target exists. Claude reads the message and fixes the input.
3. Put the script in `scripts/`. In `SKILL.md`, call it with `${CLAUDE_SKILL_DIR}/scripts/<name>.mjs`, so it works from any folder.
4. Say if Claude must run the script or read it. For a generator, write "Run it. Do not read it." A run costs only the output. A read costs the whole file.
5. Add a rule: if the script fails, fix the input and run it again. Do not build the files by hand. This keeps the shape the same.
6. End with the check command for the new thing, such as the test or the type check.
7. Keep `SKILL.md` short. The shape lives in the script.

## Check before you finish

- Does the script run on a clean project with one command?
- Does it refuse a bad name and an existing target?
- Does `SKILL.md` say to run the script, not to read it?
- Does the check command pass on the generated files?

## Common failures

- Claude writes the files by hand and the shape drifts. Add the rule from step 5.
- A script with many options. Use one default.
- A script that needs a package that is not installed. Use only what the project already has.
