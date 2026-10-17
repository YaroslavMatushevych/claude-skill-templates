# Instructions for Claude

This repo holds templates for Claude Code skills. You are probably here because a user asked you to create a skill.

1. Read `docs/choosing-a-type.md`. If a hook, a `CLAUDE.md` rule or a subagent fits better, say so and stop.
2. Pick one template from the table in `README.md`. Tell the user which, and why, in one line.
3. Read `templates/<name>/INSTRUCTIONS.md` and follow it.
4. Copy `templates/<name>/SKILL.md` into the user's skills folder. Replace every `<...>` placeholder. Delete every `TEMPLATE:` line.
5. Run `node scripts/validate.mjs <skill-folder>`. Fix every error.
6. Go through `docs/checklist.md`.
7. Run the skill on three real tasks. Read the whole transcript. Fix the skill, not the task.

Rules for this repo:

- Short sentences, simple words, no em-dashes.
- A new template needs a `SKILL.md`, an `INSTRUCTIONS.md` and a passing validate run.
