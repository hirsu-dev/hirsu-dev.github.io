export const interfaces = {
  neon: {
    name: "Night City",
    number: "01",
    tagline: "From code to the real world.",
    description:
      "Official-site-inspired yellow/black cinematic landing page, original key art, clipped panels and game-inspired transitions.",
    color: "#fcee0a",
  },
  blacksite: {
    name: "Overdrive",
    number: "02",
    tagline: "Keep building. No brakes.",
    description:
      "Edgerunners-inspired chartreuse and violet, a continuous scrolling workbench, animated project network and signal distortion.",
    color: "#100c1b",
  },
};
export function validInterface(value) {
  return Object.hasOwn(interfaces, value);
}
export function interfaceFromSearch(search, saved = "blacksite") {
  const requested = new URLSearchParams(search).get("view");
  return validInterface(requested)
    ? requested
    : validInterface(saved)
      ? saved
      : "blacksite";
}
export function interfaceURL(href, view) {
  if (!validInterface(view)) throw new Error("Unknown interface");
  const url = new URL(href);
  url.searchParams.set("view", view);
  return url;
}
