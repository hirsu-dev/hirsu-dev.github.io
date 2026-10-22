import { escapeHTML as esc } from "./console-model.js?v=15";
import {
  signalPresets,
  signalSettings,
  signalCSS,
  fragments,
  decodeFragment,
  recoveredFragments,
} from "./signal-model.js?v=15";

const head = (n, title, body) =>
  `<header class="page-head"><div><p class="eyebrow">${n} / SIDE CHANNEL</p><h1>${title}</h1><p>${body}</p></div></header>`;
export function labContent() {
  return `${head("08", "Build a better glitch.", "A small, useful signal workbench. Tune an original effect, then take the CSS with you.")}
  <div class="signal-workbench">
    <section class="signal-stage" aria-label="Live effect preview"><div class="signal-stage-top"><span>LOCAL RENDER / CSS</span><span id="signal-mode">PREVIEW</span></div><div class="signal-reticle" aria-hidden="true"></div><h2 id="signal-preview" class="signal-title">STAY CURIOUS_</h2><p>NO TRANSMISSION REQUIRED</p><div class="signal-stage-bottom"><span>01 / VISUAL SYNTH</span><a href="#archive" aria-label="Explore lost packets">UNKNOWN PACKETS ↗</a></div></section>
    <form id="signal-controls" class="signal-controls panel" aria-label="Signal controls"><h2>Tune your signal.</h2><div class="signal-presets">${Object.keys(
      signalPresets,
    )
      .map(
        (id) =>
          `<button type="button" data-preset="${id}" aria-pressed="${id === "overdrive"}">${id}</button>`,
      )
      .join("")}</div>
    <label>Preview text<input name="text" maxlength="28" value="STAY CURIOUS_" autocomplete="off" /></label>
    <label>Accent color<input name="color" type="color" value="#fcee0a" /></label>
    <label>Chromatic displacement <output id="offset-value">4px</output><input name="offset" type="range" min="0" max="12" value="4" /></label>
    <label>Cycle duration <output id="speed-value">3.2s</output><input name="speed" type="range" min="1.5" max="6" step="0.1" value="3.2" /></label>
    <label class="signal-check"><input name="lines" type="checkbox" checked /> Fine scanlines</label>
    <button type="button" id="signal-pause" aria-pressed="false">Pause preview</button><p class="fineprint">Preview honors your motion preference. Exported CSS includes a system reduced-motion fallback.</p></form>
  </div><section class="panel signal-export"><div><h2>Your effect. Your code.</h2><div class="signal-actions"><button id="signal-copy">Copy CSS</button><button id="signal-download">Download CSS ↓</button></div></div><label class="sr-only" for="signal-source">Generated CSS, ready to copy</label><textarea id="signal-source" readonly spellcheck="false"></textarea><p id="signal-status" role="status">Nothing is uploaded. Text stays in this tab.</p></section>`;
}
export function archiveContent(raw) {
  const found = recoveredFragments(raw);
  return `${head("09", "Lost packets.", "Four tiny echoes from beyond the workbench. Recover the codes; keep the fragments.")}
  <section class="packet-console panel"><div class="packet-seal" aria-hidden="true">FF<br />06<br />B5</div><div><p class="eyebrow">ARCHIVE RECOVERY / NOT A REAL NETWORK</p><h2>Some signals take the long way home.</h2><form id="packet-form"><label for="packet-code">Recovery code</label><div class="packet-entry"><input id="packet-code" maxlength="32" placeholder="__ : __ : __" autocomplete="off" spellcheck="false" /><button>Decode →</button></div></form><p id="packet-status" role="status">${found.size} / 4 fragments recovered on this browser.</p></div></section>
  <div class="fragment-grid">${fragments.map((f, i) => `<article class="fragment panel" data-fragment="${f.id}" data-found="${found.has(f.id)}"><span class="fragment-number">SHARD / 0${i + 1}</span><h2>${f.name}</h2><p class="fragment-body">${esc(found.has(f.id) ? f.body : "ENCRYPTED // Waiting for a familiar signal.")}</p><details><summary>Need a hint?</summary><p>${f.hint}</p></details><span class="fragment-mark" aria-hidden="true">${found.has(f.id) ? f.mark : "?"}</span></article>`).join("")}</div>
  <p class="fineprint">Original fan-made micro-fiction referencing Cyberpunk 2077 and Edgerunners. No official game text, assets or affiliation. Your discoveries stay on this device.</p><button id="packet-reset">Clear discoveries on this browser</button>`;
}
export function mountSignalPage(container, { read, write, toast }) {
  const form = container.querySelector("#signal-controls");
  const packetForm = container.querySelector("#packet-form");
  let paused = false,
    disposed = false;
  const found = recoveredFragments(read("hirsu-fragments-v15"));
  function update() {
    if (!form) return;
    const controls = form.elements;
    const s = signalSettings({
      color: controls.color.value,
      offset: controls.offset.value,
      speed: controls.speed.value,
      lines: controls.lines.checked,
    });
    const preview = container.querySelector("#signal-preview");
    preview.textContent = controls.text.value || "YOUR SIGNAL_";
    preview.style.setProperty("--signal-color", s.color);
    preview.style.setProperty("--signal-offset", s.offset + "px");
    preview.style.setProperty("--signal-speed", s.speed + "s");
    preview.dataset.lines = String(s.lines);
    preview.dataset.paused = String(
      paused || document.documentElement.dataset.motion === "off",
    );
    container.querySelector("#signal-mode").textContent =
      preview.dataset.paused === "true" ? "STATIC PREVIEW" : "LIVE PREVIEW";
    container.querySelector("#offset-value").textContent = s.offset + "px";
    container.querySelector("#speed-value").textContent = s.speed + "s";
    container.querySelector("#signal-source").value = signalCSS(s);
    container
      .querySelectorAll("[data-preset]")
      .forEach((b) =>
        b.setAttribute(
          "aria-pressed",
          String(
            JSON.stringify(signalPresets[b.dataset.preset]) ===
              JSON.stringify(s),
          ),
        ),
      );
    if (s.color === "#ff06b5")
      container.querySelector("#signal-status").textContent =
        "Unknown address resolved: FF:06:B5. Try the lost packets archive.";
  }
  const submit = (e) => {
    e.preventDefault();
    if (!packetForm) return;
    const f = decodeFragment(container.querySelector("#packet-code").value);
    const status = container.querySelector("#packet-status");
    if (!f) {
      status.textContent =
        "No match. Open a fragment's hint and try another code.";
      return;
    }
    found.add(f.id);
    const saved = write("hirsu-fragments-v15", JSON.stringify([...found]));
    const card = container.querySelector(`[data-fragment="${f.id}"]`);
    card.dataset.found = "true";
    card.querySelector(".fragment-body").textContent = f.body;
    card.querySelector(".fragment-mark").textContent = f.mark;
    status.textContent = `${f.name} recovered. ${found.size} / 4 found.${saved ? "" : " Storage unavailable; session only."}`;
    container.querySelector("#packet-code").value = "";
  };
  const click = async (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.preset && Object.hasOwn(signalPresets, b.dataset.preset)) {
      for (const [key, value] of Object.entries(
        signalPresets[b.dataset.preset],
      ))
        form.elements[key][key === "lines" ? "checked" : "value"] = value;
      update();
    }
    if (b.id === "signal-pause") {
      paused = !paused;
      b.setAttribute("aria-pressed", String(paused));
      b.textContent = paused ? "Resume preview" : "Pause preview";
      update();
    }
    if (b.id === "signal-copy") {
      const code = container.querySelector("#signal-source");
      try {
        await navigator.clipboard.writeText(code.value);
        if (!disposed) toast("CSS copied.");
      } catch {
        if (!disposed) {
          code.focus();
          code.select();
          toast(
            "Select and copy the CSS manually; clipboard access is unavailable.",
          );
        }
      }
    }
    if (b.id === "signal-download") {
      const blob = new Blob([container.querySelector("#signal-source").value], {
        type: "text/css",
      });
      const url = URL.createObjectURL(blob),
        a = document.createElement("a");
      a.href = url;
      a.download = "hirsu-signal.css";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    if (b.id === "packet-reset") {
      found.clear();
      const saved = write("hirsu-fragments-v15", "[]");
      container.querySelectorAll("[data-fragment]").forEach((card) => {
        card.dataset.found = "false";
        card.querySelector(".fragment-body").textContent =
          "ENCRYPTED // Waiting for a familiar signal.";
        card.querySelector(".fragment-mark").textContent = "?";
      });
      container.querySelector("#packet-status").textContent = saved
        ? "Discoveries cleared. 0 / 4 recovered."
        : "Cleared for this page. Browser storage could not be updated.";
    }
  };
  container.addEventListener("input", update);
  container.addEventListener("click", click);
  container.addEventListener("submit", submit);
  document.addEventListener("appearancechange", update);
  update();
  return () => {
    disposed = true;
    container.removeEventListener("input", update);
    container.removeEventListener("click", click);
    container.removeEventListener("submit", submit);
    document.removeEventListener("appearancechange", update);
  };
}
