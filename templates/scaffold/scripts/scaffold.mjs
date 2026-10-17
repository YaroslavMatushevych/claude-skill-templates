#!/usr/bin/env node
// Example generator: creates src/<name>/index.ts and src/<name>/index.test.ts.
// Usage: node scaffold.mjs <name>
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const name = process.argv[2];
if (!name || !/^[a-z][a-z0-9-]*$/.test(name)) {
  console.error("Error: give a name in lowercase with hyphens, for example `price-card`.");
  process.exit(1);
}

const dir = join(process.cwd(), "src", name);
if (existsSync(dir)) {
  console.error(`Error: ${dir} already exists. Choose another name.`);
  process.exit(1);
}

const pascal = name.split("-").map((p) => p[0].toUpperCase() + p.slice(1)).join("");

mkdirSync(dir, { recursive: true });
writeFileSync(
  join(dir, "index.ts"),
  `export function ${pascal}() {\n  // TODO: implement ${name}\n}\n`,
);
writeFileSync(
  join(dir, "index.test.ts"),
  `import { ${pascal} } from "./index";\n\ntest("${name} has a first test", () => {\n  // TODO: write a failing test\n  expect(${pascal}).toBeDefined();\n});\n`,
);
console.log(`Created ${dir}/index.ts and index.test.ts`);
