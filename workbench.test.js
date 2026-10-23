import test from "node:test";
import assert from "node:assert/strict";
import { Window } from "happy-dom";
import { projects } from "./projects.js";
import {
  buildEntries,
  experiments,
  filterEntries,
  statusTypes,
} from "./workbench-data.js";
import {
  workbenchContent,
  mountWorkbench,
  entryContent,
  experimentsContent,
  mountExperiments,
} from "./workbench.js";
import { resolveRoute } from "./console-model.js";

test("status and log records link to real projects and valid deep routes", () => {
  assert.equal(
    new Set(buildEntries.map((e) => e.id)).size,
    buildEntries.length,
  );
  for (const p of projects) {
    assert.ok(statusTypes[p.lifecycle.state]);
    assert.match(p.lifecycle.reviewed, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(p.lifecycle.next.length > 20);
  }
  for (const entry of buildEntries) {
    assert.ok(projects.some((p) => p.id === entry.project));
    assert.equal(resolveRoute(`#entry-${entry.id}`), `entry-${entry.id}`);
    assert.match(entryContent(entry.id), /Next experiment/);
  }
  assert.equal(resolveRoute("#entry-unknown"), "index");
  assert.equal(resolveRoute("#experiments"), "experiments");
  for (const e of experiments)
    assert.ok(projects.some((p) => p.id === e.project));
});

test("runnable experiments have verified project/demo links and filters retain an accessible empty state", () => {
  const window = new Window(),
    host = window.document.createElement("main");
  host.innerHTML = experimentsContent();
  const dispose = mountExperiments(host);
  assert.equal(experiments.length, 7);
  assert.ok(
    experiments.every(
      (e) => e.demo && e.source && e.state.includes("Prototype"),
    ),
  );
  const state = host.querySelector("#experiment-state");
  state.value = "planned";
  state.dispatchEvent(new window.Event("input", { bubbles: true }));
  assert.equal(host.querySelector("#experiment-empty").hidden, false);
  state.value = "runnable";
  state.dispatchEvent(new window.Event("input", { bubbles: true }));
  assert.equal(host.querySelector("#experiment-empty").hidden, true);
  assert.equal(
    host.querySelectorAll("[data-experiment]:not([hidden])").length,
    7,
  );
  dispose();
  window.happyDOM.abort();
});
test("build-note search composes project/date/query filters", () => {
  assert.equal(
    filterEntries({ project: "custom-keyboard", query: "physical clearance" })
      .length,
    1,
  );
  assert.equal(
    filterEntries({ project: "custom-keyboard", since: "2026-10-24" }).length,
    0,
  );
  assert.equal(filterEntries({ query: "not a real phrase" }).length, 0);
});
test("workbench filters and reset update results without replacing focused inputs", () => {
  const window = new Window(),
    host = window.document.createElement("main");
  host.innerHTML = workbenchContent();
  const cleanup = mountWorkbench(host),
    q = host.querySelector("#wb-query"),
    state = host.querySelector("#wb-state");
  q.value = "no matching note";
  q.dispatchEvent(new window.Event("input", { bubbles: true }));
  assert.match(host.querySelector("#wb-count").textContent, /0 notes/);
  assert.match(host.querySelector("#wb-entries").textContent, /No matching/);
  host.querySelector("form").dispatchEvent(new window.Event("reset"));
  assert.equal(q.value, "");
  assert.equal(host.querySelectorAll(".wb-entry").length, buildEntries.length);
  state.value = "repair";
  state.dispatchEvent(new window.Event("change"));
  assert.equal(host.querySelectorAll(".wb-status-row").length, 1);
  assert.match(
    host.querySelector("#wb-status-list").textContent,
    /Robo Telescope/,
  );
  cleanup();
  window.happyDOM.abort();
});
