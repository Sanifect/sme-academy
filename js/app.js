const KEY = "sanifect-sme-academy-v1";
const LMS = window.SANIFECT_LMS;

function loadState() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
  catch { return {}; }
}
function saveState(s) { localStorage.setItem(KEY, JSON.stringify(s)); }

let state = Object.assign({
  learner: null,
  progress: {},
  quiz: {},
  certs: {},
  libraryDone: {},
  reviewUnlock: {}
}, loadState());

function courseById(id) { return LMS.courses.find((c) => c.id === id); }
function pct(n, d) { return d ? Math.round((n / d) * 100) : 0; }

function courseProgress(id) {
  const c = courseById(id);
  if (!c) return { slides: 0, quiz: 0, overall: 0, seen: new Set(), passed: false };
  const p = state.progress[id] || { seen: [] };
  const seen = new Set(p.seen);
  const slides = pct(seen.size, c.slides.length);
  const q = state.quiz[id];
  const quiz = q && q.passed ? 100 : q && q.best != null ? q.best : 0;
  const overall = Math.round(slides * 0.7 + quiz * 0.3);
  return { slides, quiz, overall, seen, passed: !!(q && q.passed) };
}

function markSeen(id, i) {
  const p = state.progress[id] || { seen: [] };
  if (!p.seen.includes(i)) p.seen.push(i);
  state.progress[id] = p;
  saveState(state);
}

function stageById(id) { return LMS.stages.find((s) => s.id === id); }

function stageStatus(id) {
  const stage = stageById(id);
  const list = stage.courses.map(courseById).filter(Boolean);
  const done = list.filter((c) => courseProgress(c.id).passed).length;
  const passed = stage.rule === "any" ? done >= 1 : done === list.length;
  return { done, total: list.length, passed, pct: pct(done, list.length) };
}

function operatorDone() { return stageStatus("operator").passed; }
function specialistDone() { return stageStatus("specialist").passed; }
function smePrepDone() {
  return ["sme-01", "sme-02", "sme-03", "sme-04"].every((id) => courseProgress(id).passed);
}

function canAccess(c) {
  if (!c) return false;
  if (c.track !== "sme") return true;
  if (!state.learner) return false;
  if (!operatorDone() || !specialistDone()) return false;
  if (c.id === "sme-05") return smePrepDone();
  return true;
}

function lockReason(c) {
  if (canAccess(c)) return "";
  if (!state.learner) return "Sign in to open SME units.";
  if (!operatorDone()) return "Certify all six Operator units first, including ICM-01 The Sanifect method.";
  if (!specialistDone()) return "Certify at least one Specialist sector unit first.";
  if (c.id === "sme-05") return "Certify SME-01 to SME-04 before the capstone.";
  return "This unit is locked.";
}

function nextCourse() {
  for (const stage of LMS.stages) {
    for (const id of stage.courses) {
      const c = courseById(id);
      if (!c) continue;
      if (!courseProgress(id).passed && canAccess(c)) return c;
    }
  }
  const open = LMS.courses.find((c) => !courseProgress(c.id).passed && canAccess(c));
  return open || null;
}

function hash() {
  const raw = location.hash.replace(/^#/, "") || "/";
  const [pathPart, query] = raw.split("?");
  const parts = pathPart.split("/").filter(Boolean);
  return { path: "/" + parts.join("/"), parts, params: new URLSearchParams(query || "") };
}

function go(to) { location.hash = to; }

function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content;
}

function escapeHtml(s) {
  return String(s || "").replace(/[&<>"]/g, (ch) => ({ "&": "&", "<": "<", ">": ">", '"': """ }[ch]));
}

function topbar(active) {
  const l = state.learner;
  return `
    <header class="topbar">
      <a class="brand" href="#/">
        <img src="assets/logo.svg" alt="Sanifect" />
        <span class="word"><strong>Sanifect SME Academy</strong><span>Pathway \u00b7 training \u00b7 proof</span></span>
      </a>
      <nav class="nav">
        <a class="${active==="home"?"active":""}" href="#/">Academy</a>
        <a class="${active==="method"?"active":""}" href="#/method">Method</a>
        <a class="${active==="pathway"?"active":""}" href="#/pathway">Pathway</a>
        <a class="${active==="catalog"?"active":""}" href="#/units">Units</a>
        <a class="${active==="evidence"?"active":""}" href="#/evidence">Evidence</a>
        ${l ? `<a class="${active==="academy"?"active":""}" href="#/academy">Dashboard</a>
               <a class="${active==="records"?"active":""}" href="#/records">Records</a>` : ""}
        ${l ? "" : `<a class="${active==="login"?"active":""}" href="#/login">Enter</a>`}
      </nav>
      <div class="who">${l ? escapeHtml(l.name) + " \u00b7 " + escapeHtml(l.role) : "Public desk"}</div>
    </header>`;
}
