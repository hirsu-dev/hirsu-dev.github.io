import test from "node:test";
import assert from "node:assert/strict";
import { calendarDays, languageCounts, snapshot } from "./stack-data.js";
import { wrap } from "./motion.js";
import { projects } from "./projects.js";
import {
  savedIds,
  findProjects,
  resolveRoute,
  escapeHTML,
} from "./console-model.js";
import {
  spherePoints,
  connections,
  separateLabels,
} from "./project-network.js";
import {
  interfaces,
  interfaceFromSearch,
  interfaceURL,
  validInterface,
} from "./interfaces.js";

test("exactly two valid interfaces; explicit links override saved choice", () => {
  assert.deepEqual(Object.keys(interfaces), ["neon", "blacksite"]);
  assert.equal(interfaceFromSearch("?view=neon", "blacksite"), "neon");
  assert.equal(interfaceFromSearch("", "blacksite"), "blacksite");
  assert.equal(interfaceFromSearch("?view=unknown", "bad-value"), "neon");
  assert.equal(validInterface("__proto__"), false);
});
test("switching interfaces preserves the selected project and other query state", () => {
  const url = interfaceURL(
    "https://example.test/?q=python&view=neon#maintaineros",
    "blacksite",
  );
  assert.equal(url.searchParams.get("q"), "python");
  assert.equal(url.searchParams.get("view"), "blacksite");
  assert.equal(url.hash, "#maintaineros");
  assert.throws(() => interfaceURL(url, "__proto__"));
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
  assert.equal(resolveRoute("#%E0%A4%A"), "index");
  assert.equal(resolveRoute("#__proto__"), "index");
  assert.equal(resolveRoute("#unknown"), "index");
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

test("narrow project-map labels remain separated and inside the viewport", () => {
  const ys = separateLabels(
    [
      { y: 140 },
      { y: 145 },
      { y: 149 },
      { y: 190 },
      { y: 195 },
      { y: 198 },
      { y: 202 },
    ],
    400,
  );
  const sorted = [...ys].sort((a, b) => a - b);
  assert.ok(sorted[0] >= 35);
  assert.ok(sorted.at(-1) <= 375);
  for (let i = 1; i < sorted.length; i++)
    assert.ok(sorted[i] - sorted[i - 1] >= 38);
  assert.deepEqual(separateLabels([], 400), []);
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
