function footer() {
  return `
    <footer class="site-footer wrap">
      <p><strong>Sanifect ICM</strong> works each client's specific challenge \u2014 a pathway, training, and a measurable health outcome. We endorse <strong>Nanocyn Advanced</strong> when that pathway needs a listed hospital-grade hard-surface disinfectant, sanitiser and cleaner, <strong>AUST L 520725</strong>. It is not TGA approved, TGA registered, or TGA endorsed.</p>
      <p>ARTG sponsor: ${escapeHtml(LMS.sponsor)}. ${escapeHtml(LMS.org)} is the Australian distributor and ICM partner. Product claims sit with the sponsor. Argus owns Sanifect public copy. This academy does not publish the internal evidence library.</p>
      <p>1300 359 151 \u00b7 sanifect.org \u00b7 info@sanifect.org \u00b7 rafal@sanifect.org</p>
    </footer>`;
}

function tile(c) {
  const pr = courseProgress(c.id);
  const locked = !canAccess(c);
  return `
    <a class="tile${locked ? " locked" : ""}" href="#/course/${c.id}">
      <div class="kicker">${c.code} \u00b7 ${c.track}${locked ? " \u00b7 locked" : ""}</div>
      <h3>${c.title}</h3>
      <p>${c.description}</p>
      <div class="meta">
        <span class="chip">${c.duration}</span>
        <span class="chip">${c.level}</span>
        <span class="chip">${pr.passed ? "Certified" : locked ? "Locked" : pr.overall + "%"}</span>
      </div>
      <div class="progress"><span style="width:${pr.overall}%"></span></div>
    </a>`;
}

function stageCards(link) {
  return LMS.stages.map((s) => {
    const st = state.learner ? stageStatus(s.id) : { done: 0, total: s.courses.length, passed: false, pct: 0 };
    const cls = st.passed ? " done" : (state.learner && st.done > 0 ? " current" : "");
    const units = s.courses.map(courseById).filter(Boolean).map((c) => {
      const ok = courseProgress(c.id).passed;
      return `<span class="chip${ok ? " teal" : ""}">${c.code}${ok ? " \u2713" : ""}</span>`;
    }).join("");
    return `
      <article class="stage${cls}">
        <div class="n">${s.n}</div>
        <div class="label">${s.label}</div>
        <h3>${s.title}</h3>
        <p>${s.summary}</p>
        <div class="meta">${units}</div>
        <div class="progress"><span style="width:${st.pct}%"></span></div>
        <p class="muted" style="margin-top:10px">${s.duration}${state.learner ? " \u00b7 " + st.done + "/" + st.total + " certified" : ""}</p>
        ${link ? `<div class="row-actions"><a class="btn ghost" href="#/units?track=${s.id === "sme" ? "sme" : s.id === "specialist" ? "agedcare" : "core"}">View units</a></div>` : ""}
      </article>`;
  }).join("");
}
