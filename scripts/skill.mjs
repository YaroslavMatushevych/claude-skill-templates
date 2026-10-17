#!/usr/bin/env node
// Skill constructor. Builds a Claude Code skill from a template, adds references and scripts, checks the result.
//
//   node scripts/skill.mjs templates
//   node scripts/skill.mjs new <name> --template <template> [--dir .claude/skills] [--description "..."]
//   node scripts/skill.mjs add-reference <skill-folder> <file-or-url> --when "<when to read it>" [--as <file-name>] [--force]
//   node scripts/skill.mjs add-script <skill-folder> <file> [--read] [--force]
//   node scripts/skill.mjs check <skill-folder>
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, basename, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TEMPLATES = join(ROOT, "templates");
const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const TOC_AFTER_LINES = 100;

const fail = (msg) => {
  console.error(`Error: ${msg}`);
  process.exit(1);
};

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) flags[key] = true;
      else {
        flags[key] = next;
        i++;
      }
    } else positional.push(a);
  }
  return { positional, flags };
}

const templateNames = () =>
  readdirSync(TEMPLATES).filter((n) => existsSync(join(TEMPLATES, n, "SKILL.md"))).sort();

function frontmatterField(text, key) {
  const m = text.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
  return m ? m[1].trim() : "";
}

function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const name of readdirSync(src)) {
    if (name === "INSTRUCTIONS.md") continue;
    const from = join(src, name);
    const to = join(dest, name);
    if (statSync(from).isDirectory()) copyDir(from, to);
    else copyFileSync(from, to);
  }
}

