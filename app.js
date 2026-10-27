import { projects } from "./projects.js?v=2";
import { snapshot, languageCounts, calendarDays } from "./stack-data.js";
import { createEffects, wrap } from "./motion.js?v=3";
import {
  interfaces,
  validInterface,
  interfaceFromSearch,
  interfaceURL,
} from "./interfaces.js?v=4";

const $ = (selector) => document.querySelector(selector);
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const github = "https://github.com/hrushikbarani-hub";
const external = (url, text) =>
  `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(text)} ↗</a>`;
const prompt = (command) =>
  `<div class="prompt"><span>hirsu<span class="dim">@workshop ~</span></span><code><span class="command-text">${escape(command)}</span></code></div>`;
const readPreference = (key, fallback) => {
  try {
    return localStorage.getItem(`hirsu-${key}`) ?? fallback;
  } catch {
    return fallback;
  }
};
const savePreference = (key, value) => {
  try {
    localStorage.setItem(`hirsu-${key}`, value);
  } catch {
  }
};

const pages = [
  { id: "about", label: "overview", art: "monogram-art", html: "h⌁" },
  ...projects.map((p) => ({
    id: p.id,
    label:
      p.id === "custom-keyboard"
        ? "nexus-macropad"
        : p.id === "nexus-ai"
          ? "nexus-mobile"
          : p.id,
    image: p.image,
  })),
  { id: "stack", label: "stack/", art: "stack-art", html: "⌘ ◈ ◫ ⬡\n⎇ ◉ ◇ ⌁" },
  {
    id: "themes",
    label: "interfaces/",
    art: "theme-art",
    html: ["#d3d0b9", "#db6e88", "#90ada0", "#e3a854", "#c292dc", "#8fe28b"]
      .map((c) => `<i style="--swatch:${c}"></i>`)
      .join(""),
  },
  {
    id: "log",
    label: "workbench/",
    art: "log-art",
    html: "* repair telescope\n│ test macro pad\n└─ keep building_",
  },
];
const media = matchMedia("(prefers-reduced-motion: reduce)");
const state = {
  index: 0,
  target: 0,
  view: interfaceFromSearch(location.search, readPreference("view", "neon")),
  motion: readPreference("motion", media.matches ? "off" : "on") === "on",
  eye: true,
  worm: false,
  ghost: false,
};
const initialView = state.view;
const content = $("#content");
const input = $("#command-input");
let effects;
let historyIndex = 0;
const commandHistory = [];
const shotIndices = new Map();
const shotsFor = (p) => [p, ...(p.gallery || [])];
const currentShot = (p) => shotsFor(p)[shotIndices.get(p.id) || 0];

$("#wheel-track").innerHTML = pages
  .map(
    (p, i) =>
      `<button type="button" class="wheel-item" id="page-${p.id}" role="option" aria-selected="false" aria-label="${escape(p.label)}" tabindex="-1" data-index="${i}"><span class="nav-index" aria-hidden="true">${String(i).padStart(2, "0")}</span>${p.image ? `<img src="${p.image}" alt="" decoding="async" draggable="false" />` : `<span class="nav-art ${p.art}" aria-hidden="true">${p.html}</span>`}<span class="wheel-caption" aria-hidden="true">${escape(p.label)}</span></button>`,
  )
  .join("");

function calendar() {
  const days = calendarDays();
  const total = Object.values(snapshot.commits).reduce((a, b) => a + b, 0);
  return `${prompt("git log --public --since=2026-04-20")}<p class="tiny-note">// ${total} public commits · 6 repositories · snapshot ${snapshot.date}</p><div class="calendar-wrap"><div class="calendar-head"><span>APR</span><span>MAY</span><span>JUN</span><span>JUL</span><span>AUG</span><span>SEP</span><span>OCT</span></div><div class="calendar" role="img" aria-label="Public commit snapshot: ${total} authored commits, April through October 20, 2026. Most activity is in October.">${days.map((d) => `<span class="day" data-level="${d.count > 15 ? 4 : d.count > 5 ? 3 : d.count > 1 ? 2 : d.count ? 1 : 0}" title="${d.date}: ${d.count} public commits" ${d.future ? 'style="opacity:0"' : ""}></span>`).join("")}</div><div class="calendar-legend">none ${["var(--grid)", "var(--faint)", "var(--muted)", "var(--fg)", "var(--accent)"].map((c) => `<i style="--swatch:${c}"></i>`).join("")} more</div></div><p class="tiny-note" style="margin-top:9px">Default-branch commits authored as hrushikbarani-hub, not a live contributions count. <a href="${github}?tab=repositories" target="_blank" rel="noopener noreferrer">Public sources ↗</a></p>`;
}

