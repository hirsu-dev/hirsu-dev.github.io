export const signalPresets = Object.freeze({
  overdrive: { color: "#fcee0a", offset: 4, speed: 3.2, lines: true },
  ice: { color: "#79edf0", offset: 2, speed: 4.8, lines: false },
  breach: { color: "#ff5964", offset: 8, speed: 2.6, lines: true },
});
const bounded = (n, min, max, fallback) =>
  Number.isFinite(Number(n))
    ? Math.max(min, Math.min(max, Number(n)))
    : fallback;
export function signalSettings(value = {}) {
  return {
    color: /^#[0-9a-f]{6}$/i.test(value.color)
      ? value.color.toLowerCase()
      : "#fcee0a",
    offset: bounded(value.offset ?? 4, 0, 12, 4),
    speed: bounded(value.speed ?? 3.2, 1.5, 6, 3.2),
    lines: value.lines !== false,
  };
}
export function signalCSS(value) {
  const s = signalSettings(value);
  return `/* HIRSU / Signal Lab — use class="signal-title" on your heading. */
.signal-title {
  position: relative;
  color: ${s.color};
  background: #0b0a0f;
  padding: .4em;
  font-family: monospace;
  animation: signal-shift ${s.speed}s steps(1, end) infinite;
}
${
  s.lines
    ? `.signal-title::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(0deg, transparent 0 3px, #0002 3px 4px);
}`
    : "/* Scanlines disabled. */"
}
@keyframes signal-shift {
  0%, 88%, 94%, 100% { text-shadow: none; }
  89%, 93% { text-shadow: ${s.offset}px 0 #ff5964, -${s.offset}px 0 #79edf0; }
  91% { text-shadow: -${s.offset}px 0 #ff5964, ${s.offset}px 0 #79edf0; }
}
@media (prefers-reduced-motion: reduce) {
  .signal-title { animation: none; }
}`;
}
// Original micro-fiction, not quotes or extracted game shards.
export const fragments = Object.freeze([
  {
    id: "magenta",
    code: "ff06b5",
    name: "The magenta address",
    hint: "Three bytes. A colon between each. The color is the address.",
    body: "FF:06:B5 // A color pretending to be a destination. The packet contains no coordinates. Only the instruction to keep looking.",
    mark: "FF:06:B5",
  },
  {
    id: "cat",
    code: "bakeneko",
    name: "Something on the rooftop",
    hint: "Not every cat on a rooftop is just a cat. Eight letters, beginning with B.",
    body: "ROOFTOP CACHE // The camera logged an empty ledge. The motion sensor disagreed. One small pawprint remains in the dust.",
    mark: "猫",
  },
  {
    id: "ice",
    code: "bartmoss",
    name: "A very cold backup",
    hint: "Rache's surname. Some old netrunners really should have deleted their backups.",
    body: "COLD STORAGE // Backup complete. Expiration date: yesterday, forever. Whoever labeled this drive had an alarming sense of humor.",
    mark: "R.B.",
  },
  {
    id: "moon",
    code: "moon",
    name: "One-way ticket",
    hint: "A destination above the skyline. Four letters. Lucy would know.",
    body: "LUNAR UPLINK // No advertisements. No traffic. Just a quiet horizon and enough room to breathe. Keep a little of that silence down here.",
    mark: "☾",
  },
]);
export function decodeFragment(input) {
  const code = String(input)
    .toLowerCase()
    .replace(/[:\s-]/g, "");
  return fragments.find((f) => f.code === code) ?? null;
}
export function recoveredFragments(raw) {
  try {
    const value = JSON.parse(raw);
    return new Set(
      Array.isArray(value)
        ? value.filter((id) => fragments.some((f) => f.id === id))
        : [],
    );
  } catch {
    return new Set();
  }
}
