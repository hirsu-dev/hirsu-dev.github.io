import { projects } from "./projects.js?v=2";
import { snapshot, languageCounts, calendarDays } from "./stack-data.js";
import {
  interfaces,
  interfaceFromSearch,
  interfaceURL,
} from "./interfaces.js?v=5";
import {
  savedIds,
  findProjects,
  resolveRoute,
  escapeHTML as esc,
} from "./console-model.js";
import { createProjectNetwork } from "./project-network.js";

const $ = (s) => document.querySelector(s);
const root = document.documentElement,
  screen = $("#screen");
const read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key, value) => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};
let saved = savedIds(read("hirsu-saved-projects")),
  route = "index",
  category = "all",
  query = "";
let expanded = new Set(),
  shots = new Map(),
  networkCleanup = null,
  toastTimer;
const sourceLink = (p, text = "Repository ↗") =>
  p.source
    ? `<a class="source" href="${esc(p.source)}" target="_blank" rel="noopener noreferrer">${text}</a>`
    : "";
const projectById = (id) => projects.find((p) => p.id === id);
const announce = (text) => {
  $("#announcement").textContent = text;
};
function toast(text) {
  clearTimeout(toastTimer);
  $("#toast").textContent = text;
  $("#toast").classList.add("visible");
  toastTimer = setTimeout(() => $("#toast").classList.remove("visible"), 2600);
}
function openDialog(id) {
  document.querySelectorAll("dialog[open]").forEach((d) => d.close());
  $(id).showModal();
}
function setView(view, { push = true } = {}) {
  if (!Object.hasOwn(interfaces, view)) return;
  if (push && root.dataset.view === view) return;
  root.dataset.view = view;
  write("hirsu-console-view", view);
  document.querySelector('meta[name="theme-color"]').content =
    interfaces[view].color;
  $("#top-theme").innerHTML =
    `${interfaces[view].name} <span aria-hidden="true">⌄</span>`;
  document
    .querySelectorAll("[data-view-choice]")
    .forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.viewChoice === view)),
    );
  if (push)
    history.pushState(
      { hirsuView: view },
      "",
      interfaceURL(location.href, view),
    );
  else
    history.replaceState(
      { ...history.state, hirsuView: view },
      "",
      location.href,
    );
  document.dispatchEvent(new Event("appearancechange"));
}
function setMotion(on, persist = true) {
  root.dataset.motion = on ? "on" : "off";
  if (persist) write("hirsu-console-motion", on ? "on" : "off");
  $("#motion-button").setAttribute("aria-pressed", String(on));
  $("#motion-button").textContent = `Motion: ${on ? "on" : "off"}`;
  $("#dialog-motion").textContent = on
    ? "[ Pause animations ]"
    : "[ Enable animations ]";
  document.dispatchEvent(new Event("appearancechange"));
}
const mediaQuery = matchMedia("(prefers-reduced-motion: reduce)");
mediaQuery.addEventListener("change", () => {
  if (!read("hirsu-console-motion")) setMotion(!mediaQuery.matches, false);
});
document.addEventListener("click", (e) => {
  const choice = e.target.closest("[data-view-choice]");
  if (choice) {
    setView(choice.dataset.viewChoice);
    announce(
      `${interfaces[choice.dataset.viewChoice].name} interface selected.`,
    );
  }
  if (e.target.closest("[data-close]")) e.target.closest("dialog").close();
});
for (const d of document.querySelectorAll("dialog"))
  d.addEventListener("click", (e) => {
    if (e.target === d) {
      const r = d.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        d.close();
    }
  });
$("#theme-button").onclick = $("#top-theme").onclick = () =>
  openDialog("#theme-dialog");
$("#motion-button").onclick = $("#dialog-motion").onclick = () =>
  setMotion(root.dataset.motion !== "on");
