import { zip } from "/zip.js";

const $ = (id) => document.getElementById(id);
const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const TOOL_LIST = ["Read", "Grep", "Glob", "Edit", "Write", "NotebookEdit", "Bash", "PowerShell", "WebFetch", "WebSearch", "TodoWrite", "LSP", "Agent", "Skill"];


const TOOL_TIPS = {
  Read: "Read files.", Grep: "Search inside files.", Glob: "Find files by name pattern.", Edit: "Change part of a file.", Write: "Create or overwrite a file.",
  NotebookEdit: "Edit Jupyter notebook cells. It is an edit tool.", Bash: "Run shell commands. A shell can also write files, so it is not read-only.",
  PowerShell: "Run PowerShell commands on Windows. It can also write files.", WebFetch: "Download a web page.", WebSearch: "Search the web.",
  TodoWrite: "Keep a to-do list while it works.", LSP: "Code intelligence: definitions and references.", Agent: "Start another agent.", Skill: "Run a skill.",
};

// Who can start a skill. Both fields are in the docs: disable-model-invocation and user-invocable.
const STARTERS = {
  both: "You can type /name, and Claude loads it on its own when the description fits.",
  you: "You type /name. Claude never loads it on its own. Use it for work with side effects.",
  claude: "Hidden from the / menu. Claude loads it when the description fits. Use it for background knowledge.",
};

const state = {
  kind: "skill", data: null, template: null, dirty: false, refs: [], scripts: [], timer: null, seq: 0, renderSeq: 0, last: null,
  autoName: "", autoDesc: "", starter: "both",
  sets: { allowed: new Set(), blocked: new Set(), tools: new Set(), removed: new Set(), skills: new Set() },
};

async function api(path, body) {
  const res = await fetch(path, body ? { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) } : undefined);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Request failed.");
  return json;
}
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
// Small, safe inline markdown for the template notes: `code` and **bold**. The text is escaped first.
const md = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
const defaultDir = () => (state.kind === "skill" ? ".claude/skills" : ".claude/agents");
const list = (v) => (Array.isArray(v) ? v : String(v ?? "").split(/[,\s]+/)).map((x) => x.trim()).filter(Boolean);
const csv = (v) => String(v ?? "").split(",").map((x) => x.trim()).filter(Boolean);

function toast(message) {
  const t = $("toast");
  t.textContent = message;
  t.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove("show"), 3600);
}

// ---------- model field: a list, plus "Other" for a full model ID ----------

function modelValue(prefix) {
  const v = $(`${prefix}model`).value;
  return v === "__other" ? $(`${prefix}model-other`).value.trim() : v;
}
function setModel(prefix, value) {
  const select = $(`${prefix}model`);
  const known = [...select.options].some((o) => o.value === value);
  select.value = known ? value : value ? "__other" : "";
  $(`${prefix}model-other`).hidden = select.value !== "__other";
  $(`${prefix}model-other`).value = known ? "" : value;
}

// ---------- tool pickers: chips for the known tools, plus any name or rule you add ----------

const PICKERS = [
  { set: "allowed", box: "allowed", input: "allowed-custom", add: "allowed-add", kind: "skill", example: "Bash(git diff *)" },
  { set: "blocked", box: "blocked", input: "blocked-custom", add: "blocked-add", kind: "skill", example: "WebFetch" },
  { set: "tools", box: "tools", input: "tools-custom", add: "tools-add", kind: "agent", example: "mcp__github__*" },
  { set: "removed", box: "removed", input: "removed-custom", add: "removed-add", kind: "agent", example: "mcp__github__*" },
];
function renderPicker(p) {
  const set = state.sets[p.set];
  const names = [...TOOL_LIST, ...[...set].filter((n) => !TOOL_LIST.includes(n))];
  $(p.box).innerHTML = names.map((t) => `<label data-tip="${esc(TOOL_TIPS[t] || "A tool or an MCP rule you added.")}"><input type="checkbox" value="${esc(t)}"${set.has(t) ? " checked" : ""}>${esc(t)}</label>`).join("");
}

// ---------- payloads ----------

