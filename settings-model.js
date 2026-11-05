export const settingsKey = "hirsu-settings-v14";
export const motionChoiceKey = "hirsu-motion-choice-v26";
export const settingOptions = Object.freeze({
  layout: ["overdrive", "netrunner", "relic", "switchboard", "orbit"],
  motion: ["system", "on", "off"],
  skin: ["overdrive", "icewire", "monolith"],
  fx: ["signal", "clean", "crt"],
  textSize: ["standard", "large"],
});
export const defaultSettings = Object.freeze({
  layout: "overdrive",
  motion: "on",
  skin: "overdrive",
  fx: "signal",
  textSize: "standard",
  autoplay: true,
  shortcuts: true,
  smoothScroll: true,
  contrast: false,
  underlineLinks: false,
  parallax: true,
});
export function normalizeSettings(value) {
  const result = { ...defaultSettings };
  if (!value || typeof value !== "object" || Array.isArray(value))
    return result;
  for (const key of Object.keys(defaultSettings)) {
    if (!Object.hasOwn(value, key)) continue;
    if (Object.hasOwn(settingOptions, key)) {
      if (settingOptions[key].includes(value[key])) result[key] = value[key];
    } else if (typeof value[key] === "boolean") result[key] = value[key];
  }
  return result;
}
export function readSettings(raw, legacyMotion, motionChoice = null) {
  try {
    if (raw) {
      const settings = normalizeSettings(JSON.parse(raw));
      if (settings.motion === "system" && motionChoice !== "system")
        settings.motion = "on";
      return settings;
    }
  } catch {}
  return normalizeSettings({
    motion: ["on", "off"].includes(legacyMotion)
      ? legacyMotion
      : motionChoice === "system"
        ? "system"
        : "on",
  });
}
export function motionEnabled(settings, reducedMotion) {
  return (
    settings.motion === "on" || (settings.motion === "system" && !reducedMotion)
  );
}
export function applySettings(root, settings, reducedMotion) {
  const p = normalizeSettings(settings);
  Object.assign(root.dataset, {
    layout: p.layout,
    motion: motionEnabled(p, reducedMotion) ? "on" : "off",
    skin: p.skin,
    fx: p.fx,
    textSize: p.textSize,
    contrast: p.contrast ? "high" : "normal",
    links: p.underlineLinks ? "underlined" : "normal",
    autoplay: p.autoplay ? "on" : "off",
    shortcuts: p.shortcuts ? "on" : "off",
    smoothScroll: p.smoothScroll ? "on" : "off",
    parallax: p.parallax ? "on" : "off",
  });
  return p;
}
export function nextSettingsTab(current, key) {
  const tabs = ["general", "accessibility", "customize"];
  const at = Math.max(0, tabs.indexOf(current));
  if (key === "Home") return tabs[0];
  if (key === "End") return tabs.at(-1);
  return tabs[
    (at +
      (key === "ArrowLeft" ? -1 : key === "ArrowRight" ? 1 : 0) +
      tabs.length) %
      tabs.length
  ];
}
