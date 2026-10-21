# Checklist for every skill

Use this list before you call a skill done. Each item has a reason. If you cannot say why an item matters for your skill, read the reason again. Skillcaster runs the items marked (automatic) in the **Checks** tab. You must do the others yourself.

## Description

The description is the only part Claude reads before it decides to load a skill. Spend time on it.

- [ ] It says what the skill makes and when to use it. Example: "Turn a ticket into a draft pull request with tests. Use only when asked to implement a ticket."
  Why: Claude uses the description to decide if the skill fits the task.
- [ ] It does not list the steps. (automatic)
  Why: if the description sums up the steps, Claude may follow the description and skip the body.
- [ ] It uses the third person and the words a user would say. Write "Reviews a change", not "I review a change".
  Why: Claude puts the description into its own prompt. A first-person description reads as if Claude said it.
- [ ] It names a case where the skill must not be used, if two skills could be confused. Example: "Do not use to fix the problem."
  Why: two similar descriptions make Claude pick the wrong skill.
- [ ] It is shorter than 1,024 characters, and the key use is first. The name is lowercase, uses hyphens and is shorter than 64 characters. (automatic)
  Why: these are limits of the Claude platform, so the skill works everywhere. Claude Code cuts the skill list at 1,536 characters, so text at the end may be lost.
- [ ] It names two or three ways a user might ask for the skill.
  Why: Claude tends to use a skill too rarely. More real phrases make it start when it should.

## Body

- [ ] `SKILL.md` has fewer than 500 lines. Put long material in other files that the skill names. (automatic)
  Why: Claude loads the whole body each time the skill runs. A long body uses context that the task needs.
- [ ] Every step ends with a check that Claude can run or read. "The tests pass" is a check. "Be careful" is not.
  Why: a step with no check looks the same as a step that failed.
- [ ] Every rule says what to do. If you must forbid something, also say what to do instead.
  Why: a forbidden behaviour that the text names is still in Claude's context, and Claude may do it.
- [ ] No line explains something Claude already knows. Test: delete the line. If the behaviour does not change, leave it out.
  Why: extra lines hide the lines that matter.
- [ ] There is one default way to do each thing, not a list of options. Add a second way only for a case that you can name.
  Why: a list of options makes Claude choose, and it can choose wrongly.
- [ ] The same thing has the same name everywhere in the skill. Example: always "check", never "check", "test" and "verify" for the same thing.
  Why: a new word looks like a new idea.
- [ ] There is a Gotchas section. Each gotcha comes from a real failure, not from a guess. (automatic)
  Why: gotchas are the lines that change Claude's behaviour most.
- [ ] The rules that must always hold are at the top of the body.
  Why: after Claude Code compacts a long chat, it keeps only the first 5,000 tokens of each skill.
- [ ] There is a stop condition. Example: "Stop if the tests fail twice." (automatic for agents)
  Why: without it, Claude can loop on a step that cannot pass.
- [ ] Words in capital letters, such as ALWAYS and NEVER, are rare. If you need them often, give the reason in plain words.
  Why: if every rule shouts, no rule stands out.

## Files

- [ ] Reference files are linked from `SKILL.md` and are one level deep. Each link says exactly when to read the file. (automatic)
  Why: Claude opens a file only when the text tells it to. "Details" does not tell it when. "When you write a date filter" does.
- [ ] A reference file with more than 100 lines starts with a table of contents.
  Why: Claude can then jump to the part it needs.
- [ ] A script says if Claude must run it or read it. Example: "Run `scripts/make.mjs`. Do not read it."
  Why: a script that Claude runs costs almost no context, and it gives the same result each time.
- [ ] State that must survive an upgrade is stored outside the skill folder.
  Why: an upgrade replaces the skill folder.
- [ ] The skill has no paths or code snippets that go out of date fast. Point to the file instead.
  Why: a stale snippet is worse than none.

## Skills that run in their own context (`context: fork`)

- [ ] The skill has a task, not only guidelines, and `background: false` if you need the answer in the same turn.
  Why: a forked skill has no chat history. Without a task it does nothing. By default it runs in the background, so your chat does not wait for it.

## Tool limits

- [ ] If the skill must not edit files, it uses `disallowed-tools: Write Edit NotebookEdit`. (automatic)
  Why: `allowed-tools` only skips the permission prompt. It blocks nothing.
- [ ] If the work must not run commands that change files, use an agent with a plain `tools:` list and no `Bash`. (automatic)
  Why: in our test, an agent with `Bash(git log *)` in `tools:` still ran `ls -la`. The Claude Code docs do not describe this case, so do not rely on a pattern there. In `disallowedTools`, a pattern removes the whole tool.

## Test

- [ ] You ran the task once without the skill and wrote down where Claude went wrong.
  Why: without this, you cannot tell if the skill helped.
- [ ] You ran the skill on three different real tasks and read the whole transcript, not only the result.
  Why: the result can be right for the wrong reason. The transcript shows the reason.
- [ ] You tried five requests that should start the skill and five similar requests that should not.
  Why: a skill that starts on the wrong request is as bad as one that never starts.
- [ ] You tested in a fresh session.
  Why: the session where you wrote the skill remembers what you meant. A new session shows the gaps.
- [ ] If the skill will run on more than one model, you ran it on each one. Example: `haiku`, `sonnet` and `opus`.
  Why: a cheaper model follows vague text less well.
- [ ] If Claude skipped a step under pressure, you added a rule with the reason, and ran the test again.
  Why: a rule that you have not tested may not work.

## Fit

- [ ] The skill is the right tool. See "Skill or agent?" in the Docs page.
- [ ] `node scripts/validate.mjs <folder>` passes. (automatic)
