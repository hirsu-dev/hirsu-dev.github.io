import { projects } from "./projects.js?v=8";
import { snapshot, languageCounts, calendarDays } from "./stack-data.js";
import {
  interfaces,
  interfaceFromSearch,
  interfaceURL,
} from "./interfaces.js?v=13";
import {
  savedIds,
  findProjects,
  resolveRoute,
  escapeHTML as esc,
} from "./console-model.js?v=19";
import { createProjectNetwork } from "./project-network.js?v=21";
import { networkContent } from "./network-view.js?v=21";
import { buildLabContent, mountBuildLab } from "./build-lab.js?v=21";
import { mountRadio } from "./music.js?v=21";
import { netrunnerHome, relicHome, mountLayout } from "./layouts.js?v=19";
import { switchboardHome, mountSwitchboard } from "./switchboard.js?v=19";
import { overdriveHome, overdriveSections } from "./overdrive-content.js?v=19";
import { createCityMotion } from "./city-motion.js?v=19";
import { mountSettings } from "./settings.js?v=18";
import {
  introById,
  defaultIntro,
  introOptions,
  introStorageKey,
} from "./intro-variants.js?v=17";
import { mountProjectTerminal } from "./project-terminal.js?v=11";
import { photoCredit } from "./photo.js?v=11";

const $ = (s) => document.querySelector(s);
const root = document.documentElement,
  screen = $("#screen");
