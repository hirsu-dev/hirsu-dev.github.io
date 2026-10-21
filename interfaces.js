export const interfaces = {
  neon: {
    name: "Cyberspace",
    number: "01",
    tagline: "Code. Circuits. Curiosity.",
    description:
      "Cyberspace-inspired project feed, warm phosphor type and restrained red/cyan HUD details.",
    color: "#08090b",
  },
  blacksite: {
    name: "Overdrive",
    number: "02",
    tagline: "Keep building. No brakes.",
    description:
      "Edgerunners-inspired chartreuse and violet, a split workspace, sharp contrast and angular typography.",
    color: "#100c1b",
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
