function bind() {
  const login = document.getElementById("login-form");
  if (login) {
    login.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(login);
      state.learner = { name: fd.get("name").trim(), role: fd.get("role"), site: (fd.get("site") || "").trim() };
      saveState(state);
      go("/academy");
    });
  }
  document.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => {
    if (b.disabled) return;
    go(b.getAttribute("data-go").slice(1));
  }));
  document.querySelectorAll(".filters [data-track]").forEach((b) => b.addEventListener("click", () => go("/units?track=" + b.dataset.track)));
  document.querySelectorAll("[data-lib]").forEach((b) => b.addEventListener("click", () => {
    state.libraryDone[b.dataset.lib] = true;
    saveState(state);
    render();
  }));
  const so = document.getElementById("signout");
  if (so) so.addEventListener("click", () => { localStorage.removeItem(KEY); state = { learner: null, progress: {}, quiz: {}, certs: {}, libraryDone: {}, reviewUnlock: {} }; go("/"); });

  const form = document.getElementById("quiz-form");
  if (form) bindQuiz(form);
}

function onKey(e) {
  const { parts } = hash();
  if (parts[0] !== "play") return;
  const c = courseById(parts[1]);
  if (!c || !canAccess(c)) return;
  const i = Number(parts[2] || 0);
  if (e.key === "ArrowRight" && i < c.slides.length - 1) go("/play/" + c.id + "/" + (i + 1));
  if (e.key === "ArrowLeft" && i > 0) go("/play/" + c.id + "/" + (i - 1));
}

function bindQuiz(form) {
  const id = form.dataset.course;
  const c = courseById(id);
  const picks = {};
  const locked = {};

  form.querySelectorAll(".choice").forEach((btn) => {
    btn.addEventListener("click", () => {
      const qi = Number(btn.dataset.qi);
      if (locked[qi]) return;
      picks[qi] = Number(btn.dataset.ci);
      form.querySelectorAll(`.choice[data-qi="${qi}"]`).forEach((x) => x.classList.toggle("picked", Number(x.dataset.ci) === picks[qi]));
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (Object.keys(picks).length < c.quiz.length) {
      alert("Answer every question before submitting.");
      return;
    }
    let right = 0;
    c.quiz.forEach((item, qi) => {
      locked[qi] = true;
      const qel = form.querySelector(`.quiz-q[data-qi="${qi}"]`);
      qel.classList.add("locked");
      const ok = picks[qi] === item.answer;
      if (ok) right += 1;
      qel.querySelectorAll(".choice").forEach((ch) => {
        const ci = Number(ch.dataset.ci);
        ch.classList.toggle("good", ci === item.answer);
        ch.classList.toggle("bad", ci === picks[qi] && !ok);
      });
      const box = qel.querySelector(".explain");
      box.hidden = false;
      box.innerHTML = ok
        ? `<strong>Correct.</strong> ${item.explain}`
        : `<strong>Not correct.</strong> ${item.explain}<div class="row-actions"><a class="btn ink" href="#/play/${c.id}/${item.review}">Review the lesson</a></div>`;
    });
    const score = pct(right, c.quiz.length);
    const passed = score >= LMS.passMark;
    state.quiz[id] = { best: Math.max(score, (state.quiz[id] && state.quiz[id].best) || 0), last: score, passed: passed || !!(state.quiz[id] && state.quiz[id].passed) };
    if (passed) {
      state.certs[id] = {
        id: "SAN-SME-" + id.toUpperCase() + "-" + Date.now().toString(36).toUpperCase(),
        score,
        date: new Date().toLocaleDateString("en-AU")
      };
    }
    saveState(state);
    if (passed) go("/cert/" + id);
    else alert("Score " + score + "%. Pass mark is " + LMS.passMark + "%. Review the highlighted lessons, then retake.");
  });
}

function needLearner(parts) {
  const gated = ["academy", "play", "quiz", "cert", "records", "competency", "library"];
  return gated.includes(parts[0]);
}

function render() {
  const root = document.getElementById("app");
  const { parts } = hash();
  if (parts[0] === "demo") {
    state.learner = { name: "Demo learner", role: "Trainer", site: "Sanifect HQ" };
    saveState(state);
    go("/academy");
    return;
  }
  if (needLearner(parts) && !state.learner) {
    go("/login");
    return;
  }
  let html;
  switch (parts[0]) {
    case "login": html = viewLogin(); break;
    case "method": html = viewMethod(); break;
    case "pathway": html = viewPathway(); break;
    case "units":
    case "catalog": html = viewCatalog(); break;
    case "evidence": html = viewEvidence(); break;
    case "academy": html = viewAcademy(); break;
    case "course": html = viewCourse(parts[1]); break;
    case "play": html = viewPlay(parts[1], parts[2]); break;
    case "quiz": html = viewQuiz(parts[1]); break;
    case "cert": html = viewCert(parts[1]); break;
    case "records": html = viewRecords(); break;
    case "competency": html = viewCompetency(); break;
    case "library": html = viewLibrary(); break;
    default: html = viewLanding();
  }
  if (!html) return;
  root.replaceChildren(el(html));
  bind();
}

window.addEventListener("hashchange", render);
document.addEventListener("keydown", onKey);
render();
