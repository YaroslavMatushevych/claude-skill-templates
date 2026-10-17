import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { zip, crc32 } from "../public/zip.js";
import { createService } from "../scripts/service.mjs";
import templatesHandler from "../api/templates.mjs";
import checkHandler from "../api/check.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const hosted = createService({ hosted: true });
const base = { kind: "skill", template: "workflow", name: "demo-skill" };

function call(handler, req) {
  return new Promise((ok) => {
    const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(code) { this.code = code; return this; }, json(body) { ok({ code: this.code, body }); } };
    handler({ headers: { host: "app.example" }, ...req }, res);
  });
}

test("hosted mode checks a skill and returns the files, and refuses to save", async () => {
  const r = await hosted.check({ ...base, references: [{ content: "# Notes\n", as: "notes.md", when: "you write the notes" }] });
  assert.deepEqual(r.errors, []);
  assert.deepEqual(r.files.map((f) => f.path), [".claude/skills/demo-skill/SKILL.md", ".claude/skills/demo-skill/references/notes.md"]);
  assert.match(r.finalText, /read `references\/notes\.md`/);
  await assert.rejects(() => hosted.save(base), /Download the zip/);
});

test("hosted mode refuses local files, server-side URLs and absolute folders", async () => {
  await assert.rejects(() => hosted.check({ ...base, references: [{ path: "x.md", as: "x.md", when: "x" }] }), /only available when you run the builder on your machine/);
  await assert.rejects(() => hosted.check({ ...base, references: [{ url: "https://example.com/x.md", when: "x" }] }), /browser downloads URLs/);
  await assert.rejects(() => hosted.check({ ...base, outDir: "/etc" }), /inside the project folder/);
  await assert.rejects(() => hosted.check({ ...base, outDir: "../up" }), /inside the project folder|relative folder/);
});

test("hosted mode limits the number and size of files", async () => {
  const many = Array.from({ length: 11 }, (_, i) => ({ content: "x", as: `a${i}.md`, when: "x" }));
  await assert.rejects(() => hosted.check({ ...base, references: many }), /at most 10 references/);
  await assert.rejects(() => hosted.check({ ...base, references: [{ content: "x".repeat(300_001), as: "big.md", when: "x" }] }), /larger than/);
});

test("the API functions answer like the local server", async () => {
  const t = await call(templatesHandler, { method: "GET" });
  assert.equal(t.code, 200);
  assert.equal(t.body.hosted, true);
  assert.equal((await call(templatesHandler, { method: "POST" })).code, 405);
  const ok = await call(checkHandler, { method: "POST", body: base, headers: { host: "app.example", origin: "https://app.example" } });
  assert.equal(ok.code, 200);
  assert.deepEqual(ok.body.errors, []);
  const other = await call(checkHandler, { method: "POST", body: base, headers: { host: "app.example", origin: "https://evil.example" } });
  assert.equal(other.code, 403);
  const invalid = await call(checkHandler, { method: "POST", body: { ...base, name: "Bad Name" }, headers: { host: "app.example" } });
  assert.equal(invalid.code, 400);
});

test("the zip writer makes a valid archive with the right folders", () => {
  assert.equal(crc32(new TextEncoder().encode("123456789")), 0xcbf43926);
  const dir = mkdtempSync(join(tmpdir(), "zip-test-"));
  const file = join(dir, "t.zip");
  writeFileSync(file, zip([{ path: ".claude/skills/demo/SKILL.md", content: "---\nname: demo\n---\nHello é ✓\n" }, { path: ".claude/skills/demo/references/a.md", content: "# A\n" }]));
  const r = spawnSync("python3", ["-c", "import zipfile,sys; z=zipfile.ZipFile(sys.argv[1]); assert z.testzip() is None; print(sorted(z.namelist())); print(z.read('.claude/skills/demo/SKILL.md').decode('utf8'))", file], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /\.claude\/skills\/demo\/references\/a\.md/);
  assert.match(r.stdout, /Hello é ✓/);
  rmSync(dir, { recursive: true });
});

test("vercel.json bundles the templates into the functions", async () => {
  const { readFileSync } = await import("node:fs");
  const v = JSON.parse(readFileSync(join(HERE, "..", "vercel.json"), "utf8"));
  assert.match(v.functions["api/*.mjs"].includeFiles, /templates/);
  assert.match(v.functions["api/*.mjs"].includeFiles, /agent-templates/);
  assert.equal(existsSync(join(HERE, "..", "public", "index.html")), true);
});

test(".vercelignore does not exclude the templates", async () => {
  const { readFileSync } = await import("node:fs");
  const lines = readFileSync(join(HERE, "..", ".vercelignore"), "utf8").split("\n").map((l) => l.trim()).filter(Boolean);
  for (const l of lines) assert.doesNotMatch(l, /\*|templates|agent-templates|scripts|api|public/, `\`${l}\` could remove files the app needs`);
});

