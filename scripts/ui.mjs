#!/usr/bin/env node
// Local web UI to build a skill or an agent.
// Usage: node scripts/ui.mjs [--port 4747] [--dir <project folder>] [--no-open]
// It listens on 127.0.0.1 only and saves files only inside the project folder.
import http from "node:http";
import { readFileSync, mkdtempSync, rmSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve, dirname, sep, relative } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import {
  TOOLS, UserError, listTemplates, renderSkill, renderAgent, createSkill, createAgent,
  addReference, addScript, checkSkill, checkAgent, fetchUrl, slug,
} from "./lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};
const PORT = Number(flag("port", 4747));
const PROJECT = resolve(flag("dir", process.cwd()));
const MAX_BODY = 2 * 1024 * 1024;

const inside = (base, target) => target === base || target.startsWith(base + sep);

function readBody(req) {
  return new Promise((ok, fail) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        fail(new UserError("The request is too large."));
        req.destroy();
      } else chunks.push(c);
    });
    req.on("end", () => {
      try {
        ok(JSON.parse(Buffer.concat(chunks).toString() || "{}"));
      } catch {
        fail(new UserError("The request is not valid JSON."));
      }
    });
  });
}

const brief = (i) => ({ change: i.change, keep: i.keep, test: i.test });
const str = (v) => (typeof v === "string" && v.trim() ? v.trim() : undefined);

function renderDraft(b) {
  const name = str(b.name) ?? "my-skill";
  return b.kind === "agent"
    ? renderAgent({ template: b.template, name, description: str(b.description), skills: b.skills ?? [], model: str(b.model), tools: b.tools?.length ? b.tools : undefined, maxTurns: str(b.maxTurns) })
    : renderSkill({ template: b.template, name, description: str(b.description) });
}

// Build in a temp folder to check, or in the project folder to save.
async function build(b, save) {
  const name = str(b.name);
  if (!name) throw new UserError("Give the skill a name.");
  const base = save ? PROJECT : mkdtempSync(join(tmpdir(), "skill-ui-"));
  try {
    const outDir = resolve(base, str(b.outDir) ?? (b.kind === "agent" ? ".claude/agents" : ".claude/skills"));
    if (!inside(base, outDir)) throw new UserError("The output folder must be inside the project folder.");
    const text = typeof b.text === "string" && b.text.trim() ? b.text : renderDraft(b);

    if (b.kind === "agent") {
      const made = createAgent({ name, template: b.template, dir: outDir, text });
      const result = checkAgent(made.path);
      return { ...result, path: made.path, finalText: readFileSync(made.path, "utf8"), files: [relative(base, made.path)], next: brief(made.info) };
    }

    const made = createSkill({ name, template: b.template, dir: outDir, text });
    for (const ref of b.references ?? []) {
      const when = str(ref.when);
      if (ref.url) {
        const content = `<!-- Source: ${ref.url} (fetched ${new Date().toISOString().slice(0, 10)}) -->\n\n${await fetchUrl(ref.url)}`;
        const last = new URL(ref.url).pathname.split("/").filter(Boolean).pop() ?? "reference";
        await addReference({ skill: made.path, content, as: str(ref.as) ?? `${slug(last.replace(/\.[a-z0-9]+$/i, ""))}.md`, when });
      } else if (ref.path) {
        const from = resolve(PROJECT, ref.path);
        if (!inside(PROJECT, from)) throw new UserError(`${ref.path} is outside the project folder.`);
        await addReference({ skill: made.path, source: from, when, as: str(ref.as) });
      } else {
        await addReference({ skill: made.path, content: String(ref.content ?? ""), when, as: str(ref.as) });
      }
    }
    for (const s of b.scripts ?? []) addScript({ skill: made.path, content: String(s.content ?? ""), as: str(s.as), read: !!s.read });
    const result = checkSkill(made.path);
    const files = [];
    const walk = (d) => readdirSync(d).forEach((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : files.push(relative(made.path, join(d, n)))));
    walk(made.path);
    return { ...result, path: made.path, finalText: readFileSync(join(made.path, "SKILL.md"), "utf8"), files: files.sort(), next: brief(made.info) };
  } finally {
    if (!save) rmSync(base, { recursive: true, force: true });
  }
}

const send = (res, status, body, type = "application/json") => {
  res.writeHead(status, { "content-type": `${type}; charset=utf-8`, "cache-control": "no-store", "x-content-type-options": "nosniff" });
  res.end(type === "application/json" ? JSON.stringify(body) : body);
};

const server = http.createServer(async (req, res) => {
  try {
    // Only this machine, and only a page that this server served. This blocks other sites from calling the API.
    const host = req.headers.host ?? "";
    if (![`localhost:${PORT}`, `127.0.0.1:${PORT}`].includes(host)) return send(res, 403, { error: "Wrong host." });
    if (req.method === "POST" && req.headers.origin !== `http://${host}`) return send(res, 403, { error: "Wrong origin." });

    const url = new URL(req.url, `http://${host}`);
    if (req.method === "GET" && url.pathname === "/") return send(res, 200, readFileSync(join(HERE, "ui.html"), "utf8"), "text/html");
    if (req.method === "GET" && url.pathname === "/api/templates") {
      return send(res, 200, { skill: listTemplates("skill"), agent: listTemplates("agent"), tools: TOOLS, project: PROJECT });
    }
    if (req.method === "POST" && url.pathname === "/api/render") return send(res, 200, { text: renderDraft(await readBody(req)) });
    if (req.method === "POST" && url.pathname === "/api/check") return send(res, 200, await build(await readBody(req), false));
    if (req.method === "POST" && url.pathname === "/api/save") return send(res, 200, await build(await readBody(req), true));
    return send(res, 404, { error: "Not found." });
  } catch (e) {
    if (e instanceof UserError) return send(res, 400, { error: e.message });
    console.error(e);
    return send(res, 500, { error: "Something went wrong. See the terminal." });
  }
});

if (!existsSync(PROJECT)) {
  console.error(`Error: ${PROJECT} does not exist.`);
  process.exit(1);
}
server.listen(PORT, "127.0.0.1", () => {
  const url = `http://localhost:${PORT}`;
  console.log(`Skill builder: ${url}\nProject folder: ${PROJECT}\nPress Ctrl+C to stop.`);
  if (!args.includes("--no-open")) {
    const opener = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
    spawn(opener, [url], { stdio: "ignore", detached: true, shell: process.platform === "win32" }).on("error", () => {}).unref();
  }
});
