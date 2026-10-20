import { projects } from "./projects.js?v=2";
import { snapshot, languageCounts, calendarDays } from "./stack-data.js";
import { createEffects, wrap } from "./motion.js";

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
    /* Private browsing can disable storage. */
  }
};
const themes = {
  bone: {
    description: "ink, bone & a little rose",
    colors: ["#0b0c0a", "#d3d0b9", "#93917f", "#db6e88", "#90ada0"],
  },
  phosphor: {
    description: "a green-screen kind of night",
    colors: ["#07100b", "#c5e8c1", "#84a688", "#8fe28b", "#add7bf"],
  },
  amber: {
    description: "warm light, late-night builds",
    colors: ["#100d09", "#e2d1b0", "#ae9472", "#e3a854", "#cdb57a"],
  },
  violet: {
    description: "quiet ultraviolet",
    colors: ["#0e0c13", "#dbd0e4", "#a193b0", "#c292dc", "#a6b0d4"],
  },
};
const pages = [
  { id: "about", label: "whoami", art: "monogram-art", html: "h⌁" },
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
    label: "themes/",
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
  motion: readPreference("motion", media.matches ? "off" : "on") === "on",
  eye: true,
  worm: false,
  ghost: false,
};
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
      `<button type="button" class="wheel-item" id="page-${p.id}" role="option" aria-selected="false" aria-label="${escape(p.label)}" tabindex="-1" data-index="${i}">${p.image ? `<img src="${p.image}" alt="" decoding="async" draggable="false" />` : `<span class="nav-art ${p.art}" aria-hidden="true">${p.html}</span>`}<span class="wheel-caption" aria-hidden="true">${escape(p.label)}</span></button>`,
  )
  .join("");

function calendar() {
  const days = calendarDays();
  const total = Object.values(snapshot.commits).reduce((a, b) => a + b, 0);
  return `${prompt("git log --public --since=2026-04-20")}<p class="tiny-note">// ${total} public commits · 6 repositories · snapshot ${snapshot.date}</p><div class="calendar-wrap"><div class="calendar-head"><span>APR</span><span>MAY</span><span>JUN</span><span>JUL</span><span>AUG</span><span>SEP</span><span>OCT</span></div><div class="calendar" role="img" aria-label="Public commit snapshot: ${total} authored commits, April through October 20, 2026. Most activity is in October.">${days.map((d) => `<span class="day" data-level="${d.count > 15 ? 4 : d.count > 5 ? 3 : d.count > 1 ? 2 : d.count ? 1 : 0}" title="${d.date}: ${d.count} public commits" ${d.future ? 'style="opacity:0"' : ""}></span>`).join("")}</div><div class="calendar-legend">none ${["var(--grid)", "var(--faint)", "var(--muted)", "var(--fg)", "var(--accent)"].map((c) => `<i style="--swatch:${c}"></i>`).join("")} more</div></div><p class="tiny-note" style="margin-top:9px">Default-branch commits authored as hrushikbarani-hub, not a live contributions count. <a href="${github}?tab=repositories" target="_blank" rel="noopener noreferrer">Public sources ↗</a></p>`;
}

function about() {
  return `<div class="blueprint"><div class="blueprint-top"><span>H / EXPERIMENTS IN MOTION</span><span>section A—A</span></div><canvas id="blueprint-canvas" aria-hidden="true"></canvas><div class="blueprint-tags"><span>SOFTWARE</span><span>CIRCUITS</span><span>CURIOSITY →</span></div><span class="blueprint-label">seven projects · one curious mind</span></div>${prompt("whoami")}<p class="intro-copy">Hi, I'm <strong>Hrushi</strong>. I build useful software, tinker with electronics, and occasionally convince a telescope to move.<br>Python, Raspberry Pis, personal AI, and a desktop that feels like mine. This is the workbench.</p>${prompt("fetch hrushikbarani-hub")}<dl class="metrics"><dt>projects</dt><dd><b>7</b> software + hardware</dd><dt>public repos</dt><dd><b>5</b> project repositories</dd><dt>home lab</dt><dd>Pi-hole · VPN · Tailscale</dd><dt>on the bench</dt><dd>Robo Telescope <span class="dim">/ under repair</span></dd></dl>${prompt("ls links/")}<div class="inline-links">${external(github, "github")}<a href="#stack">stack/</a><a href="#log">workbench/</a>${external(`${github}/hrushikbarani-hub.github.io`, "site source")}</div>`;
}

