import { escapeHTML as esc } from "./console-model.js?v=24";
import {
  telescopeControls,
  planetariumContent,
  mountTelescope,
} from "./telescope-3d.js?v=21";
import { projects } from "./projects.js?v=24";
import {
  aim,
  aimPoint,
  pointAim,
  blendAim,
  labServices,
  macroLayers,
  macroLabels,
} from "./build-lab-model.js?v=24";

const project = (id) => projects.find((p) => p.id === id);
const fact = (id) => {
  const p = project(id);
  return `<p class="bl-reality"><b>ACTUAL BUILD / ${esc(p.status)}</b>${esc(p.progress)}<a href="#${p.id}">Read my project file ↗</a></p>`;
};
export function buildLabContent() {
  return `<div class="build-lab"><header class="page-head"><div><p class="eyebrow">HRUSHI / HANDS-ON PROJECTS</p><h1>Inside my<br /><em>workbench.</em></h1><p>A closer look at the things I build. Aim the telescope concept, follow my home-lab services, and try a six-key project navigator.</p></div><span class="bl-stamp">03 DEMOS<br />MY BUILDS<br /><small>NOT LIVE HARDWARE</small></span></header>
    <div class="bl-tabs" role="tablist" aria-label="Explore my builds">${[
      ["scope", "01", "Robo Telescope"],
      ["home", "02", "Pi home lab"],
      ["pad", "03", "NEXUS Macro Pad"],
    ]
      .map(
        ([id, n, label], i) =>
          `<button id="bl-tab-${id}" role="tab" data-lab-tab="${id}" aria-selected="${i === 0}" aria-controls="bl-panel-${id}" tabindex="${i === 0 ? 0 : -1}"><span>${n} /</span> ${label}<i aria-hidden="true">↗</i></button>`,
      )
      .join("")}</div>
    <section id="bl-panel-scope" class="bl-panel" role="tabpanel" aria-labelledby="bl-tab-scope" tabindex="0"><div class="bl-grid">
      <div class="bl-stage bl-sky"><div class="bl-stage-label"><span>POINTING CONCEPT</span><b>BROWSER DEMO</b></div>${telescopeControls()}<details class="scope-aim-map"><summary>Horizontal pointing map</summary><div class="bl-aim-stage"><svg id="aim-map" viewBox="0 0 320 320" role="img" aria-label="Illustrated aim map. Click to choose a target, or use the two angle sliders."><circle cx="160" cy="160" r="126" class="aim-ring"/><circle cx="160" cy="160" r="84" class="aim-ring"/><circle cx="160" cy="160" r="42" class="aim-ring"/><path d="M160 20V300 M20 160H300" class="aim-grid"/><text x="160" y="17">N</text><text x="306" y="164">E</text><text x="160" y="316">S</text><text x="13" y="164">W</text><text x="165" y="149" class="aim-zenith">90°</text><path id="aim-beam" d="M160 160L160 69"/><circle id="aim-current" cx="160" cy="69" r="4"/><g id="aim-target"><circle r="10"/><path d="M-15 0H15 M0-15V15"/></g></svg><svg class="aim-mount" viewBox="0 0 260 260" aria-hidden="true"><path class="mount-legs" d="M130 174V220 M130 200L90 245 M130 200L170 245"/><circle cx="130" cy="174" r="17"/><g id="aim-tube"><path d="M90 155H200V193H90Z"/><path d="M200 151V197"/><path class="mount-glass" d="M203 155L244 140V208L203 193Z"/></g><text x="130" y="35">MOTOR-DRIVEN / CONCEPT</text></svg></div></details><div class="bl-readout"><span>DEMO POSITION</span><b><span id="aim-current-az">000</span>° / <span id="aim-current-alt">25</span>°</b></div></div>
      <div class="bl-controls"><p class="eyebrow">01 / COMPUTER INPUT → MOTOR MOVEMENT</p><h2>A telescope you can<br />take apart.</h2><p>My Robo Telescope used computer-entered sky coordinates to turn motors toward a location. Orbit the 3D concept, inspect its parts, extend the focuser, then preview a motor movement. The sliders use horizontal angles—not real sky coordinates or my mount’s calibration. Explore the real sky in Stellarium below.</p><div class="aim-presets" aria-label="Example demo directions"><button data-aim="45,60">High northeast</button><button data-aim="210,30">Low southwest</button><button data-aim="0,90">Straight up</button></div><label for="aim-az">Demo azimuth <output id="aim-az-value" for="aim-az" aria-live="off">90°</output></label><input id="aim-az" type="range" min="0" max="359" value="90" /><label for="aim-alt">Demo elevation <output id="aim-alt-value" for="aim-alt" aria-live="off">45°</output></label><input id="aim-alt" type="range" min="0" max="90" value="45" /><div class="bl-actions"><button id="aim-run">Preview motion ↗</button><button id="aim-stop" disabled>Stop demo</button><button id="aim-reset">Reset</button></div><p id="aim-status" role="status">Choose a target. Only the illustration will move.</p>${fact("robo-telescope")}</div></div>${planetariumContent()}<nav class="bl-actions" aria-label="More astronomy tools"><a class="bl-related" href="https://hrushikbarani-hub.github.io/coordinate-motor-simulator/">Plan a coordinate-to-motor mission ↗</a><a class="bl-related" href="https://hrushikbarani-hub.github.io/accessible-star-map/">Explore the accessible star catalog ↗</a><a class="bl-related" href="https://hrushikbarani-hub.github.io/observatory-planner/">Plan an observing session ↗</a></nav></section>
    <section id="bl-panel-home" class="bl-panel" role="tabpanel" aria-labelledby="bl-tab-home" tabindex="0" hidden><div class="bl-grid"><div class="bl-stage bl-home-stage"><div class="bl-stage-label"><span>RASPBERRY PI / MY HOME LAB</span><b>EXPLANATORY DIAGRAM</b></div><div class="pi-core" aria-hidden="true"><span>Rπ</span><small>SMALL COMPUTER.<br />USEFUL JOBS.</small><i></i><i></i><i></i></div><div id="pi-flow" class="pi-flow" aria-label="Service path"></div><p class="bl-diagram-note">No devices connected. No traffic collected.</p></div><div class="bl-controls"><p class="eyebrow">02 / WHAT I USED THE PI FOR</p><div class="pi-services" aria-label="Home-lab service">${labServices.map((s, i) => `<button data-pi-service="${s.id}" aria-pressed="${i === 0}">${s.name}</button>`).join("")}</div><h2 id="pi-title"></h2><p id="pi-intro"></p><div class="pi-explanation" aria-live="polite"><span id="pi-step-count"></span><h3 id="pi-step-title"></h3><p id="pi-step-body"></p></div><div class="bl-actions"><button id="pi-trace">Trace this idea ↗</button><button id="pi-next">Next step →</button></div><p id="pi-status" role="status">Explore the service one step at a time.</p>${fact("pi-homelab")}<a class="bl-related" href="#nexus-ai">Related: my NEXUS home-service interface ↗</a></div></div></section>
    <section id="bl-panel-pad" class="bl-panel" role="tabpanel" aria-labelledby="bl-tab-pad" tabindex="0" hidden><div class="bl-grid"><div class="bl-stage bl-pad-stage"><div class="bl-stage-label"><span>NEXUS / SIX-KEY CONCEPT</span><b>ILLUSTRATIVE KEYMAP</b></div><div class="macro-device"><div class="macro-top"><span>NEXUS / 06</span><span>OLED + LAYERS</span></div><div class="macro-oled" aria-live="polite"><span id="macro-layer-label">LAYER 01</span><strong id="macro-title"></strong><small id="macro-state"></small></div><div class="macro-keys" aria-label="Six project keys">${Array.from({ length: 6 }, (_, i) => `<button data-macro-key="${i}" aria-pressed="${i === 0}"><small>0${i + 1}</small><b></b></button>`).join("")}</div><span class="macro-brand">CODE / CIRCUITS / CURIOSITY</span></div><p class="bl-diagram-note">Click a key, or focus a key and press 1–6.<br />Arrow keys move between keys. No system shortcuts run.</p></div><div class="bl-controls"><p class="eyebrow">03 / ONE DEVICE, MORE THAN ONE LAYER</p><h2>Six keys.<br />My project universe.</h2><p>My macro-pad design has six keys, an OLED and macro layers. Here, the same idea becomes a project navigator. These example mappings are for this portfolio, not a claim about the shipped firmware.</p><div class="macro-layers" aria-label="Example macro layer"><button data-macro-layer="hardware" aria-pressed="true">Hardware + home</button><button data-macro-layer="software" aria-pressed="false">Software</button><button data-macro-layer="tools" aria-pressed="false">New tools</button></div><div id="macro-selection" class="macro-selection"><p id="macro-description"></p><a id="macro-open">Open selected project ↗</a></div>${fact("custom-keyboard")}<a class="bl-related" href="https://github.com/hrushikbarani-hub/custom-keyboard" target="_blank" rel="noopener noreferrer">Explore my actual CAD, PCB & firmware files ↗</a></div></div></section>
    <footer class="bl-footer"><span>These are hands-on explanations of my projects—not finished-product claims.</span><a href="#projects">All ${projects.length} builds ↗</a></footer></div>`;
}