function fieldsPayload() {
  if (state.kind === "skill") {
    return {
      "disable-model-invocation": state.starter === "you",
      "user-invocable": state.starter === "claude",
      "allowed-tools": [...state.sets.allowed],
      "disallowed-tools": [...state.sets.blocked],
      model: modelValue("s"),
      effort: $("seffort").value,
      context: $("fork").checked,
      agent: $("fork").checked ? $("agent-type").value.trim() : "",
      when_to_use: $("when_to_use").value,
      "argument-hint": $("hint").value,
      arguments: list($("arguments").value),
      paths: csv($("paths").value),
    };
  }
  return {
    tools: [...state.sets.tools],
    disallowedTools: [...state.sets.removed],
    model: modelValue("a"),
    maxTurns: $("maxTurns").value.trim(),
    effort: $("aeffort").value,
    permissionMode: $("permission").value,
    memory: $("memory").value,
    background: $("background").checked,
    isolation: $("isolation").checked,
    color: $("color").value,
    mcpServers: csv($("mcp").value),
  };
}
// The template always renders. A name or description that is not valid yet is shown in the file as you typed it, and the Checks tab says what is wrong.
function renderPayload() {
  const name = $("name").value.trim();
  const description = $("description").value.replace(/\s+/g, " ").trim();
  const p = {
    kind: state.kind, template: state.template, fields: fieldsPayload(),
    name: NAME_RE.test(name) && name.length <= 64 ? name : "my-skill",
    description: description.length <= 1024 ? description : "",
  };
  if (state.kind === "agent") p.skills = [...state.sets.skills];
  return p;
}
function checkPayload() {
  const p = { ...renderPayload(), name: $("name").value.trim(), outDir: $("outDir").value.trim(), text: $("draft").value };
  if (state.kind === "skill") {
    p.references = state.refs.map(({ kind, ...r }) => (r.content !== undefined ? { content: r.content, as: r.as, when: r.when } : r));
    p.scripts = state.scripts;
  }
  return p;
}

// ---------- kind and templates ----------

function setKind(kind) {
  state.kind = kind;
  for (const k of ["skill", "agent"]) $(`tab-${k}`).setAttribute("aria-selected", String(k === kind));
  $("agent-options").hidden = kind !== "agent";
  $("skill-options").hidden = kind !== "skill";
  $("step-3").hidden = kind !== "skill";
  $("outDir").value = defaultDir();
  state.refs = []; state.scripts = []; renderRefs();
  const facts = (t) => (kind === "agent" ? `<div class="facts">${esc(t.model || "inherit")} · ${esc(t.tools)}</div>` : "");
  $("templates").innerHTML = state.data[kind]
    .map((t) => `<button class="tpl" data-t="${t.name}" aria-pressed="false"><b>${t.name}</b><p>${md(t.purpose || t.description)}</p>${facts(t)}</button>`)
    .join("");
  $("templates").querySelectorAll(".tpl").forEach((b) => b.addEventListener("click", () => pick(b.dataset.t)));
  pick(state.data[kind][0].name, true);
}

const toSet = (key, value) => { state.sets[key] = new Set(list(value)); };

function setStarter(mode) {
  state.starter = mode;
  for (const m of Object.keys(STARTERS)) $(`start-${m}`).setAttribute("aria-checked", String(m === mode));
  $("start-note").textContent = STARTERS[mode];
}

async function pick(name, force) {
  if (!force && state.dirty && !confirm("Replace your edits with the template?")) return;
  state.template = name;
  document.querySelectorAll(".tpl").forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.t === name)));
  const t = state.data[state.kind].find((x) => x.name === name);
  $("guide-body").innerHTML = [["When to use it", t.useWhen], ["What to edit", t.change], ["What to keep", t.keep], ["How to test it", t.test]]
    .filter(([, v]) => v).map(([k, v]) => `<dt>${k}</dt><dd>${md(v)}</dd>`).join("");

  // Fill the form with what the template really has, so the form and the file agree.
  const fm = t.frontmatter;
  if (!$("name").value || $("name").value === state.autoName) $("name").value = state.autoName = `my-${name}`;
  if (!$("description").value || $("description").value === state.autoDesc) $("description").value = state.autoDesc = t.description;
  if (state.kind === "skill") {
    setStarter(fm["disable-model-invocation"] === "true" ? "you" : fm["user-invocable"] === "false" ? "claude" : "both");
    setModel("s", fm.model ?? ""); $("seffort").value = fm.effort ?? "";
    $("fork").checked = fm.context === "fork"; $("agent-type").value = fm.agent ?? ""; $("agent-row").hidden = !$("fork").checked;
    toSet("allowed", fm["allowed-tools"]); toSet("blocked", fm["disallowed-tools"]);
    $("when_to_use").value = fm.when_to_use ?? ""; $("hint").value = fm["argument-hint"] ?? "";
    $("arguments").value = list(fm.arguments).join(", "); $("paths").value = list(fm.paths).join(", ");
    for (const p of PICKERS.filter((x) => x.kind === "skill")) renderPicker(p);
  } else {
    setModel("a", fm.model ?? ""); $("maxTurns").value = fm.maxTurns ?? ""; $("aeffort").value = fm.effort ?? "";
    $("permission").value = fm.permissionMode ?? ""; $("memory").value = fm.memory ?? ""; $("color").value = fm.color ?? "";
    $("background").checked = fm.background === "true"; $("isolation").checked = fm.isolation === "worktree";
    $("mcp").value = list(fm.mcpServers).join(", ");
    toSet("tools", String(fm.tools ?? "").replace(/,/g, " ")); toSet("removed", String(fm.disallowedTools ?? "").replace(/,/g, " "));
    state.sets.skills = new Set(fm.skills ?? []);
    for (const p of PICKERS.filter((x) => x.kind === "agent")) renderPicker(p);
    renderSkillPick();
  }
  state.dirty = false;
  await regenerate(true);
}

