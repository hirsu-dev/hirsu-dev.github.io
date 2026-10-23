import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Window } from "happy-dom";
import { buildLabContent } from "./build-lab.js";
import { radioTracks } from "./music.js";
import {
  netrunnerHome,
  relicHome,
  mountLayout,
  layoutProjects,
} from "./layouts.js";
import { resolveRoute } from "./console-model.js";
import {
  atlasPoints,
  atlasProject,
  atlasFocus,
  atlasCamera,
} from "./atlas-model.js";
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
  for (const route of ["lab", "radio"])
    assert.equal(resolveRoute("#" + route), route);
  assert.equal(resolveRoute("#radio/../../"), "index");
  assert.equal(resolveRoute("#archive"), "lab");
  const html = readFileSync(new URL("index.html", import.meta.url), "utf8");
  assert.match(html, /href="#lab"/);
  assert.match(html, /href="#radio"/);
  assert.doesNotMatch(html, /<iframe|src="https:\/\/www.youtube/);
  assert.equal(radioTracks.length, 5);
  assert.equal(
    radioTracks.filter((track) => track.type === "playlist").length,
    0,
  );
});
test("night sky focuses project constellations with a perspective orbit camera", () => {
  for (const point of atlasPoints()) {
    const p = atlasProject(
      point,
      { ...atlasCamera(), ...atlasFocus(point) },
      720,
      590,
    );
    assert.ok(p.x > 120 && p.x < 600);
    assert.ok(p.y > 70 && p.y < 520);
  }
});

test("network inspector links only to actual projects and explains each connection", (t) => {
  const h = dom(t, networkContent());
  assert.equal(h.doc.querySelectorAll("[data-node-index]").length, 14);
  assert.equal(h.doc.querySelectorAll(".network-index a").length, 14);
  for (let i = 0; i < projects.length; i++) {
    const html = networkInspector(i);
    const text = h.doc.createElement("div");
    text.innerHTML = html;
    assert.ok(text.textContent.includes(projects[i].title));
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

test("Netrunner filters real project files and keeps the inspector and source factual", (t) => {
  const h = dom(t, netrunnerHome());
  h.cleanup(mountLayout(h.doc.body));
  assert.equal(h.doc.querySelectorAll("[data-layout-project]").length, 14);
  assert.match(h.$("#layout-inspector").textContent, /MaintainerOS/);
  h.input(h.$("#layout-search"), "Robo Telescope");
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
  assert.equal(h.$("#layout-result-count").textContent, "14");
  h.$('[data-layout-project="5"]').click();
  assert.match(h.$("#layout-inspector").textContent, /existing models/);
  assert.equal(h.$(".nr-notes").open, false);
});
test("Relic changes project files and supports keyboard chapter navigation and cleanup", (t) => {
  const h = dom(t, relicHome());
  const dispose = mountLayout(h.doc.body);
  h.cleanup(dispose);
  h.$('[data-file-step="-1"]').click();
  assert.match(h.$("#layout-inspector-title").textContent, /Fieldnotes/);
  assert.match(h.$("#relic-file-number").textContent, /14/);
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
  await import("./console.js?integration-v20");
  assert.ok(h.$(".build-lab"));
  assert.equal(h.doc.documentElement.dataset.intro, "redline");
  assert.equal(h.$('input[name="startup"]:checked').value, "redline");
  const deck = h.$("#music-dock");
  const go = (hash) => {
    h.win.history.replaceState(null, "", "#" + hash);
    h.win.dispatchEvent(new h.win.HashChangeEvent("hashchange"));
  };
  h.$('a[href="#radio"]').click();
  assert.ok(h.$(".build-lab"), "opening music preserves current page");
  assert.equal(deck.hidden, false);
  go("archive");
  assert.ok(h.$(".build-lab"));
  assert.equal(h.$("#packet-form"), null);
  assert.equal(h.$("#music-dock"), deck);
  go("lab");
  h.input(h.$("#aim-az"), "150");
  assert.equal(h.$("#aim-az-value").textContent, "150°");
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
  assert.equal(h.doc.querySelectorAll(".project-card").length, 14);
  chooseLayout("overdrive");
  assert.equal(
    h.doc.querySelectorAll(".project-card").length,
    14,
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
