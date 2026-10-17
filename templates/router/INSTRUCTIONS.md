# Instructions for Claude: write a `router` skill

A router skill is the single entry point to many skills that the user starts by hand. It helps the user find the right one.

## Use this type when

- You have five or more skills with `disable-model-invocation: true`, and the user forgets their names.

## Do not use it when

- You have fewer than five. A table in `README.md` is enough.
- The skills start on their own. They do not need a router.

## How to write it

1. List every user-started skill in the project. Look at the skills folders. Include only skills with `disable-model-invocation: true`.
2. Write one row per skill: the name and one line that describes a situation, not a feature. "When a plan is unclear" is a situation. "Interview tool" is a feature.
3. Write the steps from the template: pick one skill, ask one question if two fit, name the skill and call it, say so when nothing fits.
4. Set `disable-model-invocation: true` on the router. It costs no context until the user calls it.
5. Write an update rule in the project instructions: when a skill is added, renamed or removed, update the router table in the same change.
6. Check the table against the folder. A skill in the folder and not in the table is a gap. A row with no skill is a lie. Both make the router give wrong answers.

## Check before you finish

- Does the table match the skills on disk exactly?
- Does each "use it when" line describe a situation?
- Can the router say "no skill fits"?

## Common failures

- A table that was right when written and is wrong now. Add the update rule.
- Rows that are too alike. Ask one question that tells them apart.
- A router that calls two skills at once. Pick one.
