// Shared code for the command line (skill.mjs), the validator (validate.mjs) and the web UI (ui.mjs).
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, basename, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export class UserError extends Error {}
const bad = (message) => {
  throw new UserError(message);
};

export const KINDS = {
  skill: { dir: join(ROOT, "templates"), file: "SKILL.md" },
  agent: { dir: join(ROOT, "agent-templates"), file: "AGENT.md" },
};
export const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MAX_NAME = 64;
const MAX_DESCRIPTION = 1024;
const MAX_BODY_LINES = 500;
const TOC_AFTER_LINES = 100;
export const TOOLS = ["Read", "Grep", "Glob", "Edit", "Write", "Bash", "WebFetch", "WebSearch"];
const KNOWN_TOOLS = new Set([...TOOLS, "NotebookEdit", "TodoWrite", "Task"]);
const WRITE_TOOLS = ["Edit", "Write", "NotebookEdit"];
const MODELS = new Set(["haiku", "sonnet", "opus", "inherit"]);

// ---------- frontmatter ----------

export function splitFrontmatter(text) {
  if (!text.startsWith("---\n")) return { error: "Line 1 must be `---`." };
  const end = text.indexOf("\n---", 4);
  if (end === -1) return { error: "Frontmatter has no closing `---`." };
  return { raw: text.slice(4, end), body: text.slice(end + 4).replace(/^\n/, "") };
}

export function parseFields(raw) {
  const fields = {};
  const lists = {};
  let key = null;
  for (const line of raw.split("\n")) {
    const m = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    const item = line.match(/^\s+-\s+(.+)$/);
    if (m) {
      key = m[1];
      fields[key] = m[2];
    } else if (item && key) {
      (lists[key] ??= []).push(item[1].trim());
    } else if (key && /^\s+\S/.test(line)) {
      fields[key] += " " + line.trim();
    }
  }
  return { fields, lists };
}

// Set or insert one frontmatter field. A value of null removes it.
function setField(text, key, value) {
  const fm = splitFrontmatter(text);
  if (fm.error) bad(fm.error);
  const lines = fm.raw.split("\n");
  const at = lines.findIndex((l) => new RegExp(`^${key}:`).test(l));
  let end = at;
  if (at !== -1) {
    while (end + 1 < lines.length && /^(\s+\S|\s*-\s)/.test(lines[end + 1])) end++;
  }
  const replacement = value === null ? [] : Array.isArray(value) ? [`${key}:`, ...value.map((v) => `  - ${v}`)] : [`${key}: ${value}`];
  if (at === -1) lines.push(...replacement);
  else lines.splice(at, end - at + 1, ...replacement);
  return `---\n${lines.join("\n")}\n---\n${fm.body}`;
}

// ---------- templates ----------

export function templateNames(kind) {
  const { dir, file } = KINDS[kind];
  return readdirSync(dir).filter((n) => existsSync(join(dir, n, file))).sort();
}

function instructionField(instructions, label) {
  const m = instructions.match(new RegExp(`\\*\\*${label}:\\*\\*([^\\n]*(?:\\n(?!\\*\\*)[^\\n]*)*)`));
  return m ? m[1].replace(/\n\s*/g, " ").trim() : "";
}

export function templateInfo(kind, name) {
  const { dir, file } = KINDS[kind];
  if (!templateNames(kind).includes(name)) bad(`Unknown ${kind} template \`${name}\`. Available: ${templateNames(kind).join(", ")}.`);
  const text = readFileSync(join(dir, name, file), "utf8");
  const instructionsPath = join(dir, name, "INSTRUCTIONS.md");
  const instructions = existsSync(instructionsPath) ? readFileSync(instructionsPath, "utf8") : "";
  const { fields, lists } = parseFields(splitFrontmatter(text).raw);
  return {
    kind,
    name,
    description: fields.description ?? "",
    tools: fields.tools ?? fields["allowed-tools"] ?? "",
    model: fields.model ?? "",
    maxTurns: fields.maxTurns ?? "",
    skills: lists.skills ?? [],
    userStarted: fields["disable-model-invocation"] === "true",
    fork: fields.context === "fork",
    disallowed: (fields["disallowed-tools"] ?? "").split(/\s+/).filter(Boolean),
    purpose: instructionField(instructions, "Purpose"),
    useWhen: instructionField(instructions, "Use when"),
    change: instructionField(instructions, "Change"),
    keep: instructionField(instructions, "Keep"),
    test: instructionField(instructions, "Test"),
    text,
  };
}