$("#help-button").onclick = () => openDialog("#help-dialog");
$("#rail-toggle").onclick = () => {
  const on = root.classList.toggle("rail-expanded"),
    b = $("#rail-toggle");
  b.setAttribute("aria-expanded", String(on));
  b.setAttribute(
    "aria-label",
    on ? "Collapse navigation" : "Expand navigation",
  );
  b.querySelector(".rail-text").textContent = on
    ? "Collapse navigation"
    : "Expand navigation";
};
document.querySelector(".rail nav").addEventListener("click", () => {
  if (matchMedia("(max-width:600px)").matches) {
    root.classList.remove("rail-expanded");
    $("#rail-toggle").setAttribute("aria-expanded", "false");
    $("#rail-toggle").setAttribute("aria-label", "Expand navigation");
    $("#rail-toggle .rail-text").textContent = "Expand navigation";
  }
});

function progress(p) {
  return `<p>${esc(p.overview)}</p><ul>${p.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul><p class="status-note">${esc(p.progress)}</p>`;
}
function card(p, i) {
  return `<article class="project-card" tabindex="-1" data-project="${p.id}" aria-labelledby="title-${p.id}" style="animation-delay:${Math.min(i, 5) * 30}ms">
    <div class="card-meta"><span class="owner">@hirsu</span><span class="card-category">${esc(p.category.toLowerCase())}</span><span class="project-status ${p.statusClass || ""}">${esc(p.status)}</span></div>
    <h3 id="title-${p.id}"><a href="#${p.id}">${esc(p.title)}</a></h3><p class="description">${esc(p.description)}</p>
    <div class="tags">${p.tags.map((t) => `<button class="tag" data-tag="${esc(t)}" aria-label="Search projects for ${esc(t)}">${esc(t.toLowerCase())}</button>`).join("")}</div>
    <div class="card-actions"><a href="#${p.id}" aria-label="Open ${esc(p.title)}">[↵] Open</a><button data-save="${p.id}" aria-pressed="${saved.has(p.id)}" aria-label="${saved.has(p.id) ? "Unsave" : "Save"} ${esc(p.title)}">[S] ${saved.has(p.id) ? "Saved" : "Save"}</button><button data-expand="${p.id}" aria-expanded="${expanded.has(p.id)}" aria-controls="expand-${p.id}" aria-label="${expanded.has(p.id) ? "Collapse" : "Expand"} ${esc(p.title)}">[E] ${expanded.has(p.id) ? "Collapse" : "Expand"}</button>${sourceLink(p, "[↗] Source")}</div>
    <div class="expanded-content" id="expand-${p.id}" ${expanded.has(p.id) ? "" : "hidden"}>${progress(p)}<a class="bracket" href="#${p.id}">[ View project / images → ]</a></div>
  </article>`;
}
function renderFeed() {
  screen.innerHTML = `<section aria-label="Project feed"><div class="feed-tools"><div class="tabs" aria-label="Project categories">${[
    ["all", "Index"],
    ["software", "Software"],
    ["hardware", "Hardware"],
    ["homelab", "Home lab"],
    ["saved", "Saved"],
  ]
    .map(
      ([id, name]) =>
        `<button data-category="${id}" aria-pressed="${category === id}">${name}</button>`,
    )
    .join(
      "",
    )}</div><label class="search-wrap"><span class="sr-only">Search projects</span><input id="project-search" type="search" value="${esc(query)}" maxlength="120" placeholder="Search projects…" autocomplete="off" /></label></div><div class="feed-heading"><h2 id="feed-caption"></h2><span id="result-count"></span></div><div class="project-list" id="project-list"></div></section>`;
  $("#project-search").addEventListener("input", (e) => {
    query = e.target.value;
    renderCards();
  });
  renderCards();
}
function renderCards() {
  const results = findProjects({ category, query, saved });
  $("#feed-caption").textContent =
    category === "saved"
      ? "Your saved projects · stored on this browser"
      : "What's on the workbench?";
  $("#result-count").textContent =
    `${String(results.length).padStart(2, "0")} / 07 projects`;
  $("#project-list").innerHTML = results.length
    ? results.map(card).join("")
    : `<div class="empty"><h3>${category === "saved" && !saved.size ? "Nothing saved. Yet." : "No matching signals."}</h3><p>${category === "saved" && !saved.size ? "Use [S] Save on a project to keep it here. No account needed." : "Try another category or a shorter search."}</p><button class="bracket" data-reset-feed>[ Back to all projects ]</button></div>`;
  document
    .querySelectorAll("[data-category]")
    .forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.category === category)),
    );
}
function saveProject(id) {
  if (!projectById(id)) return;
  saved.has(id) ? saved.delete(id) : saved.add(id);
  const persisted = write("hirsu-saved-projects", JSON.stringify([...saved]));
  const name = projectById(id).title;
  toast(
    `${saved.has(id) ? "Saved" : "Removed"}: ${name}${persisted ? "" : " (this session only — storage unavailable)"}`,
  );
  if ($("#project-list") && category === "saved") {
    renderCards();
    return;
  }
  screen.querySelectorAll("[data-save]").forEach((b) => {
    if (b.dataset.save === id) {
      b.setAttribute("aria-pressed", String(saved.has(id)));
      b.setAttribute(
        "aria-label",
        `${saved.has(id) ? "Unsave" : "Save"} ${name}`,
      );
      b.textContent =
        route === id
          ? `[ ${saved.has(id) ? "Saved" : "Save project"} ]`
          : `[S] ${saved.has(id) ? "Saved" : "Save"}`;
    }
  });
}
function expandProject(id) {
  const content = $("#expand-" + id),
    button = screen.querySelector(`[data-expand="${id}"]`);
  if (!content || !button) return;
  expanded.has(id) ? expanded.delete(id) : expanded.add(id);
  content.hidden = !expanded.has(id);
  button.setAttribute("aria-expanded", String(expanded.has(id)));
  button.setAttribute(
    "aria-label",
    `${expanded.has(id) ? "Collapse" : "Expand"} ${projectById(id).title}`,
  );
  button.textContent = `[E] ${expanded.has(id) ? "Collapse" : "Expand"}`;
}
function gallery(p) {
  return [
    { image: p.image, alt: p.alt, caption: p.caption },
    ...(p.gallery || []),
  ];
}
function renderProject(p) {
  const images = gallery(p),
    at = shots.get(p.id) || 0;
  screen.innerHTML = `<a class="back-link" href="#index">← Back to project index</a><header class="page-head"><div><p class="eyebrow">PROJECT / ${String(projects.indexOf(p) + 1).padStart(2, "0")} / ${esc(p.category)}</p><h1>${esc(p.title)}</h1><p>${esc(p.subtitle)}</p><div class="detail-links">${sourceLink(p, "[ Source & setup ↗ ]")}<button class="bracket" data-save="${p.id}" aria-pressed="${saved.has(p.id)}" aria-label="${saved.has(p.id) ? "Unsave" : "Save"} ${esc(p.title)}">[ ${saved.has(p.id) ? "Saved" : "Save project"} ]</button></div></div><span class="project-badge ${p.statusClass || ""}">${esc(p.status)}</span></header>
  <div class="detail-layout"><section class="panel"><h2>01 / The idea</h2><p>${esc(p.overview)}</p></section><section class="panel"><h2>02 / What it does</h2><ul>${p.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul></section><section class="panel"><h2>03 / Current state</h2><p class="status-note">${esc(p.progress)}</p></section>
  <figure class="project-media"><button class="media-open" data-preview="${p.id}" aria-label="Enlarge ${esc(p.title)} image"><img id="project-image" src="${images[at].image}" alt="${esc(images[at].alt)}" /></button><figcaption id="project-caption">${esc(images[at].caption)}</figcaption>${images.length > 1 ? `<div class="gallery-controls"><button data-shot="-1" aria-label="Previous project image">←</button><span id="shot-position">${at + 1} / ${images.length}</span><button data-shot="1" aria-label="Next project image">→</button></div>` : ""}</figure>
  <p class="detail-evidence">SOURCE NOTE / ${esc(p.evidence)}</p></div>`;
}
function changeShot(step) {
  const p = projectById(route);
  if (!p) return;
  const images = gallery(p),
    at = ((shots.get(p.id) || 0) + step + images.length) % images.length;
  shots.set(p.id, at);
  $("#project-image").src = images[at].image;
  $("#project-image").alt = images[at].alt;
  $("#project-caption").textContent = images[at].caption;
  if ($("#shot-position"))
    $("#shot-position").textContent = `${at + 1} / ${images.length}`;
}
function preview(id) {
  const p = projectById(id),
    image = gallery(p)[shots.get(id) || 0];
  $("#large-image").src = image.image;
  $("#large-image").alt = image.alt;
  $("#image-caption").textContent = `${p.title} / ${image.caption}`;
  openDialog("#image-dialog");
}
const pageHead = (index, title, description) =>
  `<header class="page-head"><div><p class="eyebrow">${index} / HIRSU.SYS</p><h1>${title}</h1><p>${description}</p></div></header>`;