async function regenerate(force) {
  if (state.dirty && !force) return;
  const mine = ++state.renderSeq;
  try {
    const { text } = await api("/api/render", renderPayload());
    if (mine !== state.renderSeq) return;
    $("draft").value = text;
    state.dirty = false;
    patchDraft();
  } catch (e) {
    if (mine === state.renderSeq) toast(e.message);
  }
  scheduleCheck();
}

// The name and description show in the file at once, as you type them, even when they are not valid yet.
function patchDraft() {
  let t = $("draft").value;
  const name = $("name").value.trim();
  const desc = $("description").value.replace(/\s+/g, " ").trim();
  if (name) t = t.replace(/^name:.*$/m, `name: ${name}`);
  if (desc) t = t.replace(/^description:.*$/m, `description: ${desc}`);
  $("draft").value = t;
}

// ---------- checks ----------

function scheduleCheck() {
  clearTimeout(state.timer);
  const mine = ++state.seq;
  updateSteps();
  state.timer = setTimeout(async () => {
    const p = checkPayload();
    if (!p.name) { show({ errors: [], warnings: [], finalText: "", files: [] }, "Give it a name."); return; }
    try {
      const r = await api("/api/check", p);
      if (mine === state.seq) show(r);
    } catch (e) {
      if (mine === state.seq) show({ errors: [e.message], warnings: [], finalText: "", files: [] });
    }
  }, 250);
}

function updateSteps() {
  const name = $("name").value.trim();
  const ok = NAME_RE.test(name) && $("description").value.trim().length > 0;
  $("step-2").classList.toggle("done", ok);
  const bad = name && !NAME_RE.test(name);
  $("name").setAttribute("aria-invalid", String(!!bad));
  $("name-note").textContent = bad ? "Use lowercase letters, digits and single hyphens, for example release-notes." : "";
  $("name-note").className = bad ? "note err" : "note";
  $("counter").textContent = `${$("description").value.length} / 1024`;
}

function show(r, hint) {
  state.last = r;
  const items = [...r.errors.map((e) => `<li class="err">${esc(e)}</li>`), ...r.warnings.map((w) => `<li class="warn">${esc(w)}</li>`)];
  if (!hint && !r.errors.length && !r.warnings.length) items.push('<li class="ok">All checks pass. Nothing to fix.</li>');
  else if (!hint && !r.errors.length) items.unshift('<li class="ok">No errors. The warnings are advice.</li>');
  if (hint) items.push(`<li class="warn">${esc(hint)}</li>`);
  $("results").innerHTML = items.join("");
  const badge = $("check-badge");
  const n = r.errors.length + r.warnings.length;
  badge.textContent = hint ? "!" : String(n);
  badge.className = `badge ${r.errors.length ? "err" : n || hint ? "warn" : "ok"}`;
  const status = hint ? ["", hint] : r.errors.length ? ["err", `${r.errors.length} ${r.errors.length === 1 ? "error" : "errors"} to fix`] : r.warnings.length ? ["warn", "Ready, with advice"] : ["ok", "Ready"];
  $("status").className = `pill ${status[0]}`;
  $("status").textContent = status[1];
  $("final").textContent = r.finalText || "Nothing to show yet.";
  $("files").innerHTML = (r.files || []).map((f) => `<li>${esc(f.path)}</li>`).join("");
  const ready = !hint && r.errors.length === 0;
  $("primary").disabled = !ready;
  $("download").disabled = !ready;
  $("copy").disabled = !r.finalText;
}

