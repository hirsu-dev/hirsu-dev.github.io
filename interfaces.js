export const interfaces = {
  neon: {
    name: "Night City",
    number: "01",
    tagline: "From code to the real world.",
    description:
      "Yellow/black cinematic landing page, real city photography, clipped panels and game-inspired transitions.",
    color: "#fcee0a",
  },
  blacksite: {
    name: "Overdrive",
    number: "02",
    tagline: "Code meets the physical world.",
    description:
      "An original red/yellow project terminal, real night photography, a scrolling workbench and an animated project network.",
    color: "#0b0a0f",
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
