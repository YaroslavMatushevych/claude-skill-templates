import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, existsSync, readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const UI = join(dirname(fileURLToPath(import.meta.url)), "..", "scripts", "ui.mjs");
const PORT = 4800 + Math.floor(Math.random() * 100);
const BASE = `http://localhost:${PORT}`;
let server;
let project;

before(async () => {
  project = mkdtempSync(join(tmpdir(), "ui-test-"));
  mkdirSync(join(project, "docs"));
  writeFileSync(join(project, "docs", "style.md"), "# Style\n\nUse UTC.\n");
  server = spawn(process.execPath, [UI, "--dir", project, "--port", String(PORT), "--no-open"], { stdio: "ignore" });
  for (let i = 0; i < 50; i++) {
    try {
      if ((await fetch(`${BASE}/api/templates`)).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error("The UI server did not start.");
});

after(() => {
  server.kill();
  rmSync(project, { recursive: true, force: true });
});

const post = (path, body, origin = BASE) =>
  fetch(`${BASE}${path}`, { method: "POST", headers: { "content-type": "application/json", origin }, body: JSON.stringify(body) });

test("serves the page and the template lists", async () => {
  assert.match(await (await fetch(BASE)).text(), /Skill builder/);
  const t = await (await fetch(`${BASE}/api/templates`)).json();
  assert.deepEqual(t.skill.map((x) => x.name), ["generate", "guardrail", "investigate", "knowledge", "review", "workflow"]);
  assert.deepEqual(t.agent.map((x) => x.name), ["explorer", "implementer", "planner", "reviewer", "tester"]);
  assert.ok(t.skill[0].keep.length > 0);
});

test("refuses a POST from another origin", async () => {
  assert.equal((await post("/api/check", {}, "http://evil.example")).status, 403);
});

test("check builds in a temp folder and saves nothing", async () => {
  const r = await post("/api/check", { kind: "skill", template: "workflow", name: "temp-skill" });
  assert.equal(r.status, 200);
  assert.equal(existsSync(join(project, ".claude/skills/temp-skill")), false);
});

test("save writes the skill with a reference and a pointer, and the check passes", async () => {
  const r = await post("/api/save", {
    kind: "skill", template: "workflow", name: "release-notes", description: "Write release notes. Use when asked for release notes.",
    references: [{ path: "docs/style.md", as: "style.md", when: "you write the notes" }],
  });
  const body = await r.json();
  assert.equal(r.status, 200, JSON.stringify(body));
  assert.deepEqual(body.errors, []);
  assert.match(readFileSync(join(project, ".claude/skills/release-notes/SKILL.md"), "utf8"), /When you write the notes, read `references\/style\.md`\./);
  assert.equal(existsSync(join(project, ".claude/skills/release-notes/references/style.md")), true);
});

test("save writes an agent file", async () => {
  const r = await post("/api/save", { kind: "agent", template: "reviewer", name: "diff-reviewer", model: "opus" });
  const body = await r.json();
  assert.equal(r.status, 200, JSON.stringify(body));
  assert.match(readFileSync(join(project, ".claude/agents/diff-reviewer.md"), "utf8"), /^model: opus$/m);
});

test("refuses paths outside the project, bad URLs and a reused name", async () => {
  const base = { kind: "skill", template: "workflow" };
  assert.equal((await post("/api/save", { ...base, name: "a-skill", outDir: "../escape" })).status, 400);
  assert.equal((await post("/api/save", { ...base, name: "b-skill", references: [{ path: "../../etc/hosts", as: "h.md", when: "x" }] })).status, 400);
  assert.equal((await post("/api/check", { ...base, name: "c-skill", references: [{ url: "file:///etc/passwd", when: "x" }] })).status, 400);
  assert.equal((await post("/api/check", { ...base, name: "d-skill", references: [{ url: "http://localhost:1/x", when: "x" }] })).status, 400);
  assert.equal((await post("/api/save", { ...base, name: "release-notes" })).status, 400);
});