export function mountBuildLab(container) {
  const home = container.querySelector(".build-lab");
  if (!home) return () => {};
  const $ = (s) => home.querySelector(s),
    root = document.documentElement;
  const listeners = [];
  const listen = (target, name, fn) => {
    target.addEventListener(name, fn);
    listeners.push([target, name, fn]);
  };
  let active = "scope",
    current = aim({ az: 0, alt: 25 }),
    target = aim({ az: 90, alt: 45 }),
    raf = 0,
    disposed = false;
  let service = 0,
    step = 0,
    piTimer = 0,
    layer = "hardware",
    keyIndex = 0;
  const telescope = mountTelescope(home);
  const motion = () => root.dataset.motion !== "off" && !document.hidden;
  function renderAim() {
    telescope.update(current);
    const point = aimPoint(current),
      dest = aimPoint(target);
    $("#aim-current").setAttribute("cx", point.x);
    $("#aim-current").setAttribute("cy", point.y);
    $("#aim-beam").setAttribute("d", `M160 160L${point.x} ${point.y}`);
    $("#aim-target").setAttribute(
      "transform",
      `translate(${dest.x} ${dest.y})`,
    );
    $("#aim-tube").setAttribute("transform", `rotate(${-current.alt} 130 174)`);
    $("#aim-current-az").textContent = String(
      Math.round(current.az) % 360,
    ).padStart(3, "0");
    $("#aim-current-alt").textContent = String(
      Math.round(current.alt),
    ).padStart(2, "0");
  }
  function stopAim(message) {
    cancelAnimationFrame(raf);
    raf = 0;
    $("#aim-stop").disabled = true;
    $("#aim-run").disabled = false;
    if (message) $("#aim-status").textContent = message;
  }
  function syncTarget() {
    stopAim("Target updated. Preview the movement when ready.");
    target = aim({ az: $("#aim-az").value, alt: $("#aim-alt").value });
    $("#aim-az-value").textContent = Math.round(target.az) + "°";
    $("#aim-alt-value").textContent = Math.round(target.alt) + "°";
    renderAim();
  }
  function runAim() {
    stopAim();
    if (!motion()) {
      current = { ...target };
      renderAim();
      $("#aim-status").textContent =
        "Demo position updated. Animation is off; no hardware moved.";
      return;
    }
    const from = { ...current },
      destination = { ...target };
    let started = null;
    $("#aim-status").textContent = "Moving the illustration only…";
    $("#aim-stop").disabled = false;
    $("#aim-run").disabled = true;
    function frame(time) {
      raf = 0;
      if (disposed || active !== "scope" || !motion()) return;
      started ??= time;
      const t = Math.min(1, (time - started) / 1400);
      current = blendAim(from, destination, t);
      renderAim();
      if (t < 1) raf = requestAnimationFrame(frame);
      else
        stopAim(
          "Demo target reached. The real telescope is still under repair.",
        );
    }
    raf = requestAnimationFrame(frame);
  }
  function stopPi() {
    clearTimeout(piTimer);
    piTimer = 0;
    delete $("#pi-flow").dataset.tracing;
    $("#pi-trace").disabled = false;
  }
  function renderPi() {
    const s = labServices[service],
      info = s.steps[step];
    $("#pi-title").textContent = s.headline;
    $("#pi-intro").textContent = s.intro;
    $("#pi-step-count").textContent = `${s.tag} / STEP 0${step + 1} OF 03`;
    $("#pi-step-title").textContent = info.title;
    $("#pi-step-body").textContent = info.body;
    home
      .querySelectorAll("[data-pi-service]")
      .forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.piService === s.id)),
      );
    if (!$("#pi-flow").children.length)
      $("#pi-flow").innerHTML = s.steps
        .map(
          (item, i) =>
            `<button data-pi-step="${i}" aria-pressed="${i === step}"><span>0${i + 1}</span><b>${esc(item.name)}</b><i aria-hidden="true">${i < 2 ? "→" : "✓"}</i></button>`,
        )
        .join("");
    home.querySelectorAll("[data-pi-step]").forEach((button, i) => {
      button.querySelector("b").textContent = s.steps[i].name;
      button.setAttribute("aria-pressed", String(i === step));
    });
  }
  function tracePi() {
    stopPi();
    step = 0;
    renderPi();
    if (!motion()) {
      $("#pi-status").textContent =
        "Motion is off. Use Next step or choose a diagram step.";
      return;
    }
    $("#pi-status").textContent =
      "Tracing an explanatory path—not sending network traffic.";
    $("#pi-flow").dataset.tracing = "true";
    $("#pi-trace").disabled = true;
    const next = () => {
      piTimer = 0;
      if (disposed || active !== "home" || !motion()) return;
      step++;
      renderPi();
      if (step < 2) piTimer = setTimeout(next, 900);
      else {
        stopPi();
        $("#pi-status").textContent =
          "Path explored. No devices were contacted.";
      }
    };
    piTimer = setTimeout(next, 900);
  }
  function renderMacro() {
    const p = macroLayers[layer][keyIndex];
    $("#macro-layer-label").textContent =
      layer === "hardware"
        ? "LAYER 01 / HARDWARE + HOME"
        : layer === "software"
          ? "LAYER 02 / SOFTWARE"
          : "LAYER 03 / NEW TOOLS";
    $("#macro-title").textContent = p.title;
    $("#macro-state").textContent = p.status;
    $("#macro-description").textContent = p.description;
    $("#macro-open").href = "#" + p.id;
    home.querySelectorAll("[data-macro-key]").forEach((b, i) => {
      b.querySelector("b").textContent = macroLabels[macroLayers[layer][i].id];
      b.setAttribute(
        "aria-label",
        `Key ${i + 1}: ${macroLayers[layer][i].title}`,
      );
      b.setAttribute("aria-pressed", String(i === keyIndex));
    });
    home
      .querySelectorAll("[data-macro-layer]")
      .forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.macroLayer === layer)),
      );
  }
  function tab(id, focus = false) {
    if (!["scope", "home", "pad"].includes(id)) return;
    active = id;
    telescope.activate(id === "scope");
    stopAim(raf ? "Demo paused. Preview again to continue." : undefined);
    if (piTimer)
      $("#pi-status").textContent =
        "Trace paused. Explore with the step controls.";
    stopPi();
    home.querySelectorAll("[data-lab-tab]").forEach((b) => {
      const on = b.dataset.labTab === id;
      b.setAttribute("aria-selected", String(on));
      b.tabIndex = on ? 0 : -1;
      $("#bl-panel-" + b.dataset.labTab).hidden = !on;
      if (on && focus) b.focus();
    });
  }
  const click = (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.labTab) tab(b.dataset.labTab);
    if (b.dataset.aim) {
      const [az, alt] = b.dataset.aim.split(",");
      $("#aim-az").value = az;
      $("#aim-alt").value = alt;
      syncTarget();
    }
    if (b.id === "aim-run") runAim();
    if (b.id === "aim-stop")
      stopAim("Demo paused here. Preview again to continue toward the target.");
    if (b.id === "aim-reset") {
      current = aim({ az: 0, alt: 25 });
      $("#aim-az").value = 90;
      $("#aim-alt").value = 45;
      syncTarget();
    }
    if (b.dataset.piService) {
      const i = labServices.findIndex((s) => s.id === b.dataset.piService);
      if (i < 0) return;
      stopPi();
      service = i;
      step = 0;
      renderPi();
      $("#pi-status").textContent = "Explore the service one step at a time.";
    }
    if (b.dataset.piStep !== undefined) {
      const n = Number(b.dataset.piStep);
      if (!Number.isInteger(n) || n < 0 || n > 2) return;
      stopPi();
      $("#pi-status").textContent =
        "Exploring the diagram manually. No devices connected.";
      step = n;
      renderPi();
      home.querySelector(`[data-pi-step="${n}"]`).focus();
    }
    if (b.id === "pi-next") {
      stopPi();
      $("#pi-status").textContent =
        "Exploring the diagram manually. No devices connected.";
      step = (step + 1) % 3;
      renderPi();
    }
    if (b.id === "pi-trace") tracePi();
    if (Object.hasOwn(macroLayers, b.dataset.macroLayer || "")) {
      layer = b.dataset.macroLayer;
      keyIndex = 0;
      renderMacro();
    }
    if (b.dataset.macroKey !== undefined) {
      const n = Number(b.dataset.macroKey);
      if (Number.isInteger(n) && n >= 0 && n < 6) {
        keyIndex = n;
        renderMacro();
      }
    }
  };
  const key = (e) => {
    const t = e.target.closest("[data-lab-tab]");
    if (t && ["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      const all = ["scope", "home", "pad"],
        i = all.indexOf(t.dataset.labTab);
      tab(
        all[
          e.key === "Home"
            ? 0
            : e.key === "End"
              ? 2
              : (i + (e.key === "ArrowRight" ? 1 : 2)) % 3
        ],
        true,
      );
      return;
    }
    const k = e.target.closest("[data-macro-key]");
    if (!k) return;
    let i = Number(k.dataset.macroKey);
    if (/^[1-6]$/.test(e.key)) i = Number(e.key) - 1;
    else if (e.key === "ArrowRight") i = (i + 1) % 6;
    else if (e.key === "ArrowLeft") i = (i + 5) % 6;
    else if (e.key === "ArrowDown" || e.key === "ArrowUp") i = (i + 3) % 6;
    else return;
    e.preventDefault();
    e.stopPropagation();
    keyIndex = i;
    renderMacro();
    home.querySelector(`[data-macro-key="${i}"]`).focus();
  };
  const map = (e) => {
    if (e.button !== 0) return;
    const r = $("#aim-map").getBoundingClientRect();
    if (!r.width || !r.height) return;
    const p = pointAim(
      ((e.clientX - r.left) / r.width) * 320,
      ((e.clientY - r.top) / r.height) * 320,
    );
    $("#aim-az").value = Math.round(p.az) % 360;
    $("#aim-alt").value = Math.round(p.alt);
    syncTarget();
  };
  const pause = () => {
    if (!motion()) {
      stopAim("Demo motion paused. The controls still work.");
      stopPi();
      $("#pi-status").textContent =
        "Trace paused. Explore with the step controls.";
    }
  };
  listen(home, "click", click);
  listen(home, "keydown", key);
  listen(home, "input", (e) => {
    if (["aim-az", "aim-alt"].includes(e.target.id)) syncTarget();
  });
  listen($("#aim-map"), "click", map);
  listen(document, "appearancechange", pause);
  listen(document, "visibilitychange", pause);
  renderAim();
  renderPi();
  renderMacro();
  return () => {
    if (disposed) return;
    disposed = true;
    telescope.dispose();
    stopAim();
    stopPi();
    listeners.forEach(([node, name, fn]) => node.removeEventListener(name, fn));
  };
}