// ---------- references ----------

function renderRefs() {
  const hosted = state.data?.hosted;
  const ref = (r, i) => {
    const title = { text: "Pasted text", url: "From a URL", path: "File in the project" }[r.kind];
    let body = "";
    if (r.kind === "text") body = `<textarea class="mono" data-f="content" data-i="${i}" rows="4" placeholder="Paste the text">${esc(r.content || "")}</textarea>`;
    if (r.kind === "path") body = `<input type="text" data-f="path" data-i="${i}" placeholder="docs/notes.md" value="${esc(r.path || "")}" aria-label="File path">`;
    if (r.kind === "url") {
      body = `<div class="row"><input type="text" data-f="url" data-i="${i}" placeholder="https://example.com/notes.md" value="${esc(r.url || "")}" aria-label="URL" style="flex:3"><button class="btn small" data-fetch="${i}" style="flex:none;min-width:0">Fetch</button></div>`;
      if (r.fetched) body += `<div class="note">Downloaded ${r.fetched} lines.</div>`;
      if (r.fetchError) body += `<div class="note err">${esc(r.fetchError)}</div>`;
    }
    return `<div class="item"><div class="item-head">${title}<button class="btn small" data-rm="ref" data-i="${i}">Remove</button></div>${body}
      <div class="row"><input type="text" data-f="as" data-i="${i}" placeholder="file name, for example notes.md" value="${esc(r.as || "")}" aria-label="File name" data-tip="The file is saved as references/<this name>.">
      <input type="text" data-f="when" data-i="${i}" placeholder="when to read it, for example you write the notes" value="${esc(r.when || "")}" aria-label="When to read it" data-tip="Say exactly when Claude should open this file. These words decide if it ever does." style="flex:2"></div></div>`;
  };
  const script = (s, i) => `<div class="item"><div class="item-head">Script<button class="btn small" data-rm="script" data-i="${i}">Remove</button></div>
    <input type="text" data-sf="as" data-i="${i}" placeholder="file name, for example build.mjs" value="${esc(s.as || "")}" aria-label="Script name">
    <textarea class="mono" data-sf="content" data-i="${i}" rows="5" placeholder="Paste the script" style="margin-top:8px">${esc(s.content || "")}</textarea></div>`;
  $("refs").innerHTML = state.refs.map(ref).join("") + state.scripts.map(script).join("");
  $("add-ref-path").hidden = !!hosted;
}

