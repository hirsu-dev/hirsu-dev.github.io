import { projects } from "./projects.js?v=24";
import { escapeHTML as esc } from "./console-model.js?v=24";

export function archiveOptions({
  availability = "all",
  sort = "updated",
} = {}) {
  const options = (items, selected) =>
    items
      .map(
        ([value, label]) =>
          `<option value="${value}"${value === selected ? " selected" : ""}>${label}</option>`,
      )
      .join("");
  return `<div class="archive-options"><label>Run it<select id="project-availability">${options(
    [
      ["all", "All projects"],
      ["browser", "Open in browser"],
      ["local", "Local setup required"],
      ["personal", "Personal builds"],
    ],
    availability,
  )}</select></label><label>Sort by<select id="project-sort">${options(
    [
      ["updated", "Recently updated"],
      ["curated", "Workbench order"],
      ["name", "Name A–Z"],
    ],
    sort,
  )}</select></label><p>Browser apps open in a new tab. Saved projects stay on this device.</p></div>`;
}

export function mountArchiveOptions(host, onChange) {
  const availability = host.querySelector("#project-availability"),
    sort = host.querySelector("#project-sort");
  const change = (event) => {
    if (event.target !== availability && event.target !== sort) return;
    onChange({ availability: availability.value, sort: sort.value });
  };
  host.addEventListener("change", change);
  return () => host.removeEventListener("change", change);
}

export function projectDate(project) {
  const date = project.activity?.updated || project.lifecycle.reviewed;
  return `<span class="project-date">${project.activity ? "Repo updated" : "Status reviewed"} <time datetime="${date}">${date}</time></span>`;
}

export function recentWork() {
  const featured = projects.find((p) => p.id === "biobuzz-simulator");
  return `<section class="od-section recent-work" id="od-recent" aria-labelledby="recent-title">
    <header class="od-section-head" data-reveal><p class="od-kicker">NEW / FROM THE WORKBENCH</p><div><h2 id="recent-title">FRESH<br /><em>OFF THE BENCH.</em></h2><p>Drive a robot, explore my desktop project, or take a notebook into your next build.</p></div></header>
    <article class="latest-feature" data-reveal><a class="latest-art" href="#${featured.id}"><img src="${featured.image}" width="1200" height="750" loading="lazy" alt="${esc(featured.alt)}" /><span>${esc(featured.caption)}</span></a><div class="latest-copy"><p class="od-kicker">FEATURED BUILD / ROBOTICS</p>${projectDate(featured)}<h3><a href="#${featured.id}">${esc(featured.title)}</a></h3><p>${esc(featured.description)}</p><dl class="latest-specs"><div><dt>ROBOT PRESETS</dt><dd>10</dd></div><div><dt>MATCH FORMAT</dt><dd>2 vs 2</dd></div><div><dt>RUNS IN</dt><dd>Your browser</dd></div></dl><div class="latest-actions"><a class="od-button" href="${featured.demo}" target="_blank" rel="noopener noreferrer">PLAY BIOBUZZ <span>↗</span></a><a class="od-text-link" href="#${featured.id}">BUILD NOTES ↗</a></div><p class="fineprint">Singleplayer practice with simplified physics. Java editing is supported; browser Java execution is not.</p></div></article>
    <div class="recent-secondary">${[
      "hyprland-forge",
      "offline-project-notebook",
    ]
      .map((id) => {
        const p = projects.find((p) => p.id === id);
        return `<article data-reveal><p class="od-kicker">${esc(p.category)}</p>${projectDate(p)}<h3><a href="#${id}">${esc(p.title)}</a></h3><p>${esc(p.description)}</p><div class="recent-links"><a href="#${id}">EXPLORE BUILD ↗</a>${p.demo ? `<a href="${p.demo}" target="_blank" rel="noopener noreferrer">OPEN APP ↗</a>` : `<a href="${p.source}" target="_blank" rel="noopener noreferrer">SOURCE &amp; SETUP ↗</a>`}</div><small>${esc(p.status)}</small></article>`;
      })
      .join("")}</div>
  </section>`;
}