function about() {
  return `<section class="profile-panel"><div><p class="kicker">THE PERSON BEHIND THE PROJECTS</p><h2>Not just code.<br>Things that do something.</h2><p>I'm <strong>Hrushi</strong>. I build useful software, tinker with electronics, and occasionally convince a telescope to move. This is the workbench: some shipped, some still in pieces.</p><div class="inline-links">${external(github, "Find me on GitHub")}<a href="#stack">Explore my stack ↗</a></div></div><dl class="metrics"><dt>PROJECTS</dt><dd><b>07</b> software + hardware</dd><dt>PUBLIC REPOS</dt><dd><b>05</b> project repositories</dd><dt>HOME LAB</dt><dd>Pi-hole / VPN / Tailscale</dd><dt>TELESCOPE</dt><dd>Under repair <span class="dim">/ previously working</span></dd></dl></section><div class="blueprint"><div class="blueprint-top"><span>WORKBENCH / GENERATIVE SCHEMATIC</span><span>VISUAL ONLY</span></div><canvas id="blueprint-canvas" aria-hidden="true"></canvas><span class="blueprint-label">software × hardware × curiosity</span></div><section class="project-catalog" aria-labelledby="catalog-title"><div class="catalog-heading"><div><p class="kicker">SELECTED WORK / 7 PROJECTS</p><h2 id="catalog-title">Built out of curiosity.</h2></div><a href="#log">View workbench ↗</a></div><div class="catalog-grid">${projects.map((p, i) => `<a class="catalog-card" href="#${p.id}"><div class="catalog-art"><img src="${p.image}" alt="${escape(p.alt)}" loading="lazy"><span class="card-art-caption">${escape(p.caption)}</span><span class="card-index">0${i + 1} /</span><span class="card-arrow">↗</span></div><div class="catalog-copy"><span class="kicker">${escape(p.category)}</span><h3>${escape(p.title)}</h3><p>${escape(p.description)}</p><span class="card-status">${escape(p.status)}</span></div></a>`).join("")}</div></section>`;
}

function projectView(p) {
  const shot = currentShot(p),
    total = shotsFor(p).length;
  return `<div class="project-title"><div><p class="kicker">${escape(p.category)}</p><h2>${escape(p.title)}</h2></div><span class="status-tag">${escape(p.status)}</span></div><div class="project-detail"><div class="project-media"><button type="button" class="project-preview" data-preview="${p.id}" aria-label="Enlarge ${escape(p.title)} preview"><img id="project-shot" src="${shot.image}" alt="${escape(shot.alt)}"><span class="preview-label">ENLARGE ↗</span></button><div class="gallery-meta"><p class="tiny-note" id="shot-caption">${escape(shot.caption)}</p><div class="shot-controls"><button type="button" data-shot-step="-1" aria-label="Previous image" ${total < 2 ? "disabled" : ""}>←</button><span id="shot-counter" role="status">${(shotIndices.get(p.id) || 0) + 1} / ${total}</span><button type="button" data-shot-step="1" aria-label="Next image" ${total < 2 ? "disabled" : ""}>→</button></div></div></div><div class="project-copy">${prompt("read " + p.id)}<p>${escape(p.overview)}</p>${prompt("capabilities")}<ul class="feature-list">${p.features.map((x) => `<li>${escape(x)}</li>`).join("")}</ul><div class="tag-row">${p.tags.map((t) => `<span>${escape(t)}</span>`).join("")}</div>${prompt("status --honest")}<p class="tiny-note">${escape(p.progress)}</p>${p.source ? `<div class="inline-links">${external(p.source, "Repository")}${external(p.source + "#readme", "Setup & details")}</div>` : '<p class="tiny-note">Personal build / no public repository linked.</p>'}<p class="tiny-note evidence-note">Source: ${escape(p.evidence)}</p></div></div>`;
}

function changeShot(step) {
  const p = projects.find((p) => p.id === pages[state.index].id);
  if (!p) return;
  const shots = shotsFor(p);
  if (shots.length < 2) return;
  const index = wrap((shotIndices.get(p.id) || 0) + step, shots.length);
  shotIndices.set(p.id, index);
  const shot = shots[index];
  $("#project-shot").src = shot.image;
  $("#project-shot").alt = shot.alt;
  $("#shot-caption").textContent = shot.caption;
  $("#shot-counter").textContent = `${index + 1} / ${shots.length}`;
}