export const listTemplates = (kind) => templateNames(kind).map((n) => templateInfo(kind, n));

// ---------- rendering ----------

function checkName(name) {
  if (!name || !NAME_RE.test(name) || name.length > MAX_NAME) bad("Give a name in lowercase with hyphens, up to 64 characters, for example `pr-summary`.");
  if (/anthropic|claude/.test(name)) bad("The name must not contain `anthropic` or `claude`.");
}

function checkDescription(description) {
  if (description.length > MAX_DESCRIPTION) bad(`The description is longer than ${MAX_DESCRIPTION} characters.`);
  if (/\n/.test(description)) bad("Write the description on one line.");
}

export function renderSkill({ template, name, description, userStarted, model, fork, disallowed }) {
  checkName(name);
  let text = templateInfo("skill", template).text;
  text = setField(text, "name", name);
  if (description) {
    checkDescription(description);
    text = setField(text, "description", description);
  }
  if (typeof userStarted === "boolean") text = setField(text, "disable-model-invocation", userStarted ? "true" : null);
  if (model) {
    if (!MODELS.has(model)) bad(`The model must be one of: ${[...MODELS].join(", ")}.`);
    text = setField(text, "model", model);
  }
  if (typeof fork === "boolean") text = setField(text, "context", fork ? "fork" : null);
  if (Array.isArray(disallowed)) {
    for (const t of disallowed) if (!KNOWN_TOOLS.has(t)) bad(`\`${t}\` is not a tool name that Claude Code knows.`);
    text = setField(text, "disallowed-tools", disallowed.length ? disallowed.join(" ") : null);
  }
  return text;
}

export function renderAgent({ template, name, description, skills = [], model, tools, maxTurns }) {
  checkName(name);
  let text = templateInfo("agent", template).text;
  text = setField(text, "name", name);
  if (description) {
    checkDescription(description);
    text = setField(text, "description", description);
  }
  if (tools) text = setField(text, "tools", Array.isArray(tools) ? tools.join(", ") : tools);
  if (model) {
    if (!MODELS.has(model)) bad(`The model must be one of: ${[...MODELS].join(", ")}.`);
    text = setField(text, "model", model);
  }
  if (maxTurns) {
    if (!/^\d+$/.test(String(maxTurns))) bad("maxTurns must be a number.");
    text = setField(text, "maxTurns", String(maxTurns));
  }
  if (skills.length) {
    for (const s of skills) if (!NAME_RE.test(s)) bad(`\`${s}\` is not a valid skill name.`);
    text = setField(text, "skills", skills);
    const fm = splitFrontmatter(text);
    const lines = skills.map((s) => `Follow the preloaded ${s} skill.`).join("\n");
    text = text.replace(fm.body, `${lines}\n${fm.body}`);
  }
  return text;
}

// ---------- files ----------

function copyDir(src, dest, skip) {
  mkdirSync(dest, { recursive: true });
  for (const name of readdirSync(src)) {
    if (skip.includes(name)) continue;
    const from = join(src, name);
    const to = join(dest, name);
    if (statSync(from).isDirectory()) copyDir(from, to, skip);
    else copyFileSync(from, to);
  }
}

