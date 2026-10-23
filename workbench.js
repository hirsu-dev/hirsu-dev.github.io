import { projects } from "./projects.js?v=22";
import { escapeHTML as esc } from "./console-model.js?v=22";
import {
  buildEntries,
  filterEntries,
  statusTypes,
  experiments,
} from "./workbench-data.js?v=22";

const projectById = (id) => projects.find((p) => p.id === id);
const date = (value) =>
  new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
export function statusPanel(p) {
  const s = p.lifecycle;
  return `<div class="status-detail"><span class="status-chip" data-state="${s.state}">${statusTypes[s.state].label}</span><p><strong>Next step</strong><br />${esc(s.next)}</p><small>Status reviewed <time datetime="${s.reviewed}">${date(s.reviewed)}</time>. Review date is not a hardware test.</small><a href="#log" class="bracket">[ Build logs & all statuses → ]</a></div>`;
}
function entryCard(e) {
  return `<article class="wb-entry"><div><span class="eyebrow">${esc(e.kind)} / <time datetime="${e.date}">${date(e.date)}</time></span><h2><a href="#entry-${e.id}">${esc(e.title)}</a></h2><p>${esc(e.summary)}</p><a class="bracket" href="#entry-${e.id}">[ Read build note → ]</a></div><a class="wb-entry-image" href="#entry-${e.id}" aria-label="Read ${esc(e.title)}"><img src="${e.image}" alt="${esc(e.alt)}" loading="lazy" width="600" height="375" /><span>${esc(e.caption)}</span></a></article>`;
}
export function workbenchContent() {
  return `<header class="page-head"><div><p class="eyebrow">04 / BUILD LOGS & OPEN LOOPS</p><h1>On the workbench.</h1><p>What changed, what still needs work, and the next useful step.</p></div><a class="bracket" href="#experiments">[ Explore upcoming experiments → ]</a></header>
  <section class="panel wb-status" aria-labelledby="wb-status-title"><h2 id="wb-status-title">Project status board</h2><p>Manually reviewed project states. No live home-network or hardware checks.</p><div class="wb-legend">${Object.entries(
    statusTypes,
  )
    .map(
      ([id, s]) =>
        `<details><summary class="status-chip" data-state="${id}">${s.label}</summary><p>${s.description}</p></details>`,
    )
    .join(
      "",
    )}</div><label>Show status <select id="wb-state"><option value="all">Every status</option>${Object.entries(
    statusTypes,
  )
    .map(([id, s]) => `<option value="${id}">${s.label}</option>`)
    .join("")}</select></label><div id="wb-status-list"></div></section>
  <section class="wb-logs" aria-labelledby="wb-logs-title"><h2 id="wb-logs-title">Dated build notes</h2><p class="fineprint">Software milestones and status reviews are labeled separately. These notes do not invent physical tests or past build dates.</p><form class="wb-filters" role="search" aria-label="Filter build logs"><label>Project<select id="wb-project"><option value="all">All projects</option>${projects
    .filter((p) => buildEntries.some((e) => e.project === p.id))
    .map((p) => `<option value="${p.id}">${esc(p.title)}</option>`)
    .join(
      "",
    )}</select></label><label>From date<input id="wb-since" type="date" /></label><label>Search notes<input id="wb-query" type="search" placeholder="Parts, telescope, next steps…" maxlength="120" /></label><button class="bracket" type="reset">[ Reset ]</button></form><p id="wb-count" role="status"></p><div id="wb-entries"></div></section>`;
}
export function mountWorkbench(host) {
  const state = host.querySelector("#wb-state"),
    form = host.querySelector("form");
  const renderStatus = () => {
    const list = projects.filter(
      (p) => state.value === "all" || p.lifecycle.state === state.value,
    );
    host.querySelector("#wb-status-list").innerHTML = list
      .map(
        (p) =>
          `<article class="wb-status-row"><div><a href="#${p.id}">${esc(p.title)} ↗</a><span class="status-chip" data-state="${p.lifecycle.state}">${statusTypes[p.lifecycle.state].label}</span></div><p>${esc(p.lifecycle.next)}</p><small>Reviewed <time datetime="${p.lifecycle.reviewed}">${date(p.lifecycle.reviewed)}</time></small></article>`,
      )
      .join("");
  };
  const render = () => {
    const entries = filterEntries({
      project: host.querySelector("#wb-project").value,
      since: host.querySelector("#wb-since").value,
      query: host.querySelector("#wb-query").value,
    });
    host.querySelector("#wb-count").textContent =
      `${entries.length} ${entries.length === 1 ? "note" : "notes"} found`;
    host.querySelector("#wb-entries").innerHTML = entries.length
      ? entries.map(entryCard).join("")
      : `<div class="empty"><h3>No matching notes.</h3><p>Try another project, an earlier date, or a shorter search.</p></div>`;
  };
  const submit = (e) => e.preventDefault();
  const reset = () => {
    for (const el of form.querySelectorAll("input,select"))
      el.value = el.id === "wb-project" ? "all" : "";
    render();
  };
  state.addEventListener("change", renderStatus);
  form.addEventListener("input", render);
  form.addEventListener("submit", submit);
  form.addEventListener("reset", reset);
  renderStatus();
  render();
  return () => {
    state.removeEventListener("change", renderStatus);
    form.removeEventListener("input", render);
    form.removeEventListener("submit", submit);
    form.removeEventListener("reset", reset);
  };
}
export function entryContent(id) {
  const e = buildEntries.find((e) => e.id === id),
    p = projectById(e.project);
  return `<a class="back-link" href="#log">← All build notes</a><article class="wb-note"><header class="page-head"><div><p class="eyebrow">${esc(e.kind)} / <time datetime="${e.date}">${date(e.date)}</time></p><h1>${esc(e.title)}</h1><p>${esc(e.summary)}</p><a href="#${p.id}">${esc(p.title)} →</a></div></header><figure><img src="${e.image}" alt="${esc(e.alt)}" width="1200" height="750" /><figcaption>${esc(e.caption)}</figcaption></figure><div class="wb-note-grid">${[
    ["The goal", e.goal],
    ["What changed", e.changed],
    ["What still needs work", e.constraint],
    ["The takeaway", e.learned],
    ["Next experiment", e.next],
  ]
    .map(
      ([label, body]) =>
        `<section class="panel"><h2>${label}</h2><p>${esc(body)}</p></section>`,
    )
    .join(
      "",
    )}</div><p class="fineprint">A project note compiled from the published implementation and owner-provided project status. Review date: ${date(e.date)}.</p></article>`;
}
export function experimentsContent() {
  return `<header class="page-head"><div><p class="eyebrow">EXPERIMENTS / THE NEXT ITERATIONS</p><h1>Ideas with a next step.</h1><p>Planned tools connected to the things I build. Each one starts with a useful problem.</p></div><a class="bracket" href="#log">[ See current build logs → ]</a></header><p class="panel">These are planned experiments. Working projects live in the <a href="#projects">project archive</a>.</p><div class="wb-experiments">${experiments.map((e) => `<article class="panel"><span class="status-chip">${e.state}</span><h2>${esc(e.title)}</h2><p>${esc(e.purpose)}</p><div class="od-tags">${e.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div><p><strong>Next experiment</strong><br />${esc(e.next)}</p><a href="#${e.project}">Related: ${esc(projectById(e.project).title)} ↗</a></article>`).join("")}</div>`;
}
