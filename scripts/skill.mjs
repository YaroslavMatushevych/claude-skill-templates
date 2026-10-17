#!/usr/bin/env node
// Constructor for Claude Code skills and agents.
//
//   node scripts/skill.mjs templates [skill|agent]
//   node scripts/skill.mjs new <name> --template <template> [--dir .claude/skills] [--description "..."]
//   node scripts/skill.mjs new-agent <name> --template <template> [--dir .claude/agents] [--description "..."] [--skill <skill>[,<skill>]] [--model <model>] [--tools "Read, Grep"] [--max-turns <n>]
//   node scripts/skill.mjs add-reference <skill-folder> <file-or-url> --when "<when to read it>" [--as <file-name>] [--force]
//   node scripts/skill.mjs add-script <skill-folder> <file> [--read] [--force]
//   node scripts/skill.mjs check <skill-folder-or-agent-file>
//   node scripts/ui.mjs            opens the web UI
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { listTemplates, templateNames, createSkill, createAgent, addReference, addScript, UserError } from "./lib.mjs";

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) flags[a.slice(2)] = true;
      else {
        flags[a.slice(2)] = next;
        i++;
      }
    } else positional.push(a);
  }
  return { positional, flags };
}
const str = (v) => (typeof v === "string" ? v : undefined);

function printNext(info) {
  console.log("\nNext:");
  for (const [label, value] of [["Change", info.change], ["Keep", info.keep], ["Test", info.test]]) {
    if (value) console.log(`  ${label}: ${value}`);
  }
}

const commands = {
  templates({ positional }) {
    for (const kind of positional[0] ? [positional[0]] : ["skill", "agent"]) {
      console.log(`${kind} templates:`);
      for (const t of listTemplates(kind)) console.log(`  ${t.name.padEnd(14)} ${t.purpose || t.description}`);
    }
  },
  new({ positional, flags }) {
    const template = str(flags.template);
    if (!template) throw new UserError(`Give --template <name>. Available: ${templateNames("skill").join(", ")}.`);
    const r = createSkill({ name: positional[0], template, dir: str(flags.dir), description: str(flags.description) });
    console.log(`Created ${r.path}/SKILL.md from the \`${template}\` template.`);
    printNext(r.info);
    console.log("\nThen add references and scripts with `add-reference` and `add-script`, and run `check`.");
  },
  "new-agent"({ positional, flags }) {
    const template = str(flags.template);
    if (!template) throw new UserError(`Give --template <name>. Available: ${templateNames("agent").join(", ")}.`);
    const r = createAgent({
      name: positional[0],
      template,
      dir: str(flags.dir),
      description: str(flags.description),
      skills: str(flags.skill)?.split(",").map((s) => s.trim()).filter(Boolean),
      model: str(flags.model),
      tools: str(flags.tools),
      maxTurns: str(flags["max-turns"]),
    });
    console.log(`Created ${r.path} from the \`${template}\` agent template.`);
    printNext(r.info);
  },
  async "add-reference"({ positional, flags }) {
    const r = await addReference({ skill: positional[0], source: positional[1], when: str(flags.when), as: str(flags.as), force: !!flags.force });
    console.log(`Added references/${r.name} (${r.lines} lines).`);
    if (r.tocAdded) console.log("The file was over 100 lines, so a table of contents was added at the top.");
    console.log(`Pointer in SKILL.md: ${r.line}`);
  },
  "add-script"({ positional, flags }) {
    const r = addScript({ skill: positional[0], source: positional[1], as: str(flags.as), read: !!flags.read, force: !!flags.force });
    console.log(`Added scripts/${r.name}.`);
    console.log(`Pointer in SKILL.md: ${r.line}`);
  },
  check({ positional }) {
    const r = spawnSync(process.execPath, [join(dirname(fileURLToPath(import.meta.url)), "validate.mjs"), positional[0] ?? ""], { stdio: "inherit" });
    process.exit(r.status ?? 1);
  },
};

const [command, ...rest] = process.argv.slice(2);
if (!command || !commands[command]) {
  console.error(readFileSync(fileURLToPath(import.meta.url), "utf8").split("\n").slice(1, 11).map((l) => l.replace(/^\/\/ ?/, "")).join("\n"));
  process.exit(command ? 1 : 0);
}
try {
  await commands[command](parseArgs(rest));
} catch (e) {
  if (!(e instanceof UserError)) throw e;
  console.error(`Error: ${e.message}`);
  process.exit(1);
}
