import { featuredProjectIds, buildNoteContent } from "./build-stories.js?v=28";
import { projects } from "./projects.js?v=28";
import { escapeHTML as esc } from "./console-model.js?v=28";
import { repositorySnapshot } from "./repository-data.js?v=28";

const first = [
  "biobuzz-simulator",
  ...featuredProjectIds.filter((id) => id !== "biobuzz-simulator"),
];
export const orbitProjects = [...projects].sort((a, b) => {
  const rank = (p) =>
    first.includes(p.id)
      ? first.indexOf(p.id)
      : first.length + projects.indexOf(p);
  return rank(a) - rank(b);
});
export function orbitMatches(query = "", tag = "") {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return orbitProjects.filter(
    (p) =>
      (!tag || p.tags.includes(tag)) &&
      words.every((word) =>
        [p.title, p.description, p.category, ...p.tags]
          .join(" ")
          .toLowerCase()
          .includes(word),
      ),
  );
}
export function orbitRelated(project) {
  return orbitProjects
    .filter((p) => p.id !== project.id)
    .map((p) => ({
      project: p,
      shared: p.tags.filter((tag) => project.tags.includes(tag)),
    }))
    .filter((p) => p.shared.length)
    .sort((a, b) => b.shared.length - a.shared.length)
    .slice(0, 4);
}
export function orbitGraph(selected) {
  return `<svg viewBox="0 0 340 440" aria-hidden="true" focusable="false"><path class="orbit-trunk" d="M40 422C40 365 90 370 110 280"/>${orbitProjects
    .map((p, i) => {
      const x = 154 + (i % 5) * 32,
        y = 28 + i * 24,
        active = p.id === selected;
      return `<g class="orbit-branch ${active ? "is-active" : ""}"><path pathLength="1" d="M110 280C130 ${220 + i * 3} ${x - 35} ${y + 26} ${x} ${y}"/><circle cx="${x}" cy="${y}" r="${active ? 5 : 2.5}"/><text x="${x + 10}" y="${y + 4}">${esc(p.title.split(" / ")[0].split(" ")[0].slice(0, 12))}</text></g>`;
    })
    .join(
      "",
    )}<text class="orbit-root-label" x="18" y="436">HIRSU / ${projects.length} PROJECTS</text></svg>`;
}
const imagesFor = (p) => [
  { image: p.image, alt: p.alt, caption: p.caption },
  ...(p.gallery || []),
];
export function orbitProjectContent(p, shot = 0) {
  const images = imagesFor(p),
    image = images[shot % images.length];
  return `<div class="orbit-prompt"><span>hirsu@portfolio</span> ~/projects/${p.id}</div><header class="orbit-project-heading"><p>${esc(p.category)}</p><h2 id="orbit-project-title">${esc(p.title)}</h2><span class="orbit-project-state">${esc(p.status)}</span><p class="orbit-summary">${esc(p.description)}</p></header><figure class="orbit-preview"><div class="orbit-imagebar"><span>${esc(image.image.split("/").at(-1).split("?")[0])}</span><span>${shot + 1} / ${images.length}</span></div><a href="#${p.id}" aria-label="Open ${esc(p.title)} project"><img src="${image.image}" alt="${esc(image.alt)}" width="1200" height="750" /></a><figcaption id="orbit-preview-caption">${esc(image.caption)}</figcaption>${images.length > 1 ? `<div class="orbit-gallery"><button data-orbit-shot="-1" aria-label="Previous project image">← PREVIOUS</button><button data-orbit-shot="1" aria-label="Next project image">NEXT →</button></div>` : ""}</figure><div class="orbit-file-notes"><span class="orbit-label">WHAT IT DOES</span><ul>${p.features
    .slice(0, 3)
    .map((f) => `<li>${esc(f)}</li>`)
    .join(
      "",
    )}</ul></div>${buildNoteContent(p, true)}<div class="orbit-project-links"><a class="orbit-primary" href="#${p.id}">READ PROJECT ↗</a>${p.demo ? `<a href="${esc(p.demo)}" target="_blank" rel="noopener noreferrer">${esc(p.demoLabel || "OPEN APP")} ↗</a>` : ""}${p.source ? `<a href="${esc(p.source)}" target="_blank" rel="noopener noreferrer">SOURCE ↗</a>` : "<span>Personal build</span>"}</div>`;
}
export function orbitHome() {
  return `<div class="orbit-home" data-layout-home="orbit"><header class="orbit-heading"><div><p>HIRSU / INDEPENDENT BUILDER</p><h1>A personal orbit of work<span>_</span></h1></div><nav aria-label="Portfolio sections"><a href="#projects">all projects ↗</a><a href="#log">build notes ↗</a><a href="#about">whoami ↗</a></nav></header><div class="orbit-workspace"><aside class="orbit-rail" aria-labelledby="orbit-index-title"><header><h2 id="orbit-index-title">PROJECT INDEX</h2><span id="orbit-count">${projects.length} FILES</span></header><label class="orbit-search"><span class="sr-only">Find a project in Orbit</span><span aria-hidden="true">⌕</span><input id="orbit-search" type="search" maxlength="120" placeholder="find a project…" autocomplete="off" /></label><label class="orbit-scope"><input id="orbit-scope" type="checkbox" /> Include in progress / ${projects.length - featuredProjectIds.length} more</label><div id="orbit-active-filter" class="orbit-active-filter" hidden></div><div class="orbit-wheel-controls"><button data-orbit-step="-1" aria-label="Previous project">↑</button><span>scroll to browse</span><button data-orbit-step="1" aria-label="Next project">↓</button></div><div id="orbit-list" class="orbit-wheel" role="tablist" aria-label="Orbit project files" aria-orientation="vertical"></div><p id="orbit-empty" hidden>No matching projects. <button data-orbit-clear>Clear filters</button></p><p class="orbit-rail-hint">↑ ↓ select · Home / End jump<br />Enter opens the project</p></aside><section class="orbit-reader" aria-labelledby="orbit-project-title"><div class="orbit-windowbar"><span><i></i> PORTFOLIO / FILE VIEW</span><span id="orbit-file-number"></span></div><div id="orbit-project-panel" role="tabpanel" tabindex="0"></div></section><aside class="orbit-insight" aria-label="Project connections"><header><h2>THE PROJECT TREE</h2><span>ONE BRANCH / ONE BUILD</span></header><div id="orbit-graph" class="orbit-graph"></div><p class="orbit-graph-note">An original map of this portfolio. The selected build lights its branch.</p><div class="orbit-stack"><span class="orbit-label">SHARED TOOLS / FILTER THE INDEX</span><div id="orbit-tags"></div></div><div class="orbit-connections"><span class="orbit-label">CONNECTED WORK</span><div id="orbit-related"></div></div></aside></div><footer class="orbit-status"><span><b>${projects.length}</b> PROJECTS / <b>${projects.filter((p) => p.source).length}</b> PUBLIC REPOS</span><span><b>${projects.filter((p) => p.demo).length}</b> BROWSER APPS</span><a href="#stack">STACK SNAPSHOT / ${repositorySnapshot.date} ↗</a></footer><p class="orbit-provenance">Code, circuits and things that move. Every file keeps its actual status, sources and image credits.</p><p class="sr-only" id="orbit-announcement" role="status" aria-live="polite"></p></div>`;
}

