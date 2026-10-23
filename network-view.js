import { relatedHubs } from "./atlas-model.js?v=23";
import { skyObjects } from "./sky-model.js?v=23";
import { projects } from "./projects.js?v=23";
import { escapeHTML as esc } from "./console-model.js?v=23";
export const networkLinks = [
  ["maintaineros", "civiclens", "Python · FastAPI · SQLite"],
  ["civiclens", "hyprland-forge", "Python tooling"],
  ["hyprland-forge", "custom-keyboard", "Personal computing experiments"],
  ["custom-keyboard", "robo-telescope", "Physical electronics"],
  ["robo-telescope", "pi-homelab", "Hardware experiments"],
  ["pi-homelab", "nexus-ai", "Home-service interfaces"],
  ["nexus-ai", "maintaineros", "Software interfaces"],
  [
    "robo-telescope",
    "observatory-planner",
    "Observing sessions and approximate sky geometry",
  ],
  [
    "robo-telescope",
    "coordinate-motor-simulator",
    "Computer coordinates to simulated mount movement",
  ],
  [
    "pi-homelab",
    "homelab-health",
    "Private service health and synthetic public demo",
  ],
  [
    "pi-homelab",
    "network-privacy-auditor",
    "Pi-hole data and aggregate-only reports",
  ],
  [
    "robo-telescope",
    "accessible-star-map",
    "Astronomy with an equivalent text workflow",
  ],
  [
    "custom-keyboard",
    "repair-parts-tracker",
    "Electronics, parts and repair records",
  ],
  [
    "hyprland-forge",
    "offline-project-notebook",
    "Project notes and local tools",
  ],
];
export function networkInspector(index = -1) {
  const p = projects[index];
  if (!p)
    return `<div><p class="eyebrow">STAR ATLAS / ${projects.length} CONSTELLATIONS</p><h3>Every build leaves a light.</h3><p>Orbit a three-dimensional web of my projects. Bright stars are builds; smaller labeled nodes are shared languages, tools and services. Choose a project to trace its connections.</p></div><div><p class="eyebrow">3D PROJECT UNIVERSE</p><p>A depth-filled, original night sky—not astronomical coordinates or live telemetry. Warm nodes mark language families; cool nodes mark tools and services. Physical builds is a related-work theme, not a shared coding language.</p><a href="#lab">Explore my Build Lab ↗</a></div>`;
  const neighbors = networkLinks
    .filter(([a, b]) => a === p.id || b === p.id)
    .map(([a, b, why]) => ({
      project: projects.find((item) => item.id === (a === p.id ? b : a)),
      why,
    }));
  return `<div><p class="eyebrow">CONSTELLATION / ${esc(p.status)}</p><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p><p>${p.tags.map(esc).join(" / ")}</p><div class="atlas-shared"><b>SHARED NODES</b>${relatedHubs(
    p.id,
  )
    .map(
      (h) =>
        `<p><strong>${esc(h.label)}</strong> — ${esc(h.why)}<br />${h.members
          .filter((id) => id !== p.id)
          .map(
            (id) =>
              `<a href="#${id}">${esc(projects.find((p) => p.id === id).title)}</a>`,
          )
          .join(" · ")}</p>`,
    )
    .join(
      "",
    )}</div><a href="#${p.id}">Open project file ↗</a></div><div><p class="eyebrow">RELATED WORK / ${neighbors.length} LINKS</p><div class="network-connections">${neighbors.map(({ project, why }) => `<div><a href="#${project.id}">${esc(project.title)} ↗</a><span>${esc(why)}</span></div>`).join("")}</div></div>`;
}
export function networkContent() {
  return `<section class="network-shell sky-shell" id="network-shell" aria-label="Interactive night-sky constellations">
    <div class="network-toolbar"><span>AFTER DARK <b>/</b> PROJECT ATLAS</span><div aria-label="Sky display"><button data-sky-control data-network-mode="atlas" aria-pressed="true">3D CONNECTIONS</button><button data-sky-control data-network-mode="ambient" aria-pressed="false">STARFIELD</button></div></div>
    <div class="atlas-filter-row"><label for="atlas-filter">Trace a connection</label><select id="atlas-filter"><option value="all">All connections</option><option value="language">Coding languages</option><option value="stack">Tools &amp; services</option><option value="theme">Related work themes</option></select><span>WARM / LANGUAGES &nbsp; COOL / TOOLS</span></div><div class="sky-layout"><div class="network-viewport"><div class="sky-caption" aria-hidden="true"><span>${projects.length} LIGHTS / ONE WORKBENCH</span><b>Different builds. Shared DNA.</b></div><canvas tabindex="0" aria-label="Three-dimensional night sky with ${projects.length} project constellations and shared technology nodes. Drag or use arrow keys to orbit. Plus and minus zoom. Select a bright star or use the project buttons beside the sky. Home resets the view."></canvas><span class="sky-horizon" aria-hidden="true">AN ORIGINAL SKY / NOT ASTRONOMY DATA</span><p class="sky-fallback">The animated sky is unavailable. Choose a project from the constellation index; all project details still work.</p></div>
    <nav class="sky-sidebar" aria-label="Constellation index"><label class="sky-index-search">Search project names<input id="atlas-index-search" type="search" maxlength="100" placeholder="Name, language, tool…" /></label><p class="sky-search-status" role="status"></p><p>FOLLOW A CONSTELLATION <span>↓</span></p><div class="network-labels">${skyObjects
      .map((object, i) => {
        const p = projects.find((p) => p.id === object.id);
        return `<button class="network-node" data-node-index="${i}" aria-pressed="false" aria-controls="sky-inspector" aria-label="Inspect ${esc(p.title)} constellation"><span>${String(i + 1).padStart(2, "0")}</span><b>${esc(p.title)}</b><small>${esc(p.status)}</small><i aria-hidden="true">↗</i></button>`;
      })
      .join(
        "",
      )}</div><div class="sky-sidebar-note"><span class="network-state">NIGHT SKY / ACTIVE</span><p>Choose a star.<br />Find the story behind it.</p></div></nav></div>
    <div class="network-controls"><button data-sky-control id="sky-pause" aria-pressed="false">Pause sky</button><button data-sky-control id="network-reset">Reset view</button><div class="zoom-buttons" aria-label="Sky zoom"><button data-sky-control data-zoom="-1" aria-label="Zoom out">−</button><button data-sky-control data-zoom="1" aria-label="Zoom in">+</button></div><span>DRAG TO ORBIT / ARROWS TO ROTATE</span><div class="quality" aria-label="Star density">${[
      [8, "LOW"],
      [14, "MID"],
      [22, "RICH"],
    ]
      .map(
        ([q, label]) =>
          `<button data-sky-control data-quality="${q}" aria-pressed="${q === 14}" aria-label="${label.toLowerCase()} star density">${label}</button>`,
      )
      .join("")}</div></div>
    <section id="sky-inspector" class="network-inspector" aria-label="Selected constellation details" aria-live="polite">${networkInspector()}</section>
  </section><p class="network-legend">Select a bright star or a project name. Drag to orbit in 3D; + / − to zoom; Reset to see the whole sky. Wheel zoom requires canvas focus on this dedicated page. Normal page scrolling stays available.</p><nav class="network-index" aria-label="Accessible project list">${projects.map((p) => `<a href="#${p.id}">${esc(p.title)}<span>${esc(p.status)} →</span></a>`).join("")}</nav>`;
}