function projectView(p) {
  const shot = currentShot(p),
    total = shotsFor(p).length;
  return `<div class="project-title"><h2>${escape(p.title)}</h2><span class="status-tag">${escape(p.status)}</span></div><button type="button" class="project-preview" data-preview="${p.id}" aria-label="Enlarge ${escape(p.title)} preview"><img id="project-shot" src="${shot.image}" alt="${escape(shot.alt)}" /><span class="preview-label">view large ↗</span></button><div class="gallery-meta"><p class="tiny-note" id="shot-caption">${escape(shot.caption)}</p><div class="shot-controls"><button type="button" data-shot-step="-1" aria-label="Previous image" ${total < 2 ? "disabled" : ""}>←</button><span id="shot-counter" role="status">${(shotIndices.get(p.id) || 0) + 1} / ${total}</span><button type="button" data-shot-step="1" aria-label="Next image" ${total < 2 ? "disabled" : ""}>→</button></div></div>${prompt(`cat ${p.id}/README.md`)}<p>${escape(p.overview)}</p>${prompt("ls features/")}<ul class="feature-list">${p.features.map((x) => `<li>${escape(x)}</li>`).join("")}</ul><div class="tag-row">${p.tags.map((t) => `<span>${escape(t)}</span>`).join("")}</div>${prompt("status --honest")}<p class="tiny-note">${escape(p.progress)}</p>${p.source ? `${prompt("open source/")}<div class="inline-links">${external(p.source, "repository")}${external(`${p.source}#readme`, "setup & details")}</div>` : '<p class="tiny-note">Personal build · no public repository linked.</p>'}<p class="tiny-note evidence-note">Source: ${escape(p.evidence)}</p>`;
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
  return `${prompt("stack --languages")}<div class="stack-list">${counts.map(([name, count]) => `<div class="language-row"><span class="lang-name"><span class="lang-icon">${icons[name] || "·"}</span>${name}</span><span class="language-bar" aria-hidden="true"><i style="--size:${(count / 4) * 100}%"></i></span><span class="lang-count"><b>${count}</b> ${count === 1 ? "repo" : "repos"}</span></div>`).join("")}</div><p class="tiny-note" style="margin-top:6px">Language presence, not proficiency. 5 project repos · ${snapshot.date}.</p>${prompt("stack --tools")}<div class="tools-grid">${tools.map(([name, count, icon]) => `<div><span><span class="tool-icon">${icon}</span>${name}</span><b>${count}</b></div>`).join("")}</div><p class="tiny-note" style="margin-top:5px">numbers: project repos with public source evidence</p>${prompt("stack --ai")}<div class="inline-links"><span>⌘ Codex</span><span>◈ NEXUS local-model client</span></div><p class="tiny-note" style="margin-top:5px">AI-assisted building + experiments with existing models. Not a claim of training a foundation model.</p>${prompt("stack --site")}<div class="site-stack"><span>◇ HTML / CSS</span><span>index.html · styles.css</span><span>JS JavaScript</span><span>app.js · motion.js</span><span>⎇ GitHub Pages</span><span>free static hosting</span></div>${calendar()}`;
}

