import { projects } from "./projects.js?v=24";
import { networkLinks } from "./network-view.js?v=24";

export const boardKey = "hirsu-switchboard-v18";
export const boardProjects = projects;
export const boardLinks = networkLinks;
const ids = new Set(projects.map((p) => p.id));
export const bound = (value, min, max) => Math.max(min, Math.min(max, value));
export function boardArrangement(mode = "circuit") {
  const cols = 4,
    rows = Math.ceil(projects.length / cols);
  return Object.fromEntries(
    projects.map((p, i) => [
      p.id,
      mode === "rows"
        ? {
            x: 0.14 + (i % cols) * 0.24,
            y: 0.18 + (Math.floor(i / cols) * 0.64) / Math.max(1, rows - 1),
          }
        : {
            x:
              0.14 +
              (Math.floor(i / cols) % 2 ? cols - 1 - (i % cols) : i % cols) *
                0.24,
            y: 0.2 + (Math.floor(i / cols) * 0.6) / Math.max(1, rows - 1),
          },
    ]),
  );
}
export function boardState(raw) {
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
  }
  const positions = boardArrangement();
  for (const id of ids) {
    const p = data?.positions?.[id];
    if (p && Number.isFinite(p.x) && Number.isFinite(p.y))
      positions[id] = { x: bound(p.x, 0.12, 0.88), y: bound(p.y, 0.14, 0.86) };
  }
  const sockets = ["maintaineros", "civiclens"];
  if (
    Array.isArray(data?.sockets) &&
    data.sockets.length === 2 &&
    data.sockets.every((id) => ids.has(id)) &&
    data.sockets[0] !== data.sockets[1]
  )
    sockets.splice(0, 2, ...data.sockets);
  return {
    positions,
    sockets,
    selected: ids.has(data?.selected) ? data.selected : "maintaineros",
  };
}
export function connectedIds(id) {
  return new Set([
    id,
    ...networkLinks
      .filter(([a, b]) => a === id || b === id)
      .flatMap(([a, b]) => [a, b]),
  ]);
}
export function visibleProjects({
  query = "",
  category = "all",
  selected,
  isolated = false,
} = {}) {
  const neighbors = connectedIds(selected);
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return projects.filter(
    (p) =>
      (category === "all" || p.filters.includes(category)) &&
      (!isolated || neighbors.has(p.id)) &&
      words.every((word) =>
        [p.title, p.description, p.category, ...p.tags]
          .join(" ")
          .toLowerCase()
          .includes(word),
      ),
  );
}
export function compareProjects(a, b) {
  const left = projects.find((p) => p.id === a),
    right = projects.find((p) => p.id === b);
  if (!left || !right || a === b) return null;
  return {
    left,
    right,
    shared: left.tags.filter((tag) => right.tags.includes(tag)),
    onlyLeft: left.tags.filter((tag) => !right.tags.includes(tag)),
    onlyRight: right.tags.filter((tag) => !left.tags.includes(tag)),
    connection:
      networkLinks.find(
        ([x, y]) => (x === a && y === b) || (x === b && y === a),
      )?.[2] || null,
  };
}
export function wirePath(a, b) {
  const x1 = a.x * 1000,
    y1 = a.y * 640,
    x2 = b.x * 1000,
    y2 = b.y * 640;
  const mid = (x1 + x2) / 2;
  return `M${x1} ${y1} C${mid} ${y1} ${mid} ${y2} ${x2} ${y2}`;
}