test("skill options write the real frontmatter fields", () => {
  const svc = createService({ hosted: true });
  const text = (b) => svc.render({ ...base, ...b }).text;
  const on = text({ fields: { "disable-model-invocation": true, model: "haiku", effort: "high", context: true, agent: "Explore", "disallowed-tools": ["Write", "Edit"], "allowed-tools": ["Bash(git diff *)"], paths: ["src/**/*.ts"], when_to_use: "release notes", "argument-hint": "[range]", arguments: ["range"] } });
  assert.match(on, /^disable-model-invocation: true$/m);
  assert.match(on, /^model: haiku$/m);
  assert.match(on, /^effort: high$/m);
  assert.match(on, /^context: fork$/m);
  assert.match(on, /^agent: Explore$/m);
  assert.match(on, /^disallowed-tools:\n  - Write\n  - Edit$/m);
  assert.match(on, /^allowed-tools:\n  - Bash\(git diff \*\)$/m);
  assert.match(on, /^paths:\n  - src\/\*\*\/\*\.ts$/m);
  assert.match(on, /^when_to_use: release notes$/m);
  // "Only Claude" writes user-invocable: false, and an empty value removes the field again
  assert.match(text({ fields: { "user-invocable": true } }), /^user-invocable: false$/m);
  const off = svc.render({ kind: "skill", template: "generate", name: "x-skill", fields: { "disable-model-invocation": false } }).text;
  assert.doesNotMatch(off, /disable-model-invocation/);
  const cleared = svc.render({ kind: "skill", template: "review", name: "x-skill", fields: { "disallowed-tools": [], context: false } }).text;
  assert.doesNotMatch(cleared, /disallowed-tools|context:/);
  // invalid values are refused
  assert.throws(() => text({ fields: { model: "gpt-9" } }), /must be/);
  assert.throws(() => text({ fields: { effort: "huge" } }), /effort/);
  assert.throws(() => text({ fields: { "disallowed-tools": ["Nope"] } }), /not a tool name/);
  assert.throws(() => text({ fields: { surprise: "x" } }), /not a field the builder can set/);
  // a full model id and an MCP tool are accepted
  assert.match(text({ fields: { model: "claude-opus-5-5", "allowed-tools": ["mcp__github__*"] } }), /^model: claude-opus-5-5$/m);
});

test("agent options write the real frontmatter fields", () => {
  const svc = createService({ hosted: true });
  const t = svc.render({ kind: "agent", template: "implementer", name: "x-agent", skills: ["workflow"], fields: { tools: ["Read", "Grep", "mcp__github__*"], model: "opus", maxTurns: "12", effort: "low", permissionMode: "plan", memory: "project", background: true, isolation: true, color: "blue", mcpServers: ["github"], disallowedTools: ["Bash"] } }).text;
  assert.match(t, /^tools: Read, Grep, mcp__github__\*$/m);
  assert.match(t, /^model: opus$/m);
  assert.match(t, /^maxTurns: 12$/m);
  assert.match(t, /^permissionMode: plan$/m);
  assert.match(t, /^memory: project$/m);
  assert.match(t, /^background: true$/m);
  assert.match(t, /^isolation: worktree$/m);
  assert.match(t, /^color: blue$/m);
  assert.match(t, /^mcpServers:\n  - github$/m);
  assert.match(t, /^disallowedTools: Bash$/m);
  assert.match(t, /Follow the preloaded workflow skill\./);
});

test("the check warns about unknown fields, bad enums and unusable skills", async () => {
  const svc = createService({ hosted: true });
  const text = svc.render(base).text.replace("---\n", "---\ntool: Read\nuser-invocable: false\ndisable-model-invocation: true\n");
  const r = await svc.check({ ...base, text });
  assert.ok(r.warnings.some((w) => /`tool` is not a field/.test(w)));
  assert.ok(r.errors.some((e) => /Nobody can start this skill/.test(e)));
  const agent = svc.render({ kind: "agent", template: "explorer", name: "x-agent" }).text.replace("model: haiku", "model: haiku\npermissionMode: bypassPermissions\ncolor: pinkish");
  const a = await svc.check({ kind: "agent", template: "explorer", name: "x-agent", text: agent });
  assert.ok(a.errors.some((e) => /color: pinkish/.test(e)));
  assert.ok(a.warnings.some((w) => /bypassPermissions/.test(w)));
});

test("the template list says what each skill template does by default", () => {
  const t = createService({ hosted: true }).templates();
  const review = t.skill.find((x) => x.name === "review");
  assert.deepEqual(review.disallowed, ["Write", "Edit", "NotebookEdit"]);
  assert.equal(t.skill.find((x) => x.name === "generate").userStarted, true);
  assert.equal(t.skill.find((x) => x.name === "investigate").fork, true);
  assert.deepEqual(t.projectSkills, []);
});

test("local mode lists the skills in the project, hosted mode never does", () => {
  const dir = mkdtempSync(join(tmpdir(), "proj-"));
  mkdirSync(join(dir, ".claude/skills/mine"), { recursive: true });
  writeFileSync(join(dir, ".claude/skills/mine/SKILL.md"), "---\nname: mine\ndescription: A skill. Use when asked.\n---\nBody\n");
  mkdirSync(join(dir, ".claude/skills/manual"), { recursive: true });
  writeFileSync(join(dir, ".claude/skills/manual/SKILL.md"), "---\nname: manual\ndescription: Another. Use when asked.\ndisable-model-invocation: true\n---\nBody\n");
  assert.deepEqual(createService({ hosted: false, project: dir }).templates().projectSkills, [{ name: "manual", userStarted: true }, { name: "mine", userStarted: false }]);
  assert.deepEqual(createService({ hosted: true, project: dir }).templates().projectSkills, []);
  rmSync(dir, { recursive: true });
});
