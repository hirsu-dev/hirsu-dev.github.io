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
    return `<div><p class="eyebrow">NODE INSPECTOR / READY</p><h3>Find the shared thread.</h3><p>Select a project label to lock onto its node. Inspect the tools and connections below, then open its full project file.</p></div><div><p class="eyebrow">ORBITAL MODEL / 07 NODES</p><p>This is a conceptual map, not a geographical globe or a scan of the home network. Links describe related work, not live connections.</p><a href="#lab">Explore the Signal Lab ↗</a></div>`;
  const neighbors = networkLinks
    .filter(([a, b]) => a === p.id || b === p.id)
    .map(([a, b, why]) => ({
      project: projects.find((item) => item.id === (a === p.id ? b : a)),
      why,
    }));
  return `<div><p class="eyebrow">NODE LOCK / ${esc(p.status)}</p><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p><p>${p.tags.map(esc).join(" / ")}</p><a href="#${p.id}">Open project file ↗</a></div><div><p class="eyebrow">RELATED WORK / ${neighbors.length} LINKS</p><div class="network-connections">${neighbors.map(({ project, why }) => `<div><a href="#${project.id}">${esc(project.title)} ↗</a><span>${esc(why)}</span></div>`).join("")}</div></div>`;
}
export function networkContent() {
  return `<section class="network-shell" id="network-shell" aria-label="Interactive project network"><div class="network-toolbar"><span>PROJECT CONSTELLATION / V.02</span><div aria-label="Globe display"><button data-network-mode="orbital" aria-pressed="true">ORBITAL</button><button data-network-mode="minimal" aria-pressed="false">CONNECTIONS</button></div></div><div class="network-viewport"><canvas tabindex="0" aria-label="Conceptual project sphere. Drag horizontally or use arrow keys to rotate; plus and minus to zoom. Select project labels to inspect connections."></canvas><div class="network-crosshair" aria-hidden="true"></div><span class="network-meta"><span class="network-state">ORBIT / ACTIVE</span>07 PROJECT NODES<br />CONCEPTUAL MAP<br />NOT LIVE TELEMETRY</span><div class="network-labels">${projects.map((p, i) => `<button class="network-node" data-node-index="${i}" aria-pressed="false" aria-label="Inspect ${esc(p.title)} connections">${esc(p.title)}</button>`).join("")}</div></div><div class="network-controls"><button id="spin-button" aria-pressed="true">[ Pause rotation ]</button><button id="network-reset">[ Reset / unlock ]</button><div class="zoom-buttons" aria-label="Zoom"><button data-zoom="-1" aria-label="Zoom out">−</button><button data-zoom="1" aria-label="Zoom in">+</button></div><span>DRAG / ← ↑ ↓ →</span><div class="quality" aria-label="Wireframe detail">${[
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
    )}</div></div><section class="network-inspector" aria-label="Selected project details" aria-live="polite">${networkInspector()}</section></section><p class="network-legend">Select a label to inspect. Drag horizontally to orbit; + / − to zoom. Reset releases a node lock. Wheel zoom works only on the dedicated network page with the canvas focused. Touch scrolling stays available on the homepage.</p><nav class="network-index" aria-label="Accessible project list">${projects.map((p) => `<a href="#${p.id}">${esc(p.title)}<span>${esc(p.status)} →</span></a>`).join("")}</nav>`;
}
