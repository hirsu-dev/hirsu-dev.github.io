import test from "node:test";
import assert from "node:assert/strict";
import { Window } from "happy-dom";
import { projects, publicRepoCount } from "./projects.js";
import { findProjects, resolveRoute } from "./console-model.js";
import {
  archiveOptions,
  mountArchiveOptions,
  recentWork,
  projectDate,
} from "./discovery.js";
import { repositorySnapshot, repositoryFor } from "./repository-data.js";
import { atlasHubs } from "./atlas-model.js";
import { skyObjects } from "./sky-model.js";
import { terminalIds } from "./project-terminal.js";

test("the public snapshot covers every source exactly once and keeps dates traceable", () => {
  assert.equal(projects.length, 15);
  assert.equal(publicRepoCount, 13);
  assert.equal(repositorySnapshot.repositories.length, publicRepoCount);
  assert.equal(
    new Set(repositorySnapshot.repositories.map((r) => r.name)).size,
    publicRepoCount,
  );
  for (const p of projects) {
    if (!p.source) {
      assert.equal(p.activity, null);
      continue;
    }
    assert.ok(p.activity, p.id);
    assert.match(p.activity.sha, /^[0-9a-f]{40}$/);
    assert.equal(p.activity.url, `${p.source}/commit/${p.activity.sha}`);
    assert.ok(p.activity.updated <= repositorySnapshot.date);
    assert.ok(p.activity.languages.length);
  }
  assert.equal(repositoryFor("https://github.com/someone/another-repo"), null);
  assert.match(
    projectDate(projects.find((p) => p.id === "robo-telescope")),
    /Status reviewed/,
  );
});

test("availability composes with search and saved filters without mixing local and browser projects", () => {
  const browser = findProjects({ availability: "browser" });
  assert.equal(browser.length, 8);
  assert.ok(browser.every((p) => p.demo));
  assert.equal(findProjects({ availability: "local" }).length, 5);
  assert.equal(findProjects({ availability: "personal" }).length, 2);
  assert.deepEqual(
    findProjects({
      category: "software",
      availability: "browser",
      query: "rapier robot",
    }).map((p) => p.id),
    ["biobuzz-simulator"],
  );
  const saved = new Set(["biobuzz-simulator", "robo-telescope"]);
  assert.deepEqual(
    findProjects({ category: "saved", saved, availability: "browser" }).map(
      (p) => p.id,
    ),
    ["biobuzz-simulator"],
  );
  assert.equal(
    findProjects({ availability: "local", query: "rapier" }).length,
    0,
  );
});

test("date and name sorting are deterministic and leave the shared project array unchanged", () => {
  const original = projects.map((p) => p.id);
  const recent = findProjects({ sort: "updated" });
  assert.equal(recent[0].id, "biobuzz-simulator");
  assert.equal(recent[1].id, "hyprland-forge");
  const names = findProjects({ sort: "name" }).map((p) => p.title);
  assert.deepEqual(
    names,
    [...names].sort((a, b) => a.localeCompare(b)),
  );
  assert.deepEqual(
    projects.map((p) => p.id),
    original,
  );
  assert.deepEqual(
    findProjects({ sort: "updated", query: "no-such-robot-427" }),
    [],
  );
});

test("native archive controls apply their combined values and dispose their listeners", () => {
  const win = new Window(),
    host = win.document.createElement("section");
  host.innerHTML = archiveOptions();
  win.document.body.append(host);
  let calls = 0,
    results;
  const dispose = mountArchiveOptions(host, (options) => {
    calls++;
    results = findProjects({ ...options, query: "robot" });
  });
  const availability = host.querySelector("#project-availability"),
    sort = host.querySelector("#project-sort");
  availability.value = "browser";
  availability.dispatchEvent(new win.Event("change", { bubbles: true }));
  assert.ok(results.every((p) => p.demo));
  sort.value = "updated";
  sort.dispatchEvent(new win.Event("change", { bubbles: true }));
  assert.equal(results[0].id, "biobuzz-simulator");
  assert.equal(host.querySelectorAll("label").length, 2);
  assert.equal(availability.isConnected, true);
  dispose();
  availability.value = "personal";
  availability.dispatchEvent(new win.Event("change", { bubbles: true }));
  assert.equal(calls, 2);
  win.happyDOM.abort();
});

test("the latest-work feature has playable links, labeled diagrams and no embedded game overhead", () => {
  const win = new Window(),
    host = win.document.createElement("main");
  host.innerHTML = recentWork();
  const play = host.querySelector(
    `a[href="https://hirsu-dev.github.io/biobuzz-simulator/"]`,
  );
  assert.equal(play.target, "_blank");
  assert.match(play.rel, /noopener/);
  assert.match(host.textContent, /not a gameplay screenshot/);
  assert.match(host.textContent, /browser Java execution is not/);
  assert.equal(host.querySelectorAll("canvas,iframe,video,audio").length, 0);
  const ids = [...host.querySelectorAll("[id]")].map((n) => n.id);
  assert.equal(new Set(ids).size, ids.length);
  win.happyDOM.abort();
});

test("BIOBUZZ is reachable through routes, directory and the connected project sky", () => {
  assert.equal(resolveRoute("#biobuzz-simulator"), "biobuzz-simulator");
  assert.ok(terminalIds.includes("biobuzz-simulator"));
  assert.ok(skyObjects.some((p) => p.id === "biobuzz-simulator"));
  for (const hub of ["javascript", "robotics"])
    assert.ok(
      atlasHubs.find((h) => h.id === hub).members.includes("biobuzz-simulator"),
    );
});