function renderNetwork() {
  screen.innerHTML =
    pageHead(
      "02",
      "The project network.",
      "Different experiments. Shared tools. Select a node to open its project.",
    ) +
    `<section class="network-shell" id="network-shell" aria-label="Interactive project network"><div class="network-viewport"><canvas tabindex="0" aria-label="Conceptual project sphere. Drag or use arrow keys to rotate; plus and minus to zoom. Project links follow."></canvas><div class="network-crosshair" aria-hidden="true"></div><span class="network-meta">07 PROJECT NODES<br />CONCEPTUAL MAP<br />NOT LIVE TELEMETRY</span><div class="network-labels">${projects.map((p) => `<a class="network-node" href="#${p.id}" aria-label="Open ${esc(p.title)}">${esc(p.title)}</a>`).join("")}</div></div><div class="network-controls"><button id="spin-button" aria-pressed="true">[ Pause rotation ]</button><button id="network-reset">[ Reset ]</button><span>DRAG rotate / SCROLL zoom</span><div class="quality" aria-label="Wireframe detail">${[
      [8, "LOW"],
      [14, "MID"],
      [22, "HIGH"],
    ]
      .map(
        ([q, label]) =>
          `<button data-quality="${q}" aria-pressed="${q === 14}" aria-label="${label.toLowerCase()} wireframe detail">${label}</button>`,
      )
      .join(
        "",
      )}</div></div></section><p class="network-legend">Lines connect related work: web tooling, personal computing, electronics, and home services. Positions are illustrative—not physical locations. Rotation pauses while keyboard focus is on the map.</p><nav class="network-index" aria-label="Accessible project list">${projects.map((p) => `<a href="#${p.id}">${esc(p.title)}<span>${esc(p.status)} →</span></a>`).join("")}</nav>`;
  networkCleanup = createProjectNetwork($("#network-shell"));
}
function renderStack() {
  const counts = languageCounts(),
    days = calendarDays();
  screen.innerHTML =
    pageHead(
      "03",
      "Tools, not skill bars.",
      "What actually appears in the public projects. Counts are repositories, not self-rated proficiency.",
    ) +
    `<div class="stack-grid"><section class="panel"><h2>Languages / 5 project repos</h2>${counts.map(([name, count]) => `<div class="language-row"><span>${esc(name)}</span><div class="language-bar" aria-hidden="true"><i style="width:${(count / 5) * 100}%"></i></div><span>${count} / 5</span></div>`).join("")}</section><section class="panel"><h2>Software ↔ physical world</h2><p>Python / FastAPI / SQLite for local tools. JavaScript for the web. SwiftUI for a personal iOS interface.</p><p>KiCad and CAD for electronics. CircuitPython for USB HID. QML / Quickshell for a custom Linux desktop.</p><p>Raspberry Pi, Pi-hole, VPN, and Tailscale for home services. Existing local language models behind the NEXUS interface.</p><p class="fineprint">These are project tools, not certifications or claims of expertise. Hardware validation is still pending where noted.</p></section></div>
  <section class="panel" style="margin-top:18px"><h2>Public commit snapshot / 78 authored commits</h2><div class="calendar" role="img" aria-label="78 authored public default-branch commits in the bounded April to October 20, 2026 snapshot. Highest recorded day: 38 commits on October 7.">${days.map((d) => `<span data-level="${d.count > 10 ? 3 : d.count > 2 ? 2 : d.count > 0 ? 1 : 0}" data-future="${d.future}" title="${d.date}: ${d.count} commits"></span>`).join("")}</div><p class="fineprint">Snapshot: ${snapshot.date}. Five public project repositories plus this portfolio. Not a live GitHub contribution calendar. Repository language counts exclude the portfolio. Public REST sources and refresh instructions are in the <a href="https://github.com/hrushikbarani-hub/hrushikbarani-hub.github.io#grounded-content--data" target="_blank" rel="noopener noreferrer">README ↗</a>.</p></section>`;
}
function renderLog() {
  screen.innerHTML =
    pageHead(
      "04",
      "On the workbench.",
      "Current states, not a manufactured activity feed. Snapshot: October 2026.",
    ) +
    `<section class="panel"><h2>Build notes / open loops</h2>${[
      [
        "robo-telescope",
        "Get the telescope moving again.",
        "The coordinate-to-motor build used to work. It is currently broken and needs repair before another pointing test.",
      ],
      [
        "custom-keyboard",
        "From nominal fit to physical fit.",
        "PCB, firmware, and enclosure design are prepared. Assembly, clearances, and real component fit are unverified.",
      ],
      [
        "hyprland-forge",
        "A desktop still taking shape.",
        "The Arch / Hyprland shell and tooling are in development. Daily-use readiness still needs real-hardware validation.",
      ],
      [
        "nexus-ai",
        "Keep the backend boundary clear.",
        "The mobile interface is experimental. It needs signing and the corresponding local services; selecting a model does not train one.",
      ],
      [
        "maintaineros",
        "Useful tools you can run locally.",
        "MaintainerOS and CivicLens v0.3 are published with setup instructions. The screenshots contain labeled fictional demo data.",
      ],
    ]
      .map(
        ([id, title, body], i) =>
          `<article class="log-entry"><span>${String(i + 1).padStart(2, "0")}</span><div><h3>${title}</h3><p>${body}</p><a href="#${id}">Open project →</a></div></article>`,
      )
      .join("")}</section>`;
}
function renderAbout() {
  screen.innerHTML =
    pageHead(
      "05",
      "Hello, I'm Hrushi.",
      "Online as hirsu. I build software, experiment with electronics, and connect the two.",
    ) +
    `<section class="panel"><h2>A small, useful corner of the internet.</h2><p>This is my project archive: a telescope that followed sky coordinates, a Pi keeping home services useful, tools for maintainers and civic records, and a few experiments that are still taking shape.</p><p>Not everything here is finished. Each project includes its actual status, source when public, and a clear distinction between an illustration, CAD, or a working app screenshot.</p><div class="facts"><span><b>7</b> projects</span><span><b>5</b> public project repos</span><span><b>0</b> trackers</span></div><a class="bracket" href="https://github.com/hrushikbarani-hub" target="_blank" rel="noopener noreferrer">[ Find me on GitHub ↗ ]</a></section>
  <section class="panel"><h2>Colophon / visual references</h2><p>This interface takes its text-first feed, navigation rail, bracketed actions, and keyboard-first spirit from <a href="https://cyberspace.online/" target="_blank" rel="noopener noreferrer">Cyberspace ↗</a>. Original implementation and portfolio content; no community posts, private data, or reference-site source are bundled.</p><p>Cyberpunk 2077's interface language informed the red/cyan framing. Official Edgerunners art informed Overdrive's chartreuse, violet, and hard-edged contrast. This is an independent portfolio, not affiliated with those productions.</p><p>The linked <a href="https://www.youtube.com/watch?v=yLdJh2_-o8U" target="_blank" rel="noopener noreferrer">Cyberpunk UI guide ↗</a> informed modular sections, geometric details, hover / focus states, and progressive disclosure. Its captions were reviewed; no full-series viewing is claimed.</p></section>
  <section class="panel"><h2>Local by design.</h2><p>Static files on free GitHub Pages. No Raspberry Pi hosting, accounts, analytics, backend, or API keys. Save stores project IDs in this browser. Theme and motion preferences also stay here. The network graphic is a conceptual project map, not home-network telemetry or real locations.</p><p>Project facts: five public GitHub repositories and descriptions supplied by Hrushi. The Pi lab is Pi-hole, VPN, and Tailscale; NEXUS is an experimental client for existing local AI models, not a self-trained foundation model. Images are visibly labeled. Snapshot data and provenance are documented in the <a href="https://github.com/hrushikbarani-hub/hrushikbarani-hub.github.io" target="_blank" rel="noopener noreferrer">site source ↗</a>.</p></section>`;
}
function renderRoute({ focus = false } = {}) {
  const next = resolveRoute(location.hash);
  if (next === "themes") {
    if (!screen.innerHTML) {
      route = "index";
      renderFeed();
    }
    openDialog("#theme-dialog");
    return;
  }
  networkCleanup?.();
  networkCleanup = null;
  route = next;
  $("#identity").hidden =
    !["index", "saved"].includes(route) && root.dataset.view !== "blacksite";
  // Overdrive keeps the identity dock on desktop; CSS hides it on detail mobile views.
  root.dataset.page = route;
  history.replaceState(
    { ...history.state, hirsuView: root.dataset.view },
    "",
    location.href,
  );
  const p = projectById(route);
  if (p) renderProject(p);
  else if (route === "index" || route === "saved") {
    if (route === "saved") category = "saved";
    else if (category === "saved") category = "all";
    renderFeed();
  } else if (route === "network") renderNetwork();
  else if (route === "stack") renderStack();
  else if (route === "log") renderLog();
  else renderAbout();
  $("#top-path").textContent = "/ " + (p ? p.id : route);
  document.title = `hirsu // ${p ? p.title : route === "index" ? "project index" : route}`;
  document.querySelectorAll("[data-nav]").forEach((a) => {
    const current = a.dataset.nav === (p ? "index" : route);
    if (current) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  if (focus) {
    $("#main").focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }
}
screen.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.category) {
    category = b.dataset.category;
    renderCards();
    if (route === "saved" && category !== "saved") {
      history.pushState(null, "", "#index");
      route = "index";
      $("#top-path").textContent = "/ index";
      document.title = "hirsu // project index";
      document
        .querySelectorAll("[data-nav]")
        .forEach((a) =>
          a.dataset.nav === "index"
            ? a.setAttribute("aria-current", "page")
            : a.removeAttribute("aria-current"),
        );
    }
  }
  if (b.dataset.save) saveProject(b.dataset.save);
  if (b.dataset.expand) expandProject(b.dataset.expand);
  if (b.dataset.tag) {
    query = b.dataset.tag;
    category = "all";
    $("#project-search").value = query;
    renderCards();
    $("#project-search").focus();
  }
  if (b.hasAttribute("data-reset-feed")) {
    query = "";
    category = "all";
    if (route === "saved") {
      location.hash = "index";
    } else {
      renderFeed();
      $("#project-search").focus();
    }
  }
  if (b.dataset.shot) changeShot(Number(b.dataset.shot));
  if (b.dataset.preview) preview(b.dataset.preview);
});
window.addEventListener("hashchange", () => renderRoute({ focus: true }));
window.addEventListener("popstate", (e) => {
  setView(
    interfaceFromSearch(
      location.search,
      e.state?.hirsuView || read("hirsu-console-view"),
    ),
    { push: false },
  );
  // Theme changes preserve the current gallery, search and expansion state.
  if (resolveRoute(location.hash) !== route) renderRoute({ focus: true });
  syncIdentity();
});
function syncIdentity() {
  $("#identity").hidden =
    !["index", "saved"].includes(route) && root.dataset.view !== "blacksite";
}
document.addEventListener("appearancechange", syncIdentity);

