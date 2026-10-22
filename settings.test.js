import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import {
  defaultSettings,
  settingOptions,
  normalizeSettings,
  readSettings,
  motionEnabled,
  applySettings,
  nextSettingsTab,
  settingsKey,
} from "./settings-model.js";
import { mountSettings } from "./settings.js";

function settingsHarness(
  t,
  { reduced = false, blocked = false, stored = {} } = {},
) {
  const root = { dataset: {} },
    writes = [],
    store = new Map(Object.entries(stored));
  let focused = null,
    applied = 0,
    reset = 0;
  const element = (extra = {}) => ({
    dataset: {},
    listeners: {},
    attrs: {},
    textContent: "",
    hidden: false,
    addEventListener(name, fn) {
      this.listeners[name] = fn;
    },
    setAttribute(name, value) {
      this.attrs[name] = value;
    },
    focus() {
      focused = this;
    },
    ...extra,
  });
  const controls = Object.entries(defaultSettings).flatMap(([key, value]) =>
    key === "skin"
      ? settingOptions.skin.map((skin) =>
          element({ dataset: { setting: key }, type: "radio", value: skin }),
        )
      : [
          element({
            dataset: { setting: key },
            type: typeof value === "boolean" ? "checkbox" : "select-one",
            value,
          }),
        ],
  );
  const ids = ["general", "accessibility", "customize"];
  const tabs = ids.map((id) => element({ dataset: { settingsTab: id } }));
  const panels = ids.map((id) => element({ id: `settings-${id}` }));
  const nodes = Object.fromEntries(
    [
      "#settings-status",
      "#motion-status",
      ".settings-content",
      "#settings-reset-confirm",
      "#settings-reset",
      "#settings-reset-cancel",
      "#settings-reset-accept",
      '[role="tablist"]',
    ].map((id) => [id, element()]),
  );
  nodes["#settings-reset-confirm"].hidden = true;
  const dialog = element({
    querySelector: (selector) => nodes[selector],
    querySelectorAll: (selector) =>
      selector === "[data-setting]"
        ? controls
        : selector === '[role="tab"]'
          ? tabs
          : panels,
  });
  const media = {
    matches: reduced,
    addEventListener(_, fn) {
      this.change = fn;
    },
  };
  const originalDocument = Object.getOwnPropertyDescriptor(
    globalThis,
    "document",
  );
  const originalMedia = Object.getOwnPropertyDescriptor(
    globalThis,
    "matchMedia",
  );
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { documentElement: root, querySelector: () => dialog },
  });
  Object.defineProperty(globalThis, "matchMedia", {
    configurable: true,
    value: () => media,
  });
  t.after(() => {
    if (originalDocument)
      Object.defineProperty(globalThis, "document", originalDocument);
    else delete globalThis.document;
    if (originalMedia)
      Object.defineProperty(globalThis, "matchMedia", originalMedia);
    else delete globalThis.matchMedia;
  });
  const api = mountSettings({
    read: (key) => store.get(key) || null,
    write: (key, value) => {
      writes.push(key);
      if (blocked) return false;
      store.set(key, value);
      return true;
    },
    onApply: () => {
      applied++;
    },
    onReset: () => {
      reset++;
      return !blocked;
    },
  });
  return {
    root,
    store,
    writes,
    controls,
    dialog,
    nodes,
    tabs,
    panels,
    media,
    api,
    get focused() {
      return focused;
    },
    get applied() {
      return applied;
    },
    get reset() {
      return reset;
    },
  };
}

