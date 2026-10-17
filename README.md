# claude-skill-templates

A skill constructor for Claude Code. It builds a skill from a template, adds references and scripts, and checks the result. Claude can run it for you.

## Set up

```bash
git clone https://github.com/YaroslavMatushevych/claude-skill-templates ~/skill-templates
```

Add this to your `CLAUDE.md` (project or `~/.claude/CLAUDE.md`):

```markdown
## Building skills
To create or change a skill, use the constructor in `~/skill-templates`:
1. `node ~/skill-templates/scripts/skill.mjs templates` lists the templates. Pick one that fits.
2. `node ~/skill-templates/scripts/skill.mjs new <name> --template <template> --description "<what it makes. Use when ...>"`
3. Edit `SKILL.md`. The command prints what to change and what to keep.
4. For each long document the skill needs, run `node ~/skill-templates/scripts/skill.mjs add-reference <skill-folder> <file-or-url> --when "<when to read it>"`.
5. Run `node ~/skill-templates/scripts/skill.mjs check <skill-folder>` and fix every error.
6. Run the skill on three real tasks before you say it is done.
```

Then ask: "Create a skill that writes release notes from the git log."

## The commands

| Command | What it does |
|---|---|
| `templates` | Lists the templates and what each is for. |
| `new <name> --template <t>` | Creates `.claude/skills/<name>/SKILL.md` from a template. Sets the name. Add `--description "..."` to set the description and `--dir <folder>` to change where it is created. Prints what to **change** and what to **keep**. |
| `add-reference <skill> <file-or-url> --when "..."` | Copies a file, or downloads a URL, into `references/`. Adds a line to `SKILL.md` that says when to read it. Adds a table of contents to a long file. |
| `add-script <skill> <file>` | Copies a script into `scripts/`. Adds a line that says to run it, not read it. Add `--read` if Claude must read it. |
| `check <skill>` | Checks the name, the description, the length, the pointers and the references. |

All commands run as `node scripts/skill.mjs <command>`. Node 18 or newer. No dependencies.

Why `--when` is required: the words in the pointer decide when Claude opens the file. A vague pointer means Claude never reads it.

## The templates

Six templates. Each is for a different purpose, and each works as it is. Each has an `INSTRUCTIONS.md` with **Change**, **Keep** and **Test**.

| Template | Purpose | Use it when |
|---|---|---|
| [`workflow`](templates/workflow/) | Do a repeatable task in fixed steps, with a check on each step. | You do the same task in the same order again and again. Example: ticket to pull request. |
| [`investigate`](templates/investigate/) | Answer "where", "how" or "why" with proof. Read-only. | You ask where something is, how it works, or why it fails. |
| [`generate`](templates/generate/) | Make an output in a fixed shape from known facts. | You want a plan, spec, summary or message in the same format every time. |
| [`review`](templates/review/) | Check something against criteria. Ranked findings and a verdict. Read-only. | You want a second opinion before merge. |
| [`knowledge`](templates/knowledge/) | Your traps and rules for one tool, library or area. No steps. | Claude makes the same mistake with it in more than one session. |
| [`guardrail`](templates/guardrail/) | One rule that must be followed before a claim or an action. | Claude says "done" without proof, or skips a step in a hurry. |

Not sure which one? Ask what you want from the skill: do a task (`workflow`), find out (`investigate`), produce something (`generate`), judge something (`review`), know something (`knowledge`) or hold a rule (`guardrail`).

To use a template as it is, without the constructor: `cp -R templates/workflow ~/.claude/skills/`.

## Use a skill as an agent

An agent file can name a skill in its `skills:` field, and the agent follows it. `generate` cannot be loaded this way, because you start it (`disable-model-invocation: true`).

`investigate` and `review` run in their own context (`context: fork`) and have read tools only. The tool list is the guard. A sentence that says "do not edit" is only a request.

## Test

```bash
npm test
```

## Sources

- Anthropic, "Skill authoring best practices" (platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- Anthropic, `skills` repo, including `skill-creator` (github.com/anthropics/skills)
- Claude Code docs, skills (code.claude.com/docs)
- Jesse Vincent, "Superpowers" (github.com/obra/superpowers)
- Thariq, "Lessons from Building Claude Code: How We Use Skills", March 2026
- Simon Willison, "Claude Skills are awesome, maybe a bigger deal than MCP", October 2025

MIT license. The checklist for a good skill is in [`docs/checklist.md`](docs/checklist.md).