function stack() {
  const counts = languageCounts();
  const icons = {
    Python: "Py",
    CSS: "▨",
    HTML: "◇",
    JavaScript: "JS",
    QML: "Qt",
    Shell: "›_",
    Swift: "◈",
    Lua: "◐",
    PowerShell: "PS",
    Dockerfile: "▣",
  };
  const tools = [
    ["Git / GitHub", 5, "⎇"],
    ["Python", 4, "◈"],
    ["FastAPI", 2, "ϟ"],
    ["SQLite", 2, "▤"],
    ["Docker", 2, "▣"],
    ["SwiftUI", 1, "◈"],
    ["KiCad", 1, "⌗"],
    ["Quickshell", 1, "◉"],
    ["Hyprland", 1, "◫"],
  ];
  return `${prompt("stack --languages")}<div class="stack-list">${counts.map(([name, count]) => `<div class="language-row"><span class="lang-name"><span class="lang-icon">${icons[name] || "·"}</span>${name}</span><span class="language-bar" aria-hidden="true"><i style="--size:${(count / 4) * 100}%"></i></span><span class="lang-count"><b>${count}</b> ${count === 1 ? "repo" : "repos"}</span></div>`).join("")}</div><p class="tiny-note" style="margin-top:6px">Language presence, not proficiency. 5 project repos · ${snapshot.date}.</p>${prompt("stack --tools")}<div class="tools-grid">${tools.map(([name, count, icon]) => `<div><span><span class="tool-icon">${icon}</span>${name}</span><b>${count}</b></div>`).join("")}</div><p class="tiny-note" style="margin-top:5px">numbers: project repos with public source evidence</p>${prompt("stack --ai")}<div class="inline-links"><span>◈ NEXUS local-model client</span></div>${prompt("stack --site")}<div class="site-stack"><span>◇ HTML / CSS</span><span>index.html · styles.css</span><span>JS JavaScript</span><span>app.js · motion.js</span><span>⎇ GitHub Pages</span><span>free static hosting</span></div>${calendar()}`;
}

function interfaceCards() {
  return Object.entries(interfaces)
    .map(
      ([id, mode]) =>
        `<button type="button" class="interface-choice" data-view-choice="${id}" aria-pressed="${state.view === id}" aria-label="Use ${mode.name}"><span class="mode-preview preview-${id}" aria-hidden="true"><i></i><i></i><i></i><i></i><b>H/</b></span><span class="mode-copy"><small>INTERFACE ${mode.number}</small><strong>${mode.name}</strong><span>${mode.description}</span></span><span class="mode-check" aria-hidden="true">${state.view === id ? "●" : "↗"}</span></button>`,
    )
    .join("");
}
function themeView() {
  return `<section class="interface-page"><p class="kicker">PERSONALIZE YOUR FREQUENCY</p><h2>Two worlds.<br>One workbench.</h2><p>Switch the entire layout, not just the accent color. Your project, screenshot selection, and motion setting stay with you.</p><div class="interface-page-choices">${interfaceCards()}</div><p class="tiny-note">The header menu is always available. Your choice is remembered locally; nothing is sent to a server.</p></section>`;
}

function log() {
  const entries = [
    [
      "2026-10",
      "Ship useful tools",
      "MaintainerOS and CivicLens v0.3 are runnable local applications. Repository evidence, source-linked records, saved history, and exports. Included demo records are fictional.",
      "maintaineros",
    ],
    [
      "ON THE BENCH",
      "Robo Telescope",
      "Computer-entered sky coordinates used to drive the motors toward a target. Currently broken; repair comes before any new claims about performance.",
      "robo-telescope",
    ],
    [
      "DESIGN STAGE",
      "NEXUS Macro Pad",
      "PCB, CircuitPython firmware, and a six-key enclosure design. Physical assembly, fit, and testing are still pending.",
      "custom-keyboard",
    ],
    [
      "IN DEVELOPMENT",
      "Hyprland Forge",
      "A personal Arch / Hyprland desktop with Quickshell panels. Real hardware validation is still ahead.",
      "hyprland-forge",
    ],
    [
      "ONGOING",
      "Small computer, useful jobs",
      "The Raspberry Pi home lab brings together Pi-hole ad blocking, VPN, and Tailscale. Network credentials and live endpoints stay private.",
      "pi-homelab",
    ],
  ];
  return `${prompt("cat workbench.log")}<h2>Some shipped. Some still in pieces.</h2><p class="tiny-note">Current project notes, not an automated activity feed.</p><div class="log-list">${entries.map(([date, title, text, id]) => `<article class="log-entry"><time>${date}</time><h3><a href="#${id}">${title} ↗</a></h3><p>${text}</p></article>`).join("")}</div>`;
}

