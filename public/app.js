import { zip } from "/zip.js";

const $ = (id) => document.getElementById(id);
const state = { kind: "skill", data: null, template: null, dirty: false, refs: [], scripts: [], timer: null, seq: 0, last: null, tab: "file" };
const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const WRITE_TOOLS = ["Edit", "Write", "NotebookEdit", "Bash"];

async function api(path, body) {
  const res = await fetch(path, body ? { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) } : undefined);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Request failed.");
  return json;
}
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const defaultDir = () => (state.kind === "skill" ? ".claude/skills" : ".claude/agents");

function toast(message) {
  const t = $("toast");
  t.textContent = message;
  t.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove("show"), 3200);
}

// ---------- payloads ----------

function checkPayload() {
  const p = { kind: state.kind, template: state.template, name: $("name").value.trim(), description: $("description").value.trim(), outDir: $("outDir").value.trim(), text: $("draft").value };
  if (state.kind === "skill") {
    p.references = state.refs.map(({ kind, ...r }) => (r.content !== undefined ? { content: r.content, as: r.as, when: r.when } : r));
    p.scripts = state.scripts;
  }
  return p;
}
function renderPayload() {
  const p = checkPayload();
  delete p.text; delete p.references; delete p.scripts;
  if (state.kind === "agent") {
    p.model = $("model").value;
    p.maxTurns = $("maxTurns").value;
    p.tools = [...document.querySelectorAll("#tools input:checked")].map((i) => i.value);
    p.skills = $("skills").value.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return p;
}

// ---------- kind and templates ----------

function setKind(kind) {
  state.kind = kind;
  for (const k of ["skill", "agent"]) $(`tab-${k}`).setAttribute("aria-selected", String(k === kind));
  $("agent-options").hidden = kind !== "agent";
  $("step-3").hidden = kind !== "skill";
  $("outDir").value = defaultDir();
  state.refs = []; state.scripts = []; renderRefs();
  const chips = (t) => {
    const out = [];
    if (kind === "skill") {
      if (t.userStarted) out.push('<span class="chip accent">you start it</span>');
      else out.push('<span class="chip">Claude starts it</span>');
      if (/without editing|read-only/i.test(t.description)) out.push('<span class="chip accent">no edits</span>');
    } else {
      const tools = t.tools.split(",").map((x) => x.trim()).filter(Boolean);
      out.push(`<span class="chip accent">${esc(t.model || "inherit")}</span>`);
      out.push(`<span class="chip">${tools.length} tools</span>`);
      if (!tools.some((x) => WRITE_TOOLS.includes(x))) out.push('<span class="chip accent">read-only</span>');
    }
    return out.join("");
  };
  $("templates").innerHTML = state.data[kind]
    .map((t) => `<button class="tpl" data-t="${t.name}" aria-pressed="false"><b>${t.name}</b><p>${esc(t.purpose || t.description)}</p><div class="chips">${chips(t)}</div></button>`)
    .join("");
  $("templates").querySelectorAll(".tpl").forEach((b) => b.addEventListener("click", () => pick(b.dataset.t)));
  pick(state.data[kind][0].name, true);
}

async function pick(name, force) {
  if (!force && state.dirty && !confirm("Replace your edits with the template?")) return;
  state.template = name;
  document.querySelectorAll(".tpl").forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.t === name)));
  const t = state.data[state.kind].find((x) => x.name === name);
  $("guide-body").innerHTML = [["Use when", t.useWhen], ["Change", t.change], ["Keep", t.keep], ["Test", t.test]]
    .filter(([, v]) => v).map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join("");
  if (state.kind === "agent") {
    $("model").value = ""; $("maxTurns").value = ""; $("skills").value = "";
    const have = new Set(t.tools.split(",").map((x) => x.trim()));
    document.querySelectorAll("#tools input").forEach((i) => { i.checked = have.has(i.value); });
  }
  $("description").placeholder = t.description;
  state.dirty = false;
  await regenerate(true);
}

async function regenerate(force) {
  if (state.dirty && !force) return;
  try {
    const { text } = await api("/api/render", renderPayload());
    $("draft").value = text; state.dirty = false;
  } catch { /* the name may be invalid while typing */ }
  scheduleCheck();
}

// While the user edits the draft by hand, keep name and description in the draft in step with the form.
function patchDraft() {
  let t = $("draft").value;
  const name = $("name").value.trim();
  const desc = $("description").value.trim().replace(/\n+/g, " ");
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
  }, 300);
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
  const pill = $("status");
  const status = hint ? ["", hint] : r.errors.length ? ["err", `${r.errors.length} ${r.errors.length === 1 ? "error" : "errors"} to fix`] : r.warnings.length ? ["warn", "Ready, with advice"] : ["ok", "Ready"];
  pill.className = `pill ${status[0]}`;
  pill.textContent = status[1];
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
      <div class="row"><input type="text" data-f="as" data-i="${i}" placeholder="file name, for example notes.md" value="${esc(r.as || "")}" aria-label="File name">
      <input type="text" data-f="when" data-i="${i}" placeholder="when to read it, for example you write the notes" value="${esc(r.when || "")}" aria-label="When to read it" style="flex:2"></div></div>`;
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
  } catch (e) {
    delete r.content;
    r.fetchError = state.data.hosted
      ? "Your browser could not download this URL. The site may block it. Paste the text instead."
      : "Your browser could not download this URL. The builder will try again from this machine when you check or save.";
  }
  renderRefs(); scheduleCheck();
}

// ---------- actions ----------

function currentFiles() {
  return state.last?.files ?? [];
}

async function doDownload() {
  const files = currentFiles();
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
  state.tab = tab;
  for (const t of ["file", "final", "checks"]) {
    $(`pt-${t}`).setAttribute("aria-selected", String(t === tab));
    $(`pane-${t}`).hidden = t !== tab;
  }
}

function wire() {
  $("tab-skill").onclick = () => setKind("skill");
  $("tab-agent").onclick = () => setKind("agent");
  for (const t of ["file", "final", "checks"]) $(`pt-${t}`).onclick = () => setTab(t);
  $("name").addEventListener("input", () => { state.dirty ? patchDraft() : regenerate(); scheduleCheck(); });
  $("description").addEventListener("input", () => { state.dirty ? patchDraft() : regenerate(); scheduleCheck(); });
  for (const id of ["model", "maxTurns", "skills"]) $(id).addEventListener("input", () => regenerate());
  $("tools").addEventListener("change", () => regenerate());
  $("outDir").addEventListener("input", scheduleCheck);
  $("draft").addEventListener("input", () => { state.dirty = true; scheduleCheck(); });
  $("reset").onclick = () => regenerate(true);
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

(async () => {
  try {
    state.data = await api("/api/templates");
  } catch (e) {
    $("status").textContent = "Could not load the templates.";
    return;
  }
  $("tools").innerHTML = state.data.tools.map((t) => `<label><input type="checkbox" value="${t}">${t}</label>`).join("");
  $("primary").textContent = state.data.hosted ? "Download .zip" : "Save to project";
  $("download").hidden = !!state.data.hosted;
  wire();
  setKind("skill");
})();
