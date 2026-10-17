# Instructions for Claude: write a `session-handoff` skill

At the end of a session, Claude writes a short note so a fresh session can continue with a clean context.

**Use when:** sessions get long and answers get worse, or the user often stops and picks the work up later.
**Not when:** a short summary in the chat is enough, or the state already lives in files and the note would only copy them.

## Steps

1. Set `disable-model-invocation: true`. The user decides when to stop.
2. Save the note in the system temp folder, not in the project. Print the full path.
3. Keep the sections from the template: goal, state, decisions, next steps, where things are, traps.
4. Add a rule: do not copy what other files say. Point to the spec, plan, issue, commit or diff by path or link.
5. Require that the first next step can start right now.
6. End with the first message to paste into the new session.

## Check

- You opened a fresh session, pasted only the note, and it could continue without asking.
- The note is under one page.
