// The builder service. The local server (ui.mjs) and the Vercel functions (api/*.mjs) both use it.
// Hosted mode never touches the project folder, never reads local files and never fetches URLs.
import { mkdtempSync, rmSync, readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, resolve, sep, relative } from "node:path";
import { tmpdir } from "node:os";
import {
  TOOLS, UserError, listTemplates, renderSkill, renderAgent, createSkill, createAgent,
  addReference, addScript, checkSkill, checkAgent, fetchUrl, slug,
} from "./lib.mjs";

const NAME_OK = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const LIMITS = { body: 1_000_000, references: 10, scripts: 5, file: 300_000 };

const bad = (m) => {
  throw new UserError(m);
};
const str = (v) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
const inside = (base, target) => target === base || target.startsWith(base + sep);
const brief = (i) => ({ change: i.change, keep: i.keep, test: i.test });

function normalize(b) {
  if (!b || typeof b !== "object") bad("The request is not valid.");
  if (!["skill", "agent"].includes(b.kind)) bad("Choose a skill or an agent.");
  if (!str(b.template)) bad("Pick a template.");
  for (const key of ["name", "description", "outDir", "model", "text"]) if (b[key] !== undefined && typeof b[key] !== "string") bad(`\`${key}\` must be text.`);
  for (const key of ["references", "scripts", "tools", "skills", "disallowed"]) if (b[key] !== undefined && !Array.isArray(b[key])) bad(`\`${key}\` must be a list.`);
  if ((b.references ?? []).length > LIMITS.references) bad(`Use at most ${LIMITS.references} references.`);
  if ((b.scripts ?? []).length > LIMITS.scripts) bad(`Use at most ${LIMITS.scripts} scripts.`);
  const big = [...(b.references ?? []), ...(b.scripts ?? [])].find((x) => typeof x?.content === "string" && x.content.length > LIMITS.file);
  if (big) bad(`A file is larger than ${LIMITS.file / 1000} KB.`);
  if (typeof b.text === "string" && b.text.length > LIMITS.file) bad(`The draft is larger than ${LIMITS.file / 1000} KB.`);
  return b;
}

function projectSkills(project) {
  const dir = project ? join(project, ".claude", "skills") : null;
  if (!dir || !existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((n) => NAME_OK.test(n) && existsSync(join(dir, n, "SKILL.md")))
    .map((n) => ({ name: n, userStarted: /^disable-model-invocation:\s*true\s*$/m.test(readFileSync(join(dir, n, "SKILL.md"), "utf8").split("\n---")[0]) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function createService({ hosted = false, project = null } = {}) {
  const renderDraft = (b) => {
    normalize(b);
    const name = str(b.name) ?? "my-skill";
    return b.kind === "agent"
      ? renderAgent({ template: b.template, name, description: str(b.description), skills: b.skills ?? [], model: str(b.model), tools: b.tools?.length ? b.tools : undefined, maxTurns: str(b.maxTurns) })
      : renderSkill({
          template: b.template, name, description: str(b.description),
          userStarted: typeof b.userStarted === "boolean" ? b.userStarted : undefined,
          model: str(b.model), fork: typeof b.fork === "boolean" ? b.fork : undefined,
          disallowed: Array.isArray(b.disallowed) ? b.disallowed : undefined,
        });
  };

  // Build in a temp folder to check, or in the project folder to save.
  async function build(b, save) {
    normalize(b);
    if (save && hosted) bad("Saving to a folder only works when you run the builder on your machine. Download the zip instead.");
    const name = str(b.name);
    if (!name) bad("Give it a name.");
    const base = save ? project : mkdtempSync(join(tmpdir(), "skill-builder-"));
    try {
      const outRel = str(b.outDir) ?? (b.kind === "agent" ? ".claude/agents" : ".claude/skills");
      const outDir = resolve(base, outRel);
      if (!inside(base, outDir)) bad("The output folder must be inside the project folder.");
      if (hosted && /^(\/|[a-z]:|\.\.)/i.test(outRel)) bad("Use a relative folder, for example .claude/skills.");
      const text = typeof b.text === "string" && b.text.trim() ? b.text : renderDraft(b);

      let result;
      let root;
      if (b.kind === "agent") {
        const made = createAgent({ name, template: b.template, dir: outDir, text });
        result = { ...checkAgent(made.path), info: made.info };
        root = made.path;
      } else {
        const made = createSkill({ name, template: b.template, dir: outDir, text });
        for (const ref of b.references ?? []) {
          const when = str(ref.when);
          if (typeof ref.content === "string") {
            await addReference({ skill: made.path, content: ref.content, when, as: str(ref.as) });
          } else if (ref.url) {
            if (hosted) bad("In the hosted builder, the browser downloads URLs. Use the Fetch button, or paste the text.");
            const last = new URL(ref.url).pathname.split("/").filter(Boolean).pop() ?? "reference";
            const content = `<!-- Source: ${ref.url} (fetched ${new Date().toISOString().slice(0, 10)}) -->\n\n${await fetchUrl(ref.url)}`;
            await addReference({ skill: made.path, content, as: str(ref.as) ?? `${slug(last.replace(/\.[a-z0-9]+$/i, ""))}.md`, when });
          } else if (ref.path) {
            if (hosted) bad("Files from the project are only available when you run the builder on your machine.");
            const from = resolve(project, ref.path);
            if (!inside(project, from)) bad(`${ref.path} is outside the project folder.`);
            await addReference({ skill: made.path, source: from, when, as: str(ref.as) });
          } else {
            bad("A reference needs text, a URL or a file.");
          }
        }
        for (const s of b.scripts ?? []) addScript({ skill: made.path, content: String(s.content ?? ""), as: str(s.as), read: !!s.read });
        result = { ...checkSkill(made.path), info: made.info };
        root = made.path;
      }

      // Collect the files with their content, so the browser can show them and build a zip.
      const files = [];
      const walk = (p) => {
        if (statSync(p).isDirectory()) readdirSync(p).sort().forEach((n) => walk(join(p, n)));
        else files.push({ path: relative(base, p).split(sep).join("/"), content: readFileSync(p, "utf8") });
      };
      walk(root);
      const main = files.find((f) => f.path.endsWith("SKILL.md") || (b.kind === "agent" && f.path.endsWith(`${name}.md`)));
      return { errors: result.errors, warnings: result.warnings, finalText: main?.content ?? "", files, next: brief(result.info), path: save ? root : undefined };
    } finally {
      if (!save) rmSync(base, { recursive: true, force: true });
    }
  }

  return {
    hosted,
    templates: () => ({ skill: listTemplates("skill"), agent: listTemplates("agent"), tools: TOOLS, hosted, projectSkills: hosted ? [] : projectSkills(project) }),
    render: (b) => ({ text: renderDraft(b) }),
    check: (b) => build(b, false),
    save: (b) => build(b, true),
  };
}
