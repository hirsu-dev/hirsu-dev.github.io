// One bounded timeline; six original visual treatments. No device/network activity.
export const introStorageKey = "hirsu-startup-v12";
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
      "Concentric cyan optics lock together, then rush through the lens.",
    stages: ["ALIGN THE OPTICS", "CONNECT THE RINGS", "ENTER THE INTERFACE"],
  },
  {
    id: "rain",
    name: "Data Rain",
    code: "03",
    description:
      "Falling code streams resolve into a terminal and peel upward.",
    stages: ["DRAW THE STREAM", "RESOLVE THE PATTERN", "REVEAL THE ARCHIVE"],
  },
  {
    id: "redline",
    name: "Redline",
    code: "04",
    description:
      "Red diagonal blades, oversized type and a split-gate release.",
    stages: ["CUT THE SIGNAL", "FORM THE WORDMARK", "SPLIT THE GATE"],
  },
  {
    id: "ghost",
    name: "Ghost Scan",
    code: "05",
    description:
      "A monochrome CRT trace expands, scans and collapses to a line.",
    stages: ["FORM THE TRACE", "RESOLVE THE IMAGE", "COLLAPSE THE SIGNAL"],
  },
  {
    id: "shards",
    name: "Shard Assembly",
    code: "06",
    description:
      "Six angular plates converge, then scatter to uncover the page.",
    stages: ["PLACE THE SHARDS", "LOCK THE GEOMETRY", "BREAK THE FRAME"],
  },
]);
export function introById(value) {
  return intros.find((intro) => intro.id === value) || intros[0];
}
export function introOptions(selected) {
  const current = introById(selected).id;
  return intros
    .map(
      (intro) =>
        `<label class="intro-choice"><input type="radio" name="startup" value="${intro.id}" ${intro.id === current ? "checked" : ""} /><span class="intro-card"><span class="intro-mini mini-${intro.id}" aria-hidden="true"><i></i><i></i><i></i><i></i><b>h/</b></span><span class="intro-name"><small>${intro.code}</small> ${intro.name}</span><span class="intro-description">${intro.description}</span></span></label>`,
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
    return `<div class="intro-backdrop"></div><div class="neural-optics">${pieces(5, "optic")}<b>INTERFACE / LINK</b></div>`;
  if (id === "rain")
    return `<div class="intro-backdrop"></div><div class="data-streams">${Array.from({ length: 12 }, (_, i) => `<span style="--n:${i}">0${i} / HIRSU<br>1011 0100<br>CODE // 07<br>0010 1101<br>FRAME_${i}<br>0101 0010<br>PORTFOLIO<br>1100 1010<br>0${i} / HIRSU<br>1011 0100<br>CODE // 07<br>0010 1101</span>`).join("")}</div>`;
  if (id === "redline")
    return `<div class="intro-backdrop"></div><div class="red-gate gate-left"></div><div class="red-gate gate-right"></div><div class="red-blades">${pieces(5, "blade")}</div>`;
  if (id === "ghost")
    return `<div class="intro-backdrop"></div><div class="ghost-trace"><i></i><b>ANALOG / DIGITAL</b></div>`;
  return `<div class="intro-backdrop"></div><div class="shard-field">${pieces(6, "shard")}</div>`;
}
