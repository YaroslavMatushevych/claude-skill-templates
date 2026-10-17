# Checklist for every skill

Go through this list before you call a skill done. Each item has a reason. If you cannot say why an item matters for your skill, read the reason again.

## Description

- [ ] It says what the skill makes and when to use it. Example: "Turn a ticket into a draft pull request with tests. Use only when asked to implement a ticket."
  Reason: the description is the trigger. Claude uses it to decide whether to load the skill.
- [ ] It does not list the steps.
  Reason: if the description sums up the workflow, Claude may follow the description and skip the body.
- [ ] It is written in the third person, and it has the words a user would say.
- [ ] It names a case where the skill must not be used, if two skills could be confused.
- [ ] It is under 1,024 characters. The skill name is lowercase, with hyphens, and under 64 characters.

## Body

- [ ] `SKILL.md` has fewer than 500 lines. Details go in other files that the skill names.
- [ ] Every step ends with a check Claude can run or read. "Tests pass" is a check. "Be careful" is not.
- [ ] Every rule says what to do. If you must forbid something, also say what to do instead.
  Reason: a forbidden behaviour named in the text is still in the context.
- [ ] No line explains what Claude already knows. Test: if you delete the line, does the behaviour change? If not, delete it.
- [ ] There is one default, not a list of options. Add an escape hatch only if you need it.
- [ ] The same thing has the same name everywhere in the skill.
- [ ] There is a Gotchas section. Each gotcha comes from a real failure, not from a guess.
- [ ] There is a stop condition. Example: "Stop if the tests fail twice."
- [ ] Words in capital letters, like ALWAYS and NEVER, are rare. If you need them often, explain the reason in plain words instead.

## Files

- [ ] Reference files are linked from `SKILL.md` and are one level deep.
- [ ] A reference file over 100 lines starts with a table of contents.
- [ ] A script says if Claude must run it or read it.
- [ ] State that must survive an upgrade is stored outside the skill folder.
- [ ] No paths or code snippets that go out of date fast. Point to the file instead.

## Test

- [ ] You ran the task once without the skill and wrote down where Claude went wrong.
- [ ] You ran the skill on three different real tasks and read the whole transcript, not only the result.
- [ ] If the skill is for a cheaper model, you ran it on that model too.
- [ ] If a step is skipped under pressure, you added the rule and the reason for it, then ran the test again.

## Fit

- [ ] The skill is the right tool. See [`choosing-a-type.md`](choosing-a-type.md).
- [ ] `node scripts/validate.mjs <folder>` passes.
