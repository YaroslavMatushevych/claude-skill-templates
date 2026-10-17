import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, existsSync, rmSync } from "node:fs";
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
