/* =========================================================
   main.js — builds the header/nav and footer on every page
   from data/config.json, so editing ONE file updates the
   conference name, dates, and contact info site-wide.
   ========================================================= */

const NAV_LINKS = [
  { href: "index.html", label: "Home", key: "home" },
  { href: "speakers.html", label: "Speakers", key: "speakers" },
  { href: "schedule.html", label: "Schedule", key: "schedule" },
  { href: "information.html", label: "Information", key: "information" },
];

async function loadConfig() {
  const res = await fetch("data/config.json");
  if (!res.ok) throw new Error("Could not load data/config.json");
  return res.json();
}

function buildHeader(config, activeKey) {
  const links = NAV_LINKS.map(
    (l) => `<li><a href="${l.href}" ${l.key === activeKey ? 'aria-current="page"' : ""}>${l.label}</a></li>`
  ).join("");

  return `
    <div class="nav-inner">
      <a class="brand" href="index.html">${config.shortName}<em>.</em></a>
      <button class="nav-toggle" id="navToggle" aria-expanded="false" aria-controls="navLinks">Menu</button>
      <ul class="nav-links" id="navLinks">${links}</ul>
    </div>`;
}

function buildFooter(config) {
  const social = (config.social || [])
    .map((s) => `<li><a href="${s.url}" target="_blank" rel="noopener">${s.label}</a></li>`)
    .join("");

  return `
    <div class="wrap">
      <div class="footer-grid">
        <div>
          <h4>${config.fullName}</h4>
          <p style="max-width:42ch;color:#C9D6C7;">${config.shortDescription}</p>
          <p style="max-width:42ch;color:#8FA189;font-family:var(--font-mono);font-size:.8rem;">${config.organisers || ""}</p>
        </div>
        <div>
          <h4>Contact</h4>
          <ul>
            <li><a href="mailto:${config.contactEmail}">${config.contactEmail}</a></li>
            <li>${config.venueShort}</li>
          </ul>
        </div>
        <div>
          <h4>Elsewhere</h4>
          <ul>${social || "<li>—</li>"}</ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; ${new Date().getFullYear()} ${config.shortName}. Content licensed CC BY 4.0 unless noted.</span>
        <span>Built with plain HTML/CSS/JS — hosted on GitHub Pages.</span>
      </div>
    </div>`;
}

function bindMobileNav() {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  if (!toggle || !links) return;
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
}

function renderCountdown(config) {
  const el = document.getElementById("countdown-value");
  if (!el) return;
  const target = new Date(config.startDateISO).getTime();
  const update = () => {
    const diff = target - Date.now();
    if (diff <= 0) {
      el.textContent = "Underway";
      return;
    }
    const days = Math.floor(diff / 86400000);
    el.textContent = `T-minus ${days} day${days === 1 ? "" : "s"}`;
  };
  update();
  setInterval(update, 60000);
}

function fillDataAttrs(config) {
  // Any element with data-config="fieldName" gets its text filled in.
  document.querySelectorAll("[data-config]").forEach((el) => {
    const key = el.getAttribute("data-config");
    if (config[key] !== undefined) el.textContent = config[key];
  });
}

(async function initChrome() {
  const headerMount = document.getElementById("site-header");
  const footerMount = document.getElementById("site-footer");
  const activeKey = document.body.dataset.page || "home";

  try {
    const config = await loadConfig();
    if (headerMount) headerMount.innerHTML = buildHeader(config, activeKey);
    if (footerMount) footerMount.innerHTML = buildFooter(config);
    bindMobileNav();
    renderCountdown(config);
    fillDataAttrs(config);
    document.dispatchEvent(new CustomEvent("config:ready", { detail: config }));
  } catch (err) {
    console.error(err);
    if (headerMount) headerMount.innerHTML = buildHeader(
      { shortName: "CONFLUENCE" }, activeKey
    );
  }
})();
