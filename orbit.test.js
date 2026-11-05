import test from "node:test";
import assert from "node:assert/strict";
import { Window } from "happy-dom";
import { featuredProjectIds } from "./build-stories.js";
import { projects } from "./projects.js";
import {
  orbitHome,
  mountOrbit,
  orbitProjects,
  orbitMatches,
  orbitRelated,
} from "./orbit-layout.js";
function harness(t, stored = null) {
  const win = new Window({ url: "https://portfolio.test/" }),
    host = win.document.createElement("main"),
    saved = [];
  win.document.documentElement.dataset.motion = "off";
  win.document.body.append(host);
  host.innerHTML = orbitHome();
  const dispose = mountOrbit(host, {
    read: () => stored,
    write: (key, value) => {
      saved.push([key, value]);
      return true;
    },
  });
  t.after(() => {
    dispose();
    win.happyDOM.abort();
  });
  return {
    win,
    host,
    saved,
    dispose,
    $: (s) => host.querySelector(s),
    input: (value) => {
      const i = host.querySelector("#orbit-search");
      i.value = value;
      i.dispatchEvent(new win.Event("input", { bubbles: true }));
    },
    key: (target, key) =>
      target.dispatchEvent(
        new win.KeyboardEvent("keydown", {
          key,
          bubbles: true,
          cancelable: true,
        }),
      ),
  };
}
test("Orbit features five builds and exposes the full archive with a selected file, source, app and credited media", (t) => {
  const h = harness(t);
  assert.equal(
    h.host.querySelectorAll("#orbit-list [role=tab]").length,
    featuredProjectIds.length,
  );
  const scope = h.$("#orbit-scope");
  scope.checked = true;
  scope.dispatchEvent(new h.win.Event("change", { bubbles: true }));
  assert.equal(
    h.host.querySelectorAll("#orbit-list [role=tab]").length,
    projects.length,
  );
  assert.equal(
    h.host.querySelectorAll("#orbit-list [aria-selected=true]").length,
    1,
  );
  assert.match(h.$("#orbit-project-title").textContent, /BIOBUZZ/);
  assert.equal(
    h.$("#orbit-project-panel img").getAttribute("src"),
    projects.find((p) => p.id === "biobuzz-simulator").image,
  );
  assert.ok(
    h.$(
      '#orbit-project-panel a[href="https://hirsu-dev.github.io/biobuzz-simulator/"]',
    ),
  );
  assert.match(
    h.$("#orbit-preview-caption").textContent,
    /Actual browser capture.*simulated solo-practice field/,
  );
  const ids = [...h.host.querySelectorAll("[id]")].map((n) => n.id);
  assert.equal(ids.length, new Set(ids).size);
  for (const n of h.host.querySelectorAll("[aria-controls],[aria-labelledby]"))
    for (const a of ["aria-controls", "aria-labelledby"])
      for (const id of (n.getAttribute(a) || "").split(" ").filter(Boolean))
        assert.ok(h.win.document.getElementById(id), id);
});
test("search and shared-tool filters compose without replacing focused input", (t) => {
  const h = harness(t),
    input = h.$("#orbit-search");
  input.focus();
  h.input("python sqlite");
  assert.equal(
    h.host.querySelectorAll("#orbit-list [role=tab]").length,
    orbitMatches("python sqlite").filter((p) =>
      featuredProjectIds.includes(p.id),
    ).length,
  );
  assert.equal(h.win.document.activeElement, input);
  h.input("no-matching-build-723");
  assert.equal(h.$("#orbit-empty").hidden, false);
  h.$("[data-orbit-clear]").click();
  assert.equal(h.$("#orbit-empty").hidden, true);
  h.$('[data-orbit-tag="JavaScript"]').click();
  assert.equal(
    h.host.querySelectorAll("#orbit-list [role=tab]").length,
    projects.filter(
      (p) => featuredProjectIds.includes(p.id) && p.tags.includes("JavaScript"),
    ).length,
  );
});
test("arrow keys wrap, focus follows selection and Enter opens a project route", (t) => {
  const h = harness(t),
    last = orbitProjects
      .filter((p) => featuredProjectIds.includes(p.id))
      .at(-1);
  h.key(h.$("#orbit-list [role=tab]"), "End");
  assert.equal(
    h.$("#orbit-list [aria-selected=true]").dataset.orbitProject,
    last.id,
  );
  assert.equal(h.win.document.activeElement.dataset.orbitProject, last.id);
  h.key(h.win.document.activeElement, "ArrowDown");
  assert.equal(
    h.$("#orbit-list [aria-selected=true]").dataset.orbitProject,
    orbitProjects[0].id,
  );
  h.key(h.win.document.activeElement, "Enter");
  assert.equal(h.win.location.hash, "#" + orbitProjects[0].id);
});
test("gallery and related-work navigation use actual project records", (t) => {
  const h = harness(t);
  h.$('#orbit-list [data-orbit-project="maintaineros"]').click();
  const p = projects.find((p) => p.id === "maintaineros");
  h.$('[data-orbit-shot="1"]').click();
  assert.equal(
    h.$("#orbit-project-panel img").getAttribute("src"),
    p.gallery[0].image,
  );
  h.$('[data-orbit-shot="-1"]').click();
  assert.equal(h.$("#orbit-project-panel img").getAttribute("src"), p.image);
  const related = orbitRelated(p);
  assert.ok(
    related.every((r) =>
      r.shared.every(
        (tag) => p.tags.includes(tag) && r.project.tags.includes(tag),
      ),
    ),
  );
  h.$("#orbit-related button").click();
  assert.equal(
    h.$("#orbit-list [aria-selected=true]").dataset.orbitProject,
    related[0].project.id,
  );
});
test("restored selection is validated and disposed layouts release handlers", (t) => {
  const h = harness(t, "custom-keyboard");
  assert.match(h.$("#orbit-project-title").textContent, /NEXUS Macro Pad/);
  h.dispose();
  h.$('#orbit-list [data-orbit-project="biobuzz-simulator"]').click();
  assert.match(h.$("#orbit-project-title").textContent, /NEXUS Macro Pad/);
  assert.equal(h.saved.length, 0);
  const invalid = harness(t, "__proto__");
  assert.match(invalid.$("#orbit-project-title").textContent, /BIOBUZZ/);
});
