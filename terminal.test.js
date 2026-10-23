import test from "node:test";
import assert from "node:assert/strict";
import {
  projectTerminal,
  terminalProject,
  terminalIds,
  mountProjectTerminal,
} from "./project-terminal.js";
import { projects } from "./projects.js";
import { cityHome } from "./city-content.js";
import { overdriveHome } from "./overdrive-content.js";
import { cityPhoto, photoCredit } from "./photo.js";

test("Overdrive and the archived theme use only the credited real photograph for their hero", () => {
  for (const html of [cityHome(), overdriveHome("")]) {
    assert.ok(html.includes(`srcset="${cityPhoto.srcset}"`));
    assert.ok(html.includes(cityPhoto.source));
    assert.ok(html.includes(cityPhoto.license));
    assert.doesNotMatch(
      html,
      /night-city-engineer|overdrive-rooftop|FICTIONAL KEY ART/,
    );
  }
  assert.match(
    photoCredit(),
    /Display crop, dark overlay &amp; animated slices/,
  );
});
test("directory has all real projects and a single keyboard tab stop", () => {
  const html = projectTerminal();
  assert.equal(new Set(terminalIds).size, 14);
  assert.equal((html.match(/role="tab"/g) || []).length, 14);
  assert.equal((html.match(/aria-selected="true"/g) || []).length, 1);
  assert.match(html, /role="tablist".*aria-orientation="vertical"/);
  for (const id of terminalIds) {
    const p = projects.find((p) => p.id === id);
    assert.ok(p);
    const preview = terminalProject(id);
    assert.ok(preview.includes(`href="#${id}"`));
    assert.ok(preview.includes(p.image));
    assert.ok(preview.includes(p.status));
    if (p.source) assert.ok(preview.includes(p.source));
    else assert.match(preview, /NO PUBLIC REPO/);
  }
  assert.equal(terminalProject("unknown"), "");
  assert.equal(terminalProject("__proto__"), "");
});

function harness() {
  const listeners = {},
    animations = [];
  const tabs = terminalIds.map((id, i) => ({
    id: `terminal-tab-${id}`,
    dataset: { terminalProject: id },
    tabIndex: i ? -1 : 0,
    attrs: { "aria-selected": String(i === 0) },
    focused: false,
    setAttribute(name, value) {
      this.attrs[name] = value;
    },
    getAttribute(name) {
      return this.attrs[name];
    },
    focus() {
      this.focused = true;
    },
    closest() {
      return this;
    },
  }));
  const panel = {
    innerHTML: terminalProject(terminalIds[0]),
    attrs: {},
    setAttribute(name, value) {
      this.attrs[name] = value;
    },
  };
  const counter = { textContent: "01 / 14" };
  const container = {
    querySelectorAll() {
      return tabs;
    },
    querySelector(selector) {
      return selector === "#terminal-preview" ? panel : counter;
    },
    addEventListener(name, handler) {
      listeners[name] = handler;
    },
  };
  mountProjectTerminal(container, (...args) => animations.push(args));
  function key(index, key) {
    let prevented = false,
      stopped = false;
    listeners.keydown({
      target: tabs[index],
      key,
      preventDefault() {
        prevented = true;
      },
      stopPropagation() {
        stopped = true;
      },
    });
    return { prevented, stopped };
  }
  return { listeners, tabs, panel, counter, animations, key };
}
test("click updates preview, source, count and accessible selection together", () => {
  const h = harness();
  h.listeners.click({ target: h.tabs[3] });
  assert.equal(h.tabs[3].attrs["aria-selected"], "true");
  assert.equal(h.tabs[0].tabIndex, -1);
  assert.equal(h.tabs[3].tabIndex, 0);
  assert.equal(h.panel.attrs["aria-labelledby"], h.tabs[3].id);
  assert.equal(h.counter.textContent, "04 / 14");
  assert.match(h.panel.innerHTML, /Under repair|UNDER REPAIR|Under Repair/);
  assert.equal(h.animations.length, 1);
  h.listeners.click({ target: h.tabs[3] });
  assert.equal(h.animations.length, 1);
});
test("arrow keys wrap; Home/End focus selection; unrelated keys are untouched", () => {
  const h = harness();
  assert.deepEqual(h.key(0, "ArrowUp"), { prevented: true, stopped: true });
  assert.equal(h.tabs[terminalIds.length - 1].focused, true);
  assert.equal(h.counter.textContent, "14 / 14");
  h.key(terminalIds.length - 1, "ArrowDown");
  assert.equal(h.counter.textContent, "01 / 14");
  h.key(0, "End");
  assert.equal(h.counter.textContent, "14 / 14");
  h.key(terminalIds.length - 1, "Home");
  assert.equal(h.counter.textContent, "01 / 14");
  assert.deepEqual(h.key(0, "Tab"), { prevented: false, stopped: false });
  assert.deepEqual(h.key(0, "s"), { prevented: false, stopped: false });
});
test("no terminal and clicks outside tabs are harmless", () => {
  assert.doesNotThrow(() => mountProjectTerminal(null));
  const h = harness();
  h.listeners.click({
    target: {
      closest() {
        return null;
      },
    },
  });
  h.listeners.click({
    target: {
      closest() {
        return {};
      },
    },
  });
  assert.equal(h.animations.length, 0);
});