function setView(name, { url = true } = {}) {
  if (!validInterface(name)) return false;
  state.view = name;
  document.documentElement.dataset.view = name;
  $('meta[name="theme-color"]').content = interfaces[name].color;
  $("#interface-label").textContent = interfaces[name].name;
  $("#current-theme").textContent = "interface: " + interfaces[name].name;
  $("#hero-interface-name").textContent = interfaces[name].name.toUpperCase();
  $("#hero-interface-number").textContent = interfaces[name].number;
  $("#cyber-title").innerHTML =
    name === "neon"
      ? "BUILT OUTSIDE<br><span>THE LINES.</span>"
      : "KEEP BUILDING.<br><span>NO BRAKES.</span>";
  $("#hero-render-label").textContent =
    name === "neon"
      ? "ORIGINAL CONCEPT ART / FICTIONAL SCENE"
      : "ORIGINAL KEY ART / NOT A PORTRAIT";
  document.querySelectorAll("[data-view-choice]").forEach((button) => {
    const active = button.dataset.viewChoice === name;
    button.setAttribute("aria-pressed", String(active));
    button.querySelector(".mode-check").textContent = active ? "●" : "↗";
  });
  savePreference("view", name);
  if (url) {
    const next = interfaceURL(location.href, name);
    if (next.href !== location.href) history.pushState(null, "", next);
    if (state.index === 0) window.scrollTo({ top: 0, behavior: "instant" });
    else $("#terminal").scrollIntoView({ block: "start", behavior: "instant" });
  }
  effects?.refresh();
  return true;
}

function select(index, { hash = true, focus = false } = {}) {
  const next = wrap(index, pages.length),
    old = state.index;
  let delta = next - old;
  if (delta > pages.length / 2) delta -= pages.length;
  if (delta < -pages.length / 2) delta += pages.length;
  state.target += delta;
  state.index = next;
  const page = pages[next];
  if (hash && location.hash !== `#${page.id}`) location.hash = page.id;
  document.querySelectorAll(".wheel-item").forEach((button, i) => {
    button.classList.toggle("selected", i === next);
    button.setAttribute("aria-selected", String(i === next));
    button.tabIndex = i === next ? 0 : -1;
  });
  $("#wheel-track").setAttribute("aria-activedescendant", `page-${page.id}`);
  $("#position").textContent =
    `${String(next + 1).padStart(2, "0")} / ${pages.length}`;
  document.documentElement.dataset.page = page.id;
  $("#terminal-title").textContent =
    `ARCHIVE / ${page.label.replaceAll("/", "").toUpperCase()}`;
  document.title = `hirsu — ${page.label}`;
  const p = projects.find((p) => p.id === page.id);
  content.classList.toggle("stack-content", page.id === "stack");
  content.innerHTML = p
    ? projectView(p)
    : page.id === "stack"
      ? stack()
      : page.id === "themes"
        ? themeView()
        : page.id === "log"
          ? log()
          : about();
  $("#command-output").textContent = "";
  $("#terminal-scroll").scrollTop = 0;
  const navButton = $(`#page-${page.id}`);
  navButton.scrollIntoView({
    block: "nearest",
    inline: "nearest",
    behavior: "instant",
  });
  if (state.view === "neon" && next !== 0)
    $("#terminal").scrollIntoView({ block: "start", behavior: "instant" });
  if (focus) $(`#page-${page.id}`).focus({ preventScroll: true });
  effects?.refresh();
}

function route() {
  let raw;
  try {
    raw = decodeURIComponent(location.hash.slice(1)).replace(/^project-/, "");
  } catch {
    raw = "about";
  }
  if (raw === "terminal") {
    if (!content.children.length) select(0, { hash: false });
    $("#terminal").focus();
    return;
  }
  const aliases = {
    work: "about",
    bench: "log",
    "nexus-mobile": "nexus-ai",
    whoami: "about",
    overview: "about",
    interfaces: "themes",
  };
  const index = pages.findIndex((p) => p.id === (aliases[raw] || raw));
  const next = index < 0 ? 0 : index;
  if (next !== state.index || !content.children.length)
    select(next, { hash: false });
}

