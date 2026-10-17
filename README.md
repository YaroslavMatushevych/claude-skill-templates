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

Each template is a skill that works as it is. Each has an `INSTRUCTIONS.md` with **Change**, **Keep** and **Test**.

| Template | What it does | Use it when |
|---|---|---|
| [`clarifier`](templates/clarifier/) | Asks questions until a request is clear. | Claude starts before it understands you. |
| [`explorer`](templates/explorer/) | Finds things in the code, returns paths and a short answer. Read-only. | "Where is X?" "How does Y work here?" |
| [`planner`](templates/planner/) | Makes a plan of at most 10 small steps, each with a check. Read-only. | A change touches more than one file. |
| [`implementer`](templates/implementer/) | Builds an approved plan. Check first, stops if it fails twice. | The plan is approved. |
| [`tester`](templates/tester/) | Writes failing tests from acceptance criteria. | You want tests before code. |
| [`debugger`](templates/debugger/) | Finds the cause of a failure by testing hypotheses. | Something is broken and you do not know why. |
| [`reviewer`](templates/reviewer/) | Returns ranked problems and a verdict. Read-only. | You want a review before merge. |
| [`verifier`](templates/verifier/) | Shows fresh evidence before it says "done". | Claude says "fixed" without proof. |
| [`writer`](templates/writer/) | Writes a spec, plan or summary from what is known. | A discussion is done and you want it on paper. |

A common order: `clarifier`, `planner`, `implementer`, `reviewer`, `verifier`. The others fit anywhere.

To use a template as it is, without the constructor: `cp -R templates/planner ~/.claude/skills/`.

## Use a skill as an agent

An agent file can name a skill in its `skills:` field, and the agent follows it. `clarifier` and `writer` cannot be loaded this way, because you start them (`disable-model-invocation: true`).

`explorer`, `planner` and `reviewer` run in their own context (`context: fork`) and have read tools only. The tool list is the guard. A sentence that says "do not edit" is only a request.

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