function commands() {
  return [
    ...[
      ["index", "Project index"],
      ["network", "Project network"],
      ["stack", "Technology stack"],
      ["log", "Workbench"],
      ["saved", "Saved projects"],
      ["about", "About / colophon"],
    ].map(([id, label]) => ({ label, type: "PAGE", run: () => navigate(id) })),
    ...projects.map((p) => ({
      label: p.title,
      type: "PROJECT",
      run: () => navigate(p.id),
    })),
    {
      label: "Switch to Cyberspace",
      type: "INTERFACE",
      run: () => setView("neon"),
    },
    {
      label: "Switch to Overdrive",
      type: "INTERFACE",
      run: () => setView("blacksite"),
    },
    {
      label:
        root.dataset.motion === "on"
          ? "Pause animations / motion off"
          : "Enable animations / motion on",
      type: "SETTING",
      run: () => setMotion(root.dataset.motion !== "on"),
    },
    {
      label: "Keyboard shortcuts / help",
      type: "HELP",
      run: () => openDialog("#help-dialog"),
    },
  ];
}
let visibleCommands = [];
function navigate(id) {
  if (location.hash === "#" + id) renderRoute({ focus: true });
  else location.hash = id;
}
function renderCommands() {
  const text = $("#command-search").value.toLowerCase().trim();
  visibleCommands = commands().filter((c) =>
    c.label.toLowerCase().includes(text),
  );
  $("#command-results").innerHTML = visibleCommands.length
    ? visibleCommands
        .map(
          (c, i) =>
            `<button data-command="${i}"><span>${esc(c.label)}</span><small>${c.type} ↵</small></button>`,
        )
        .join("")
    : `<p class="muted">No matching command. Try “network”, “Pi”, or “motion”.</p>`;
}
function openCommands() {
  $("#command-search").value = "";
  renderCommands();
  openDialog("#command-dialog");
  $("#command-search").focus();
}
$("#command-button").onclick = $("#footer-commands").onclick = openCommands;
$("#command-search").addEventListener("input", renderCommands);
$("#command-results").addEventListener("click", (e) => {
  const b = e.target.closest("[data-command]");
  if (!b) return;
  const command = visibleCommands[Number(b.dataset.command)];
  $("#command-dialog").close();
  command?.run();
});
$("#command-dialog").addEventListener("keydown", (e) => {
  const buttons = [...$("#command-results").querySelectorAll("button")],
    at = buttons.indexOf(document.activeElement);
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    const next =
      e.key === "ArrowDown" ? at + 1 : at < 0 ? buttons.length - 1 : at - 1;
    if (next < 0) $("#command-search").focus();
    else buttons[next % buttons.length]?.focus();
  }
  if (e.key === "Enter" && e.target === $("#command-search")) {
    e.preventDefault();
    buttons[0]?.click();
  }
});
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    $("#command-dialog").open ? $("#command-dialog").close() : openCommands();
    return;
  }
  if (
    document.querySelector("dialog[open]") ||
    e.ctrlKey ||
    e.metaKey ||
    e.altKey
  )
    return;
  if (e.target.matches("input,textarea,select,[contenteditable=true]")) return;
  if (e.key === "?") {
    e.preventDefault();
    openDialog("#help-dialog");
    return;
  }
  if (e.key === "/" && $("#project-search")) {
    e.preventDefault();
    $("#project-search").focus();
    return;
  }
  if (e.target.tagName === "CANVAS") return;
  const cards = [...screen.querySelectorAll(".project-card")],
    current = document.activeElement.closest?.(".project-card"),
    at = cards.indexOf(current);
  if (cards.length && ["ArrowDown", "ArrowUp", "j", "k"].includes(e.key)) {
    e.preventDefault();
    const step = e.key === "ArrowDown" || e.key === "j" ? 1 : -1;
    const next =
      at < 0
        ? step > 0
          ? 0
          : cards.length - 1
        : (at + step + cards.length) % cards.length;
    cards[next].focus({ preventScroll: true });
    cards[next].scrollIntoView({ block: "nearest", behavior: "instant" });
    return;
  }
  if (current && !e.target.matches("button,a")) {
    if (e.key === "Enter") {
      e.preventDefault();
      navigate(current.dataset.project);
    }
    if (e.key.toLowerCase() === "s") {
      e.preventDefault();
      saveProject(current.dataset.project);
    }
    if (e.key.toLowerCase() === "e") {
      e.preventDefault();
      expandProject(current.dataset.project);
    }
  }
  if (
    projectById(route) &&
    ["ArrowLeft", "ArrowRight"].includes(e.key) &&
    !e.target.matches("button,a")
  ) {
    e.preventDefault();
    changeShot(e.key === "ArrowLeft" ? -1 : 1);
  }
});
setView(interfaceFromSearch(location.search, read("hirsu-console-view")), {
  push: false,
});
setMotion(root.dataset.motion !== "off", false);
renderRoute();
