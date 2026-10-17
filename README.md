# claude-skill-templates

Ten templates for Claude Code skills. Each one has a ready `SKILL.md` and short instructions that Claude reads before it writes your skill.

## Use it

1. Copy this repo into your project, for example to `.claude/skill-templates/`.
2. Add this to your `CLAUDE.md`:

```markdown
## Creating skills
When I ask you to create or change a skill:
1. Read `.claude/skill-templates/README.md`. Pick one template and tell me which, in one line.
2. Read `templates/<name>/INSTRUCTIONS.md` and follow it.
3. Copy `templates/<name>/SKILL.md` to `.claude/skills/<skill-name>/SKILL.md` and fill it in.
4. Run `node .claude/skill-templates/scripts/validate.mjs .claude/skills/<skill-name>`.
5. Test the skill on three real tasks before you say it is done.
```

3. Ask: "Create a skill that does X."

## Which template

| Template | Use it when | Example |
|---|---|---|
| [`task-workflow`](templates/task-workflow/) | You repeat the same task in the same order. | Ticket to draft pull request |
| [`plan-interview`](templates/plan-interview/) | Claude starts before it understands what you want. | Stress-test a design before coding |
| [`write-doc`](templates/write-doc/) | A discussion is done and you want it on paper. | Spec, plan, summary |
| [`review-change`](templates/review-change/) | You want a read-only second look. | Pull request review |
| [`library-traps`](templates/library-traps/) | Claude gets one library wrong in the same way each time. | A date library with a known trap |
| [`hard-rule`](templates/hard-rule/) | Claude skips one step when it is in a hurry. | No "done" without a test run |
| [`session-handoff`](templates/session-handoff/) | A long session must continue in a fresh context. | End of day, or context is full |
| [`find-cause`](templates/find-cause/) | Something is broken and the cause is unknown. | A failing build, a production error |
| [`scaffold`](templates/scaffold/) | You create the same shape of files often. | A new component with its test |
| [`skill-index`](templates/skill-index/) | You have many skills that you start by hand. | One entry point to find them |

Not sure a skill is the right tool? See [`docs/choosing-a-type.md`](docs/choosing-a-type.md). A rule that must hold every time is a hook, not a skill.

## Check a skill

```bash
node scripts/validate.mjs .claude/skills/my-skill
```

It checks the name, the description, the length and the frontmatter. Node 18 or newer, no dependencies. The full list of what a good skill needs is in [`docs/checklist.md`](docs/checklist.md).

## Sources

- Anthropic, "Skill authoring best practices" (platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- Anthropic, `skill-creator` in github.com/anthropics/skills
- Claude Code docs, skills (code.claude.com/docs)
- Jesse Vincent, "Superpowers" and its `writing-skills` skill (github.com/obra/superpowers)
- Thariq, "Lessons from Building Claude Code: How We Use Skills", March 2026
- Simon Willison, "Claude Skills are awesome, maybe a bigger deal than MCP", October 2025

MIT license.
