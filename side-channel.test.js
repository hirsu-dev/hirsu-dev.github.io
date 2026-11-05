import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Window } from "happy-dom";
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
test("retired utility URLs resolve to the portfolio without exposing removed features", () => {
  for (const route of ["lab", "archive", "experiments"])
    assert.equal(resolveRoute("#" + route), "projects");
  assert.equal(resolveRoute("#radio"), "index");
  const html = readFileSync(new URL("index.html", import.meta.url), "utf8");
  assert.doesNotMatch(
    html,
    /href="#(?:lab|radio|experiments)"|music\.css|build-lab\.css|Stellarium/,
  );
  assert.match(html, /value="orbit"/);
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
  assert.equal(
    h.doc.querySelectorAll("[data-node-index]").length,
    projects.length,
  );
  assert.equal(
    h.doc.querySelectorAll(".network-index a").length,
    projects.length,
  );
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
  assert.equal(
    h.doc.querySelectorAll("[data-layout-project]").length,
    projects.length,
  );
  assert.match(h.$("#layout-inspector").textContent, /MaintainerOS/);
  h.input(h.$("#layout-search"), "Robo Telescope");
  assert.equal(h.$("#layout-result-count").textContent, "1");
  assert.match(h.$("#layout-inspector").textContent, /currently broken/);
  assert.equal(
    h
      .$(
        '[data-layout-project="' +
          layoutProjects.findIndex((p) => p.id === "robo-telescope") +
          '"]',
      )
      .getAttribute("aria-pressed"),
    "true",
  );
  h.input(h.$("#layout-search"), "no such project");
  assert.equal(h.$("#layout-empty").hidden, false);
  assert.equal(h.$("#layout-result-count").textContent, "0");
  h.input(h.$("#layout-search"), "");
  assert.equal(
    h.$("#layout-result-count").textContent,
    String(projects.length),
  );
  h.$(
    '[data-layout-project="' +
      layoutProjects.findIndex((p) => p.id === "nexus-ai") +
      '"]',
  ).click();
  assert.match(h.$("#layout-inspector").textContent, /existing models/);
  assert.equal(h.$(".nr-notes").open, false);
});
test("Relic changes project files and supports keyboard chapter navigation and cleanup", (t) => {
  const h = dom(t, relicHome());
  const dispose = mountLayout(h.doc.body);
  h.cleanup(dispose);
  h.$('[data-file-step="-1"]').click();
  assert.match(h.$("#layout-inspector-title").textContent, /Fieldnotes/);
  assert.equal(
    h.$("#relic-file-number").textContent,
    `FILE ${projects.length} / ${projects.length}`,
  );
  h.$('[data-file-step="1"]').click();
  assert.match(h.$("#layout-inspector-title").textContent, /MaintainerOS/);
  h.$(
    '[data-layout-project="' +
      layoutProjects.findIndex((p) => p.id === "robo-telescope") +
      '"]',
  ).click();
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

test("portfolio switches five layouts, retires utilities and keeps project navigation", async (t) => {
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
  h.win.history.replaceState(null, "", "#projects");
  h.win.HTMLCanvasElement.prototype.getContext = () => null;
  await import("./console.js?pure-portfolio-v27");
  const go = (hash) => {
    h.win.history.replaceState(null, "", "#" + hash);
    h.win.dispatchEvent(new h.win.HashChangeEvent("hashchange"));
  };
  const choose = (value) => {
    const c = h.$('[data-setting="layout"][value="' + value + '"]');
    c.checked = true;
    c.dispatchEvent(new h.win.Event("change", { bubbles: true }));
  };
  assert.equal(h.doc.querySelectorAll(".project-card").length, projects.length);
  for (const route of ["lab", "archive", "experiments"]) {
    go(route);
    assert.equal(h.doc.documentElement.dataset.page, "projects");
  }
  go("radio");
  assert.equal(h.doc.documentElement.dataset.page, "index");
  for (const mode of [
    "netrunner",
    "relic",
    "switchboard",
    "orbit",
    "overdrive",
  ]) {
    choose(mode);
    assert.ok(h.$("." + mode + "-home"), mode);
  }
  choose("orbit");
  h.input(h.$("#orbit-search"), "rapier");
  assert.equal(h.doc.querySelectorAll("#orbit-list [role=tab]").length, 1);
  h.$('[data-orbit-project="biobuzz-simulator"]').click();
  assert.match(h.$("#orbit-project-panel").textContent, /BIOBUZZ/);
  go("biobuzz-simulator");
  assert.match(h.$("#screen").textContent, /simplified estimates/);
  go("stack");
  assert.equal(h.doc.querySelectorAll(".repo-activity li").length, 13);
  go("about");
  assert.doesNotMatch(
    h.$("#screen").textContent,
    /Optional music|Stellarium|hands-on build demos/,
  );
  assert.match(h.$("#screen").textContent, /Orbit/);
  assert.equal(
    h.doc.querySelectorAll("audio,iframe,#music-dock,#music-mini").length,
    0,
  );
  h.$("#city-settings").click();
  assert.equal(h.$("#settings-dialog").open, true);
});

test("a fresh visit starts Redline even when the OS reports reduced motion", async (t) => {
  const h = dom(t, "", (win) => ({
    Event: win.Event,
    IntersectionObserver: win.IntersectionObserver,
    history: win.history,
    localStorage: win.localStorage,
    matchMedia: () => ({
      matches: true,
      addEventListener() {},
      removeEventListener() {},
    }),
    requestAnimationFrame: () => 0,
    cancelAnimationFrame: () => {},
  }));
  h.doc.write(readFileSync(new URL("index.html", import.meta.url), "utf8"));
  h.win.HTMLCanvasElement.prototype.getContext = () => null;
  h.win.HTMLMediaElement.prototype.play = () =>
    Promise.reject(new Error("Autoplay blocked"));
  await import("./console.js?intro-default-regression-v26");
  assert.equal(h.doc.documentElement.dataset.motion, "on");
  assert.equal(h.$("#boot-dialog").open, true);
  assert.equal(h.$("#boot-dialog").dataset.intro, "redline");
  assert.equal(h.$("#boot-percent").textContent, "000%");
  h.$("#skip-intro").click();
  assert.equal(h.$("#boot-dialog").open, false);
  assert.equal(h.doc.documentElement.dataset.booting, undefined);
});
