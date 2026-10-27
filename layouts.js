import { projects } from "./projects.js?v=24";
import { escapeHTML as esc } from "./console-model.js?v=24";
import { cityPhoto, photoCredit } from "./photo.js?v=11";

export const layoutProjects = [
  "maintaineros",
  "civiclens",
  "custom-keyboard",
  "robo-telescope",
  "pi-homelab",
  "nexus-ai",
  "hyprland-forge",
  ...projects.filter((p) => p.demo).map((p) => p.id),
].map((id) => projects.find((p) => p.id === id));
const number = (i) => String(i + 1).padStart(2, "0");
const tags = (p) =>
  `<ul class="layout-tags">${p.tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;
const source = (p) =>
  (p.demo
    ? `<a href="${esc(p.demo)}" target="_blank" rel="noopener noreferrer">${esc(p.demoLabel || "Try in browser")} ↗</a>`
    : "") +
  (p.source
    ? `<a href="${esc(p.source)}" target="_blank" rel="noopener noreferrer">Source & setup ↗</a>`
    : "<span>Personal build / no public repository</span>");
const image = (p) =>
  `<figure class="layout-media"><img src="${p.image}" alt="${esc(p.alt)}" width="1200" height="750" /><figcaption>${esc(p.caption)}</figcaption></figure>`;
const windowBar = (label, extra = "") =>
  `<div class="nr-windowbar"><span><i aria-hidden="true"></i>${label}</span>${extra}</div>`;
const projectButtons = (mode) =>
  layoutProjects
    .map(
      (p, i) =>
        `<button type="button" data-layout-project="${i}" aria-pressed="${i === 0}" aria-controls="layout-inspector"><span>${number(i)}</span><b>${esc(p.title)}</b><small>${mode === "netrunner" ? esc(p.status) : esc(p.category.split(" / ")[0])}</small></button>`,
    )
    .join("");

export function netrunnerHome() {
  return `<div class="netrunner-home" data-layout-home="netrunner">
    <header class="nr-masthead"><div><p class="eyebrow">HIRSU / PERSONAL WORKSTATION / 01</p><h1>BUILD. BREAK.<br /><em>RECONNECT_</em></h1><p>Software meets the physical world. ${projects.length} experiments from Hrushi’s workbench.</p></div><div class="nr-session"><span>LOCAL INDEX</span><strong>${projects.length} <small>FILES</small></strong><p>${projects.filter((p) => p.source).length} public repositories<br />No live device connection</p><a href="#about">Operator profile ↗</a></div></header>
    <div class="nr-workspace">
      <section class="nr-window nr-explorer" aria-labelledby="nr-files-title">${windowBar("01 / PROJECT DIRECTORY", "<span>READ ONLY</span>")}<div class="nr-windowbody"><h2 id="nr-files-title">Find a signal.</h2><label class="nr-search"><span>Filter files</span><input id="layout-search" type="search" maxlength="120" placeholder="Try Python, telescope…" autocomplete="off" /></label><div class="nr-file-list" aria-label="Project files">${projectButtons("netrunner")}</div><p id="layout-empty" hidden>No matching files. Try another tool or project name.</p><p class="nr-file-count" role="status"><span id="layout-result-count">${projects.length}</span> / ${projects.length} files visible</p></div></section>
      <section class="nr-window nr-inspector" aria-labelledby="layout-inspector-title">${windowBar("02 / FILE INSPECTOR", '<span id="nr-selected-number">FILE 01</span>')}<div id="layout-inspector" aria-live="polite"></div></section>
      <aside class="nr-utilities"><section class="nr-window">${windowBar("03 / CONNECTIONS")}<div class="nr-windowbody"><h2>Off the grid.<br />Still connected.</h2><p>Explore how code, circuits and home services overlap.</p><a class="layout-action" href="#network">Explore the night sky ↗</a><a class="layout-action" href="#stack">Inspect technology stack ↗</a></div><div class="nr-node-map" aria-hidden="true"><i></i><i></i><i></i><i></i><span>CODE → CIRCUITS → WORLD</span></div></section><figure class="nr-window nr-city">${windowBar("04 / CITY REFERENCE")}<img src="${cityPhoto.src}" alt="Shinjuku at night, photographed by Fboas" loading="lazy" width="1280" height="853" /><figcaption>SHINJUKU / TOKYO · REAL PHOTOGRAPH${photoCredit()}</figcaption></figure></aside>
    </div><nav class="nr-dock" aria-label="Workstation applications"><a href="#projects"><b>01</b> All files</a><a href="#lab"><b>02</b> Build Lab</a><a href="#log"><b>03</b> Build log</a><a href="#about"><b>04</b> About Hrushi</a><button data-radio-open><b>05</b> Background radio</button></nav>
  </div>`;
}

export function relicHome() {
  return `<div class="relic-home" data-layout-home="relic"><header class="relic-masthead"><p class="eyebrow">HIRSU / AN INDEPENDENT PROJECT ARCHIVE</p><div><h1>TRACES OF<br /><em>A BUILDER.</em></h1><p>Ideas leave evidence.<br />Code. Circuits. Things that move.<br /><span>${projects.length} files from Hrushi’s workbench.</span></p></div><div class="relic-rule"><span>PERSONAL DOSSIER / VOL. 01</span><span>SELECT A FILE BELOW ↓</span></div></header>
    <div class="relic-dossier"><nav class="relic-index" aria-label="Dossier project index">${projectButtons("relic")}</nav><section class="relic-file" aria-labelledby="layout-inspector-title"><div class="relic-filebar"><span id="relic-file-number">FILE 01 / ${projects.length}</span><div><button data-file-step="-1" aria-label="Previous project file">← PREV</button><button data-file-step="1" aria-label="Next project file">NEXT →</button></div></div><div id="layout-inspector" aria-live="polite"></div></section></div>
    <section class="relic-footnotes" aria-label="Beyond the dossier"><a href="#network"><span>01 / CONNECTIONS</span><h2>A constellation<br />of shared tools. ↗</h2><p>Explore the interactive night sky.</p></a><a href="#lab"><span>02 / MY WORKBENCH</span><h2>Try the ideas<br />behind my builds. ↗</h2><p>Aim the telescope, follow my Pi services, and explore the macro-pad concept.</p></a><a href="#about"><span>03 / PROVENANCE</span><h2>The person<br />behind the files. ↗</h2><p>About Hrushi, sources and the visual references.</p></a></section>
  </div>`;
}

function netrunnerFile(p) {
  return `${image(p)}<div class="nr-windowbody"><p class="eyebrow">${esc(p.category)}</p><h2 id="layout-inspector-title">${esc(p.title)}</h2><p>${esc(p.description)}</p><div class="layout-status"><span>CURRENT STATE</span><strong>${esc(p.status)}</strong></div>${tags(p)}<details class="nr-notes"><summary>Read build notes</summary><p>${esc(p.progress)}</p></details><div class="layout-links"><a class="layout-primary" href="#${p.id}">Open full project ↗</a>${source(p)}</div></div>`;
}
function relicFile(p) {
  return `<div class="relic-spread">${image(p)}<div class="relic-copy"><p class="eyebrow">${esc(p.category)}</p><h2 id="layout-inspector-title">${esc(p.title)}</h2><p class="relic-subtitle">${esc(p.subtitle)}</p><p class="layout-status"><span>CURRENT STATE</span><strong>${esc(p.status)}</strong></p><div class="relic-tabs" role="tablist" aria-label="Project chapters">${["Overview", "Build notes", "Tools"].map((label, i) => `<button id="relic-tab-${i}" role="tab" data-chapter="${i}" aria-selected="${i === 0}" aria-controls="relic-chapter-${i}" tabindex="${i === 0 ? 0 : -1}">${label}</button>`).join("")}</div><div id="relic-chapter-0" class="relic-chapter" role="tabpanel" aria-labelledby="relic-tab-0" tabindex="0"><p>${esc(p.overview)}</p><ul>${p.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul></div><div id="relic-chapter-1" class="relic-chapter" role="tabpanel" aria-labelledby="relic-tab-1" tabindex="0" hidden><p>${esc(p.progress)}</p><p class="relic-evidence">SOURCE / ${esc(p.evidence)}</p></div><div id="relic-chapter-2" class="relic-chapter" role="tabpanel" aria-labelledby="relic-tab-2" tabindex="0" hidden>${tags(p)}<p>Tools documented for this project—not a proficiency rating.</p></div><div class="layout-links"><a class="layout-primary" href="#${p.id}">Read the full file ↗</a>${source(p)}</div></div></div>`;
}

export function mountLayout(container, { animate = () => {} } = {}) {
  const home = container.querySelector("[data-layout-home]");
  if (!home) return () => {};
  const mode = home.dataset.layoutHome;
  const inspector = home.querySelector("#layout-inspector");
  const buttons = [...home.querySelectorAll("[data-layout-project]")];
  let selected = 0;
  const show = (index) => {
    selected = (index + layoutProjects.length) % layoutProjects.length;
    buttons.forEach((button, i) =>
      button.setAttribute("aria-pressed", String(i === selected)),
    );
    inspector.innerHTML =
      mode === "netrunner"
        ? netrunnerFile(layoutProjects[selected])
        : relicFile(layoutProjects[selected]);
    const counter = home.querySelector(
      "#nr-selected-number, #relic-file-number",
    );
    counter.textContent = `FILE ${number(selected)}${mode === "relic" ? " / " + projects.length : ""}`;
    animate(
      inspector,
      [
        { opacity: 0.2, transform: "translateY(8px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      300,
    );
  };
  const chapter = (index, focus = false) => {
    home.querySelectorAll("[data-chapter]").forEach((tab, i) => {
      tab.setAttribute("aria-selected", String(index === i));
      tab.tabIndex = index === i ? 0 : -1;
      if (index === i && focus) tab.focus();
    });
    home.querySelectorAll(".relic-chapter").forEach((panel, i) => {
      panel.hidden = index !== i;
    });
  };
  const click = (event) => {
    const file = event.target.closest("[data-layout-project]");
    if (file) show(Number(file.dataset.layoutProject));
    const step = event.target.closest("[data-file-step]");
    if (step) show(selected + Number(step.dataset.fileStep));
    const tab = event.target.closest("[data-chapter]");
    if (tab) chapter(Number(tab.dataset.chapter));
  };
  const key = (event) => {
    const tab = event.target.closest("[data-chapter]");
    if (!tab || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
      return;
    event.preventDefault();
    event.stopPropagation();
    chapter(
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? 2
          : (Number(tab.dataset.chapter) +
              (event.key === "ArrowRight" ? 1 : 2)) %
            3,
      true,
    );
  };
  const filter = (event) => {
    if (event.target.id !== "layout-search") return;
    const query = event.target.value.trim().toLowerCase();
    buttons.forEach((button, i) => {
      const p = layoutProjects[i];
      button.hidden = ![p.title, p.description, p.category, ...p.tags]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
    const visible = buttons.filter((button) => !button.hidden);
    home.querySelector("#layout-result-count").textContent = String(
      visible.length,
    );
    home.querySelector("#layout-empty").hidden = visible.length > 0;
    if (buttons[selected].hidden && visible.length)
      show(Number(visible[0].dataset.layoutProject));
  };
  home.addEventListener("click", click);
  home.addEventListener("keydown", key);
  home.addEventListener("input", filter);
  show(0);
  return () => {
    home.removeEventListener("click", click);
    home.removeEventListener("keydown", key);
    home.removeEventListener("input", filter);
  };
}