// Add a line to a `## <heading>` section. Create the section before `## Gotchas`, or at the end.
export function addToSection(text, heading, line) {
  const start = text.search(new RegExp(`^## ${heading}\\s*$`, "m"));
  if (start === -1) {
    const block = `## ${heading}\n\n${line}\n`;
    const gotchas = text.search(/^## Gotchas\s*$/m);
    if (gotchas === -1) return `${text.replace(/\n*$/, "\n")}\n${block}`;
    return `${text.slice(0, gotchas)}${block}\n${text.slice(gotchas)}`;
  }
  const rest = text.slice(start + 1);
  const next = rest.search(/\n## /);
  const end = next === -1 ? text.length : start + 1 + next;
  const section = text.slice(start, end).replace(/\n*$/, "\n");
  return `${text.slice(0, start)}${section}${line}\n${end < text.length ? "\n" : ""}${text.slice(end).replace(/^\n+/, "")}`;
}

export const slug = (s) => s.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");

export function withContents(text) {
  const lines = text.split("\n");
  if (lines.length <= TOC_AFTER_LINES) return text;
  if (/^#{1,6}\s*(table of )?contents\s*$/im.test(lines.slice(0, 40).join("\n"))) return text;
  const headings = lines.filter((l) => /^#{1,3} /.test(l)).map((l) => `- ${l.replace(/^#+\s*/, "")}`);
  if (headings.length === 0) return text;
  return `## Contents\n\n${headings.join("\n")}\n\n${text}`;
}

export function requireSkill(dir) {
  if (!dir) bad("Give the skill folder.");
  const skill = resolve(dir);
  if (!existsSync(join(skill, "SKILL.md"))) bad(`No SKILL.md in ${skill}.`);
  return skill;
}

export function createSkill({ name, template, dir = ".claude/skills", description, text }) {
  checkName(name);
  templateInfo("skill", template);
  const target = join(resolve(dir), name);
  if (existsSync(target)) bad(`${target} already exists. Choose another name.`);
  const { dir: templateRoot } = KINDS.skill;
  copyDir(join(templateRoot, template), target, ["INSTRUCTIONS.md", "SKILL.md"]);
  writeFileSync(join(target, "SKILL.md"), text ?? renderSkill({ template, name, description }));
  return { path: target, info: templateInfo("skill", template) };
}

export function createAgent({ name, template, dir = ".claude/agents", description, skills, model, tools, maxTurns, text }) {
  checkName(name);
  templateInfo("agent", template);
  const target = join(resolve(dir), `${name}.md`);
  if (existsSync(target)) bad(`${target} already exists. Choose another name.`);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, text ?? renderAgent({ template, name, description, skills, model, tools, maxTurns }));
  return { path: target, info: templateInfo("agent", template) };
}

export async function addReference({ skill, source, content, when, as, force }) {
  const dir = requireSkill(skill);
  if (!when) bad('Say when Claude should read the file, for example "you write a date filter". Those words decide when Claude opens it.');
  let text = content;
  let name = as;
  if (text === undefined) {
    if (!source) bad("Give a file path or a URL to add.");
    if (/^https?:\/\//.test(source)) {
      const res = await fetchUrl(source);
      const url = new URL(source);
      const last = url.pathname.split("/").filter(Boolean).pop() ?? url.hostname;
      name ??= `${slug(last.replace(/\.[a-z0-9]+$/i, ""))}.md`;
      text = `<!-- Source: ${source} (fetched ${new Date().toISOString().slice(0, 10)}) -->\n\n${res}`;
    } else {
      const from = resolve(source);
      if (!existsSync(from)) bad(`${from} does not exist.`);
      name ??= slug(basename(from));
      text = readFileSync(from, "utf8");
    }
  }
  if (!name || !/^[a-z0-9._-]+\.[a-z0-9]+$/.test(name)) bad(`The file name \`${name ?? ""}\` is not valid. Use lowercase letters, digits, dots and hyphens, with an extension.`);
  const target = join(dir, "references", name);
  if (existsSync(target) && !force) bad(`${target} already exists. Use --force to replace it.`);
  mkdirSync(join(dir, "references"), { recursive: true });
  const body = extname(name) === ".md" ? withContents(text) : text;
  writeFileSync(target, body);
  const skillFile = join(dir, "SKILL.md");
  const line = `- When ${when.replace(/^when\s+/i, "").replace(/[.\s]+$/, "")}, read \`references/${name}\`.`;
  const current = readFileSync(skillFile, "utf8");
  if (!current.includes(`references/${name}`)) writeFileSync(skillFile, addToSection(current, "References", line));
  return { name, lines: body.split("\n").length, tocAdded: body !== text, line };
}

export async function fetchUrl(source) {
  const url = new URL(source);
  if (!/^https?:$/.test(url.protocol)) bad("Only http and https URLs are allowed.");
  if (/^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?$|0\.0\.0\.0)/i.test(url.hostname)) bad("URLs on this machine or a private network are not allowed.");
  const res = await fetch(source).catch((e) => bad(`Could not fetch ${source}: ${e.message}`));
  if (!res.ok) bad(`Could not fetch ${source}: HTTP ${res.status}.`);
  return res.text();
}

export function addScript({ skill, source, content, as, read, force }) {
  const dir = requireSkill(skill);
  let text = content;
  let name = as;
  if (text === undefined) {
    if (!source) bad("Give the script file to add.");
    const from = resolve(source);
    if (!existsSync(from)) bad(`${from} does not exist.`);
    name ??= basename(from);
    text = readFileSync(from, "utf8");
  }
  if (!name || !/^[A-Za-z0-9._-]+\.[A-Za-z0-9]+$/.test(name)) bad(`The script name \`${name ?? ""}\` is not valid.`);
  const target = join(dir, "scripts", name);
  if (existsSync(target) && !force) bad(`${target} already exists. Use --force to replace it.`);
  mkdirSync(join(dir, "scripts"), { recursive: true });
  writeFileSync(target, text);
  const runner = { ".mjs": "node", ".js": "node", ".py": "python3", ".sh": "bash" }[extname(name)] ?? "";
  const path = "${CLAUDE_SKILL_DIR}/scripts/" + name;
  const line = read
    ? `- Read \`${path}\` before you change the files it builds.`
    : `- Run \`${runner ? runner + " " : ""}${path}\`. Do not read it. If it prints an error, fix the input and run it again.`;
  const skillFile = join(dir, "SKILL.md");
  const current = readFileSync(skillFile, "utf8");
  if (!current.includes(`scripts/${name}`)) writeFileSync(skillFile, addToSection(current, "Scripts", line));
  return { name, line };
}

// ---------- checks ----------

export function checkSkill(folder) {
  const errors = [];
  const warnings = [];
  const parsed = splitFrontmatter(readFileSync(join(folder, "SKILL.md"), "utf8"));
  if (parsed.error) return { errors: [parsed.error], warnings };
  const { fields } = parseFields(parsed.raw);
  const { body } = parsed;
  const isTemplate = folder.split("/").includes("templates");

  const name = fields.name ?? "";
  if (!name) errors.push("Missing `name`.");
  else {
    if (!/^[a-z0-9-]+$/.test(name)) errors.push("`name` may only have lowercase letters, digits and hyphens.");
    if (name.length > MAX_NAME) errors.push(`\`name\` is longer than ${MAX_NAME} characters.`);
    if (/anthropic|claude/.test(name)) errors.push("`name` must not contain `anthropic` or `claude`.");
    if (!isTemplate && name !== basename(folder)) warnings.push(`\`name\` (${name}) differs from the folder name (${basename(folder)}).`);
  }

  const description = (fields.description ?? "").replace(/^>[-+]?\s*/, "").trim();
  if (!description) errors.push("Missing `description`.");
  else {
    if (description.length > MAX_DESCRIPTION) errors.push(`\`description\` is longer than ${MAX_DESCRIPTION} characters.`);
    if (/<[a-zA-Z/][^>]*>/.test(description)) errors.push("`description` must not contain XML or HTML tags.");
    if (/^(I|You|We)\b/.test(description)) warnings.push("Write the description in the third person.");
    if (/\b(1\.|2\.|step 1|first,)/i.test(description)) warnings.push("The description seems to list steps. Say what the skill makes and when to use it.");
    if (!/\b(use|when|only)\b/i.test(description)) warnings.push("The description does not say when to use the skill.");
  }

  const lines = body.split("\n").length;
  if (lines >= MAX_BODY_LINES) errors.push(`SKILL.md body has ${lines} lines. Keep it under ${MAX_BODY_LINES}.`);
  if (!isTemplate) {
    if (/^TEMPLATE:/m.test(body)) errors.push("A `TEMPLATE:` comment line is still in the file. Delete it.");
    if (/<[a-z][a-z -]*>/i.test(body.replace(/`[^`]*`/g, ""))) warnings.push("The body has `<placeholder>` text outside code. Fill it in.");
  }
  const pointers = [...new Set([...body.matchAll(/(?:references|scripts)\/[A-Za-z0-9._-]+/g)].map((m) => m[0]))];
  for (const p of pointers) {
    if (!existsSync(join(folder, p))) errors.push(`SKILL.md points to \`${p}\`, but the file does not exist.`);
  }
  const refDir = join(folder, "references");
  if (existsSync(refDir)) {
    for (const f of readdirSync(refDir)) {
      if (!pointers.includes(`references/${f}`)) warnings.push(`references/${f} is not linked from SKILL.md. Claude will not know when to read it.`);
      const refText = readFileSync(join(refDir, f), "utf8");
      if (f.endsWith(".md") && refText.split("\n").length > TOC_AFTER_LINES && !/^#{1,6}\s*(table of )?contents\s*$/im.test(refText.split("\n").slice(0, 40).join("\n"))) {
        warnings.push(`references/${f} has over 100 lines and no table of contents.`);
      }
    }
  }
  if (fields["allowed-tools"] && /read[- ]only|does not edit|without editing|cannot edit/i.test(`${description} ${body}`)) {
    warnings.push("`allowed-tools` only pre-approves tools. It does not stop Claude from using others. To block edits, use `disallowed-tools: Write Edit NotebookEdit`.");
  }
  const caps = (body.match(/\b(ALWAYS|NEVER|MUST)\b/g) ?? []).length;
  if (caps > 3) warnings.push(`${caps} words in capitals (ALWAYS, NEVER, MUST). Explain the reason in plain words instead.`);
  if (!/gotchas/i.test(body)) warnings.push("No Gotchas section.");
  return { errors, warnings };
}

export function checkAgent(file) {
  const errors = [];
  const warnings = [];
  const parsed = splitFrontmatter(readFileSync(file, "utf8"));
  if (parsed.error) return { errors: [parsed.error], warnings };
  const { fields, lists } = parseFields(parsed.raw);
  const { body } = parsed;

  const name = fields.name ?? "";
  if (!name) errors.push("Missing `name`.");
  else {
    if (!/^[a-z0-9-]+$/.test(name)) errors.push("`name` may only have lowercase letters, digits and hyphens.");
    if (name.length > MAX_NAME) errors.push(`\`name\` is longer than ${MAX_NAME} characters.`);
    if (name !== basename(file, ".md") && !file.includes("agent-templates")) warnings.push(`\`name\` (${name}) differs from the file name (${basename(file)}).`);
  }
  const description = (fields.description ?? "").replace(/^"|"$/g, "").trim();
  if (!description) errors.push("Missing `description`.");
  else if (!/\b(use|when)\b/i.test(description)) warnings.push("The description does not say when Claude should hand work to this agent.");

  const toolsText = fields.tools ?? "";
  const tools = toolsText.split(",").map((t) => t.trim()).filter(Boolean);
  if (!toolsText) warnings.push("No `tools` line. The agent gets every tool. Name the tools it needs.");
  for (const t of tools) {
    if (t.includes("(")) warnings.push(`\`${t}\`: a pattern in an agent's \`tools\` line does not limit the tool. Use the plain name, and know that it allows every use of it.`);
    const base = t.replace(/\(.*$/, "");
    if (!KNOWN_TOOLS.has(base) && !base.startsWith("mcp__")) warnings.push(`\`${t}\` is not a tool name that Claude Code knows.`);
  }
  if (/read[- ]only|cannot edit|does not edit/i.test(description) && tools.some((t) => WRITE_TOOLS.includes(t))) {
    errors.push("The description says read-only, but the tools include Edit or Write. The tool list is the guard. Remove them.");
  }
  if (fields.model && !MODELS.has(fields.model) && !/^claude-/.test(fields.model)) warnings.push(`\`model: ${fields.model}\` is not haiku, sonnet, opus or inherit.`);
  if (fields.maxTurns && !/^\d+$/.test(fields.maxTurns)) errors.push("`maxTurns` must be a number.");
  if (!fields.maxTurns) warnings.push("No `maxTurns`. A stuck agent keeps spending.");
  for (const s of lists.skills ?? []) if (!NAME_RE.test(s)) errors.push(`\`${s}\` in \`skills\` is not a valid skill name.`);
  if (body.split("\n").length > 200) warnings.push("The prompt is over 200 lines. Shorten it.");
  if (!/\b(stop|at most|no more than|under \d+)\b/i.test(body)) warnings.push("The prompt has no stop condition or length limit.");
  return { errors, warnings };
}

export function check(target) {
  const path = resolve(target);
  if (!existsSync(path)) bad(`${path} does not exist.`);
  return statSync(path).isDirectory() ? checkSkill(path) : checkAgent(path);
}

// Find skill folders (with SKILL.md) or agent files (*.md) under a path.
export function findTargets(path) {
  const p = resolve(path);
  if (!existsSync(p)) return [];
  if (statSync(p).isFile()) return [p];
  if (existsSync(join(p, "SKILL.md"))) return [p];
  if (existsSync(join(p, "AGENT.md"))) return [join(p, "AGENT.md")];
  return readdirSync(p).flatMap((n) => {
    const child = join(p, n);
    if (statSync(child).isDirectory()) return findTargets(child);
    return [];
  });
}
