# Instructions for Claude

This repo builds Claude Code skills and agents. The constructor is `scripts/skill.mjs`. The web UI is `scripts/ui.mjs`. Skill templates: `workflow`, `investigate`, `generate`, `review`, `knowledge`, `guardrail`. Agent templates: `explorer`, `planner`, `implementer`, `reviewer`, `tester`. Use the constructor. Do not write a skill or agent file by hand.

To build a skill:

1. `node scripts/skill.mjs templates` and pick the template that fits.
2. `node scripts/skill.mjs new <name> --template <template> --description "<what it makes. Use when ...>"` for a skill, or `new-agent` for an agent (`--skill`, `--model`, `--tools`, `--max-turns`).
3. Edit `SKILL.md`. Change only what the command printed under **Change**. Keep what it printed under **Keep**.
4. For each long document the skill needs, run `node scripts/skill.mjs add-reference <skill-folder> <file-or-url> --when "<when to read it>"`. Name the exact moment in `--when`.
5. For a script the skill should run, use `add-script`.
6. `node scripts/skill.mjs check <skill-folder>`. Fix every error. Read `docs/checklist.md` for the rest.
7. Run the skill on three real tasks. Read the whole transcript. Fix the skill, not the task.

To add a template: create `templates/<name>/SKILL.md` (or `agent-templates/<name>/AGENT.md`) that works as it is, with no placeholders, and `INSTRUCTIONS.md` with **Purpose**, **Use when**, **Change**, **Keep** and **Test**. Run `npm test`.

A read-only claim must be true. In a skill use `disallowed-tools: Write Edit NotebookEdit`, because `allowed-tools` does not restrict. In an agent use a plain `tools:` list with no `Edit`, `Write` or `Bash`, because a pattern such as `Bash(git log *)` does not limit Bash.

Rules for this repo: short sentences, simple words, no em-dashes.
