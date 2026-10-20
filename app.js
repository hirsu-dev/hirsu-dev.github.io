import { projects } from "./projects.js";

const $ = (selector) => document.querySelector(selector);
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ],
  );
const validFilters = new Set(["all", "software", "hardware", "homelab", "ai"]);
const query = new URLSearchParams(location.search);
let filter = validFilters.has(query.get("filter"))
  ? query.get("filter")
  : "all";
let search = (query.get("q") || "").slice(0, 150);
let returnFocus = null;

function renderProjects() {
  const terms = search.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  const visible = projects.filter((project) => {
    const matchesCategory =
      filter === "all" || project.filters.includes(filter);
    const text = [
      project.title,
      project.description,
      project.category,
      project.status,
      ...project.tags,
    ]
      .join(" ")
      .toLocaleLowerCase();
    return matchesCategory && terms.every((term) => text.includes(term));
  });
  $("#project-grid").innerHTML = visible
    .map(
      (
        project,
        index,
      ) => `<article class="project-card" data-project="${escape(project.id)}">
    <a class="project-visual art-${escape(project.artwork)}" href="#project-${escape(project.id)}" aria-label="Read about ${escape(project.title)}">
      <span class="project-status ${escape(project.statusClass || "")}">${escape(project.status)}</span>
      <img src="${escape(project.image)}" alt="${escape(project.alt)}" width="800" height="520" loading="${index > 1 ? "lazy" : "eager"}" />
      <span class="visual-arrow" aria-hidden="true">↗</span>
    </a>
    <div class="project-card-body"><p class="project-category">${escape(project.category)}</p><div class="project-title-row"><h3><a href="#project-${escape(project.id)}">${escape(project.title)}</a></h3><span aria-hidden="true">↗</span></div><p class="project-description">${escape(project.description)}</p><ul class="project-tags" aria-label="Technologies">${project.tags.map((tag) => `<li>${escape(tag)}</li>`).join("")}</ul><div class="project-card-footer"><span>${escape(project.caption)}</span>${project.source ? `<a href="${escape(project.source)}" target="_blank" rel="noopener noreferrer" aria-label="${escape(project.title)} on GitHub">GitHub ↗</a>` : '<span class="personal-build">Personal build</span>'}</div></div>
  </article>`,
    )
    .join("");
  document.querySelectorAll("[data-filter]").forEach((button) => {
    const active = button.dataset.filter === filter;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  $("#empty-state").hidden = visible.length !== 0;
  $("#result-count").textContent =
    filter === "all" && !search.trim()
      ? `${projects.length} projects · 5 public repositories + 2 personal builds`
      : `${visible.length} ${visible.length === 1 ? "project" : "projects"} found`;
}

function updateQuery() {
  const url = new URL(location.href);
  if (filter !== "all") url.searchParams.set("filter", filter);
  else url.searchParams.delete("filter");
  if (search.trim()) url.searchParams.set("q", search.trim());
  else url.searchParams.delete("q");
  history.replaceState(null, "", url);
}

function openProject(id, trigger = null) {
  const project = projects.find((entry) => entry.id === id);
  if (!project) return;
  returnFocus = trigger;
  $("#project-detail").innerHTML =
    `<div class="detail-art art-${escape(project.artwork)}"><img src="${escape(project.image)}" alt="${escape(project.alt)}" width="800" height="520" /><span>${escape(project.caption)}</span></div><div class="detail-copy"><p class="eyebrow">${escape(project.category)}</p><h2 id="detail-title">${escape(project.title)}</h2><p class="detail-subtitle">${escape(project.subtitle)}</p><span class="detail-status ${escape(project.statusClass || "")}">${escape(project.status)}</span><p>${escape(project.overview)}</p><h3>The build</h3><ul>${project.features.map((feature) => `<li>${escape(feature)}</li>`).join("")}</ul><h3>Where it stands</h3><p>${escape(project.progress)}</p>${project.source ? `<a class="button button-dark" href="${escape(project.source)}" target="_blank" rel="noopener noreferrer">${escape(project.sourceLabel)} <span aria-hidden="true">↗</span></a>` : ""}<p class="detail-evidence">${escape(project.evidence)}</p></div>`;
  const dialog = $("#project-dialog");
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
  document.body.classList.add("dialog-open");
}

$("#project-grid").addEventListener("click", (event) => {
  const link = event.target.closest('a[href^="#project-"]');
  if (!link) return;
  event.preventDefault();
  const id = link.getAttribute("href").slice("#project-".length);
  history.replaceState(
    null,
    "",
    `${location.pathname}${location.search}#project-${id}`,
  );
  openProject(id, link);
});
$("#dialog-close").addEventListener("click", () =>
  $("#project-dialog").close(),
);
$("#project-dialog").addEventListener("click", (event) => {
  if (event.target !== $("#project-dialog")) return;
  const bounds = event.target.getBoundingClientRect();
  if (
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom
  )
    event.target.close();
});
$("#project-dialog").addEventListener("close", () => {
  document.body.classList.remove("dialog-open");
  if (location.hash.startsWith("#project-"))
    history.replaceState(
      null,
      "",
      `${location.pathname}${location.search}#work`,
    );
  if (returnFocus?.isConnected) returnFocus.focus();
  returnFocus = null;
});
document.querySelectorAll("[data-filter]").forEach((button) =>
  button.addEventListener("click", () => {
    filter = button.dataset.filter;
    renderProjects();
    updateQuery();
  }),
);
$("#project-search").value = search;
$("#project-search").addEventListener("input", (event) => {
  search = event.target.value;
  renderProjects();
  updateQuery();
});
$("#reset-filters").addEventListener("click", () => {
  filter = "all";
  search = "";
  $("#project-search").value = "";
  renderProjects();
  updateQuery();
  document.querySelector('[data-filter="all"]').focus();
});

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  $("#theme-toggle").setAttribute(
    "aria-label",
    `Switch to ${theme === "dark" ? "light" : "dark"} theme`,
  );
  document.querySelector('meta[name="theme-color"]').content =
    theme === "dark" ? "#171c19" : "#f5f4ee";
}
let savedTheme = null;
try {
  savedTheme = localStorage.getItem("hirsu-theme");
} catch {
  /* Storage can be unavailable in private browsers. */
}
applyTheme(savedTheme === "dark" ? "dark" : "light");
$("#theme-toggle").addEventListener("click", () => {
  const theme =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(theme);
  try {
    localStorage.setItem("hirsu-theme", theme);
  } catch {
    /* The toggle still works without persistence. */
  }
});
$("#year").textContent = String(new Date().getFullYear());
renderProjects();
if (location.hash.startsWith("#project-"))
  openProject(location.hash.slice("#project-".length));
window.addEventListener("hashchange", () => {
  if (location.hash.startsWith("#project-"))
    openProject(location.hash.slice("#project-".length));
  else if ($("#project-dialog").open) $("#project-dialog").close();
});
window.addEventListener("popstate", () => {
  const parameters = new URLSearchParams(location.search);
  filter = validFilters.has(parameters.get("filter"))
    ? parameters.get("filter")
    : "all";
  search = (parameters.get("q") || "").slice(0, 150);
  $("#project-search").value = search;
  renderProjects();
});
