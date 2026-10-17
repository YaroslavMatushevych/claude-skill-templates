# Instructions for Claude

This repo holds templates for Claude Code skills. You are probably here because a user asked you to create a skill.

Do this, in order:

1. Read `docs/choosing-a-type.md`. Decide if a skill is the right tool. If a hook, a CLAUDE.md rule or a subagent fits better, say so and stop.
2. Pick exactly one type from the table in `README.md`. Tell the user the type and the reason in one line.
3. Read `templates/<type>/INSTRUCTIONS.md`. Follow it step by step.
4. Copy `templates/<type>/SKILL.md` into the user's skills folder and fill it in. Replace every `<...>` placeholder. Delete every comment line that starts with `TEMPLATE:`.
5. Run `node scripts/validate.mjs <skill-folder>`. Fix every error.
6. Go through `docs/checklist.md`. Fix every item that fails.
7. Test: run the skill on three real tasks. Read the whole transcript, not only the result. Fix the skill, not the task.

Rules for this repo:

- Write in short sentences and simple words.
- Do not add a type without a `SKILL.md`, an `INSTRUCTIONS.md` and a passing validate run.
- Do not use em-dashes.
