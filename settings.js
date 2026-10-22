import {
  settingsKey,
  defaultSettings,
  readSettings,
  normalizeSettings,
  applySettings,
  nextSettingsTab,
} from "./settings-model.js?v=16";

export function mountSettings({ read, write, onApply, onReset }) {
  const root = document.documentElement;
  const dialog = document.querySelector("#settings-dialog");
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  const status = dialog.querySelector("#settings-status");
  let value = readSettings(read(settingsKey), read("hirsu-console-motion"));
  const controls = [...dialog.querySelectorAll("[data-setting]")];
  function apply() {
    applySettings(root, value, media.matches);
    for (const control of controls) {
      const selected = value[control.dataset.setting];
      if (control.type === "checkbox") control.checked = selected;
      else if (control.type === "radio")
        control.checked = control.value === selected;
      else control.value = selected;
    }
    dialog.querySelector("#motion-status").textContent =
      root.dataset.motion === "on"
        ? "Animations are on. Reduced motion turns off the intro, globe rotation and page effects."
        : "Animations are off. Manual globe controls and all project links still work.";
    onApply();
  }
  function persist() {
    const saved = write(settingsKey, JSON.stringify(value));
    // Keep the pre-paint compatibility key aligned; "system" follows the OS.
    write("hirsu-console-motion", value.motion);
    status.textContent = saved
      ? "Saved in this browser. No account or tracking."
      : "Applied for this session. Browser storage is unavailable.";
  }
  function set(key, next) {
    value = normalizeSettings({ ...value, [key]: next });
    apply();
    persist();
  }
  dialog.addEventListener("change", (event) => {
    const control = event.target.closest("[data-setting]");
    if (control)
      set(
        control.dataset.setting,
        control.type === "checkbox" ? control.checked : control.value,
      );
  });
  function selectTab(id, focus = false) {
    if (!["general", "accessibility", "customize"].includes(id)) id = "general";
    for (const tab of dialog.querySelectorAll('[role="tab"]')) {
      const active = tab.dataset.settingsTab === id;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus();
    }
    for (const panel of dialog.querySelectorAll('[role="tabpanel"]'))
      panel.hidden = panel.id !== `settings-${id}`;
    dialog.querySelector(".settings-content").scrollTop = 0;
  }
  const tabs = dialog.querySelector('[role="tablist"]');
  tabs.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-settings-tab]");
    if (tab) selectTab(tab.dataset.settingsTab);
  });
  tabs.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    selectTab(
      nextSettingsTab(event.target.dataset.settingsTab, event.key),
      true,
    );
  });
  const confirmation = dialog.querySelector("#settings-reset-confirm");
  dialog.querySelector("#settings-reset").onclick = () => {
    confirmation.hidden = false;
    dialog.querySelector("#settings-reset-cancel").focus();
  };
  dialog.querySelector("#settings-reset-cancel").onclick = () => {
    confirmation.hidden = true;
    dialog.querySelector("#settings-reset").focus();
  };
  dialog.querySelector("#settings-reset-accept").onclick = () => {
    value = { ...defaultSettings };
    confirmation.hidden = true;
    const introSaved = onReset();
    apply();
    persist();
    if (!introSaved)
      status.textContent =
        "Defaults applied for this session. Startup preference could not be saved.";
    dialog.querySelector("#settings-reset").focus();
  };
  media.addEventListener("change", apply);
  apply();
  return { set, selectTab };
}
