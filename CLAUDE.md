# Instructions for Claude

This repo is a skill constructor (`scripts/skill.mjs`) and six templates: `workflow`, `investigate`, `generate`, `review`, `knowledge`, `guardrail`. Use the constructor. Do not write a skill file by hand.

To build a skill:

1. `node scripts/skill.mjs templates` and pick the template that fits.
2. `node scripts/skill.mjs new <name> --template <template> --description "<what it makes. Use when ...>"`
3. Edit `SKILL.md`. Change only what the command printed under **Change**. Keep what it printed under **Keep**.
4. For each long document the skill needs, run `node scripts/skill.mjs add-reference <skill-folder> <file-or-url> --when "<when to read it>"`. Name the exact moment in `--when`.
5. For a script the skill should run, use `add-script`.
6. `node scripts/skill.mjs check <skill-folder>`. Fix every error. Read `docs/checklist.md` for the rest.
7. Run the skill on three real tasks. Read the whole transcript. Fix the skill, not the task.

To add a template: create `templates/<name>/SKILL.md` that works as it is, with no placeholders, and `INSTRUCTIONS.md` with **Change**, **Keep** and **Test**. Run `npm test` and `node scripts/validate.mjs templates`.

Rules for this repo: short sentences, simple words, no em-dashes.