const cityMotion = createCityMotion();
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
  pageCleanup = null,
  layoutCleanup = null,
  renderedLayout = null,
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
  cityMotion.animate(
    $(id),
    [
      {
        opacity: 0,
        transform: "translateY(24px) scale(.96)",
        clipPath: "inset(0 0 30% 0)",
      },
      { opacity: 1, transform: "translateX(0)", clipPath: "inset(0 0 0 0)" },
    ],
    500,
  );
  $(id)
    .querySelectorAll(
      ".menu-pages,.theme-options,.dialog-bar,#command-search,#command-results,#large-image",
    )
    .forEach((piece, i) =>
      cityMotion.animate(
        piece,
        [
          { opacity: 0, transform: "translateY(10px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        420,
        80 + i * 55,
      ),
    );
}
function setView(view, { push = true } = {}) {
  if (!Object.hasOwn(interfaces, view)) return;
  if (push && root.dataset.view === view) return;
  const previous = root.dataset.view;
  root.dataset.view = view;
  write("hirsu-city-view-v9", view);
  document.querySelector('meta[name="theme-color"]').content =
    interfaces[view].color;
  $("#top-theme").innerHTML = 'Settings <span aria-hidden="true">⌄</span>';
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
  if (previous !== view && route === "index" && screen.innerHTML) {
    renderHome();
    document.title = "hirsu // " + root.dataset.layout;
    cityMotion.enter(screen);
  }
}
function refreshMotion() {
  $("#replay-intro").disabled = root.dataset.motion !== "on";
  syncIntroChoice();
  document.dispatchEvent(new Event("appearancechange"));
  if (
    route === "index" &&
    renderedLayout &&
    renderedLayout !== root.dataset.layout
  ) {
    renderHome();
    document.title = "hirsu // " + root.dataset.layout;
    cityMotion.enter(screen);
  }
}
function setMotion(on) {
  preferences.set("motion", on ? "on" : "off");
}
function syncIntroChoice() {
  const intro = introById(root.dataset.intro);
  $("#intro-selection").textContent =
    `Selected: ${intro.name} · 2.9 seconds${root.dataset.motion === "on" ? "" : " · Enable animations to preview."}`;
  $("#replay-intro").textContent = `[ Preview ${intro.name} ↗ ]`;
}
root.dataset.intro = introById(read(introStorageKey)).id;
$("#intro-options").innerHTML = introOptions(root.dataset.intro);
$("#intro-options").addEventListener("change", (event) => {
  const input = event.target.closest('input[name="startup"]');
  if (!input) return;
  const intro = introById(input.value);
  root.dataset.intro = intro.id;
  const persisted = write(introStorageKey, intro.id);
  syncIntroChoice();
  announce(`${intro.name} startup selected.`);
  if (!persisted)
    toast("Startup selected for this session. Browser storage is unavailable.");
});
const preferences = mountSettings({
  read,
  write,
  onApply: refreshMotion,
  onReset: () => {
    root.dataset.intro = defaultIntro;
    $("#intro-options").innerHTML = introOptions(defaultIntro);
    return write(introStorageKey, defaultIntro);
  },
});
const radio = mountRadio();
function openSettings(tab = "general") {
  preferences.selectTab(tab);
  openDialog("#settings-dialog");
  $("#settings-dialog [aria-selected='true']").focus({ preventScroll: true });
}
$("#settings-dialog").addEventListener("close", () => {
  if (!document.querySelector("dialog[open]"))
    $("#city-settings").focus({ preventScroll: true });
});
document.addEventListener("click", (e) => {
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
$("#theme-button").onclick =
  $("#top-theme").onclick =
  $("#city-settings").onclick =
  $("#city-footer-theme").onclick =
  $("#menu-settings").onclick =
    () => openSettings();
$("#help-button").onclick = () => openDialog("#help-dialog");
document.querySelector(".skip").addEventListener("click", (e) => {
  e.preventDefault();
  $("#main").focus({ preventScroll: true });
  $("#main").scrollIntoView({ block: "start", behavior: "instant" });
});
$("#city-menu").onclick = () => openDialog("#theme-dialog");
function replayIntro() {
  document.querySelectorAll("dialog[open]").forEach((d) => d.close());
  // Return to a visible control after preview; a closed menu cannot receive focus.
  $("#city-settings").focus({ preventScroll: true });
  cityMotion.opening({ replay: true });
}
$("#replay-intro").onclick = replayIntro;
$("#theme-dialog .menu-pages").addEventListener("click", (e) => {
  if (e.target.closest("a")) $("#theme-dialog").close();
});
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

function renderHome() {
  networkCleanup?.();
  networkCleanup = null;
  layoutCleanup?.();
  layoutCleanup = null;
  renderedLayout = root.dataset.layout || "overdrive";
  if (renderedLayout === "switchboard") {
    screen.innerHTML = switchboardHome();
    layoutCleanup = mountSwitchboard(screen, {
      read,
      write,
      animate: cityMotion.animate,
    });
    return;
  }
  if (renderedLayout !== "overdrive") {
    screen.innerHTML =
      renderedLayout === "netrunner" ? netrunnerHome() : relicHome();
    layoutCleanup = mountLayout(screen, { animate: cityMotion.animate });
    return;
  }
  screen.innerHTML = overdriveHome(networkContent());
  mountProjectTerminal($(".project-terminal"), cityMotion.animate);
  networkCleanup = createProjectNetwork($("#network-shell"), {
    scrollZoom: false,
  });
}

function progress(p) {
  return `<p>${esc(p.overview)}</p><ul>${p.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul><p class="status-note">${esc(p.progress)}</p>`;
}
function card(p, i) {
  return `<article class="project-card" tabindex="-1" data-project="${p.id}" aria-labelledby="title-${p.id}" style="animation-delay:${Math.min(i, 5) * 30}ms">
    <a class="card-art" href="#${p.id}" aria-label="View ${esc(p.title)}"><img src="${p.image}" alt="${esc(p.alt)}" loading="lazy" width="1200" height="750" /><span>${esc(p.caption)}</span></a><div class="card-meta"><span class="owner">@hirsu</span><span class="card-category">${esc(p.category.toLowerCase())}</span><span class="project-status ${p.statusClass || ""}">${esc(p.status)}</span></div>
    <h3 id="title-${p.id}"><a href="#${p.id}">${esc(p.title)}</a></h3><p class="description">${esc(p.description)}</p>
    <div class="tags">${p.tags.map((t) => `<button class="tag" data-tag="${esc(t)}" aria-label="Search projects for ${esc(t)}">${esc(t.toLowerCase())}</button>`).join("")}</div>
    <div class="card-actions"><a href="#${p.id}" aria-label="Open ${esc(p.title)}">[↵] Open</a><button data-save="${p.id}" aria-pressed="${saved.has(p.id)}" aria-label="${saved.has(p.id) ? "Unsave" : "Save"} ${esc(p.title)}">[S] ${saved.has(p.id) ? "Saved" : "Save"}</button><button data-expand="${p.id}" aria-expanded="${expanded.has(p.id)}" aria-controls="expand-${p.id}" aria-label="${expanded.has(p.id) ? "Collapse" : "Expand"} ${esc(p.title)}">[E] ${expanded.has(p.id) ? "Collapse" : "Expand"}</button>${sourceLink(p, "[↗] Source")}</div>
    <div class="expanded-content" id="expand-${p.id}" ${expanded.has(p.id) ? "" : "hidden"}>${progress(p)}<a class="bracket" href="#${p.id}">[ View project / images → ]</a></div>
  </article>`;
}
function renderFeed() {
  screen.innerHTML =
    pageHead(
      "PROJECT.ARCHIVE",
      route === "saved" ? "Saved projects." : "The project archive.",
      "Software, hardware and the home lab. Open a project for features, source and its actual current state.",
    ) +
    `<section aria-label="Project feed"><div class="feed-tools"><div class="tabs" aria-label="Project categories">${[
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
  cityMotion.observe(screen);
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
  if (!content.hidden)
    cityMotion.animate(
      content,
      [
        {
          opacity: 0,
          height: "0px",
          overflow: "hidden",
          transform: "translateY(-8px)",
        },
        {
          opacity: 1,
          height: content.scrollHeight + "px",
          overflow: "hidden",
          transform: "translateY(0)",
        },
      ],
      420,
    );
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
  screen.innerHTML = `<a class="back-link" href="#projects">← Back to all projects</a><header class="page-head"><div><p class="eyebrow">PROJECT / ${String(projects.indexOf(p) + 1).padStart(2, "0")} / ${esc(p.category)}</p><h1>${esc(p.title)}</h1><p>${esc(p.subtitle)}</p><div class="detail-links">${sourceLink(p, "[ Source & setup ↗ ]")}<button class="bracket" data-save="${p.id}" aria-pressed="${saved.has(p.id)}" aria-label="${saved.has(p.id) ? "Unsave" : "Save"} ${esc(p.title)}">[ ${saved.has(p.id) ? "Saved" : "Save project"} ]</button></div></div><span class="project-badge ${p.statusClass || ""}">${esc(p.status)}</span></header>
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
  const image = $("#project-image");
  image
    .decode()
    .catch(() => {})
    .then(() => {
      if (!image.isConnected || shots.get(p.id) !== at) return;
      cityMotion.animate(
        image,
        [
          {
            opacity: 0,
            transform: `translateX(${step > 0 ? 18 : -18}px) scale(.98)`,
            clipPath: "inset(0 0 0 8%)",
          },
          {
            opacity: 1,
            transform: "translateX(0) scale(1)",
            clipPath: "inset(0)",
          },
        ],
        500,
      );
    });
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
      "A sky full of projects.",
      "Seven original constellations. Follow a star, explore a build, and find the ideas that connect them.",
    ) + networkContent();
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
    `<section class="panel"><h2>A small, useful corner of the internet.</h2><p>This is my project archive: a telescope that followed sky coordinates, a Pi keeping home services useful, tools for maintainers and civic records, and a few experiments that are still taking shape.</p><p>Not everything here is finished. Each project includes its actual status, source when public, and a clear distinction between an illustration, CAD, or a working app screenshot.</p><div class="facts"><span><b>7</b> projects</span><span><b>5</b> public project repos</span><span><b>3</b> hands-on build demos</span></div><a class="bracket" href="https://github.com/hrushikbarani-hub" target="_blank" rel="noopener noreferrer">[ Find me on GitHub ↗ ]</a></section>
  <section class="panel"><h2>Colophon / visual references</h2><p>Overdrive reinterprets the angular red/yellow menu language of <a href="https://www.cyberpunk.net/us/en/" target="_blank" rel="noopener noreferrer">Cyberpunk 2077 ↗</a> as an original project terminal. Select a file, inspect its real status and preview, then scroll through the workbench. Settings → Customize offers four independent layouts: the scrolling Overdrive workbench, a Netrunner file desktop, the Relic visual dossier, and Switchboard’s movable project map with a two-build comparison patch bay. Palettes, effects and startup scenes are separate choices. No game source, character art or official branding is bundled; this independent portfolio is not affiliated with the franchise.</p><p>The earlier text-first archive and keyboard controls take inspiration from <a href="https://cyberspace.online/" target="_blank" rel="noopener noreferrer">Cyberspace ↗</a>. The supplied UI references informed geometric callouts, sliding panels, hover/focus states and chromatic distortion. The implementation and project content are original.</p><h3>A real city, photographed.</h3><p>The homepage background uses a genuine photograph of Shinjuku, Tokyo, not AI-generated artwork. The original photograph is bundled locally with a smaller responsive copy; only the display crop, dark overlay and temporary glitch slices alter its presentation.</p>${photoCredit()}<p><a href="PHOTO-CREDITS.md">Full photo attribution and license notes ↗</a></p></section>
  <section class="panel"><h2>A signal from the workbench.</h2><p>The opening takes the idea of an assembling interface from <a href="https://hancore.dev/site/#stack" target="_blank" rel="noopener noreferrer">hancore.dev ↗</a>, reinterpreted through six original short boot sequences. Redline is the default: a charged red seam, fractured wordmark, and particle-lined gates that split into the page at 100%. It is a visual introduction, not a download meter or system scan. Skip or Escape dismisses it; replay is in the interface menu. FX off disables motion and the intro. System reduced motion is respected by default.</p></section>
  <section class="panel"><h2>Local by default.</h2><p>Static files on free GitHub Pages. No Raspberry Pi hosting, portfolio accounts, first-party analytics, backend, or API keys. The optional Stellarium Web embed contacts Stellarium’s servers and analytics only after Load is clicked; unload it or leave Build Lab to disconnect the embedded page. Saved project IDs, interface preferences and Switchboard arrangements stay in this browser. The night sky is an original project illustration, not astronomical coordinates, home-network telemetry or real locations.</p><p><strong>Optional music:</strong> Five complete, owner-supplied MP3 recordings are hosted on this site. The owner confirmed public hosting and streaming permission; recording rights remain with their respective rightsholders. No Spotify, YouTube, third-party player, sign-in or listening-history storage is involved. The site attempts quiet playback on startup. If your browser blocks autoplay, use Retry to start with a click. Playback starts at 15% volume each visit, with a working volume slider and mute controls in both player sizes. The × hides all radio controls without stopping music; Radio in the menu reopens them. Stop &amp; unload ends playback. Music stays with you across pages and layout changes, with optional continuous next-track playback. Browser and device audio restrictions may still apply. See <a href="assets/audio/README.md" target="_blank" rel="noopener noreferrer">recording credits &amp; usage notice</a> or open <a href="#radio">background radio</a>.</p><p>Project facts: five public GitHub repositories and descriptions supplied by Hrushi. The Pi lab is Pi-hole, VPN, and Tailscale; NEXUS is an experimental client for existing local AI models, not a self-trained foundation model. Images are visibly labeled. Snapshot data and provenance are documented in the <a href="https://github.com/hrushikbarani-hub/hrushikbarani-hub.github.io" target="_blank" rel="noopener noreferrer">site source ↗</a>.</p></section>`;
}
function renderRoute({ focus = false } = {}) {
  let requested = resolveRoute(location.hash);
  const openMusic = requested === "radio";
  if (openMusic) {
    requested = "index";
    history.replaceState(history.state, "", "#index");
  }
  if (requested === "themes") {
    if (!screen.innerHTML) {
      route = "index";
      root.dataset.page = "index";
      renderHome();
    }
    openSettings("customize");
    return;
  }
  networkCleanup?.();
  networkCleanup = null;
  pageCleanup?.();
  pageCleanup = null;
  layoutCleanup?.();
  layoutCleanup = null;
  route = requested;
  root.dataset.page = route;
  syncIdentity();
  history.replaceState(
    { ...history.state, hirsuView: root.dataset.view },
    "",
    location.href,
  );
  const project = projectById(route);
  if (project) renderProject(project);
  else if (route === "index") renderHome();
  else if (route === "projects" || route === "saved") {
    if (route === "saved") category = "saved";
    else if (category === "saved") category = "all";
    renderFeed();
  } else if (route === "network") renderNetwork();
  else if (route === "stack") renderStack();
  else if (route === "log") renderLog();
  else if (route === "lab") {
    screen.innerHTML = buildLabContent();
    pageCleanup = mountBuildLab(screen);
  } else renderAbout();
  $("#top-path").textContent = "/ " + (project ? project.id : route);
  document.title =
    "hirsu // " +
    (project
      ? project.title
      : route === "index"
        ? root.dataset.layout
        : route === "projects"
          ? "all projects"
          : route);
  document.querySelectorAll("[data-nav]").forEach((a) => {
    const current = a.dataset.nav === (project ? "projects" : route);
    if (current) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  if (focus) {
    $("#main").focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  cityMotion.enter(screen);
  if (openMusic) radio.open();
}
screen.addEventListener("click", (e) => {
  const jump = e.target.closest("[data-home-section]");
  if (jump && overdriveSections.includes(jump.dataset.homeSection)) {
    e.preventDefault();
    const target = document.getElementById(jump.dataset.homeSection);
    target?.scrollIntoView({
      behavior:
        root.dataset.motion === "on" && root.dataset.smoothScroll !== "off"
          ? "smooth"
          : "instant",
      block: "start",
    });
    const heading = target?.querySelector("h2");
    heading?.setAttribute("tabindex", "-1");
    heading?.focus({ preventScroll: true });
    return;
  }
  const browse = e.target.closest("[data-browse]");
  if (browse) {
    category = browse.dataset.browse;
    query = "";
  }
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.category) {
    category = b.dataset.category;
    if (route === "saved" && category !== "saved") location.hash = "projects";
    else renderCards();
  }
  if (b.dataset.save) saveProject(b.dataset.save);
  if (b.dataset.expand) expandProject(b.dataset.expand);
  if (b.dataset.tag) {
    query = b.dataset.tag;
    category = "all";
    $("#project-search").value = query;
    renderCards();
    $("#project-search").focus();
    if (route === "saved") location.hash = "projects";
  }
  if (b.hasAttribute("data-reset-feed")) {
    query = "";
    category = "all";
    if (route === "saved") {
      location.hash = "projects";
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
      e.state?.hirsuView || read("hirsu-city-view-v9"),
    ),
    { push: false },
  );
  // Theme changes preserve the current gallery, search and expansion state.
  if (resolveRoute(location.hash) !== route) renderRoute({ focus: true });
  syncIdentity();
});
function syncIdentity() {
  $("#identity").hidden = true;
}
document.addEventListener("appearancechange", syncIdentity);

function commands() {
  return [
    ...[
      ["index", "Home / landing page"],
      ["projects", "All projects / archive"],
      ["network", "Night sky / project constellations"],
      ["stack", "Technology stack"],
      ["log", "Workbench"],
      ["saved", "Saved projects"],
      ["about", "About / colophon"],
      ["lab", "Build Lab / telescope, home lab & macro pad"],
    ].map(([id, label]) => ({ label, type: "PAGE", run: () => navigate(id) })),
    {
      label: "Background radio / music selections",
      type: "AUDIO",
      run: () => radio.open(),
    },
    ...projects.map((p) => ({
      label: p.title,
      type: "PROJECT",
      run: () => navigate(p.id),
    })),
    {
      label: "Choose startup animation / settings",
      type: "SETTING",
      run: () => openSettings("customize"),
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
      label: "Replay opening sequence",
      type: "MOTION",
      run: () =>
        root.dataset.motion === "on"
          ? replayIntro()
          : toast(
              "Enable animations in the interface menu to replay the opening.",
            ),
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
$("#command-button").onclick =
  $("#footer-commands").onclick =
  $("#city-commands").onclick =
    openCommands;
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
  if (root.dataset.shortcuts === "off") return;
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
setView(interfaceFromSearch(location.search, read("hirsu-city-view-v9")), {
  push: false,
});
refreshMotion();
renderRoute();
cityMotion.opening();
