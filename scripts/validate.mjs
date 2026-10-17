#!/usr/bin/env node
// Checks skill folders (with SKILL.md) and agent files (*.md).
// Usage: node scripts/validate.mjs <path> [<path> ...]
// Exit code 1 if any error is found. Warnings do not fail the run.
import { check, findTargets, UserError } from "./lib.mjs";

const targets = process.argv.slice(2);
if (targets.length === 0) {
  console.error("Usage: node scripts/validate.mjs <skill-folder-or-agent-file> [...]");
  process.exit(2);
}
const found = targets.flatMap(findTargets);
if (found.length === 0) {
  console.error("No SKILL.md or agent file found.");
  process.exit(2);
}
let failed = false;
for (const target of found) {
  try {
    const { errors, warnings } = check(target);
    console.log(`${errors.length ? "FAIL" : warnings.length ? "WARN" : "OK  "} ${target}`);
    for (const e of errors) console.log(`     error:   ${e}`);
    for (const w of warnings) console.log(`     warning: ${w}`);
    if (errors.length) failed = true;
  } catch (e) {
    if (!(e instanceof UserError)) throw e;
    console.log(`FAIL ${target}\n     error:   ${e.message}`);
    failed = true;
  }
}
process.exit(failed ? 1 : 0);
