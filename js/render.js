/* =========================================================
   render.js — turns data/*.json into page content.
   To add/change a speaker, session, or news item: edit the
   matching JSON file. Never touch the HTML.
   ========================================================= */

async function fetchData(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Could not load ${path}`);
  return res.json();
}

function escapeHTML(str = "") {
  return str.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

/* ---------- Speakers ---------- */
async function renderSpeakers(selector, path = "data/speakers.json", { limit } = {}) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.innerHTML = `<p class="state-msg">Loading speakers…</p>`;
  try {
    let speakers = await fetchData(path);
    if (limit) speakers = speakers.slice(0, limit);
    if (!speakers.length) {
      el.innerHTML = `<p class="state-msg">Speaker list will be announced soon.</p>`;
      return;
    }
    el.innerHTML = speakers.map((s) => `
      <div class="card speaker-card">
        ${s.photo ? `<img class="speaker-photo" src="${s.photo}" alt="Portrait of ${escapeHTML(s.name)}" loading="lazy">` : ""}
        <h4>${escapeHTML(s.name)}</h4>
        <div class="speaker-affil">${escapeHTML(s.affiliation)}</div>
        ${s.talkTitle ? `<p class="speaker-talk">${escapeHTML(s.talkTitle)}</p>` : ""}
      </div>
    `).join("");
  } catch (err) {
    console.error(err);
    el.innerHTML = `<p class="state-msg">Speakers could not be loaded right now.</p>`;
  }
}

/* ---------- Schedule / Program ---------- */
async function renderSchedule(selector, path = "data/schedule.json") {
  const el = document.querySelector(selector);
  if (!el) return;
  el.innerHTML = `<p class="state-msg">Loading program…</p>`;
  try {
    const days = await fetchData(path); // [{date, label, sessions:[...]}]
    if (!days.length) {
      el.innerHTML = `<p class="state-msg">The schedule is still being finalised and will be posted here.</p>`;
      return;
    }
    const tabs = days.map((d, i) => `
      <button class="day-tab" role="tab" aria-selected="${i === 0}" data-day="${i}">${escapeHTML(d.label)}</button>
    `).join("");

    const panels = days.map((d, i) => `
      <div class="day-panel" data-day-panel="${i}" ${i === 0 ? "" : "hidden"}>
        ${d.sessions.map((s) => `
          <div class="session">
            <div class="session-time">${escapeHTML(s.time)}</div>
            <div>
              ${s.track ? `<span class="session-track">${escapeHTML(s.track)}</span>` : ""}
              <h4 class="session-title">${escapeHTML(s.title)}</h4>
              <div class="session-meta">${escapeHTML(s.speaker || "")}${s.room ? " · " + escapeHTML(s.room) : ""}</div>
            </div>
          </div>
        `).join("")}
      </div>
    `).join("");

    el.innerHTML = `<div class="day-tabs" role="tablist">${tabs}</div>${panels}`;

    el.querySelectorAll(".day-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        el.querySelectorAll(".day-tab").forEach((t) => t.setAttribute("aria-selected", "false"));
        el.querySelectorAll(".day-panel").forEach((p) => p.setAttribute("hidden", ""));
        tab.setAttribute("aria-selected", "true");
        el.querySelector(`[data-day-panel="${tab.dataset.day}"]`).removeAttribute("hidden");
      });
    });
  } catch (err) {
    console.error(err);
    el.innerHTML = `<p class="state-msg">Program could not be loaded right now.</p>`;
  }
}

/* ---------- News ---------- */
async function renderNews(selector, path = "data/news.json", { limit } = {}) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.innerHTML = `<p class="state-msg">Loading updates…</p>`;
  try {
    let items = await fetchData(path);
    items = items.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    if (limit) items = items.slice(0, limit);
    if (!items.length) {
      el.innerHTML = `<p class="state-msg">No announcements yet — check back soon.</p>`;
      return;
    }
    el.innerHTML = items.map((n) => `
      <div class="news-item">
        <div class="news-date">${escapeHTML(n.date)}</div>
        <div>
          <h4 style="margin-bottom:.2em;">${escapeHTML(n.title)}</h4>
          <p style="margin-bottom:0;color:var(--graphite-soft);">${escapeHTML(n.body)}</p>
        </div>
      </div>
    `).join("");
  } catch (err) {
    console.error(err);
    el.innerHTML = `<p class="state-msg">Updates could not be loaded right now.</p>`;
  }
}

/* ---------- Information ---------- */
async function renderInformation(selector, path = "data/information.json") {
  const el = document.querySelector(selector);
  if (!el) return;
  el.innerHTML = `<p class="state-msg">Loading…</p>`;
  try {
    const sections = await fetchData(path); // [{title, status, body}]
    if (!sections.length) {
      el.innerHTML = `<p class="state-msg">Information will be posted here soon.</p>`;
      return;
    }
    el.innerHTML = sections.map((s) => `
      <div class="session" style="grid-template-columns: 200px 1fr;">
        <div>
          <div class="session-title" style="font-size:1.05rem;margin-bottom:.3em;">${escapeHTML(s.title)}</div>
          ${s.status ? `<span class="pill">${escapeHTML(s.status)}</span>` : ""}
        </div>
        <p style="margin:0;color:var(--graphite-soft);">${escapeHTML(s.body)}</p>
      </div>
    `).join("");
  } catch (err) {
    console.error(err);
    el.innerHTML = `<p class="state-msg">Information could not be loaded right now.</p>`;
  }
}
