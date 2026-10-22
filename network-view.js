import { skyObjects } from "./sky-model.js?v=17";
import { projects } from "./projects.js?v=8";
import { escapeHTML as esc } from "./console-model.js?v=15";
export const networkLinks = [
  ["maintaineros", "civiclens", "Python · FastAPI · SQLite"],
  ["civiclens", "hyprland-forge", "Python tooling"],
  ["hyprland-forge", "custom-keyboard", "Personal computing experiments"],
  ["custom-keyboard", "robo-telescope", "Physical electronics"],
  ["robo-telescope", "pi-homelab", "Hardware experiments"],
  ["pi-homelab", "nexus-ai", "Home-service interfaces"],
  ["nexus-ai", "maintaineros", "Software interfaces"],
];
export function networkInspector(index = -1) {
  const p = projects[index];
  if (!p)
    return `<div><p class="eyebrow">STAR ATLAS / 07 CONSTELLATIONS</p><h3>Every build leaves a light.</h3><p>Choose a constellation to drift toward it. Each bright star represents a project; its neighboring stars form a small, original pattern.</p></div><div><p class="eyebrow">ILLUSTRATED NIGHT SKY</p><p>An imaginary sky for real projects—not astronomical coordinates or live telemetry. The thin links between constellations describe shared tools and related work.</p><a href="#lab">Explore my Build Lab ↗</a></div>`;
  const neighbors = networkLinks
    .filter(([a, b]) => a === p.id || b === p.id)
    .map(([a, b, why]) => ({
      project: projects.find((item) => item.id === (a === p.id ? b : a)),
      why,
    }));
  return `<div><p class="eyebrow">CONSTELLATION / ${esc(p.status)}</p><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p><p>${p.tags.map(esc).join(" / ")}</p><a href="#${p.id}">Open project file ↗</a></div><div><p class="eyebrow">RELATED WORK / ${neighbors.length} LINKS</p><div class="network-connections">${neighbors.map(({ project, why }) => `<div><a href="#${project.id}">${esc(project.title)} ↗</a><span>${esc(why)}</span></div>`).join("")}</div></div>`;
}
export function networkContent() {
  return `<section class="network-shell sky-shell" id="network-shell" aria-label="Interactive night-sky constellations">
    <div class="network-toolbar"><span>AFTER DARK <b>/</b> PROJECT ATLAS</span><div aria-label="Sky display"><button data-sky-control data-network-mode="atlas" aria-pressed="true">CONSTELLATIONS</button><button data-sky-control data-network-mode="ambient" aria-pressed="false">STARFIELD</button></div></div>
    <div class="sky-layout"><div class="network-viewport"><div class="sky-caption" aria-hidden="true"><span>07 LIGHTS / ONE WORKBENCH</span><b>Look a little closer.</b></div><canvas tabindex="0" aria-label="Illustrated night sky with seven project constellations. Drag or use arrow keys to pan. Plus and minus zoom. Select a bright star or use the project buttons beside the sky. Home resets the view."></canvas><span class="sky-horizon" aria-hidden="true">AN ORIGINAL SKY / NOT ASTRONOMY DATA</span><p class="sky-fallback">The animated sky is unavailable. Choose a project from the constellation index; all project details still work.</p></div>
    <nav class="sky-sidebar" aria-label="Constellation index"><p>FOLLOW A CONSTELLATION <span>↓</span></p><div class="network-labels">${skyObjects
      .map((object, i) => {
        const p = projects.find((p) => p.id === object.id);
        return `<button class="network-node" data-node-index="${i}" aria-pressed="false" aria-controls="sky-inspector" aria-label="Inspect ${esc(p.title)} constellation"><span>${String(i + 1).padStart(2, "0")}</span><b>${esc(p.title)}</b><small>${esc(p.status)}</small><i aria-hidden="true">↗</i></button>`;
      })
      .join(
        "",
      )}</div><div class="sky-sidebar-note"><span class="network-state">NIGHT SKY / ACTIVE</span><p>Choose a star.<br />Find the story behind it.</p></div></nav></div>
    <div class="network-controls"><button data-sky-control id="sky-pause" aria-pressed="false">Pause sky</button><button data-sky-control id="network-reset">Reset view</button><div class="zoom-buttons" aria-label="Sky zoom"><button data-sky-control data-zoom="-1" aria-label="Zoom out">−</button><button data-sky-control data-zoom="1" aria-label="Zoom in">+</button></div><span>DRAG TO EXPLORE / ARROWS TO PAN</span><div class="quality" aria-label="Star density">${[
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
  </section><p class="network-legend">Select a bright star or a project name. Drag to pan; + / − to zoom; Reset to see the whole sky. Wheel zoom requires canvas focus on this dedicated page. Normal page scrolling stays available.</p><nav class="network-index" aria-label="Accessible project list">${projects.map((p) => `<a href="#${p.id}">${esc(p.title)}<span>${esc(p.status)} →</span></a>`).join("")}</nav>`;
}
