import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const SKILL = join(dirname(fileURLToPath(import.meta.url)), "..", "scripts", "skill.mjs");
const run = (args, cwd) => spawnSync(process.execPath, [SKILL, ...args], { cwd, encoding: "utf8" });
const tmp = () => mkdtempSync(join(tmpdir(), "skill-test-"));

test("every template passes the validator", () => {
  const r = spawnSync(process.execPath, [join(dirname(SKILL), "validate.mjs"), join(dirname(SKILL), "..", "templates")], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stdout);
  assert.doesNotMatch(r.stdout, /warning/);
});

test("templates lists every template with its description", () => {
  const r = run(["templates"], tmp());
  assert.equal(r.status, 0);
  for (const t of ["workflow", "investigate", "generate", "review", "knowledge", "guardrail"]) {
    assert.match(r.stdout, new RegExp(`^\\s+${t}\\s`, "m"));
  }
});

test("new creates a skill with the given name and description", () => {
  const cwd = tmp();
  const r = run(["new", "pr-planner", "--template", "workflow", "--description", "Plan a pull request. Use before a change."], cwd);
  assert.equal(r.status, 0, r.stderr);
  const text = readFileSync(join(cwd, ".claude/skills/pr-planner/SKILL.md"), "utf8");
  assert.match(text, /^name: pr-planner$/m);
  assert.match(text, /^description: Plan a pull request\. Use before a change\.$/m);
  assert.match(r.stdout, /Change:/);
  assert.match(r.stdout, /Keep:/);
  assert.equal(existsSync(join(cwd, ".claude/skills/pr-planner/INSTRUCTIONS.md")), false);
  rmSync(cwd, { recursive: true });
});

test("new refuses an existing folder, a bad name and an unknown template", () => {
  const cwd = tmp();
  assert.equal(run(["new", "a-skill", "--template", "generate"], cwd).status, 0);
  assert.equal(run(["new", "a-skill", "--template", "generate"], cwd).status, 1);
  assert.equal(run(["new", "Bad_Name", "--template", "generate"], cwd).status, 1);
  assert.equal(run(["new", "claude-helper", "--template", "generate"], cwd).status, 1);
  const unknown = run(["new", "x-skill", "--template", "nope"], cwd);
  assert.equal(unknown.status, 1);
  assert.match(unknown.stderr, /Available:/);
  rmSync(cwd, { recursive: true });
});

test("add-reference copies the file and writes a pointer with the when-to-read wording", () => {
  const cwd = tmp();
  run(["new", "dates", "--template", "investigate"], cwd);
  writeFileSync(join(cwd, "notes.md"), "# Date traps\n\nUse UTC.\n");
  const r = run(["add-reference", ".claude/skills/dates", "notes.md", "--when", "you write a date filter"], cwd);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(readFileSync(join(cwd, ".claude/skills/dates/references/notes.md"), "utf8"), "# Date traps\n\nUse UTC.\n");
  const skill = readFileSync(join(cwd, ".claude/skills/dates/SKILL.md"), "utf8");
  assert.match(skill, /^## References$/m);
  assert.match(skill, /- When you write a date filter, read `references\/notes\.md`\./);
  assert.equal(run(["check", ".claude/skills/dates"], cwd).status, 0);
  rmSync(cwd, { recursive: true });
});

test("add-reference needs --when, and adds a table of contents to a long file", () => {
  const cwd = tmp();
  run(["new", "api-notes", "--template", "investigate"], cwd);
  writeFileSync(join(cwd, "long.md"), "# Title\n\n## Auth\n" + "text\n".repeat(60) + "## Errors\n" + "text\n".repeat(60));
  assert.equal(run(["add-reference", ".claude/skills/api-notes", "long.md"], cwd).status, 1);
  const r = run(["add-reference", ".claude/skills/api-notes", "long.md", "--when", "you handle an API error"], cwd);
  assert.equal(r.status, 0, r.stderr);
  const ref = readFileSync(join(cwd, ".claude/skills/api-notes/references/long.md"), "utf8");
  assert.match(ref, /^## Contents\n\n- Title\n- Auth\n- Errors\n/);
  rmSync(cwd, { recursive: true });
});

test("add-script copies the script and says to run it, not read it", () => {
  const cwd = tmp();
  run(["new", "builder", "--template", "generate"], cwd);
  writeFileSync(join(cwd, "make.mjs"), "console.log('made');\n");
  const r = run(["add-script", ".claude/skills/builder", "make.mjs"], cwd);
  assert.equal(r.status, 0, r.stderr);
  const skill = readFileSync(join(cwd, ".claude/skills/builder/SKILL.md"), "utf8");
  assert.match(skill, /^## Scripts$/m);
  assert.match(skill, /Run `node \$\{CLAUDE_SKILL_DIR\}\/scripts\/make\.mjs`\. Do not read it\./);
  assert.equal(existsSync(join(cwd, ".claude/skills/builder/scripts/make.mjs")), true);
  rmSync(cwd, { recursive: true });
});

test("check fails when SKILL.md points to a missing file", () => {
  const cwd = tmp();
  run(["new", "checker", "--template", "generate"], cwd);
  const file = join(cwd, ".claude/skills/checker/SKILL.md");
  writeFileSync(file, readFileSync(file, "utf8") + "\nRead `references/gone.md` first.\n");
  const bad = run(["check", ".claude/skills/checker"], cwd);
  assert.equal(bad.status, 1);
  assert.match(bad.stdout, /references\/gone\.md/);
  rmSync(cwd, { recursive: true });
});
