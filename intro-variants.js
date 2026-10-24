
export const introStorageKey = "hirsu-startup-v17";
export const defaultIntro = "redline";
export const intros = Object.freeze([
  {
    id: "fracture",
    name: "Signal Fracture",
    code: "01",
    description:
      "The original. Static, targeting rings and eight torn signal bands.",
    stages: ["FORM THE SIGNAL", "ASSEMBLE THE INTERFACE", "OPEN THE WORKBENCH"],
  },
  {
    id: "neural",
    name: "Neural Link",
    code: "02",
    description:
      "A five-ring optical core assembles around a link glyph, then zooms through.",
    stages: ["ALIGN THE OPTICS", "CONNECT THE RINGS", "ENTER THE INTERFACE"],
  },
  {
    id: "rain",
    name: "Data Rain",
    code: "03",
    description:
      "A full-screen code stream types out a terminal before a vertical data wipe.",
    stages: ["DRAW THE STREAM", "RESOLVE THE PATTERN", "REVEAL THE ARCHIVE"],
  },
  {
    id: "redline",
    name: "Redline",
    code: "04",
    description:
      "A charged red seam cuts through the wordmark, throws sparks, and tears the gates into the page.",
    stages: ["CUT THE SIGNAL", "FORM THE WORDMARK", "SPLIT THE GATE"],
  },
  {
    id: "ghost",
    name: "Ghost Scan",
    code: "05",
    description:
      "An oscilloscope trace draws itself, scans the display and collapses to a line.",
    stages: ["FORM THE TRACE", "RESOLVE THE IMAGE", "COLLAPSE THE SIGNAL"],
  },
  {
    id: "shards",
    name: "Shard Assembly",
    code: "06",
    description:
      "Floating geometric plates assemble a central emblem, then fly apart.",
    stages: ["PLACE THE SHARDS", "LOCK THE GEOMETRY", "BREAK THE FRAME"],
  },
]);
export function introById(value) {
  return (
    intros.find((intro) => intro.id === value) ||
    intros.find((intro) => intro.id === defaultIntro)
  );
}

export const redlineParticles = Object.freeze(
  Array.from({ length: 72 }, (_, i) => ({
    y: 5 + ((i * 29) % 90),
    dx: (i % 2 ? 1 : -1) * (45 + ((i * 47) % 240)),
    dy: ((i * 31) % 170) - 85,
    delay: 2.18 + (i % 8) * 0.015,
    width: i % 5 === 0 ? 38 : 5 + (i % 6),
    height: 3 + (i % 3),
  })),
);
export function introOptions(selected) {
  const current = introById(selected).id;
  return [...intros]
    .sort(
      (a, b) => Number(b.id === defaultIntro) - Number(a.id === defaultIntro),
    )
    .map(
      (intro) =>
        `<label class="intro-choice"><input type="radio" name="startup" value="${intro.id}" ${intro.id === current ? "checked" : ""} /><span class="intro-card"><span class="intro-mini mini-${intro.id}" aria-hidden="true"><i></i><i></i><i></i><i></i><b>h/</b></span><span class="intro-name"><small>${intro.code}</small> ${intro.name}${intro.id === defaultIntro ? '<em class="intro-default">DEFAULT</em>' : ""}</span><span class="intro-description">${intro.description}</span></span></label>`,
    )
    .join("");
}
export function introArtwork(value) {
  const { id } = introById(value);
  const pieces = (count, className) =>
    Array.from(
      { length: count },
      (_, i) => `<i class="${className}" style="--n:${i}"></i>`,
    ).join("");
  if (id === "fracture") return "";
  if (id === "neural")
    return `<div class="intro-backdrop"></div><div class="neural-optics">${pieces(5, "optic")}<b>INTERFACE / LINK</b><div class="neural-core"><span>H/</span><small>PORTFOLIO LINK</small></div></div><div class="neural-readout"><span>01 / ALIGN</span><span>02 / CONNECT</span><span>03 / ENTER</span></div>`;
  if (id === "rain")
    return `<div class="intro-backdrop"></div><div class="data-streams">${Array.from({ length: 12 }, (_, i) => `<span style="--n:${i}">0${i} / HIRSU<br>1011 0100<br>CODE // 07<br>0010 1101<br>FRAME_${i}<br>0101 0010<br>PORTFOLIO<br>1100 1010<br>0${i} / HIRSU<br>1011 0100<br>CODE // 07<br>0010 1101</span>`).join("")}</div><div class="rain-terminal"><small>HIRSU://WORKSHOP / VISUAL TERMINAL</small>${["> compose interface", "  software / hardware / curiosity", "> index project files", "  14 projects. 12 public repositories.", "> render the workbench", "  no tracking. no system access.", "> ENTER_"].map((line, i) => `<code style="--row:${i}">${line.replaceAll(">", "&gt;")}</code>`).join("")}</div>`;
  if (id === "redline")
    return `<div class="cut-scene"><div class="cut-panel cut-left"><div class="cut-word">HIRSU<span>_</span></div></div><div class="cut-panel cut-right"><div class="cut-word">HIRSU<span>_</span></div></div><svg class="cut-beam" viewBox="0 0 1000 1000" preserveAspectRatio="none"><path class="cut-aura" d="M700 0L300 1000" pathLength="1" /><path d="M700 0L300 1000" pathLength="1" /><path class="cut-core" d="M700 0L300 1000" pathLength="1" /></svg><div class="cut-impact"></div><div class="cut-rulers">${pieces(8, "cut-ruler")}</div><div class="cut-particles">${redlineParticles.map((p) => `<i class="cut-spark" style="left:${70 - p.y * 0.4}%;top:${p.y}%;--dx:${p.dx}px;--dy:${p.dy}px;--delay:${p.delay}s;width:${p.width}px;height:${p.height}px"></i>`).join("")}</div><span class="cut-callout">REDLINE / OPEN THE SIGNAL</span><div class="cut-diagnostics"><span>VISUAL SEQUENCE / 04</span><span>CODE → CIRCUITS → WORLD</span></div><div class="cut-tears">${pieces(3, "cut-tear")}</div></div>`;
  if (id === "ghost")
    return `<div class="intro-backdrop"></div><div class="ghost-trace"><i></i><b>ANALOG / DIGITAL</b></div><div class="ghost-scope"><span>HIRSU / SIGNAL OBSERVATORY</span><svg viewBox="0 0 1000 260" preserveAspectRatio="none"><path d="M0 130H180L205 115L220 150L242 70L268 205L295 20L328 240L358 75L390 175L420 110L450 145L480 130H1000" pathLength="1" /></svg><div><b>GHOST / 05</b><small>VISUAL SIGNAL · NOT DEVICE TELEMETRY</small></div></div>`;
  return `<div class="intro-backdrop"></div><div class="shard-field">${pieces(6, "shard")}</div><div class="shard-emblem">${pieces(3, "emblem-plate")}<b>H/</b><span>COMPOSE / CONNECT / BUILD</span></div>`;
}