// Add a line to a `## <heading>` section. Create the section before `## Gotchas`, or at the end.
function addToSection(text, heading, line) {
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

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");

function withContents(text) {
  const lines = text.split("\n");
  if (lines.length <= TOC_AFTER_LINES) return text;
  if (/^#{1,6}\s*(table of )?contents\s*$/im.test(lines.slice(0, 40).join("\n"))) return text;
  const headings = lines.filter((l) => /^#{1,3} /.test(l)).map((l) => `- ${l.replace(/^#+\s*/, "")}`);
  if (headings.length === 0) return text;
  return `## Contents\n\n${headings.join("\n")}\n\n${text}`;
}

function requireSkill(dir) {
  if (!dir) fail("Give the skill folder.");
  const skill = resolve(dir);
  if (!existsSync(join(skill, "SKILL.md"))) fail(`No SKILL.md in ${skill}.`);
  return skill;
}

function cmdTemplates() {
  for (const t of templateNames()) {
    const text = readFileSync(join(TEMPLATES, t, "SKILL.md"), "utf8");
    console.log(`${t.padEnd(14)} ${frontmatterField(text, "description")}`);
  }
}

function cmdNew({ positional, flags }) {
  const [name] = positional;
  if (!name || !NAME_RE.test(name) || name.length > 64) fail("Give a name in lowercase with hyphens, up to 64 characters, for example `pr-summary`.");
  if (/anthropic|claude/.test(name)) fail("The name must not contain `anthropic` or `claude`.");
  const template = flags.template;
  if (!template || template === true) fail(`Give --template <name>. Run \`templates\` to see the list: ${templateNames().join(", ")}.`);
  if (!templateNames().includes(template)) fail(`Unknown template \`${template}\`. Available: ${templateNames().join(", ")}.`);
  const target = join(resolve(flags.dir && flags.dir !== true ? flags.dir : ".claude/skills"), name);
  if (existsSync(target)) fail(`${target} already exists. Choose another name.`);

  copyDir(join(TEMPLATES, template), target);
  const file = join(target, "SKILL.md");
  let text = readFileSync(file, "utf8").replace(/^name:.*$/m, `name: ${name}`);
  if (flags.description && flags.description !== true) {
    if (flags.description.length > 1024) fail("The description is longer than 1024 characters.");
    text = text.replace(/^description:.*$/m, `description: ${flags.description}`);
  }
  writeFileSync(file, text);
  console.log(`Created ${target}/SKILL.md from the \`${template}\` template.`);

  const instructions = join(TEMPLATES, template, "INSTRUCTIONS.md");
  if (existsSync(instructions)) {
    const i = readFileSync(instructions, "utf8");
    const section = (label) => (i.match(new RegExp(`\\*\\*${label}:\\*\\*([^\\n]*(?:\\n(?!\\*\\*)[^\\n]*)*)`)) ?? [])[1]?.trim();
    console.log("\nNext:");
    for (const label of ["Change", "Keep", "Test"]) {
      const s = section(label);
      if (s) console.log(`  ${label}: ${s.replace(/\n\s*/g, " ")}`);
    }
  }
  console.log("\nThen add references and scripts with `add-reference` and `add-script`, and run `check`.");
}

async function cmdAddReference({ positional, flags }) {
  const skill = requireSkill(positional[0]);
  const source = positional[1];
  if (!source) fail("Give a file path or a URL to add.");
  const when = flags.when;
  if (!when || when === true) fail('Give --when "<when Claude should read it>", for example --when "you write a date filter". The wording decides when Claude opens the file.');

  let text;
  let name;
  if (/^https?:\/\//.test(source)) {
    const res = await fetch(source).catch((e) => fail(`Could not fetch ${source}: ${e.message}`));
    if (!res.ok) fail(`Could not fetch ${source}: HTTP ${res.status}.`);
    const url = new URL(source);
    const last = url.pathname.split("/").filter(Boolean).pop() ?? url.hostname;
    name = flags.as && flags.as !== true ? flags.as : `${slug(last.replace(/\.[a-z0-9]+$/i, ""))}.md`;
    text = `<!-- Source: ${source} (fetched ${new Date().toISOString().slice(0, 10)}) -->\n\n${await res.text()}`;
  } else {
    const from = resolve(source);
    if (!existsSync(from)) fail(`${from} does not exist.`);
    name = flags.as && flags.as !== true ? flags.as : slug(basename(from));
    text = readFileSync(from, "utf8");
  }
  if (!/^[a-z0-9._-]+\.[a-z0-9]+$/.test(name)) fail(`The file name \`${name}\` is not valid. Use lowercase letters, digits, dots and hyphens, with an extension.`);
  const target = join(skill, "references", name);
  if (existsSync(target) && !flags.force) fail(`${target} already exists. Use --force to replace it.`);

  mkdirSync(join(skill, "references"), { recursive: true });
  const body = extname(name) === ".md" ? withContents(text) : text;
  writeFileSync(target, body);
  const skillFile = join(skill, "SKILL.md");
  const line = `- When ${when.replace(/^when\s+/i, "").replace(/[.\s]+$/, "")}, read \`references/${name}\`.`;
  const current = readFileSync(skillFile, "utf8");
  if (!current.includes(`references/${name}`)) writeFileSync(skillFile, addToSection(current, "References", line));
  console.log(`Added references/${name} (${body.split("\n").length} lines).`);
  if (body !== text) console.log("The file was over 100 lines, so a table of contents was added at the top.");
  console.log(`Pointer in SKILL.md: ${line}`);
}

function cmdAddScript({ positional, flags }) {
  const skill = requireSkill(positional[0]);
  const source = positional[1];
  if (!source) fail("Give the script file to add.");
  const from = resolve(source);
  if (!existsSync(from)) fail(`${from} does not exist.`);
  const name = basename(from);
  const target = join(skill, "scripts", name);
  if (existsSync(target) && !flags.force) fail(`${target} already exists. Use --force to replace it.`);
  mkdirSync(join(skill, "scripts"), { recursive: true });
  copyFileSync(from, target);
  const runner = { ".mjs": "node", ".js": "node", ".py": "python3", ".sh": "bash" }[extname(name)] ?? "";
  const path = "${CLAUDE_SKILL_DIR}/scripts/" + name;
  const line = flags.read
    ? `- Read \`${path}\` before you change the files it builds.`
    : `- Run \`${runner ? runner + " " : ""}${path}\`. Do not read it. If it prints an error, fix the input and run it again.`;
  const skillFile = join(skill, "SKILL.md");
  const current = readFileSync(skillFile, "utf8");
  if (!current.includes(`scripts/${name}`)) writeFileSync(skillFile, addToSection(current, "Scripts", line));
  console.log(`Added scripts/${name}.`);
  console.log(`Pointer in SKILL.md: ${line}`);
}

function cmdCheck({ positional }) {
  const skill = requireSkill(positional[0]);
  const r = spawnSync(process.execPath, [join(ROOT, "scripts/validate.mjs"), skill], { stdio: "inherit" });
  process.exit(r.status ?? 1);
}

const [command, ...rest] = process.argv.slice(2);
const args = parseArgs(rest);
const commands = {
  templates: cmdTemplates,
  new: cmdNew,
  "add-reference": cmdAddReference,
  "add-script": cmdAddScript,
  check: cmdCheck,
};
if (!command || !commands[command]) {
  console.error(readFileSync(fileURLToPath(import.meta.url), "utf8").split("\n").slice(1, 8).map((l) => l.replace(/^\/\/ ?/, "")).join("\n"));
  process.exit(command ? 1 : 0);
}
await commands[command](args);