export function mountOrbit(
  host,
  { read = () => null, write = () => false, animate = () => {} } = {},
) {
  const home = host.querySelector(".orbit-home");
  if (!home) return () => {};
  const $ = (selector) => home.querySelector(selector),
    input = $("#orbit-search"),
    rail = $("#orbit-list"),
    panel = $("#orbit-project-panel"),
    scope = $("#orbit-scope");
  const stored = read("hirsu-orbit-selected");
  let selected = orbitProjects.some((p) => p.id === stored)
      ? stored
      : orbitProjects[0].id,
    query = "",
    tag = "",
    shot = 0,
    visible = [];
  let showProgress = !featuredProjectIds.includes(selected);
  scope.checked = showProgress;
  const matching = () =>
    orbitMatches(query, tag).filter(
      (p) => showProgress || featuredProjectIds.includes(p.id),
    );
  const moving = () =>
    host.ownerDocument.documentElement.dataset.motion === "on";
  const narrow =
    host.ownerDocument.defaultView.matchMedia("(max-width: 680px)");
  function alignRail() {
    rail.setAttribute(
      "aria-orientation",
      narrow.matches ? "horizontal" : "vertical",
    );
    const tab = rail.querySelector(`[data-orbit-project="${selected}"]`);
    if (!tab) return;
    const card = tab.getBoundingClientRect(),
      bounds = rail.getBoundingClientRect();
    rail.scrollTo?.({
      left: Math.max(
        0,
        rail.scrollLeft +
          card.left -
          bounds.left -
          rail.clientWidth / 2 +
          card.width / 2,
      ),
      top: Math.max(
        0,
        rail.scrollTop +
          card.top -
          bounds.top -
          rail.clientHeight / 2 +
          card.height / 2,
      ),
      behavior: moving() ? "smooth" : "instant",
    });
  }
  function renderRail(focus = false) {
    visible = matching();
    const at = visible.findIndex((p) => p.id === selected);
    rail.innerHTML = visible
      .map((p, i) => {
        const offset = Math.max(-3, Math.min(3, i - at)),
          active = p.id === selected;
        return `<button id="orbit-tab-${p.id}" class="orbit-file ${active ? "is-active" : ""}" role="tab" aria-selected="${active}" aria-controls="orbit-project-panel" tabindex="${active ? 0 : -1}" data-orbit-project="${p.id}" style="--orbit-offset:${offset};--orbit-inset:${Math.abs(offset) * 4}px;--orbit-rotation:${-offset * 2}deg"><img src="${p.image}" alt="" width="160" height="100" loading="lazy"/><span><small>${String(orbitProjects.indexOf(p) + 1).padStart(2, "0")} / ${esc(p.category.split(" / ")[0])}</small><b>${esc(p.title)}</b></span><i aria-hidden="true">›</i></button>`;
      })
      .join("");
    $("#orbit-empty").hidden = !!visible.length;
    $("#orbit-count").textContent =
      `${visible.length} / ${projects.length} FILES`;
    $("#orbit-active-filter").hidden = !tag;
    $("#orbit-active-filter").innerHTML = tag
      ? `<span>${esc(tag)}</span><button data-orbit-clear aria-label="Clear technology filter">×</button>`
      : "";
    const tab = home.querySelector(`[data-orbit-project="${selected}"]`);
    if (focus && tab) tab.focus({ preventScroll: true });
    alignRail();
  }
  function renderProject() {
    const p = orbitProjects.find((p) => p.id === selected);
    panel.innerHTML = orbitProjectContent(p, shot);
    panel.setAttribute("aria-labelledby", `orbit-tab-${selected}`);
    $("#orbit-file-number").textContent =
      `${String(orbitProjects.indexOf(p) + 1).padStart(2, "0")} / ${projects.length}`;
    $("#orbit-graph").innerHTML = orbitGraph(selected);
    $("#orbit-tags").innerHTML = p.tags
      .map(
        (t) =>
          `<button data-orbit-tag="${esc(t)}" aria-pressed="${tag === t}">${esc(t)}</button>`,
      )
      .join("");
    const related = orbitRelated(p);
    $("#orbit-related").innerHTML = related.length
      ? related
          .map(
            ({ project, shared }) =>
              `<button data-orbit-project="${project.id}"><span>${esc(project.title)}</span><small>${shared.map(esc).join(" / ")}</small><b aria-hidden="true">↗</b></button>`,
          )
          .join("")
      : "<p>No shared tools recorded yet. Explore the full index.</p>";
    $("#orbit-announcement").textContent = `${p.title}. ${p.status}.`;
    if (moving())
      animate(
        panel,
        [
          {
            opacity: 0.25,
            transform: "translate3d(0,10px,0)",
            clipPath: "inset(0 0 8%)",
          },
          { opacity: 1, transform: "translate3d(0,0,0)", clipPath: "inset(0)" },
        ],
        500,
      );
  }
  function select(id, focus = false) {
    if (!orbitProjects.some((p) => p.id === id)) return;
    selected = id;
    if (!featuredProjectIds.includes(id)) showProgress = scope.checked = true;
    shot = 0;
    if (!orbitMatches(query, tag).some((p) => p.id === id)) {
      query = "";
      tag = "";
      input.value = "";
    }
    renderRail(focus);
    renderProject();
    write("hirsu-orbit-selected", selected);
  }
  function filter() {
    query = input.value;
    const matches = matching();
    if (matches.length && !matches.some((p) => p.id === selected)) {
      selected = matches[0].id;
      shot = 0;
    }
    renderRail();
    if (matches.length) renderProject();
    else panel.removeAttribute("aria-labelledby");
  }
  function step(delta, focus = false) {
    if (!visible.length) return;
    const at = visible.findIndex((p) => p.id === selected);
    select(visible[(at + delta + visible.length) % visible.length].id, focus);
  }
  const click = (event) => {
    const button = event.target.closest("button");
    if (!button || !home.contains(button)) return;
    if (button.dataset.orbitProject) {
      const fromRail = rail.contains(button);
      select(button.dataset.orbitProject, fromRail);
      if (!fromRail) panel.focus({ preventScroll: true });
    }
    if (button.hasAttribute("data-orbit-step"))
      step(Number(button.dataset.orbitStep), true);
    if (button.hasAttribute("data-orbit-shot")) {
      const p = orbitProjects.find((p) => p.id === selected),
        count = imagesFor(p).length;
      shot = (shot + Number(button.dataset.orbitShot) + count) % count;
      renderProject();
      $("#orbit-project-panel").focus({ preventScroll: true });
    }
    if (button.hasAttribute("data-orbit-tag")) {
      tag = tag === button.dataset.orbitTag ? "" : button.dataset.orbitTag;
      filter();
    }
    if (button.hasAttribute("data-orbit-clear")) {
      query = tag = "";
      input.value = "";
      filter();
      input.focus();
    }
  };
  const key = (event) => {
    if (!event.target.closest("#orbit-list")) return;
    if (
      [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End",
        "Enter",
      ].includes(event.key)
    ) {
      event.preventDefault();
      event.stopPropagation();
      if (event.key === "Enter") {
        host.ownerDocument.defaultView.location.hash = selected;
        return;
      }
      if (event.key === "Home" || event.key === "End") {
        if (visible.length)
          select((event.key === "Home" ? visible[0] : visible.at(-1)).id, true);
      } else step(["ArrowUp", "ArrowLeft"].includes(event.key) ? -1 : 1, true);
    }
  };
  const changeScope = () => {
    showProgress = scope.checked;
    filter();
  };
  scope.addEventListener("change", changeScope);
  home.addEventListener("click", click);
  home.addEventListener("keydown", key);
  input.addEventListener("input", filter);
  narrow.addEventListener("change", alignRail);
  renderRail();
  renderProject();
  return () => {
    home.removeEventListener("click", click);
    home.removeEventListener("keydown", key);
    input.removeEventListener("input", filter);
    scope.removeEventListener("change", changeScope);
    narrow.removeEventListener("change", alignRail);
  };
}
