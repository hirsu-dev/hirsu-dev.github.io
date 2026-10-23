import { projects } from "./projects.js?v=23";
import { buildEntryIds } from "./workbench-data.js?v=23";

export const projectIds = new Set(projects.map((p) => p.id));
export function savedIds(raw) {
  try {
    const value = JSON.parse(raw);
    return new Set(
      Array.isArray(value) ? value.filter((id) => projectIds.has(id)) : [],
    );
  } catch {
    return new Set();
  }
}
export function findProjects({
  category = "all",
  query = "",
  saved = new Set(),
} = {}) {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return projects.filter(
    (p) =>
      (category === "all" ||
        (category === "saved"
          ? saved.has(p.id)
          : p.filters.includes(category))) &&
      words.every((word) =>
        [p.title, p.description, p.category, p.status, ...p.tags]
          .join(" ")
          .toLocaleLowerCase()
          .includes(word),
      ),
  );
}
export function resolveRoute(hash) {
  let route;
  try {
    route = decodeURIComponent(hash.replace(/^#/, ""));
  } catch {
    return "index";
  }
  const aliases = {
    work: "projects",
    bench: "log",
    whoami: "about",
    themes: "themes",
    settings: "themes",
    archive: "lab",
  };
  if (Object.hasOwn(aliases, route)) return aliases[route];
  if (route.startsWith("entry-") && buildEntryIds.has(route.slice(6)))
    return route;
  if (route.startsWith("project-")) route = route.slice(8);
  return projectIds.has(route) ||
    [
      "index",
      "projects",
      "network",
      "stack",
      "log",
      "about",
      "saved",
      "themes",
      "lab",
      "radio",
      "experiments",
    ].includes(route)
    ? route
    : "index";
}
export function escapeHTML(value) {
  return String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