function themeView() {
  return `${prompt("ls themes/")}<h2>Four palettes. Same little corner of the internet.</h2><p class="tiny-note">Choose one to recolor the entire site, including the live graphics. Saved only in your browser.</p><div class="theme-grid">${Object.entries(
    themes,
  )
    .map(
      ([name, t]) =>
        `<button class="theme-card" type="button" data-theme-choice="${name}" aria-pressed="${document.documentElement.dataset.theme === name}" aria-label="Use ${name} theme"><div class="theme-preview" style="${["bg", "fg", "muted", "accent", "link"].map((s, i) => `--theme-${s}:${t.colors[i]}`).join(";")}"><span>hirsu@workshop ~</span><br>› theme ${name}<br><span class="preview-accent">████████ ░░░░░░</span><br>make something useful_</div><div class="theme-caption"><span>${name}</span><span>apply ↵</span></div></button>`,
    )
    .join(
      "",
    )}</div>${prompt("cat preferences")}<p class="tiny-note">bone / ink, olive and rose<br>phosphor / a green-screen kind of night<br>amber / warm light, late-night builds<br>violet / quiet ultraviolet</p><p class="tiny-note">Motion can be paused from the footer. Your system's reduced-motion preference is respected by default.</p>`;
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

function setTheme(name) {
  if (!Object.hasOwn(themes, name)) return false;
  document.documentElement.dataset.theme = name;
  $('meta[name="theme-color"]').content = themes[name].colors[0];
  $("#current-theme").textContent = `palette: ${name}`;
  savePreference("theme", name);
  document
    .querySelectorAll("[data-theme-choice]")
    .forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.themeChoice === name)),
    );
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
  $("#terminal-title").textContent = `fish — ~ · ${page.label}`;
  document.title = `hirsu — ${page.label}`;
  const p = projects.find((p) => p.id === page.id);
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
  if (matchMedia("(max-width: 640px)").matches) {
    const b = $(`#page-${page.id}`);
    $("#wheel-track").scrollTo({
      left: b.offsetLeft,
      behavior: state.motion ? "smooth" : "instant",
    });
  }
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
      "whoami · ls · open <name or 1–11> · stack · themes · workbench\nsearch <term> · theme bone|phosphor|amber|violet\nmotion on|off · eye · worm · ghost · status · clear\n↑↓ browse projects outside this input; ↑↓ recall commands here.",
    );
  else if (lower === "ls")
    say(
      pages
        .map((p, i) => `${String(i + 1).padStart(2, "0")}  ${p.label}`)
        .join("\n"),
    );
  else if (["whoami", "stack", "themes", "workbench", "log"].includes(lower)) {
    select(
      pages.findIndex(
        (p) => p.id === ({ whoami: "about", workbench: "log" }[lower] || lower),
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
  } else if (lower === "theme")
    say(
      setTheme(arg.toLowerCase())
        ? `Applied ${arg}.`
        : "Choose: bone, phosphor, amber, violet.",
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
  if (dragged) return;
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
  const theme = event.target.closest("[data-theme-choice]");
  if (theme) setTheme(theme.dataset.themeChoice);
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

let wheelAccum = 0,
  lastWheel = 0,
  dragStart = null,
  dragged = false;
$("#wheel").addEventListener(
  "wheel",
  (event) => {
    if (matchMedia("(max-width:640px)").matches) return;
    event.preventDefault();
    const now = performance.now();
    if (now - lastWheel > 180) wheelAccum = 0;
    wheelAccum += event.deltaY;
    if (Math.abs(wheelAccum) > 45 && now - lastWheel > 130) {
      select(state.index + Math.sign(wheelAccum));
      wheelAccum = 0;
      lastWheel = now;
    }
  },
  { passive: false },
);
$("#wheel-track").addEventListener("pointerdown", (e) => {
  if (e.button !== 0 || matchMedia("(max-width:640px)").matches) return;
  dragStart = { y: e.clientY, index: state.index, pointer: e.pointerId };
  dragged = false;
});
window.addEventListener("pointermove", (e) => {
  if (!dragStart) return;
  const diff = dragStart.y - e.clientY;
  if (Math.abs(diff) > 12) {
    dragged = true;
    const next = wrap(dragStart.index + Math.round(diff / 80), pages.length);
    if (next !== state.index) select(next);
  }
});
window.addEventListener("pointerup", () => {
  dragStart = null;
  setTimeout(() => {
    dragged = false;
  }, 0);
});
window.addEventListener("pointercancel", () => {
  dragStart = null;
  dragged = false;
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
setTheme(readPreference("theme", "bone"));
route();
toggle("motion", state.motion);
effects = createEffects(state, pages.length);
effects.refresh();
const started = Date.now();
setInterval(() => {
  const seconds = Math.floor((Date.now() - started) / 1000);
  $("#session-time").textContent =
    `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}, 1000);
