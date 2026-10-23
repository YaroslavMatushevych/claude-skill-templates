# Building skills and agents

Use this file when you create or change a skill or an agent. Do not write the file by hand. Use the constructor.

Run every command from the project where the skill or agent will live. The files go into that project's `.claude/skills` or `.claude/agents` folder.

Every command runs as:

```
node ~/skillcaster/scripts/skill.mjs <command>
```

## Steps

1. `templates` lists the templates. Pick the one that fits.
2. `new <name> --template <template> --description "<what it makes. Use when ...>"` creates a skill. Use `new-agent` for an agent.
3. Edit the file. The command prints what to change and what to keep.
4. For each long document, run `add-reference <skill-folder> <file-or-url> --when "<when to read it>"`. Name the exact moment in `--when`.
5. For a script the skill should run, run `add-script <skill-folder> <file>`.
6. Run `check <skill-folder-or-agent-file>` and fix every error.
7. Run it on three real tasks. Read the whole transcript. Fix the skill, not the task.

## How to use this file

Add three lines to your `CLAUDE.md`:

```markdown
## Building skills and agents
Use the builder in `~/skillcaster`.
Follow @~/skillcaster/BUILDING.md
```

The `@` line imports this file. Your `CLAUDE.md` stays short, and you change the steps in one place.

Clone the repo to `~/skillcaster` first.
