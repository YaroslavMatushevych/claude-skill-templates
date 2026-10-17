# claude-skill-templates

Nine role skills for Claude Code. Copy one folder and use it. No blanks to fill.

The roles are the ones that the most used skill sets share: ask, explore, plan, build, test, debug, review, verify, write.

## Use one

```bash
cp -R templates/planner ~/.claude/skills/        # for all your projects
cp -R templates/planner .claude/skills/          # for this project only
```

Then call it: `/planner add a price filter to the search page`.

## The roles

| Role | What it does | Use it when |
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

A common order: `clarifier` then `planner`, `implementer`, `reviewer`, `verifier`. The others fit anywhere.

## Make it yours

Each folder has an `INSTRUCTIONS.md` with three short parts: **Change** (what to edit for your project), **Keep** (what makes the role work) and **Test** (how to check it).

To let Claude adapt a role, add this to your `CLAUDE.md`:

```markdown
## Adapting skills
When I ask you to adapt a skill from `skill-templates`:
1. Read `templates/<role>/INSTRUCTIONS.md`.
2. Change only what it lists under Change. Keep what it lists under Keep.
3. Run `node scripts/validate.mjs <folder>` and fix every error.
4. Run the skill on the task under Test and show me the result.
```

## Use a role as an agent

An agent file can name a skill in its `skills:` field, and the agent follows it. `clarifier` and `writer` cannot be loaded this way, because they are started by you (`disable-model-invocation: true`).

`explorer`, `planner` and `reviewer` already run in their own context (`context: fork`) and only have read tools. That tool list is the guard. A sentence in the prompt that says "do not edit" is only a request.

## Check a skill

```bash
node scripts/validate.mjs .claude/skills/my-skill
```

It checks the name, the description, the length and the frontmatter. Node 18 or newer, no dependencies. The full list of what a good skill needs is in [`docs/checklist.md`](docs/checklist.md).

## Sources

- Anthropic, "Skill authoring best practices" (platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- Anthropic, `skills` repo, including `skill-creator` (github.com/anthropics/skills)
- Claude Code docs, skills (code.claude.com/docs)
- Jesse Vincent, "Superpowers" (github.com/obra/superpowers)
- Thariq, "Lessons from Building Claude Code: How We Use Skills", March 2026
- Simon Willison, "Claude Skills are awesome, maybe a bigger deal than MCP", October 2025

MIT license.
