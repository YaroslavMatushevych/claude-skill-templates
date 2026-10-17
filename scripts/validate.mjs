#!/usr/bin/env node
// Checks one skill folder, or every skill folder under a path.
// Usage: node scripts/validate.mjs <folder> [<folder> ...]
// Exit code 1 if any error is found. Warnings do not fail the run.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, basename } from "node:path";

const MAX_NAME = 64;
const MAX_DESCRIPTION = 1024;
const MAX_BODY_LINES = 500;

function parseFrontmatter(text) {
  if (!text.startsWith("---\n")) return { error: "Line 1 must be `---`." };
  const end = text.indexOf("\n---", 4);
  if (end === -1) return { error: "Frontmatter has no closing `---`." };
  const raw = text.slice(4, end);
  const fields = {};
  let key = null;
  for (const line of raw.split("\n")) {
    const m = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (m) {
      key = m[1];
      fields[key] = m[2];
    } else if (key && /^\s+\S/.test(line)) {
      fields[key] += " " + line.trim();
    }
  }
  const body = text.slice(end + 4).replace(/^\n/, "");
  return { fields, body };
}

function findSkillFolders(path) {
  if (existsSync(join(path, "SKILL.md"))) return [path];
  if (!existsSync(path) || !statSync(path).isDirectory()) return [];
  return readdirSync(path)
    .map((n) => join(path, n))
    .filter((p) => statSync(p).isDirectory())
    .flatMap(findSkillFolders);
}

function check(folder) {
  const errors = [];
  const warnings = [];
  const file = join(folder, "SKILL.md");
  const parsed = parseFrontmatter(readFileSync(file, "utf8"));
  if (parsed.error) return { errors: [parsed.error], warnings };
  const { fields, body } = parsed;
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
  const caps = (body.match(/\b(ALWAYS|NEVER|MUST)\b/g) ?? []).length;
  if (caps > 3) warnings.push(`${caps} words in capitals (ALWAYS, NEVER, MUST). Explain the reason in plain words instead.`);
  if (!/gotchas/i.test(body)) warnings.push("No Gotchas section.");
  return { errors, warnings };
}

const targets = process.argv.slice(2);
if (targets.length === 0) {
  console.error("Usage: node scripts/validate.mjs <folder> [<folder> ...]");
  process.exit(2);
}
const folders = targets.flatMap(findSkillFolders);
if (folders.length === 0) {
  console.error("No SKILL.md found.");
  process.exit(2);
}
let failed = false;
for (const folder of folders) {
  const { errors, warnings } = check(folder);
  const status = errors.length ? "FAIL" : warnings.length ? "WARN" : "OK  ";
  console.log(`${status} ${folder}`);
  for (const e of errors) console.log(`     error:   ${e}`);
  for (const w of warnings) console.log(`     warning: ${w}`);
  if (errors.length) failed = true;
}
process.exit(failed ? 1 : 0);
