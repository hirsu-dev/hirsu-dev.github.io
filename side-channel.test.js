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
import {
  mountRadio,
  radioVolume,
  radioRelease,
  radioContent,
  loadYouTubeAPI,
} from "./radio.js";
import { resolveRoute } from "./console-model.js";
import { focusAngles, spherePoints } from "./project-network.js";
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
  assert.match(radioContent(), /12% volume/);
  assert.match(radioContent(), /privacy/);
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
test("network aims every selected node at the front without a long rotation", () => {
  for (const point of spherePoints(7))
    for (const current of [0, 8, -40]) {
      const { angle, tilt } = focusAngles(point, current),
        [x, y, z] = point;
      const rx = x * Math.cos(angle) + z * Math.sin(angle),
        rz = z * Math.cos(angle) - x * Math.sin(angle);
      assert.ok(Math.abs(rx) < 1e-10);
      assert.ok(Math.abs(y * Math.cos(tilt) - rz * Math.sin(tilt)) < 1e-10);
      assert.ok(Math.abs(angle - current) <= Math.PI);
      assert.ok(y * Math.sin(tilt) + rz * Math.cos(tilt) > 0.99);
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
function radioHarness(t, { delayed = false, fail = false } = {}) {
  const h = dom(t, "<button data-radio-open>Open radio</button><main></main>");
  const calls = [],
    instances = [];
  let loads = 0,
    resolve;
  class Player {
    constructor(id, options) {
      this.options = options;
      instances.push(this);
    }
    setVolume(v) {
      calls.push(["volume", v]);
    }
    playVideo() {
      calls.push(["play"]);
    }
    pauseVideo() {
      calls.push(["pause"]);
    }
    mute() {
      calls.push(["mute"]);
    }
    unMute() {
      calls.push(["unmute"]);
    }
    destroy() {
      calls.push(["destroy"]);
    }
    getIframe() {
      return h.doc.createElement("iframe");
    }
  }
  const loadAPI = () => {
    loads++;
    return fail
      ? Promise.reject(new Error("blocked"))
      : delayed
        ? new Promise((r) => {
            resolve = r;
          })
        : Promise.resolve({ Player });
  };
  const radio = mountRadio({ loadAPI });
  h.cleanup(() => radio.dispose());
  return {
    ...h,
    calls,
    instances,
    radio,
    Player,
    get loads() {
      return loads;
    },
    resolve: () => resolve({ Player }),
    async load() {
      h.$("[data-radio-open]").click();
      h.$("#radio-load").click();
      await Promise.resolve();
    },
    ready() {
      const p = instances.at(-1);
      p.options.events.onReady({ target: p });
      return p;
    },
  };
}
test("radio makes zero provider requests until consent; controls wait for readiness", async (t) => {
  const h = radioHarness(t);
  assert.equal(h.loads, 0);
  assert.equal(h.$("#radio-deck").hidden, true);
  h.$("[data-radio-open]").click();
  assert.equal(h.loads, 0);
  assert.equal(h.$("#radio-play").disabled, true);
  await h.load();
  assert.equal(h.loads, 1);
  const p = h.ready();
  assert.equal(p.options.playerVars.autoplay, 0);
  assert.equal(p.options.playerVars.list, radioRelease.playlist);
  assert.equal(p.options.height, "200");
  assert.deepEqual(h.calls, [["volume", 12]]);
  assert.equal(h.$("#radio-play").disabled, false);
  h.$("#radio-play").click();
  assert.ok(h.calls.some(([name]) => name === "play"));
  p.options.events.onStateChange({ data: 1 });
  assert.equal(h.$("#radio-play").textContent, "Pause");
  h.$("#radio-mute").click();
  assert.equal(h.$("#radio-mute").getAttribute("aria-pressed"), "true");
  h.input(h.$("#radio-volume"), "6");
  assert.deepEqual(h.calls.at(-1), ["volume", 6]);
  h.$("main").innerHTML = labContent();
  assert.equal(h.instances.length, 1);
  h.radio.pause();
  assert.deepEqual(h.calls.at(-1), ["pause"]);
  h.$("[data-radio-close]").click();
  assert.equal(h.$("#radio-deck").hidden, true);
  assert.deepEqual(h.calls.at(-1), ["destroy"]);
  assert.equal(h.$("#radio-play").disabled, true);
});
test("closing during API loading prevents late playback creation", async (t) => {
  const h = radioHarness(t, { delayed: true });
  await h.load();
  h.$("[data-radio-close]").click();
  h.resolve();
  await Promise.resolve();
  assert.equal(h.instances.length, 0);
  assert.equal(h.$("#radio-deck").hidden, true);
});
test("blocked API and unavailable tracks offer retry and official release fallback", async (t) => {
  const h = radioHarness(t, { fail: true });
  await h.load();
  assert.equal(h.$("#radio-load").disabled, false);
  assert.match(h.$("#radio-state").textContent, /blocked/);
  assert.equal(h.$(".radio-fallback").href, radioRelease.url);
});
test("player errors destroy the failed instance and late events cannot resurrect it", async (t) => {
  const h = radioHarness(t);
  await h.load();
  const p = h.ready();
  p.options.events.onError({ data: 150 });
  assert.equal(h.$("#radio-frame").hidden, true);
  p.options.events.onStateChange({ data: 1 });
  assert.equal(h.$("#radio-play").disabled, true);
  assert.match(h.$("#radio-state").textContent, /unavailable/);
});
test("backgrounding pauses music without automatic resumption", async (t) => {
  const h = radioHarness(t);
  await h.load();
  h.ready();
  Object.defineProperty(h.doc, "hidden", { value: true, configurable: true });
  h.doc.dispatchEvent(new h.win.Event("visibilitychange"));
  assert.deepEqual(h.calls.at(-1), ["pause"]);
  const count = h.calls.length;
  Object.defineProperty(h.doc, "hidden", { value: false, configurable: true });
  h.doc.dispatchEvent(new h.win.Event("visibilitychange"));
  assert.equal(h.calls.length, count);
});
test("radio volume clamps bad values", () => {
  assert.equal(radioVolume(-5), 0);
  assert.equal(radioVolume(200), 100);
  assert.equal(radioVolume("bad"), 12);
});
test("actual API loader is lazy, shares pending load, and recovers after script blocking", async (t) => {
  const h = dom(t);
  let script;
  h.doc.head.append = (node) => {
    script = node;
  };
  const first = loadYouTubeAPI();
  const second = loadYouTubeAPI();
  assert.equal(first, second);
  assert.equal(script.src, "https://www.youtube.com/iframe_api");
  script.dispatchEvent(new h.win.Event("error"));
  await assert.rejects(first);
  const retry = loadYouTubeAPI();
  h.win.YT = { Player: class {} };
  h.win.onYouTubeIframeAPIReady();
  assert.equal(await retry, h.win.YT);
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
  h.win.history.replaceState(null, "", "#lab");
  h.win.HTMLCanvasElement.prototype.getContext = () => null;
  await import("./console.js?integration-v15");
  assert.ok(h.$("#signal-controls"));
  const deck = h.$("#radio-deck");
  const go = (hash) => {
    h.win.history.replaceState(null, "", "#" + hash);
    h.win.dispatchEvent(new h.win.HashChangeEvent("hashchange"));
  };
  go("radio");
  assert.ok(h.$(".radio-station"));
  h.$("[data-radio-open]").click();
  assert.equal(deck.hidden, false);
  go("archive");
  assert.ok(h.$("#packet-form"));
  assert.equal(h.$("#radio-deck"), deck);
  go("lab");
  h.input(h.$('[name="text"]'), "ROUTE CHECK");
  assert.equal(h.$("#signal-preview").textContent, "ROUTE CHECK");
  go("network");
  assert.ok(h.$(".network-inspector"));
  assert.equal(h.$("#network-shell").dataset.renderer, "unavailable");
  go("maintaineros");
  assert.match(h.$("#screen").textContent, /MaintainerOS/);
  go("index");
  assert.ok(h.$(".overdrive-home"));
  assert.equal(h.doc.querySelectorAll("#radio-deck").length, 1);
  go("projects");
  assert.equal(h.doc.querySelectorAll(".project-card").length, 7);
  go("about");
  assert.match(h.$("#screen").textContent, /Optional music/);
  h.$("#city-settings").click();
  assert.equal(h.$("#settings-dialog").open, true);
  assert.equal(
    h.doc.querySelectorAll('script[src="https://www.youtube.com/iframe_api"]')
      .length,
    0,
  );
});
