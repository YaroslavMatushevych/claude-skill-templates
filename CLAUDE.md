# Instructions for Claude

This repo holds nine role skills: `clarifier`, `explorer`, `planner`, `implementer`, `tester`, `debugger`, `reviewer`, `verifier`, `writer`.

When the user asks you to adapt a role:

1. Read `templates/<role>/INSTRUCTIONS.md`.
2. Change only what it lists under **Change**. Keep what it lists under **Keep**.
3. Run `node scripts/validate.mjs <folder>`. Fix every error.
4. Run the skill on the task under **Test**. Read the whole transcript. Fix the skill, not the task.

When the user asks for a new role, check `docs/checklist.md` first. A new role needs a `SKILL.md` that works as it is, and an `INSTRUCTIONS.md` with Change, Keep and Test. It must pass `node scripts/validate.mjs`.

Rules for this repo: short sentences, simple words, no em-dashes, no `<placeholder>` text in a `SKILL.md`.
