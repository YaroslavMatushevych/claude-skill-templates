# claude-skill-templates

Templates for ten types of Claude Code skill. Each type has a ready `SKILL.md` and a set of instructions that Claude reads before it writes your skill.

Use it when you want a skill that is short, specific and checkable, not a vague page of advice.

## How to use it

1. Copy this repo into your project, for example to `.claude/skill-templates/`.
2. Add this block to your `CLAUDE.md`:

```markdown
## Creating skills
When I ask you to create or change a skill:
1. Read `.claude/skill-templates/README.md` and `docs/choosing-a-type.md`.
2. Pick one type. Say which type you picked and why, in one line.
3. Read `templates/<type>/INSTRUCTIONS.md` and follow it exactly.
4. Copy `templates/<type>/SKILL.md` to `.claude/skills/<name>/SKILL.md` and fill it in.
5. Run `node .claude/skill-templates/scripts/validate.mjs .claude/skills/<name>`.
6. Test the skill on three real tasks before you say it is done.
```

3. Ask: "Create a skill that does X." Claude picks the type, reads the instructions for that type and writes the skill.

## The ten types

| Type | Use it when | Who starts it |
|---|---|---|
| [`procedure`](templates/procedure/) | The work is a fixed list of steps with hard rules. | Claude or you |
| [`interview`](templates/interview/) | A plan is unclear and Claude must ask questions before it acts. | You |
| [`synthesis`](templates/synthesis/) | You want a document made from what Claude already knows. | You |
| [`review`](templates/review/) | You want a read-only check of a change, in a separate context. | Claude or you |
| [`reference`](templates/reference/) | Claude must use a library, API or tool with known traps. | Claude |
| [`discipline`](templates/discipline/) | One rule must hold under pressure, for example "test before you claim done". | Claude |
| [`handoff`](templates/handoff/) | A long session must continue in a fresh context. | You |
| [`diagnosis`](templates/diagnosis/) | Something is broken and the cause is unknown. | Claude or you |
| [`generator`](templates/generator/) | The output has a fixed shape and a script can build it. | Claude or you |
| [`router`](templates/router/) | You have many user-started skills and need one entry point. | You |

Not sure a skill is the right tool? Read [`docs/choosing-a-type.md`](docs/choosing-a-type.md). A rule that must hold every time is a hook, not a skill.

## What every skill must pass

See [`docs/checklist.md`](docs/checklist.md). The short version:

- The description says what the skill makes and when to use it. It does not list the steps.
- `SKILL.md` has fewer than 500 lines.
- Every step ends with something Claude can check.
- Rules say what to do. They do not only say what to avoid.
- The skill has a Gotchas section built from real failures.

## Check your skill

```bash
node scripts/validate.mjs templates/procedure
node scripts/validate.mjs .claude/skills/my-skill
```

The script checks the name, the description, the length and the frontmatter. Node 18 or newer. No dependencies.

## Sources

The rules come from these public documents:

- Anthropic, "Skill authoring best practices" (platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- Anthropic, `skill-creator` in github.com/anthropics/skills
- Claude Code docs, "Extend Claude with skills" (code.claude.com/docs)
- Jesse Vincent, "Superpowers" and its `writing-skills` skill (github.com/obra/superpowers)
- Thariq, "Lessons from Building Claude Code: How We Use Skills", March 2026
- Simon Willison, "Claude Skills are awesome, maybe a bigger deal than MCP", October 2025

## License

MIT
