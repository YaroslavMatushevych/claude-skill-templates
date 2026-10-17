#!/usr/bin/env node
// Local web UI to build a skill or an agent.
// Usage: node scripts/ui.mjs [--port 4747] [--dir <project folder>] [--no-open]
// It listens on 127.0.0.1 only and saves files only inside the project folder.
import http from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { join, resolve, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { UserError } from "./lib.mjs";
import { createService, LIMITS } from "./service.mjs";

const PUBLIC = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};
const PORT = Number(flag("port", 4747));
const PROJECT = resolve(flag("dir", process.cwd()));
const service = createService({ hosted: false, project: PROJECT });

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".webmanifest": "application/manifest+json" };
const STATIC = /^(index\.html|app\.js|style\.css|zip\.js|theme\.js|site\.webmanifest|brand\/[a-z0-9._-]+\.(svg|png))$/;

function readBody(req) {
  return new Promise((ok, fail) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > LIMITS.body) {
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

const send = (res, status, body, type = "application/json") => {
  res.writeHead(status, {
    "content-type": type.startsWith("image/png") ? type : `${type}; charset=utf-8`, "cache-control": "no-store", "x-content-type-options": "nosniff",
    "content-security-policy": "default-src 'self'; style-src 'self' 'unsafe-inline'; connect-src *; img-src 'self' data:; frame-ancestors 'none'",
  });
  res.end(type === "application/json" ? JSON.stringify(body) : body);
};

const server = http.createServer(async (req, res) => {
  try {
    // Only this machine, and only a page that this server served. This blocks other sites from calling the API.
    const host = req.headers.host ?? "";
    if (![`localhost:${PORT}`, `127.0.0.1:${PORT}`].includes(host)) return send(res, 403, { error: "Wrong host." });
    if (req.method === "POST" && req.headers.origin !== `http://${host}`) return send(res, 403, { error: "Wrong origin." });

    const url = new URL(req.url, `http://${host}`);
    if (req.method === "GET") {
      if (url.pathname === "/api/templates") return send(res, 200, service.templates());
      const file = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
      if (STATIC.test(file) && existsSync(join(PUBLIC, file))) {
        const bytes = readFileSync(join(PUBLIC, file));
        return send(res, 200, extname(file) === ".png" ? bytes : bytes.toString("utf8"), TYPES[extname(file)]);
      }
    }
    if (req.method === "POST" && url.pathname === "/api/render") return send(res, 200, service.render(await readBody(req)));
    if (req.method === "POST" && url.pathname === "/api/check") return send(res, 200, await service.check(await readBody(req)));
    if (req.method === "POST" && url.pathname === "/api/save") return send(res, 200, await service.save(await readBody(req)));
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