test("controller changes persist and restore with native controls synchronized", (t) => {
  const h = settingsHarness(t, {
    stored: {
      [settingsKey]: JSON.stringify({
        ...defaultSettings,
        skin: "monolith",
        autoplay: false,
      }),
    },
  });
  assert.equal(h.root.dataset.skin, "monolith");
  assert.equal(
    h.controls.find((c) => c.dataset.setting === "autoplay").checked,
    false,
  );
  const input = h.controls.find((c) => c.dataset.setting === "contrast");
  input.checked = true;
  h.dialog.listeners.change({ target: { closest: () => input } });
  assert.equal(h.root.dataset.contrast, "high");
  assert.equal(JSON.parse(h.store.get(settingsKey)).contrast, true);
  assert.equal(
    h.controls.filter((c) => c.type === "radio" && c.checked).length,
    1,
  );
  assert.match(h.nodes["#settings-status"].textContent, /Saved/);
});
test("blocked storage keeps session state and announces the limitation", (t) => {
  const h = settingsHarness(t, { blocked: true });
  h.api.set("motion", "off");
  assert.equal(h.root.dataset.motion, "off");
  assert.equal(h.store.size, 0);
  assert.match(h.nodes["#settings-status"].textContent, /session.*unavailable/);
  h.media.matches = true;
  h.media.change();
  assert.equal(h.root.dataset.motion, "off");
});
test("system preference reacts live without overriding an explicit selection", (t) => {
  const h = settingsHarness(t);
  h.media.matches = true;
  h.media.change();
  assert.equal(h.root.dataset.motion, "off");
  h.api.set("motion", "on");
  h.media.change();
  assert.equal(h.root.dataset.motion, "on");
  h.api.set("motion", "system");
  assert.equal(h.root.dataset.motion, "off");
  h.media.matches = false;
  h.media.change();
  assert.equal(h.root.dataset.motion, "on");
});
test("reset requires confirmation, resets intro and preferences, and leaves bookmarks", (t) => {
  const h = settingsHarness(t, {
    stored: { "hirsu-saved-projects": '["maintaineros"]' },
  });
  h.api.set("skin", "icewire");
  h.api.set("autoplay", false);
  h.nodes["#settings-reset"].onclick();
  assert.equal(h.nodes["#settings-reset-confirm"].hidden, false);
  h.nodes["#settings-reset-cancel"].onclick();
  assert.equal(h.reset, 0);
  assert.equal(h.root.dataset.skin, "icewire");
  h.nodes["#settings-reset"].onclick();
  h.nodes["#settings-reset-accept"].onclick();
  assert.equal(h.reset, 1);
  assert.deepEqual(JSON.parse(h.store.get(settingsKey)), defaultSettings);
  assert.equal(h.store.get("hirsu-saved-projects"), '["maintaineros"]');
  assert.ok(!h.writes.includes("hirsu-saved-projects"));
  assert.equal(h.focused, h.nodes["#settings-reset"]);
});
test("controller tabs update visibility, selection, roving focus and scroll together", (t) => {
  const h = settingsHarness(t);
  h.nodes[".settings-content"].scrollTop = 90;
  h.api.selectTab("customize", true);
  assert.deepEqual(
    h.panels.map((p) => p.hidden),
    [true, true, false],
  );
  assert.deepEqual(
    h.tabs.map((p) => p.tabIndex),
    [-1, -1, 0],
  );
  assert.equal(h.focused, h.tabs[2]);
  assert.equal(h.nodes[".settings-content"].scrollTop, 0);
  h.api.selectTab("bad");
  assert.deepEqual(
    h.panels.map((p) => p.hidden),
    [false, true, true],
  );
});