function toggle(kind, forced) {
  state[kind] = forced ?? !state[kind];
  const labels = {
    worm: ["awake", "asleep"],
    eye: ["tracking", "closed"],
    ghost: ["wandering", "idle"],
    motion: ["on", "off"],
  };
  const button = $(`#${kind}-toggle`);
  button.setAttribute("aria-pressed", String(state[kind]));
  button.querySelector("b").textContent = labels[kind][state[kind] ? 0 : 1];
  if (kind === "motion") {
    $("#menu-motion").setAttribute("aria-pressed", String(state.motion));
    $("#menu-motion span").textContent = state.motion ? "On" : "Off";
    document.documentElement.classList.toggle("motion-off", !state.motion);
    document.documentElement.classList.toggle("motion-on", state.motion);
    savePreference("motion", state.motion ? "on" : "off");
  }
  effects?.refresh();
}

function resolvePage(query) {
  const q = query.trim().toLowerCase().replace(/\/$/, "");
  if (/^\d+$/.test(q)) {
    const n = Number(q) - 1;
    return n >= 0 && n < pages.length ? n : -1;
  }
  return pages.findIndex(
    (p) =>
      p.id === q ||
      p.label.replace(/\/$/, "") === q ||
      projects.find((x) => x.id === p.id)?.title.toLowerCase() === q,
  );
}

function execute(command) {
  const [name = "", ...words] = command.trim().split(/\s+/);
  const arg = words.join(" "),
    lower = name.toLowerCase();
  const output = $("#command-output");
  const say = (text) => {
    output.textContent = `› ${command}\n${text}`;
  };
  if (!lower) return;
  if (lower === "help")
    say(
      "whoami · ls · open <name or 1–11> · stack · themes · workbench\nsearch <term> · view neon|blacksite\nmotion on|off · eye · worm · ghost · status · clear\n↑↓ browse projects outside this input; ↑↓ recall commands here.",
    );
  else if (lower === "ls")
    say(
      pages
        .map((p, i) => `${String(i + 1).padStart(2, "0")}  ${p.label}`)
        .join("\n"),
    );
  else if (
    ["whoami", "stack", "themes", "interfaces", "workbench", "log"].includes(
      lower,
    )
  ) {
    select(
      pages.findIndex(
        (p) =>
          p.id ===
          ({ whoami: "about", workbench: "log", interfaces: "themes" }[lower] ||
            lower),
      ),
    );
  } else if (["open", "cd"].includes(lower)) {
    const index = resolvePage(arg);
    if (index < 0) say("No matching page. Type ls for names.");
    else select(index);
  } else if (lower === "search") {
    const found = projects.filter((p) =>
      `${p.title} ${p.description} ${p.tags.join(" ")}`
        .toLowerCase()
        .includes(arg.toLowerCase()),
    );
    say(
      arg
        ? found.length
          ? found.map((p) => `${p.id} — ${p.title}`).join("\n")
          : "No projects match that search."
        : "Usage: search <term>",
    );
  } else if (lower === "theme" || lower === "view")
    say(
      setView(arg.toLowerCase())
        ? `Interface: ${interfaces[state.view].name}.`
        : "Choose: neon or blacksite. Or use the header menu.",
    );
  else if (["motion", "eye", "worm", "ghost"].includes(lower)) {
    if (arg && !["on", "off"].includes(arg)) say(`Usage: ${lower} [on|off]`);
    else {
      toggle(lower, arg ? arg === "on" : undefined);
      say(`${lower}: ${state[lower] ? "on" : "off"}`);
    }
  } else if (lower === "status")
    say(
      "7 projects / 5 public project repos / free GitHub Pages hosting\nTelescope: under repair. Macro pad: design stage. Forge: in development.\nNo live network connections. No visitor tracking.",
    );
  else if (lower === "clear") output.textContent = "";
  else
    say(
      `Unknown command: ${name}. Type help. This terminal only navigates the portfolio.`,
    );
  $("#command-form").scrollIntoView({
    block: "nearest",
    behavior: state.motion ? "smooth" : "instant",
  });
}

