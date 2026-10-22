import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Window } from "happy-dom";
import {
  signalPresets,
  signalSettings,
  signalCSS,
  fragments,
  decodeFragment,
  recoveredFragments,
} from "./signal-model.js";
import { labContent, archiveContent, mountSignalPage } from "./signal-pages.js";
import { mountRadio, radioTracks, loadSpotifyAPI } from "./music.js";
import {
  netrunnerHome,
  relicHome,
  mountLayout,
  layoutProjects,
} from "./layouts.js";
import { resolveRoute } from "./console-model.js";
import { skyPoints, projectStar, focusStar } from "./sky-model.js";
import {
  networkContent,
  networkInspector,
  networkLinks,
} from "./network-view.js";
import { projects } from "./projects.js";

// DOM unit tests, NOT a visual browser or a live streaming integration test.
// Script/stylesheet loading is explicitly disabled; provider playback is mocked.
function dom(t, html = "", extraGlobals = () => ({})) {
  const cleanups = [];
  const win = new Window({
    url: "https://portfolio.test/",
    settings: {
      disableJavaScriptFileLoading: true,
      enableCSSFileLoading: false,
    },
  });
  const globals = {
    window: win,
    document: win.document,
    location: win.location,
    navigator: { clipboard: { writeText: async () => {} } },
    ...extraGlobals(win),
  };
  const original = new Map(
    Object.keys(globals).map((key) => [
      key,
      Object.getOwnPropertyDescriptor(globalThis, key),
    ]),
  );
  Object.entries(globals).forEach(([key, value]) =>
    Object.defineProperty(globalThis, key, {
      value,
      configurable: true,
      writable: true,
    }),
  );
  win.document.body.innerHTML = html;
  win.document.documentElement.dataset.motion = "on";
  t.after(async () => {
    for (const cleanup of cleanups.reverse()) cleanup();
    await win.happyDOM.close();
    original.forEach((descriptor, key) =>
      descriptor
        ? Object.defineProperty(globalThis, key, descriptor)
        : delete globalThis[key],
    );
  });
  return {
    win,
    doc: win.document,
    cleanup: (fn) => cleanups.push(fn),
    $: (s) => win.document.querySelector(s),
    input: (el, value) => {
      el.value = value;
      el.dispatchEvent(new win.Event("input", { bubbles: true }));
    },
  };
}
test("new routes and menus expose real pages, while the archive stays discoverable", () => {
  for (const route of ["lab", "radio", "archive"])
    assert.equal(resolveRoute("#" + route), route);
  assert.equal(resolveRoute("#radio/../../"), "index");
  const html = readFileSync(new URL("index.html", import.meta.url), "utf8");
  assert.match(html, /href="#lab"/);
  assert.match(html, /href="#radio"/);
  assert.doesNotMatch(html, /<iframe|src="https:\/\/www.youtube/);
  assert.equal(radioTracks.length, 7);
  assert.equal(
    radioTracks.filter((track) => track.type === "playlist").length,
    1,
  );
});
test("signal export bounds and sanitizes values, and includes reduced-motion fallback", () => {
  assert.deepEqual(
    signalSettings({
      color: "red;url(bad)",
      offset: Infinity,
      speed: -90,
      lines: false,
    }),
    { color: "#fcee0a", offset: 4, speed: 1.5, lines: false },
  );
  for (const preset of Object.values(signalPresets)) {
    const css = signalCSS(preset);
    assert.match(css, /prefers-reduced-motion/);
    assert.doesNotMatch(css, /url\(|@import/);
  }
  assert.match(signalCSS({ offset: 300, speed: 900 }), /12px/);
  assert.match(signalCSS({ offset: 300, speed: 900 }), /6s/);
});
test("Signal Lab edits preview safely, switches presets, pauses and exports live CSS", async (t) => {
  const h = dom(t, labContent()),
    toasts = [];
  const dispose = mountSignalPage(h.doc.body, {
    read: () => null,
    write: () => true,
    toast: (s) => toasts.push(s),
  });
  h.cleanup(dispose);
  h.input(h.$('[name="text"]'), '<img src=x onerror="bad">');
  assert.equal(h.$("#signal-preview").children.length, 0);
  assert.match(h.$("#signal-preview").textContent, /<img/);
  h.$('[data-preset="ice"]').click();
  assert.equal(h.$('[name="color"]').value, "#79edf0");
  assert.equal(h.$('[name="lines"]').checked, false);
  assert.match(h.$("#signal-source").value, /4.8s/);
  h.$("#signal-pause").click();
  assert.equal(h.$("#signal-preview").dataset.paused, "true");
  h.$("#signal-pause").click();
  h.doc.documentElement.dataset.motion = "off";
  h.doc.dispatchEvent(new h.win.Event("appearancechange"));
  assert.equal(h.$("#signal-mode").textContent, "STATIC PREVIEW");
  let copied;
  navigator.clipboard.writeText = async (value) => {
    copied = value;
  };
  h.$("#signal-copy").click();
  await Promise.resolve();
  assert.equal(copied, h.$("#signal-source").value);
  assert.equal(toasts[0], "CSS copied.");
  h.input(h.$('[name="color"]'), "#ff06b5");
  assert.match(h.$("#signal-status").textContent, /FF:06:B5/);
  dispose();
  h.input(h.$('[name="text"]'), "AFTER DISPOSE");
  assert.doesNotMatch(h.$("#signal-preview").textContent, /AFTER DISPOSE/);
});
test("clipboard failure keeps generated CSS selectable without losing it", async (t) => {
  const h = dom(t, labContent()),
    toasts = [];
  const dispose = mountSignalPage(h.doc.body, {
    read: () => null,
    write: () => true,
    toast: (s) => toasts.push(s),
  });
  h.cleanup(dispose);
  navigator.clipboard.writeText = async () => {
    throw new Error("blocked");
  };
  h.$("#signal-copy").click();
  await Promise.resolve();
  assert.equal(h.doc.activeElement.id, "signal-source");
  assert.match(toasts[0], /manually/);
});
test("all recovery codes normalize safely; saved fragments are validated", () => {
  assert.equal(decodeFragment(" FF:06:B5 ").id, "magenta");
  for (const f of fragments)
    assert.equal(decodeFragment(f.code.toUpperCase()).id, f.id);
  assert.equal(decodeFragment("<script>"), null);
  assert.deepEqual([...recoveredFragments('["cat","bad","cat"]')], ["cat"]);
  assert.equal(recoveredFragments('{"cat":true}').size, 0);
  assert.equal(recoveredFragments("bad").size, 0);
});
test("archive decodes, persists, restores, and clears only its own discoveries", (t) => {
  const store = new Map(),
    h = dom(t, archiveContent(null));
  const dispose = mountSignalPage(h.doc.body, {
    read: (key) => store.get(key),
    write: (key, value) => {
      store.set(key, value);
      return true;
    },
    toast() {},
  });
  h.cleanup(dispose);
  for (const f of fragments) {
    h.$("#packet-code").value = f.code;
    h.$("#packet-form").dispatchEvent(
      new h.win.Event("submit", { bubbles: true, cancelable: true }),
    );
  }
  assert.match(h.$("#packet-status").textContent, /4 \/ 4/);
  assert.equal(h.doc.querySelectorAll('[data-found="true"]').length, 4);
  assert.match(
    archiveContent(store.get("hirsu-fragments-v15")),
    /LUNAR UPLINK/,
  );
  h.$("#packet-reset").click();
  assert.equal(h.doc.querySelectorAll('[data-found="true"]').length, 0);
  assert.deepEqual([...store.keys()], ["hirsu-fragments-v15"]);
});
test("blocked fragment storage is announced and unknown codes are harmless", (t) => {
  const h = dom(t, archiveContent(null));
  const dispose = mountSignalPage(h.doc.body, {
    read: () => null,
    write: () => false,
    toast() {},
  });
  h.cleanup(dispose);
  h.$("#packet-code").value = "moon";
  h.$("#packet-form").dispatchEvent(
    new h.win.Event("submit", { bubbles: true, cancelable: true }),
  );
  assert.match(h.$("#packet-status").textContent, /session only/);
  h.$("#packet-code").value = "<script>";
  h.$("#packet-form").dispatchEvent(
    new h.win.Event("submit", { bubbles: true, cancelable: true }),
  );
  assert.match(h.$("#packet-status").textContent, /No match/);
});
test("night sky focuses project constellations with a flat pan-and-zoom camera", () => {
  for (const point of skyPoints(720, 590)) {
    const p = projectStar(point, focusStar(point), 720, 590);
    assert.equal(p.x, 360);
    assert.equal(p.y, 295);
  }
});

test("network inspector links only to actual projects and explains each connection", (t) => {
  const h = dom(t, networkContent());
  assert.equal(h.doc.querySelectorAll("[data-node-index]").length, 7);
  assert.equal(h.doc.querySelectorAll(".network-index a").length, 7);
  for (let i = 0; i < projects.length; i++) {
    const html = networkInspector(i);
    assert.ok(html.includes(projects[i].title));
    assert.match(html, /RELATED WORK/);
  }
  assert.ok(
    networkLinks.every(
      ([a, b, why]) =>
        projects.some((p) => p.id === a) &&
        projects.some((p) => p.id === b) &&
        why.length,
    ),
  );
});

function radioHarness(
  t,
  {
    delayed = false,
    delayedController = false,
    fail = false,
    readyTimeout = 15000,
  } = {},
) {
  const h = dom(t, "<button data-radio-open>Open radio</button><main></main>");
  const calls = [],
    instances = [];
  let loads = 0,
    resolve,
    create;
  const api = {
    createController(host, options, callback) {
      const p = {
        options,
        events: {},
        addListener(event, fn) {
          this.events[event] = fn;
        },
        loadEntity(uri) {
          calls.push(["load", uri]);
        },
        play() {
          calls.push(["play"]);
        },
        pause() {
          calls.push(["pause"]);
        },
        destroy() {
          calls.push(["destroy"]);
        },
      };
      instances.push(p);
      create = () => callback(p);
      if (!delayedController) create();
    },
  };
  const radio = mountRadio({
    readyTimeout,
    loadAPI: () => {
      loads++;
      return fail
        ? Promise.reject(new Error("blocked"))
        : delayed
          ? new Promise((r) => {
              resolve = r;
            })
          : Promise.resolve(api);
    },
  });
  h.cleanup(() => radio.dispose());
  return {
    ...h,
    calls,
    instances,
    radio,
    get loads() {
      return loads;
    },
    resolve: () => resolve(api),
    create: () => create(),
    async load() {
      h.$("[data-radio-open]").click();
      h.$("#radio-load").click();
      await Promise.resolve();
    },
    ready() {
      const p = instances.at(-1);
      p.events.ready();
      return p;
    },
  };
}

test("music makes no provider requests until Enable, and never auto-plays on connection", async (t) => {
  const h = radioHarness(t);
  assert.equal(h.loads, 0);
  assert.equal(h.$("#music-dock").hidden, true);
  h.$("[data-radio-open]").click();
  assert.equal(h.loads, 0);
  assert.equal(h.$("#radio-play").disabled, true);
  await h.load();
  const p = h.ready();
  assert.equal(p.options.uri, radioTracks[0].uri);
  assert.equal(p.options.height, 152);
  assert.equal(
    h.calls.some(([name]) => name === "play"),
    false,
  );
  h.$("#radio-play").click();
  assert.deepEqual(h.calls.at(-1), ["play"]);
  p.events.playback_update({ data: { isPaused: false } });
  assert.equal(h.$("#radio-play").textContent, "Pause");
  h.$("#radio-play").click();
  assert.deepEqual(h.calls.at(-1), ["pause"]);
  assert.match(h.$("#radio-queue").textContent, /volume API/);
  assert.equal(h.$("#radio-volume"), null);
  assert.match(h.$("#radio-queue").textContent, /previews/);
  h.$("[data-radio-close]").click();
  assert.deepEqual(h.calls.at(-1), ["destroy"]);
  assert.equal(h.$("#music-dock").hidden, true);
  assert.equal(h.doc.documentElement.dataset.music, undefined);
});

test("six song selections and official continuous mix wrap without recreating the player", async (t) => {
  const h = radioHarness(t);
  await h.load();
  h.ready();
  h.$("#radio-prev").click();
  assert.deepEqual(h.calls.at(-1), ["load", radioTracks.at(-1).uri]);
  assert.equal(h.$("#radio-track").value, "6");
  h.$("#radio-next").click();
  assert.equal(h.$("#radio-track").value, "0");
  h.$("#radio-track").value = "3";
  h.$("#radio-track").dispatchEvent(
    new h.win.Event("change", { bubbles: true }),
  );
  assert.deepEqual(h.calls.at(-1), ["load", radioTracks[3].uri]);
  assert.equal(h.$(".radio-fallback").href, radioTracks[3].url);
  assert.equal(h.instances.length, 1);
  h.$("#radio-queue-toggle").click();
  assert.equal(h.$("#radio-queue").hidden, false);
  assert.equal(
    h.$("#radio-queue-toggle").getAttribute("aria-expanded"),
    "true",
  );
  h.$("#radio-queue-toggle").click();
  assert.equal(h.$("#radio-queue").hidden, true);
});

test("closing while API or controller is pending cancels stale initialization", async (t) => {
  const h = radioHarness(t, { delayed: true });
  await h.load();
  h.$("[data-radio-close]").click();
  h.resolve();
  await Promise.resolve();
  assert.equal(h.instances.length, 0);
  assert.equal(h.$("#music-dock").hidden, true);
});
test("late controller is destroyed after close", async (t) => {
  const h = radioHarness(t, { delayedController: true });
  await h.load();
  h.$("[data-radio-close]").click();
  h.create();
  assert.deepEqual(h.calls.at(-1), ["destroy"]);
  assert.equal(h.$("#radio-play").disabled, true);
});
test("changing the selection during readiness loads the latest selection", async (t) => {
  const h = radioHarness(t);
  await h.load();
  h.$("#radio-next").click();
  h.ready();
  assert.deepEqual(h.calls.at(-1), ["load", radioTracks[1].uri]);
});
test("blocked connection offers retry and official fallback", async (t) => {
  const h = radioHarness(t, { fail: true });
  await h.load();
  assert.equal(h.$("#radio-load").disabled, false);
  assert.match(h.$("#radio-state").textContent, /blocked/);
  assert.equal(h.$(".radio-fallback").href, radioTracks[0].url);
});
test("controller timeout cleans up and late events cannot resurrect playback", async (t) => {
  const h = radioHarness(t, { readyTimeout: 5 });
  await h.load();
  const p = h.instances[0];
  await new Promise((resolve) => setTimeout(resolve, 15));
  assert.deepEqual(h.calls.at(-1), ["destroy"]);
  p.events.ready();
  p.events.playback_update({ data: { isPaused: false } });
  assert.equal(h.$("#radio-play").disabled, true);
  assert.equal(h.$("#radio-frame").hidden, true);
  assert.match(h.$("#radio-state").textContent, /unavailable/);
});
test("background music stays connected through page content changes and visibility events", async (t) => {
  const h = radioHarness(t);
  await h.load();
  const p = h.ready();
  p.events.playback_update({ data: { isPaused: false } });
  const count = h.calls.length;
  h.$("main").innerHTML = labContent();
  Object.defineProperty(h.doc, "hidden", { value: true, configurable: true });
  h.doc.dispatchEvent(new h.win.Event("visibilitychange"));
  assert.equal(h.calls.length, count);
  assert.equal(h.instances.length, 1);
  h.radio.dispose();
  h.radio.dispose();
  assert.equal(h.$("#music-dock"), null);
});
test("Spotify API loader shares requests and recovers after a blocked script", async (t) => {
  const h = dom(t);
  let script;
  h.doc.head.append = (node) => {
    script = node;
  };
  const first = loadSpotifyAPI(),
    second = loadSpotifyAPI();
  assert.equal(first, second);
  assert.equal(script.src, "https://open.spotify.com/embed/iframe-api/v1");
  script.dispatchEvent(new h.win.Event("error"));
  await assert.rejects(first);
  const retry = loadSpotifyAPI();
  const api = { createController() {} };
  h.win.onSpotifyIframeApiReady(api);
  assert.equal(await retry, api);
});

test("Netrunner filters real project files and keeps the inspector and source factual", (t) => {
  const h = dom(t, netrunnerHome());
  h.cleanup(mountLayout(h.doc.body));
  assert.equal(h.doc.querySelectorAll("[data-layout-project]").length, 7);
  assert.match(h.$("#layout-inspector").textContent, /MaintainerOS/);
  h.input(h.$("#layout-search"), "telescope");
  assert.equal(h.$("#layout-result-count").textContent, "1");
  assert.match(h.$("#layout-inspector").textContent, /currently broken/);
  assert.equal(
    h.$('[data-layout-project="3"]').getAttribute("aria-pressed"),
    "true",
  );
  h.input(h.$("#layout-search"), "no such project");
  assert.equal(h.$("#layout-empty").hidden, false);
  assert.equal(h.$("#layout-result-count").textContent, "0");
  h.input(h.$("#layout-search"), "");
  assert.equal(h.$("#layout-result-count").textContent, "7");
  h.$('[data-layout-project="5"]').click();
  assert.match(h.$("#layout-inspector").textContent, /existing models/);
  assert.equal(h.$(".nr-notes").open, false);
});
test("Relic changes project files and supports keyboard chapter navigation and cleanup", (t) => {
  const h = dom(t, relicHome());
  const dispose = mountLayout(h.doc.body);
  h.cleanup(dispose);
  h.$('[data-file-step="-1"]').click();
  assert.match(h.$("#layout-inspector-title").textContent, /Hyprland/);
  assert.match(h.$("#relic-file-number").textContent, /07/);
  h.$('[data-file-step="1"]').click();
  assert.match(h.$("#layout-inspector-title").textContent, /MaintainerOS/);
  h.$('[data-layout-project="3"]').click();
  h.$('[data-chapter="1"]').click();
  assert.equal(h.$("#relic-chapter-1").hidden, false);
  assert.match(h.$("#relic-chapter-1").textContent, /currently broken/);
  const tab = h.$('[data-chapter="1"]');
  tab.dispatchEvent(
    new h.win.KeyboardEvent("keydown", { key: "End", bubbles: true }),
  );
  assert.equal(h.doc.activeElement.id, "relic-tab-2");
  assert.equal(h.$("#relic-chapter-2").hidden, false);
  h.$('[data-chapter="2"]').dispatchEvent(
    new h.win.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
  );
  assert.equal(h.doc.activeElement.id, "relic-tab-0");
  dispose();
  h.$('[data-file-step="1"]').click();
  assert.match(h.$("#layout-inspector-title").textContent, /Telescope/);
});
test("both layout templates use all real project images and unique accessible targets", (t) => {
  const h = dom(t);
  for (const content of [netrunnerHome(), relicHome()]) {
    h.doc.body.innerHTML = content;
    const dispose = mountLayout(h.doc.body);
    for (let i = 0; i < layoutProjects.length; i++) {
      h.$('[data-layout-project="' + i + '"]').click();
      assert.equal(
        h.$(".layout-media img").getAttribute("src"),
        layoutProjects[i].image,
      );
      assert.equal(
        h.$(".layout-media figcaption").textContent,
        layoutProjects[i].caption,
      );
      const ids = [...h.doc.querySelectorAll("[id]")].map((el) => el.id);
      assert.equal(ids.length, new Set(ids).size);
      for (const el of h.doc.querySelectorAll(
        "[aria-controls], [aria-labelledby]",
      )) {
        for (const attr of ["aria-controls", "aria-labelledby"]) {
          for (const id of (el.getAttribute(attr) || "")
            .split(" ")
            .filter(Boolean))
            assert.ok(h.doc.getElementById(id), id);
        }
      }
    }
    dispose();
  }
});

test("full app routes new pages, preserves the deck, and retains existing projects/settings", async (t) => {
  const h = dom(t, "", (win) => ({
    Event: win.Event,
    history: win.history,
    localStorage: win.localStorage,
    matchMedia: win.matchMedia.bind(win),
    requestAnimationFrame: () => 0,
    cancelAnimationFrame: () => {},
  }));
  h.doc.write(readFileSync(new URL("index.html", import.meta.url), "utf8"));
  h.win.localStorage.setItem(
    "hirsu-settings-v14",
    JSON.stringify({ motion: "off", autoplay: false }),
  );
  h.win.localStorage.setItem("hirsu-startup-v12", "fracture");
  h.win.history.replaceState(null, "", "#lab");
  h.win.HTMLCanvasElement.prototype.getContext = () => null;
  await import("./console.js?integration-v18");
  assert.ok(h.$("#signal-controls"));
  assert.equal(h.doc.documentElement.dataset.intro, "redline");
  assert.equal(h.$('input[name="startup"]:checked').value, "redline");
  const deck = h.$("#music-dock");
  const go = (hash) => {
    h.win.history.replaceState(null, "", "#" + hash);
    h.win.dispatchEvent(new h.win.HashChangeEvent("hashchange"));
  };
  h.$('a[href="#radio"]').click();
  assert.ok(h.$("#signal-controls"), "opening music preserves current page");
  assert.equal(deck.hidden, false);
  go("archive");
  assert.ok(h.$("#packet-form"));
  assert.equal(h.$("#music-dock"), deck);
  go("lab");
  h.input(h.$('[name="text"]'), "ROUTE CHECK");
  assert.equal(h.$("#signal-preview").textContent, "ROUTE CHECK");
  go("network");
  assert.ok(h.$(".network-inspector"));
  assert.equal(h.$("#network-shell").dataset.renderer, "unavailable");
  h.$('[data-node-index="4"]').click();
  assert.match(h.$(".network-inspector").textContent, /MaintainerOS/);
  assert.equal(h.$("#sky-pause").disabled, true);
  go("maintaineros");
  assert.match(h.$("#screen").textContent, /MaintainerOS/);
  go("index");
  assert.ok(h.$(".overdrive-home"));
  assert.equal(h.doc.querySelectorAll("#music-dock").length, 1);

  const chooseLayout = (value) => {
    const input = h.$('[data-setting="layout"][value="' + value + '"]');
    input.checked = true;
    input.dispatchEvent(new h.win.Event("change", { bubbles: true }));
  };
  chooseLayout("netrunner");
  assert.ok(h.$(".netrunner-home"));
  assert.equal(h.$("#music-dock"), deck);
  chooseLayout("relic");
  assert.ok(h.$(".relic-home"));
  chooseLayout("switchboard");
  assert.ok(h.$(".switchboard-home"));
  h.$('[data-sb-select="robo-telescope"]').click();
  h.$('[data-sb-pin="0"]').click();
  assert.match(h.$("#sb-comparison").textContent, /Under repair/);
  assert.equal(h.$("#music-dock"), deck);
  chooseLayout("netrunner");
  assert.ok(h.$(".netrunner-home"));
  chooseLayout("switchboard");
  assert.match(h.$("#sb-file-title").textContent, /Telescope/);
  assert.equal(h.$('[data-sb-socket="0"]').value, "robo-telescope");
  go("projects");
  assert.equal(h.doc.querySelectorAll(".project-card").length, 7);
  chooseLayout("overdrive");
  assert.equal(
    h.doc.querySelectorAll(".project-card").length,
    7,
    "layout selection preserves route",
  );
  go("index");
  assert.ok(h.$(".overdrive-home"));
  assert.equal(h.$("#music-dock"), deck);
  go("radio");
  assert.equal(h.win.location.hash, "#index");
  assert.equal(deck.hidden, false);
  go("about");
  assert.match(h.$("#screen").textContent, /Optional music/);
  h.$("#city-settings").click();
  assert.equal(h.$("#settings-dialog").open, true);
  assert.equal(
    h.doc.querySelectorAll(
      'script[src="https://open.spotify.com/embed/iframe-api/v1"]',
    ).length,
    0,
  );
});