test("preferences validate every value and ignore unknown or inherited keys", () => {
  for (const value of [null, [], true, "bad", 7])
    assert.deepEqual(normalizeSettings(value), defaultSettings);
  assert.deepEqual(
    normalizeSettings(Object.create({ skin: "icewire" })),
    defaultSettings,
  );
  assert.deepEqual(
    normalizeSettings({
      motion: "__proto__",
      autoplay: "false",
      contrast: 1,
      fx: "bad",
      extra: "x",
    }),
    defaultSettings,
  );
  for (const [key, values] of Object.entries(settingOptions))
    for (const value of values)
      assert.equal(normalizeSettings({ [key]: value })[key], value);
  assert.equal(normalizeSettings({ autoplay: false }).autoplay, false);
});
test("legacy motion migrates; current valid preferences take precedence", () => {
  assert.equal(readSettings(null, "off").motion, "off");
  assert.equal(readSettings(null, "on").motion, "on");
  assert.equal(readSettings(null, "system").motion, "system");
  assert.equal(readSettings("broken", null).motion, "system");
  assert.equal(
    readSettings('{"motion":"system","skin":"icewire"}', "off").motion,
    "system",
  );
  assert.equal(readSettings('{"skin":"monolith"}', null).skin, "monolith");
});
test("system motion follows OS; explicit off/on always wins", () => {
  for (const reduced of [true, false]) {
    assert.equal(motionEnabled({ motion: "off" }, reduced), false);
    assert.equal(motionEnabled({ motion: "on" }, reduced), true);
    assert.equal(motionEnabled({ motion: "system" }, reduced), !reduced);
  }
});
test("all settings apply independently and defaults fully reverse them", () => {
  const root = { dataset: {} };
  const custom = {
    ...defaultSettings,
    skin: "icewire",
    layout: "relic",
    fx: "crt",
    textSize: "large",
    motion: "off",
    contrast: true,
    underlineLinks: true,
    autoplay: false,
    shortcuts: false,
    smoothScroll: false,
    parallax: false,
  };
  applySettings(root, custom, false);
  assert.deepEqual(root.dataset, {
    layout: "relic",
    motion: "off",
    skin: "icewire",
    fx: "crt",
    textSize: "large",
    contrast: "high",
    links: "underlined",
    autoplay: "off",
    shortcuts: "off",
    smoothScroll: "off",
    parallax: "off",
  });
  applySettings(root, defaultSettings, false);
  assert.deepEqual(root.dataset, {
    layout: "overdrive",
    motion: "on",
    skin: "overdrive",
    fx: "signal",
    textSize: "standard",
    contrast: "normal",
    links: "normal",
    autoplay: "on",
    shortcuts: "on",
    smoothScroll: "on",
    parallax: "on",
  });
});
test("settings tabs support wrapping arrow keys and Home/End", () => {
  assert.equal(nextSettingsTab("general", "ArrowLeft"), "customize");
  assert.equal(nextSettingsTab("customize", "ArrowRight"), "general");
  assert.equal(nextSettingsTab("general", "End"), "customize");
  assert.equal(nextSettingsTab("customize", "Home"), "general");
});
test("navigation is separate; settings expose all preferences and labeled native tabs", () => {
  const html = readFileSync(new URL("index.html", import.meta.url), "utf8");
  const menu = html.match(/<dialog id="theme-dialog"[\s\S]*?<\/dialog>/)[0];
  assert.doesNotMatch(menu, /intro-options|data-setting=/);
  for (const key of Object.keys(defaultSettings))
    assert.ok(html.includes(`data-setting="${key}"`));
  for (const tab of ["general", "accessibility", "customize"]) {
    assert.ok(html.includes(`id="tab-${tab}"`));
    assert.ok(html.includes(`aria-controls="settings-${tab}"`));
    assert.ok(html.includes(`aria-labelledby="tab-${tab}"`));
  }
  assert.match(html.replace(/\s+/g, " "), /Your saved projects will stay/);
  const source = readFileSync(new URL("settings.js", import.meta.url), "utf8");
  assert.doesNotMatch(source, /localStorage\.clear|hirsu-saved-projects/);
});
test("pre-paint preferences agree with validated current settings and system motion", () => {
  const script = readFileSync(
    new URL("index.html", import.meta.url),
    "utf8",
  ).match(/<script>([\s\S]*?)<\/script>/)[1];
  for (const motion of ["system", "on", "off"])
    for (const reduced of [true, false]) {
      const document = { documentElement: { dataset: {} } };
      const prefs = {
        motion,
        skin: "icewire",
        layout: "netrunner",
        fx: "clean",
        contrast: true,
        textSize: "large",
      };
      runInNewContext(script, {
        document,
        matchMedia: () => ({ matches: reduced }),
        localStorage: {
          getItem: (key) =>
            key === "hirsu-settings-v14" ? JSON.stringify(prefs) : "on",
        },
      });
      assert.equal(
        document.documentElement.dataset.motion,
        motionEnabled(prefs, reduced) ? "on" : "off",
      );
      assert.equal(document.documentElement.dataset.skin, "icewire");
      assert.equal(document.documentElement.dataset.layout, "netrunner");
      assert.equal(document.documentElement.dataset.fx, "clean");
      assert.equal(document.documentElement.dataset.contrast, "high");
    }
});

test("partial or malformed stored preferences cannot cause a different first-paint motion choice", () => {
  const script = readFileSync(
    new URL("index.html", import.meta.url),
    "utf8",
  ).match(/<script>([\s\S]*?)<\/script>/)[1];
  for (const raw of [
    null,
    "broken",
    "null",
    "[]",
    '{"skin":"icewire"}',
    '{"motion":"invalid"}',
  ]) {
    for (const legacy of ["on", "off", "system", null])
      for (const reduced of [true, false]) {
        const document = { documentElement: { dataset: {} } };
        runInNewContext(script, {
          document,
          matchMedia: () => ({ matches: reduced }),
          localStorage: {
            getItem: (key) => (key === settingsKey ? raw : legacy),
          },
        });
        assert.equal(
          document.documentElement.dataset.motion,
          motionEnabled(readSettings(raw, legacy), reduced) ? "on" : "off",
        );
      }
  }
});
test("settings labels and ARIA targets resolve to unique elements", () => {
  const html = readFileSync(new URL("index.html", import.meta.url), "utf8");
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(ids.length, new Set(ids).size);
  const dialog = html.match(
    /<dialog id="settings-dialog"[\s\S]*?<\/dialog>/,
  )[0];
  for (const match of dialog.matchAll(
    /(?:aria-controls|aria-labelledby|aria-describedby|for)="([^"]+)"/g,
  ))
    for (const target of match[1].split(" "))
      assert.ok(ids.includes(target), target);
});
