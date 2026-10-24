import { projects } from "./projects.js?v=23";
import { escapeHTML as esc } from "./console-model.js?v=23";

export const terminalIds = [
  "maintaineros",
  "civiclens",
  "custom-keyboard",
  "robo-telescope",
  "pi-homelab",
  "nexus-ai",
  "hyprland-forge",
  ...projects.filter((p) => p.demo).map((p) => p.id),
];
export function terminalProject(id) {
  const project = projects.find((p) => p.id === id);
  if (!project || !terminalIds.includes(id)) return "";
  return `<figure class="terminal-image"><img src="${project.image}" width="1200" height="750" alt="${esc(project.alt)}" decoding="async" /><figcaption>${esc(project.caption)}</figcaption></figure><div class="terminal-details"><p class="terminal-category">${esc(project.category)}</p><h2>${esc(project.title)}</h2><p class="terminal-description">${esc(project.description)}</p><div class="terminal-facts"><span>STATE</span><strong class="${project.statusClass || ""}">${esc(project.status)}</strong><span>TOOLS</span><strong>${project.tags.map(esc).join(" / ")}</strong></div><div class="terminal-links"><a class="od-button" href="#${id}">OPEN FILE <span>↗</span></a>${project.source ? `<a class="terminal-source" href="${esc(project.source)}" target="_blank" rel="noopener noreferrer">SOURCE CODE ↗</a>` : `<span class="terminal-source">PERSONAL BUILD / NO PUBLIC REPO</span>`}</div></div>`;
}
export function projectTerminal() {
  return `<section class="project-terminal od-enter" aria-label="Interactive project directory"><div class="terminal-toolbar"><span><i aria-hidden="true"></i> PROJECT DIRECTORY</span><span>SELECT A FILE TO INSPECT</span><b id="terminal-position">01 / ${terminalIds.length}</b></div><div class="terminal-layout"><div class="terminal-tabs" role="tablist" aria-label="Project files" aria-orientation="vertical">${terminalIds
    .map((id, i) => {
      const p = projects.find((item) => item.id === id);
      return `<button id="terminal-tab-${id}" role="tab" aria-selected="${i === 0}" aria-controls="terminal-preview" tabindex="${i === 0 ? 0 : -1}" data-terminal-project="${id}"><span>${String(i + 1).padStart(2, "0")}</span><b>${esc(p.title)}</b><i aria-hidden="true">↗</i></button>`;
    })
    .join(
      "",
    )}</div><div id="terminal-preview" role="tabpanel" tabindex="0" aria-labelledby="terminal-tab-${terminalIds[0]}">${terminalProject(terminalIds[0])}</div></div><div class="terminal-footnote"><span>↑ ↓ SELECT / TAB TO OPEN FILE</span><span>LOCAL ARCHIVE · NO LIVE DEVICE CONNECTION</span></div></section>`;
}

export function mountProjectTerminal(container, animate = () => {}) {
  if (!container) return;
  const tabs = [...container.querySelectorAll("[role=tab]")];
  const panel = container.querySelector("#terminal-preview");
  const counter = container.querySelector("#terminal-position");
  function select(button, focus = false) {
    if (!tabs.includes(button)) return;
    if (focus) button.focus();
    if (button.getAttribute("aria-selected") === "true") return;
    tabs.forEach((tab) => {
      const selected = tab === button;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    panel.innerHTML = terminalProject(button.dataset.terminalProject);
    panel.setAttribute("aria-labelledby", button.id);
    counter.textContent = `${String(tabs.indexOf(button) + 1).padStart(2, "0")} / ${terminalIds.length}`;
    animate(
      panel,
      [
        {
          opacity: 0.3,
          transform: "translateX(9px)",
          clipPath: "inset(0 0 10% 0)",
        },
        { opacity: 1, transform: "translateX(0)", clipPath: "inset(0)" },
      ],
      430,
    );
  }
  container.addEventListener("click", (event) => {
    const button = event.target.closest("[role=tab]");
    if (button) select(button);
  });
  container.addEventListener("keydown", (event) => {
    const button = event.target.closest("[role=tab]");
    const at = tabs.indexOf(button);
    if (at < 0 || !["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key))
      return;
    event.preventDefault();
    event.stopPropagation();
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? tabs.length - 1
          : (at + (event.key === "ArrowDown" ? 1 : -1) + tabs.length) %
            tabs.length;
    select(tabs[next], true);
  });
}
