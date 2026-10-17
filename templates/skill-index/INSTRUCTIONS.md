# Instructions for Claude: write a `skill-index` skill

One entry point to many skills that the user starts by hand. It helps the user find the right one.

**Use when:** there are five or more skills with `disable-model-invocation: true`, and the user forgets their names.
**Not when:** there are fewer than five (a table in `README.md` is enough), or the skills start on their own.

## Steps

1. List every skill in the project that has `disable-model-invocation: true`.
2. Write one row per skill: the name, and a situation. "When a plan is unclear" is a situation. "Interview tool" is a feature.
3. Keep the steps from the template: pick one skill, ask one question if two fit, name it and call it, say so when nothing fits.
4. Set `disable-model-invocation: true` on the index too.
5. Add a rule to `CLAUDE.md`: when a skill is added, renamed or removed, update the index in the same change.

## Check

- The table matches the skills on disk exactly. A missing skill is a gap. A row with no skill is a lie.
- The index can say "no skill fits".
