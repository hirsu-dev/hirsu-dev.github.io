import test from "node:test";
import assert from "node:assert/strict";
import { calendarDays, languageCounts, snapshot } from "./stack-data.js";
import { wrap } from "./motion.js";
import { projects } from "./projects.js";
import { cityHome, featuredIds } from "./city-content.js";
import { overdriveHome, overdriveSections } from "./overdrive-content.js";
import {
  panelFrames,
  bootPhases,
  bootDuration,
  bootPhaseAt,
  bootProgressAt,
} from "./city-motion.js";
import { existsSync, readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import {
  savedIds,
  findProjects,
  resolveRoute,
  escapeHTML,
} from "./console-model.js";
import {
  spherePoints,
  connections,
  dockLabels,
  arcPoints,
} from "./project-network.js";
import {
  interfaces,
  interfaceFromSearch,
  interfaceURL,
  validInterface,
} from "./interfaces.js";

test("Overdrive is the only interface; legacy Night City URLs and storage migrate safely", () => {
  assert.deepEqual(Object.keys(interfaces), ["blacksite"]);
  assert.equal(interfaceFromSearch("?view=neon", "blacksite"), "blacksite");
  assert.equal(interfaceFromSearch("?view=neon", "neon"), "blacksite");
  assert.equal(interfaceFromSearch("", "neon"), "blacksite");
  assert.equal(validInterface("neon"), false);
  assert.equal(interfaceFromSearch("", "blacksite"), "blacksite");
  assert.equal(interfaceFromSearch("?view=unknown", "bad-value"), "blacksite");
  assert.equal(interfaceFromSearch(""), "blacksite");
  assert.equal(validInterface("__proto__"), false);
});
test("legacy interface URL normalization preserves project and other query state", () => {
  const url = interfaceURL(
    "https://example.test/?q=python&view=neon#maintaineros",
    "blacksite",
  );
  assert.equal(url.searchParams.get("q"), "python");
  assert.equal(url.searchParams.get("view"), "blacksite");
  assert.equal(url.hash, "#maintaineros");
  assert.throws(() => interfaceURL(url, "__proto__"));
});
test("live shell and controller offer no retired interface controls or route", () => {
  const html = readFileSync(new URL("index.html", import.meta.url), "utf8");
  const controller = readFileSync(
    new URL("console.js", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(html, /Night City|data-view-choice|SWITCH INTERFACE/);
  assert.doesNotMatch(
    controller,
    /cityHome|Switch to Night City|setView\("neon"\)/,
  );
  assert.match(html, /STARTUP SETTINGS/);
});

test("legacy circular navigation helper wraps correctly", () => {
  assert.equal(wrap(-1, 11), 10);
  assert.equal(wrap(11, 11), 0);
  assert.equal(wrap(-25, 11), 8);
});

test("project filters and multi-word search compose without mutating content", () => {
  assert.equal(findProjects().length, 7);
  assert.deepEqual(
    findProjects({ category: "software", query: "python SQLite" }).map(
      (p) => p.id,
    ),
    ["maintaineros", "civiclens"],
  );
  assert.deepEqual(
    findProjects({ category: "homelab", query: "TAILSCALE" }).map((p) => p.id),
    ["pi-homelab"],
  );
  assert.equal(
    findProjects({ category: "hardware", query: "sqlite" }).length,
    0,
  );
  assert.deepEqual(
    findProjects({ category: "saved", saved: new Set(["robo-telescope"]) }).map(
      (p) => p.id,
    ),
    ["robo-telescope"],
  );
});
test("local bookmarks validate type, project IDs and malformed storage", () => {
  assert.deepEqual(
    [
      ...savedIds(
        '["robo-telescope","bogus","__proto__","robo-telescope",7,null]',
      ),
    ],
    ["robo-telescope"],
  );
  for (const raw of [null, "bad json", "{}", "null", "42"])
    assert.equal(savedIds(raw).size, 0);
});
test("routes support legacy project links and reject malformed/unknown input", () => {
  assert.equal(resolveRoute("#project-maintaineros"), "maintaineros");
  assert.equal(resolveRoute("#network"), "network");
  assert.equal(resolveRoute("#bench"), "log");
  assert.equal(resolveRoute("#projects"), "projects");
  assert.equal(resolveRoute("#work"), "projects");
  assert.equal(resolveRoute("#%E0%A4%A"), "index");
  assert.equal(resolveRoute("#__proto__"), "index");
  assert.equal(resolveRoute("#unknown"), "index");
});

test("cinematic landing uses real projects, labeled media and working archive routes", () => {
  const html = cityHome();
  assert.equal(new Set(featuredIds).size, 3);
  for (const id of featuredIds) {
    const p = projects.find((p) => p.id === id);
    assert.ok(p);
    assert.ok(html.includes('href="#' + id + '"'));
    assert.ok(html.includes(escapeHTML(p.caption)));
  }
  assert.match(html, /href="#projects"/);
  assert.match(html, /REAL PHOTOGRAPH/);
  assert.match(html, /Shinjuku by Night — Fboas/);
  assert.match(html, /currently broken/);
  assert.doesNotMatch(html, /PUSH SQUARE|GAMESPOT|EUROGAMER|BUY NOW/);
});
test("all project and cinematic image assets exist in the static checkout", () => {
  const assets = projects.flatMap((p) => [
    p.image,
    ...(p.gallery || []).map((s) => s.image),
  ]);
  assets.push("assets/shinjuku-night.jpg", "assets/shinjuku-night-1280.jpg");
  for (const path of assets)
    assert.ok(existsSync(new URL(path, import.meta.url)), path);
});
test("Overdrive has a continuous, accessible home for all seven real builds", () => {
  const html = overdriveHome('<div id="network-shell"></div>');
  for (const p of projects) {
    assert.ok(html.includes(`href="#${p.id}"`));
    assert.ok(html.includes(escapeHTML(p.caption)));
    assert.ok(html.includes(escapeHTML(p.description)));
  }
  for (const id of overdriveSections) assert.ok(html.includes(`id="${id}"`));
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, ids.length);
  assert.match(html, /not polished products/i);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
});
test("visual progress reaches 100 before the glitch release finishes", () => {
  assert.equal(bootProgressAt(-10), 0);
  assert.equal(bootProgressAt(0), 0);
  assert.equal(bootProgressAt(1125), 50);
  assert.equal(bootProgressAt(2250), 100);
  assert.equal(bootProgressAt(bootDuration), 100);
});
test("panel transition restores visibility with a single non-flashing entrance", () => {
  assert.equal(panelFrames.length, 2);
  assert.equal(panelFrames[0].opacity, 0);
  assert.equal(panelFrames[1].opacity, 1);
  assert.equal(panelFrames[1].transform, "translateX(0)");
});
test("opening timeline is ordered, bounded and has one release stage", () => {
  assert.ok(bootDuration > 2000 && bootDuration <= 3000);
  assert.equal(bootPhaseAt(-1), "init");
  assert.equal(bootPhaseAt(0), "init");
  assert.equal(bootPhaseAt(bootDuration), "complete");
  assert.equal(bootPhaseAt(Infinity), "complete");
  assert.equal(bootPhases.filter((p) => p.name === "release").length, 1);
  for (let i = 0; i < bootPhases.length; i++) {
    const phase = bootPhases[i];
    assert.equal(bootPhaseAt(phase.at), phase.name);
    assert.ok(phase.at < bootDuration);
    if (i) assert.ok(phase.at > bootPhases[i - 1].at);
  }
});
test("system reduced motion bypasses boot by default, even with blocked storage", () => {
  const source = readFileSync(
    new URL("index.html", import.meta.url),
    "utf8",
  ).match(/<script>([\s\S]*?)<\/script>/)[1];
  for (const [reduce, stored, blocked, expected] of [
    [true, null, false, "off"],
    [false, null, false, "on"],
    [true, null, true, "off"],
    [false, "off", false, "off"],
    [true, "on", false, "on"],
  ]) {
    const document = { documentElement: { dataset: {} } };
    runInNewContext(source, {
      document,
      matchMedia: () => ({ matches: reduce }),
      URLSearchParams,
      location: { search: "" },
      localStorage: {
        getItem(key) {
          if (blocked) throw new Error("storage blocked");
          return key === "hirsu-console-motion" ? stored : null;
        },
      },
    });
    assert.equal(document.documentElement.dataset.motion, expected);
    assert.equal(document.documentElement.dataset.view, "blacksite");
  }
});
test("boot is closed without JavaScript; real content is not made inert or hidden", () => {
  const html = readFileSync(new URL("index.html", import.meta.url), "utf8");
  const boot = html.match(/<dialog\s+id="boot-dialog"[^>]*>/)[0];
  assert.doesNotMatch(boot, /\bopen\b/);
  assert.doesNotMatch(html.match(/<main[^>]*>/)[0], /inert|hidden/);
  assert.match(html, /<noscript/);
});
test("HTML escaping covers user-supplied query attribute delimiters", () => {
  assert.equal(escapeHTML('<a x="&">\''), "&lt;a x=&quot;&amp;&quot;&gt;&#39;");
});
test("project sphere is finite, normalized and connected only to real projects", () => {
  const points = spherePoints(7);
  assert.equal(points.length, 7);
  for (const p of points)
    assert.ok(Math.abs(p.reduce((s, n) => s + n * n, 0) - 1) < 1e-12);
  const ids = new Set(projects.map((p) => p.id));
  for (const pair of connections) for (const id of pair) assert.ok(ids.has(id));
  assert.deepEqual(spherePoints(0), []);
});

test("docked labels stay in bounds and never overlap on mobile or desktop", () => {
  const sizes = [98, 124, 150, 110, 92, 80, 110];
  for (const width of [240, 280, 320, 390, 440, 720, 1200]) {
    const positions = dockLabels(sizes, width, 460);
    const boxes = positions.map((p, i) => ({
      left: p.x - sizes[i] / 2,
      right: p.x + sizes[i] / 2,
      top: p.y - 18,
      bottom: p.y + 18,
    }));
    for (const box of boxes) {
      assert.ok(box.left >= 0 && box.right <= width);
      assert.ok(box.top >= 80 && box.bottom <= 460);
    }
    boxes.forEach((a, i) =>
      boxes.slice(i + 1).forEach((b) => {
        assert.ok(
          a.right <= b.left ||
            b.right <= a.left ||
            a.bottom <= b.top ||
            b.bottom <= a.top,
        );
      }),
    );
  }
  assert.deepEqual(dockLabels([], 400, 460), []);
});
test("curved connections preserve endpoints and stay outside the globe", () => {
  const points = spherePoints(7);
  for (const [a, b] of [
    [points[0], points[4]],
    [
      [1, 0, 0],
      [-1, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 0],
    ],
  ]) {
    const arc = arcPoints(a, b);
    assert.equal(arc.length, 49);
    for (const p of arc) {
      assert.ok(p.every(Number.isFinite));
      assert.ok(Math.hypot(...p) >= 1 - 1e-9);
      assert.ok(Math.hypot(...p) <= 1.13 + 1e-9);
    }
    a.forEach((n, i) => assert.ok(Math.abs(n - arc[0][i]) < 1e-9));
    b.forEach((n, i) => assert.ok(Math.abs(n - arc.at(-1)[i]) < 1e-9));
  }
});
test("language counts are per repository, not duplicated file/language entries", () => {
  assert.deepEqual(
    languageCounts([
      { languages: ["Python", "Python"] },
      { languages: ["Python", "Swift"] },
    ]),
    [
      ["Python", 2],
      ["Swift", 1],
    ],
  );
  assert.equal(languageCounts().find(([name]) => name === "Python")[1], 4);
});
test("calendar uses UTC, starts Monday, preserves the bounded snapshot counts", () => {
  const days = calendarDays();
  assert.equal(days.length, 189);
  assert.equal(new Date(`${days[0].date}T00:00:00Z`).getUTCDay(), 1);
  assert.equal(
    days.reduce((sum, day) => sum + day.count, 0),
    Object.values(snapshot.commits).reduce((a, b) => a + b, 0),
  );
  assert.equal(days.find((d) => d.date === "2026-10-07").count, 38);
  assert.equal(days.find((d) => d.date === "2026-10-21").future, true);
  assert.equal(
    calendarDays("2024-03-01", 1).find((d) => d.date === "2024-02-29").future,
    false,
  );
});
