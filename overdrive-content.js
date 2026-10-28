import { projects } from "./projects.js?v=24";
import { escapeHTML as esc } from "./console-model.js?v=24";
import { cityPhoto, photoCredit } from "./photo.js?v=11";
import { projectTerminal } from "./project-terminal.js?v=24";
import { recentWork } from "./discovery.js?v=24";

export const overdriveSections = [
  "od-recent",
  "od-projects",
  "od-network",
  "od-stack",
  "od-workbench",
];
export function overdriveHome(network) {
  const order = [
    "maintaineros",
    "civiclens",
    "custom-keyboard",
    "robo-telescope",
    "pi-homelab",
    "nexus-ai",
    "hyprland-forge",
    ...projects.filter((p) => p.demo).map((p) => p.id),
  ];
  return `<div class="overdrive-home">
    <section class="od-hero" aria-labelledby="od-title">
      <div class="od-hero-art" aria-hidden="true"><img src="${cityPhoto.src}" srcset="${cityPhoto.srcset}" sizes="100vw" alt="" width="3888" height="2592" fetchpriority="high" /></div>
      <div class="od-grid" aria-hidden="true"></div>
      <div class="hud-image-slices" aria-hidden="true"><img src="${cityPhoto.src}" srcset="${cityPhoto.srcset}" sizes="100vw" alt="" width="3888" height="2592" /></div>
      <div class="hud-frame" aria-hidden="true"><span>OVR_DRIVE // WORKBENCH_OS.11</span><span>PERSONAL ARCHIVE / MANUAL CONTROL</span><i></i><b>+<br />+<br />+<br />+</b></div>
      <div class="terminal-banner">
      <div class="od-hero-copy">
        <p class="od-kicker od-enter"><i></i> HRUSHI / INDEPENDENT BUILDER</p>
        <h1 id="od-title"><span class="od-title-line">HIRSU<span class="od-dot">_</span></span></h1>
        <p class="terminal-tagline od-enter">CODE MEETS THE PHYSICAL WORLD.</p>
        <p class="od-intro od-enter">Useful software. Custom electronics. A telescope, a home lab,<br />and whatever I can get working next.</p>
        <a class="hero-latest od-enter" href="#biobuzz-simulator"><b>NEW BUILD</b> BIOBUZZ / 3D ROBOT PRACTICE <span>↗</span></a>
      </div>
      <aside class="terminal-profile od-enter" aria-label="Portfolio summary"><p>BUILDER PROFILE / HIRSU</p><div class="terminal-stats"><span><b>${projects.length}</b>PROJECT FILES</span><span><b>${projects.filter((p) => p.source).length}</b>PUBLIC REPOS</span><span><b>03</b>SIDE CHANNELS</span></div><div class="terminal-directive"><span>ONGOING WORK</span><a href="#robo-telescope">Repair Robo Telescope <b>↗</b></a><a href="#custom-keyboard">Validate the macro pad <b>↗</b></a></div></aside>
      </div>
      ${projectTerminal()}
      <div class="od-hero-bottom od-enter">${photoCredit()}<a href="#od-projects" data-home-section="od-projects">SCROLL / FULL ARCHIVE <span class="od-scroll-arrow">↓</span></a></div>
    </section>
    <div class="od-ticker" aria-hidden="true"><div>${Array.from({ length: 2 }, () => `<span>PYTHON <b>×</b> JAVASCRIPT <b>×</b> ROBOTICS <b>×</b> LOCAL AI <b>×</b> RASPBERRY PI <b>×</b> OPEN SOURCE <b>×</b> `).join("")}</div></div>
    <nav class="od-jump" aria-label="Home sections"><span>SCROLL / INDEX</span>${overdriveSections.map((id, i) => `<a href="#${id}" data-home-section="${id}">0${i + 1} / ${["LATEST", "BUILDS", "NIGHT SKY", "STACK", "WORKBENCH"][i]}</a>`).join("")}</nav>
    <nav class="channel-links od-section" aria-label="Side channels"><a href="#lab">BUILD LAB / TRY MY PROJECTS ↗</a><a href="#radio">RADIO / AFTER HOURS ↗</a><a href="#log">BUILD LOG / MY WORKBENCH ↗</a><a href="#experiments">SEVEN NEW TOOLS / TRY THE PROTOTYPES ↗</a></nav>
    ${recentWork()}
    <section id="od-projects" class="od-section" aria-labelledby="od-projects-title">
      <header class="od-section-head" data-reveal><p class="od-kicker">01 / SELECTED SIGNALS</p><div><h2 id="od-projects-title">BUILT TO<br /><em>DO SOMETHING.</em></h2><p>Useful tools. Physical experiments. Unfinished ideas worth pursuing. Every project includes its actual current state.</p></div></header>
      <div class="od-builds">${order
        .map((id, i) => {
          const p = projects.find((item) => item.id === id);
          return `<article class="od-build" data-reveal aria-labelledby="od-${id}"><a class="od-build-media" href="#${id}" aria-label="Explore ${esc(p.title)}"><img src="${p.image}" alt="${esc(p.alt)}" loading="lazy" width="1200" height="750" /><span class="od-media-caption">${esc(p.caption)}</span><span class="od-open" aria-hidden="true">↗</span></a><div class="od-build-copy"><div class="od-build-meta"><span>FILE / ${String(i + 1).padStart(2, "0")}</span><span class="od-status ${p.statusClass || ""}">${esc(p.status)}</span></div><p class="od-kicker">${esc(p.category)}</p><h3 id="od-${id}"><a href="#${id}">${esc(p.title)}</a></h3><p>${esc(p.description)}</p><div class="od-tags">${p.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div><a class="od-text-link" href="#${id}">OPEN PROJECT <span>↗</span></a></div></article>`;
        })
        .join(
          "",
        )}</div><a class="od-button od-archive" href="#projects">SEARCH THE FULL ARCHIVE <span>↗</span></a>
    </section>
    <section id="od-network" class="od-section od-network" aria-labelledby="od-network-title"><header class="od-section-head" data-reveal><p class="od-kicker">02 / AFTER DARK</p><div><h2 id="od-network-title">SMALL IDEAS.<br /><em>BRIGHT STARS.</em></h2><p>A night sky made from the things I build. Drift between ${projects.length} constellations and follow the threads connecting software, circuits and the home lab.</p></div></header><div data-reveal>${network}</div></section>
    <section id="od-stack" class="od-section" aria-labelledby="od-stack-title"><header class="od-section-head" data-reveal><p class="od-kicker">03 / THE LOADOUT</p><div><h2 id="od-stack-title">TOOLS, NOT<br /><em>SKILL BARS.</em></h2><p>The technologies behind the work. No invented proficiency percentages. Just things I build with.</p></div></header><div class="od-stack-grid">${[
      [
        "01",
        "SOFTWARE",
        "Python / FastAPI / SQLite",
        "Useful local applications, evidence-linked records, search and developer tools.",
        "JavaScript / SwiftUI",
      ],
      [
        "02",
        "HARDWARE",
        "KiCad / CAD / CircuitPython",
        "From a six-key macro pad and custom PCB to motor-driven telescope positioning.",
        "Electronics / USB HID",
      ],
      [
        "03",
        "SYSTEMS",
        "Linux / Raspberry Pi / QML",
        "A personal desktop, home ad blocking, remote access and experimental AI interfaces.",
        "Hyprland / Pi-hole / Tailscale",
      ],
    ]
      .map(
        ([n, title, tools, body, foot]) =>
          `<article data-reveal><span class="od-stack-num">${n}</span><h3>${title}</h3><strong>${tools}</strong><p>${body}</p><small>${foot}</small></article>`,
      )
      .join(
        "",
      )}</div><a class="od-text-link" href="#stack">VIEW REPOSITORY LANGUAGE SNAPSHOT ↗</a></section>
    <section id="od-workbench" class="od-section od-workbench" aria-labelledby="od-workbench-title"><div data-reveal><p class="od-kicker">04 / ALWAYS A WORK IN PROGRESS</p><h2 id="od-workbench-title">THE NEXT<br /><em>ITERATION.</em></h2><p>The interesting part is figuring it out. These are personal projects—not polished products pretending to be finished.</p><a class="od-text-link" href="#log">OPEN THE WORKBENCH ↗</a></div><div class="od-bench-list" data-reveal><a href="#robo-telescope"><span>01 / REPAIR</span><h3>Get back to the stars.</h3><p>Robo Telescope worked before. Right now it's broken and needs repair.</p><b>↗</b></a><a href="#custom-keyboard"><span>02 / VALIDATE</span><h3>From CAD to real keys.</h3><p>Verify the macro pad's assembly, clearances and physical fit.</p><b>↗</b></a><a href="#hyprland-forge"><span>03 / ITERATE</span><h3>Make the desktop mine.</h3><p>Keep developing the Linux shell and validate it on real hardware.</p><b>↗</b></a></div></section>
    <section class="od-outro" data-reveal><p class="od-kicker">END OF TRANSMISSION / NOT THE END OF THE WORK</p><h2>STAY CURIOUS<span>_</span></h2><a class="od-button" href="https://github.com/hirsu-dev" target="_blank" rel="noopener noreferrer">FOLLOW THE SOURCE <span>↗</span></a><a class="od-text-link" href="#about">ABOUT / SOURCES</a></section>
  </div>`;
}