$("#command-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const command = input.value.trim();
  input.value = "";
  if (command) {
    commandHistory.push(command);
    if (commandHistory.length > 50) commandHistory.shift();
    historyIndex = commandHistory.length;
    execute(command);
  }
});
input.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp" || event.key === "ArrowDown") {
    event.preventDefault();
    historyIndex = Math.max(
      0,
      Math.min(
        commandHistory.length,
        historyIndex + (event.key === "ArrowUp" ? -1 : 1),
      ),
    );
    input.value = commandHistory[historyIndex] || "";
  }
  if (event.key === "Escape") {
    input.blur();
    $("#terminal").focus();
  }
});
$("#wheel-track").addEventListener("click", (event) => {
  const b = event.target.closest("[data-index]");
  if (b) select(Number(b.dataset.index));
});
$("#previous").addEventListener("click", () => select(state.index - 1));
$("#next").addEventListener("click", () => select(state.index + 1));
for (const kind of ["motion", "eye", "worm", "ghost"])
  $(`#${kind}-toggle`).addEventListener("click", () => toggle(kind));
$("#help-button").addEventListener("click", () =>
  $("#help-dialog").showModal(),
);
$("#close-help").addEventListener("click", () => $("#help-dialog").close());
$("#close-image").addEventListener("click", () => $("#image-dialog").close());
for (const dialog of document.querySelectorAll("dialog"))
  dialog.addEventListener("click", (e) => {
    if (e.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      dialog.close();
  });
content.addEventListener("click", (event) => {
  const step = event.target.closest("[data-shot-step]");
  if (step) changeShot(Number(step.dataset.shotStep));
  const choice = event.target.closest("[data-view-choice]");
  if (choice) setView(choice.dataset.viewChoice);
  const button = event.target.closest("[data-preview]");
  if (button) {
    const p = projects.find((p) => p.id === button.dataset.preview);
    const shot = currentShot(p);
    $("#large-image").src = shot.image;
    $("#large-image").alt = shot.alt;
    $("#large-caption").textContent = `${p.title} / ${shot.caption}`;
    $("#image-dialog").showModal();
  }
});

$("#interface-choices").innerHTML = interfaceCards();
$("#interface-toggle").addEventListener("click", () => {
  $("#interface-menu").showModal();
  $("#interface-toggle").setAttribute("aria-expanded", "true");
});
$("#close-interface").addEventListener("click", () =>
  $("#interface-menu").close(),
);
$("#menu-motion").addEventListener("click", () => toggle("motion"));
$("#interface-menu").addEventListener("close", () =>
  $("#interface-toggle").setAttribute("aria-expanded", "false"),
);
$("#interface-choices").addEventListener("click", (event) => {
  const button = event.target.closest("[data-view-choice]");
  if (button) {
    setView(button.dataset.viewChoice);
    $("#interface-menu").close();
  }
});

let echoTimer;
window.addEventListener("keydown", (event) => {
  if (document.querySelector("dialog[open]")) return;
  const editing = event.target.matches(
    "input,textarea,select,[contenteditable=true]",
  );
  if (editing || event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    changeShot(event.key === "ArrowLeft" ? -1 : 1);
  }
  if (event.key === ":") {
    event.preventDefault();
    input.focus();
    input.scrollIntoView({ block: "nearest" });
    return;
  }
  if (["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
    event.preventDefault();
    select(
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? pages.length - 1
          : state.index + (event.key === "ArrowDown" ? 1 : -1),
      { focus: true },
    );
  }
  if (event.key === "Enter" && event.target.closest("#wheel")) {
    event.preventDefault();
    $("#terminal").focus();
  }
  $("#key-echo").textContent = `key: ${event.key}`;
  $(".keyboard-echo").classList.add("active");
  clearTimeout(echoTimer);
  echoTimer = setTimeout(
    () => $(".keyboard-echo").classList.remove("active"),
    600,
  );
});
media.addEventListener("change", () => {
  if (media.matches) toggle("motion", false);
});
window.addEventListener("hashchange", route);
setView(initialView, { url: false });
window.addEventListener("popstate", () => {
  setView(interfaceFromSearch(location.search, initialView), { url: false });
  route();
});
route();
toggle("motion", state.motion);
effects = createEffects(state);
effects.refresh();
const started = Date.now();
setInterval(() => {
  const seconds = Math.floor((Date.now() - started) / 1000);
  $("#session-time").textContent =
    `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}, 1000);