async function fetchRef(i) {
  const r = state.refs[i];
  r.fetchError = ""; r.fetched = 0;
  try {
    const res = await fetch(r.url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    r.content = `<!-- Source: ${r.url} (fetched ${new Date().toISOString().slice(0, 10)}) -->\n\n${text}`;
    r.fetched = text.split("\n").length;
    if (!r.as) r.as = `${(new URL(r.url).pathname.split("/").filter(Boolean).pop() ?? "reference").replace(/\.[a-z0-9]+$/i, "").toLowerCase().replace(/[^a-z0-9._-]+/g, "-")}.md`;
  } catch {
    delete r.content;
    r.fetchError = state.data.hosted
      ? "Your browser could not download this URL. The site may block it. Paste the text instead."
      : "Your browser could not download this URL. The builder will try again from this machine when you check or save.";
  }
  renderRefs(); scheduleCheck();
}

// ---------- skills an agent follows ----------

function skillChoices() {
  const out = new Map();
  for (const t of state.data.skill) out.set(t.name, { name: t.name, userStarted: t.userStarted, tag: "template" });
  for (const p of state.data.projectSkills ?? []) out.set(p.name, { name: p.name, userStarted: p.userStarted, tag: "in your project" });
  for (const n of state.sets.skills) if (!out.has(n)) out.set(n, { name: n, userStarted: false, tag: "custom" });
  return [...out.values()];
}
function renderSkillPick() {
  $("skillpick").innerHTML = skillChoices().map((c) => {
    const off = c.userStarted && !state.sets.skills.has(c.name);
    const title = c.userStarted ? "Only you start this skill, so an agent cannot load it." : c.tag;
    return `<label data-tip="${esc(title)}"${off ? ' style="opacity:.5"' : ""}><input type="checkbox" value="${esc(c.name)}"${state.sets.skills.has(c.name) ? " checked" : ""}${off ? " disabled" : ""}>${esc(c.name)}</label>`;
  }).join("");
}

// ---------- actions ----------

async function doDownload() {
  const files = state.last?.files ?? [];
  if (!files.length) return;
  const blob = new Blob([zip(files)], { type: "application/zip" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${$("name").value.trim() || "skill"}.zip`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast("Downloaded. Unzip it in your project folder.");
}

async function doSave() {
  $("primary").disabled = true;
  try {
    const r = await api("/api/save", checkPayload());
    show(r);
    toast(`Saved ${r.files.length} ${r.files.length === 1 ? "file" : "files"}: ${r.files.map((f) => f.path).join(", ")}`);
  } catch (e) {
    toast(e.message);
    $("primary").disabled = false;
  }
}

function setTab(tab) {
  for (const t of ["file", "final", "checks"]) {
    $(`pt-${t}`).setAttribute("aria-selected", String(t === tab));
    $(`pane-${t}`).hidden = t !== tab;
  }
}

// An option changed. If you edited the file by hand, do not overwrite your edits.
function optionChanged() {
  if (state.dirty) { toast("You edited the file by hand, so this option did not change it. Press Reset to apply it."); return; }
  regenerate();
}

function wire() {
  $("tab-skill").onclick = () => setKind("skill");
  $("tab-agent").onclick = () => setKind("agent");
  for (const t of ["file", "final", "checks"]) $(`pt-${t}`).onclick = () => setTab(t);
  $("name").addEventListener("input", () => { patchDraft(); scheduleCheck(); });
  $("description").addEventListener("input", () => { patchDraft(); scheduleCheck(); });
  $("outDir").addEventListener("input", scheduleCheck);
  $("draft").addEventListener("input", () => { state.dirty = true; scheduleCheck(); });
  $("reset").onclick = () => regenerate(true);
  for (const id of ["seffort", "aeffort", "maxTurns", "permission", "memory", "color", "mcp", "when_to_use", "hint", "arguments", "paths", "agent-type", "smodel-other", "amodel-other"]) $(id).addEventListener("input", optionChanged);
  for (const id of ["fork", "background", "isolation"]) $(id).addEventListener("change", () => { if (id === "fork") $("agent-row").hidden = !$("fork").checked; optionChanged(); });
  for (const prefix of ["s", "a"]) $(`${prefix}model`).addEventListener("change", () => { $(`${prefix}model-other`).hidden = $(`${prefix}model`).value !== "__other"; optionChanged(); });
  for (const m of Object.keys(STARTERS)) $(`start-${m}`).onclick = () => { setStarter(m); optionChanged(); };
  for (const p of PICKERS) {
    $(p.box).addEventListener("change", (e) => { e.target.checked ? state.sets[p.set].add(e.target.value) : state.sets[p.set].delete(e.target.value); optionChanged(); });
    const add = () => {
      const v = $(p.input).value.trim();
      if (!v) return;
      state.sets[p.set].add(v); $(p.input).value = ""; renderPicker(p); optionChanged();
    };
    $(p.add).onclick = add;
    $(p.input).addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); add(); } });
    $(p.input).placeholder = `Add another, for example ${p.example}`;
  }
  $("skillpick").addEventListener("change", (e) => {
    e.target.checked ? state.sets.skills.add(e.target.value) : state.sets.skills.delete(e.target.value);
    optionChanged();
  });
  const addSkill = () => {
    const n = $("skill-custom").value.trim();
    if (!NAME_RE.test(n)) { toast("Use lowercase letters, digits and hyphens, for example release-notes."); return; }
    state.sets.skills.add(n); $("skill-custom").value = ""; renderSkillPick(); optionChanged();
  };
  $("skill-add").onclick = addSkill;
  $("skill-custom").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } });
  $("add-ref-text").onclick = () => { state.refs.push({ kind: "text" }); renderRefs(); };
  $("add-ref-url").onclick = () => { state.refs.push({ kind: "url" }); renderRefs(); };
  $("add-ref-path").onclick = () => { state.refs.push({ kind: "path" }); renderRefs(); };
  $("add-script").onclick = () => { state.scripts.push({}); renderRefs(); };
  $("refs").addEventListener("input", (e) => {
    const t = e.target;
    const i = Number(t.dataset.i);
    if (t.dataset.f) { state.refs[i][t.dataset.f] = t.value; if (t.dataset.f === "url") { delete state.refs[i].content; state.refs[i].fetched = 0; } }
    if (t.dataset.sf) state.scripts[i][t.dataset.sf] = t.value;
    scheduleCheck();
  });
  $("refs").addEventListener("click", (e) => {
    const rm = e.target.closest("[data-rm]");
    if (rm) { (rm.dataset.rm === "ref" ? state.refs : state.scripts).splice(Number(rm.dataset.i), 1); renderRefs(); scheduleCheck(); return; }
    const f = e.target.closest("[data-fetch]");
    if (f) fetchRef(Number(f.dataset.fetch));
  });
  $("copy").onclick = async () => {
    try { await navigator.clipboard.writeText(state.last?.finalText ?? $("draft").value); toast("Copied the file."); } catch { toast("Your browser blocked copying."); }
  };
  $("download").onclick = doDownload;
  $("primary").onclick = () => (state.data.hosted ? doDownload() : doSave());
}


// ---------- tooltips: one real tooltip, so nothing is clipped. Shows on hover and on keyboard focus. ----------

function initTooltips() {
  // Labels get an info icon you can tab to. The icon carries the text for screen readers too.
  document.querySelectorAll("label.field[data-tip]").forEach((label) => {
    const tip = label.dataset.tip;
    label.removeAttribute("data-tip");
    const icon = document.createElement("span");
    icon.className = "info";
    icon.tabIndex = 0;
    icon.setAttribute("role", "img");
    icon.setAttribute("aria-label", tip);
    icon.dataset.tip = tip;
    icon.textContent = "i";
    icon.addEventListener("click", (e) => e.preventDefault());
    label.appendChild(icon);
  });
  const tip = $("tooltip");
  let shown = null;
  let timer = 0;
  const hide = () => { clearTimeout(timer); tip.hidden = true; shown = null; };
  const show = (el) => {
    const text = el.dataset.tip;
    if (!text) return;
    tip.textContent = text;
    tip.hidden = false;
    shown = el;
    const r = el.getBoundingClientRect();
    const t = tip.getBoundingClientRect();
    let x = Math.min(window.innerWidth - t.width - 8, Math.max(8, r.left + r.width / 2 - t.width / 2));
    let y = r.bottom + 8;
    if (y + t.height > window.innerHeight - 8) y = Math.max(8, r.top - t.height - 8);
    tip.style.left = `${x}px`;
    tip.style.top = `${y}px`;
  };
  document.addEventListener("pointerover", (e) => {
    const el = e.target.closest?.("[data-tip]");
    if (!el || el === shown) return;
    clearTimeout(timer);
    timer = setTimeout(() => show(el), 350);
  });
  document.addEventListener("pointerout", (e) => {
    const el = e.target.closest?.("[data-tip]");
    if (el && !el.contains(e.relatedTarget)) hide();
  });
  document.addEventListener("focusin", (e) => { const el = e.target.closest?.("[data-tip]"); if (el) show(el); });
  document.addEventListener("focusout", hide);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") hide(); });
  document.addEventListener("scroll", hide, true);
  document.addEventListener("pointerdown", hide);
}

// ---------- movable and resizable panels (kept in this browser) ----------

const LAYOUT_KEY = "skill-builder-layout";
const layout = { left: 52, swapped: false, height: 0 };

function loadLayout() {
  try {
    const saved = JSON.parse(localStorage.getItem(LAYOUT_KEY) || "{}");
    if (typeof saved.left === "number") layout.left = Math.min(70, Math.max(30, saved.left));
    if (typeof saved.swapped === "boolean") layout.swapped = saved.swapped;
    if (typeof saved.height === "number") layout.height = saved.height;
  } catch { /* storage may be blocked */ }
}
function saveLayout() {
  try { localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout)); } catch { /* ignore */ }
}
function applyLayout() {
  const el = document.querySelector(".layout");
  const [a, b] = layout.swapped ? [100 - layout.left, layout.left] : [layout.left, 100 - layout.left];
  // The splitter always sits between the two panels. When swapped, the preview is on the left and gets the left share.
  el.style.gridTemplateColumns = layout.swapped ? `minmax(0, ${layout.left}fr) 12px minmax(0, ${100 - layout.left}fr)` : `minmax(0, ${a}fr) 12px minmax(0, ${b}fr)`;
  el.classList.toggle("swapped", layout.swapped);
  $("splitter").setAttribute("aria-valuenow", String(Math.round(layout.left)));
  $("preview").style.setProperty("--preview-h", layout.height ? `${layout.height}px` : "calc(100vh - 96px)");
}
function initLayout() {
  loadLayout();
  applyLayout();
  const splitter = $("splitter");
  const grip = $("grip");

  // Drag the divider. The left share is the share of the panel on the left side, whichever panel that is.
  splitter.addEventListener("pointerdown", (e) => {
    splitter.setPointerCapture(e.pointerId);
    splitter.classList.add("drag");
    document.body.classList.add("dragging");
    const box = document.querySelector(".layout").getBoundingClientRect();
    const move = (ev) => {
      layout.left = Math.min(70, Math.max(30, ((ev.clientX - box.left) / box.width) * 100));
      applyLayout();
    };
    const up = () => {
      splitter.classList.remove("drag");
      document.body.classList.remove("dragging");
      splitter.removeEventListener("pointermove", move);
      splitter.removeEventListener("pointerup", up);
      splitter.removeEventListener("pointercancel", up);
      saveLayout();
    };
    splitter.addEventListener("pointermove", move);
    splitter.addEventListener("pointerup", up);
    splitter.addEventListener("pointercancel", up);
  });
  splitter.addEventListener("keydown", (e) => {
    const step = e.shiftKey ? 8 : 2;
    if (e.key === "ArrowLeft") layout.left = Math.max(30, layout.left - step);
    else if (e.key === "ArrowRight") layout.left = Math.min(70, layout.left + step);
    else if (e.key === "Home") layout.left = 52;
    else return;
    e.preventDefault(); applyLayout(); saveLayout();
  });
  splitter.addEventListener("dblclick", () => { layout.left = 52; applyLayout(); saveLayout(); });

  // Drag the bottom edge of the preview to change its height. This also resizes the Edit file box.
  grip.addEventListener("pointerdown", (e) => {
    grip.setPointerCapture(e.pointerId);
    grip.classList.add("drag");
    document.body.classList.add("dragging", "row");
    const startY = e.clientY;
    const startH = $("preview").getBoundingClientRect().height;
    const move = (ev) => {
      layout.height = Math.round(Math.min(2400, Math.max(360, startH + (ev.clientY - startY))));
      applyLayout();
    };
    const up = () => {
      grip.classList.remove("drag");
      document.body.classList.remove("dragging", "row");
      grip.removeEventListener("pointermove", move);
      grip.removeEventListener("pointerup", up);
      grip.removeEventListener("pointercancel", up);
      saveLayout();
    };
    grip.addEventListener("pointermove", move);
    grip.addEventListener("pointerup", up);
    grip.addEventListener("pointercancel", up);
  });
  grip.addEventListener("keydown", (e) => {
    const cur = layout.height || $("preview").getBoundingClientRect().height;
    const step = e.shiftKey ? 160 : 40;
    if (e.key === "ArrowDown") layout.height = Math.min(2400, cur + step);
    else if (e.key === "ArrowUp") layout.height = Math.max(360, cur - step);
    else if (e.key === "Home") layout.height = 0;
    else return;
    e.preventDefault(); applyLayout(); saveLayout();
  });
  grip.addEventListener("dblclick", () => { layout.height = 0; applyLayout(); saveLayout(); });

  $("swap").onclick = () => { layout.swapped = !layout.swapped; layout.left = 100 - layout.left; applyLayout(); saveLayout(); };
  $("reset-layout").onclick = () => { layout.left = 52; layout.swapped = false; layout.height = 0; applyLayout(); saveLayout(); toast("Layout reset."); };
}

(async () => {
  try {
    state.data = await api("/api/templates");
  } catch {
    $("status").textContent = "Could not load the templates.";
    return;
  }
  const agents = ["Explore", "Plan", "general-purpose", ...state.data.agent.map((a) => a.name)];
  $("agent-list").innerHTML = [...new Set(agents)].map((a) => `<option value="${esc(a)}">`).join("");
  $("primary").textContent = state.data.hosted ? "Download .zip" : "Save to project";
  $("primary").dataset.tip = state.data.hosted ? "Download a zip with the right folders. Unzip it in your project." : "Write the files into your project folder.";
  $("download").hidden = !!state.data.hosted;
  wire();
  initTooltips();
  initLayout();
  setKind("skill");
})();
