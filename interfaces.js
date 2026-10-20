export const interfaces = {
  neon: {
    name: "Nightshift",
    number: "01",
    tagline: "Built outside the lines.",
    description:
      "2077-inspired: acid yellow, black, red/cyan HUD details, cut edges and an original city-workshop illustration.",
    color: "#0a0a0c",
  },
  blacksite: {
    name: "Overdrive",
    number: "02",
    tagline: "Keep building. No brakes.",
    description:
      "Edgerunners-inspired: chartreuse, violet, hard cel-shaded contrast, kinetic type and a focused project terminal.",
    color: "#171325",
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
