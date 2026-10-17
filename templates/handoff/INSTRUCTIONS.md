# Instructions for Claude: write a `handoff` skill

A handoff skill writes a short note at the end of a session, so a fresh session can continue the work with a clean context.

## Use this type when

- Sessions get long and answers get worse.
- The user often stops work and picks it up later.

## Do not use it when

- A short summary in the chat is enough.
- The state is already in files, such as a spec and a ticket list. Then the handoff only points to them.

## How to write it

1. Set `disable-model-invocation: true`. The user decides when to stop.
2. Tell Claude to save the note in the system temp folder and not in the project. The note is not part of the code. Tell it to print the full path.
3. Keep the sections from the template: goal, state, decisions, next steps, where things are, traps.
4. Add this rule: do not copy what other files say. Point to the spec, the plan, the issue, the commit or the diff by path or link. A copy goes out of date.
5. Require that the first next step can start right now. A first step that needs a decision is not a first step.
6. Require the last line: the first message to paste into the new session.
7. Add the cases from your own work to Gotchas, for example a branch name that was easy to lose.

## Check before you finish

- Open a fresh session. Paste only the note. Can it continue without asking what you meant?
- Is the note under one page?
- Does it point to files and links, not copy them?

## Common failures

- A story of the session. Write facts, not a story.
- A long note that copies the plan. Link the plan.
- No next step. The new session then asks "what now?"
