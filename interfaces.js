export const interfaces = {
  neon: {
    name: "Neon District",
    number: "01",
    tagline: "A little human. A little machine.",
    description:
      "An electric project gallery. Cyan light, magenta accents, a procedural skyline, and room to explore.",
    color: "#07101c",
  },
  blacksite: {
    name: "Blacksite",
    number: "02",
    tagline: "Build. Break. Rebuild.",
    description:
      "A focused field terminal. Amber signals, a file-system navigator, and a radar-inspired workbench.",
    color: "#11120e",
  },
};
export function validInterface(value) {
  return Object.hasOwn(interfaces, value);
}
export function interfaceFromSearch(search, saved = "neon") {
  const requested = new URLSearchParams(search).get("view");
  return validInterface(requested)
    ? requested
    : validInterface(saved)
      ? saved
      : "neon";
}
export function interfaceURL(href, view) {
  if (!validInterface(view)) throw new Error("Unknown interface");
  const url = new URL(href);
  url.searchParams.set("view", view);
  return url;
}
