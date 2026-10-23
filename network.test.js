import test from "node:test";
import assert from "node:assert/strict";
import { createProjectNetwork } from "./project-network.js";
import {
  atlasPoints,
  atlasProject,
  atlasCamera,
  atlasFocus,
} from "./atlas-model.js";

// Exercise the real renderer/controller with deterministic canvas, focus and RAF
// boundaries. This checks lifecycle behavior; it is not a visual browser test.
function harness(
  t,
  { motion = "on", canvasAvailable = true, scrollZoom = true } = {},
) {
  class Target {
    listeners = new Map();
    dataset = {};
    style = {};
    attributes = {};
    addEventListener(name, fn) {
      if (!this.listeners.has(name)) this.listeners.set(name, new Set());
      this.listeners.get(name).add(fn);
    }
    removeEventListener(name, fn) {
      this.listeners.get(name)?.delete(fn);
    }
    emit(name, extra = {}) {
      const event = {
        target: this,
        type: name,
        preventDefault() {},
        stopPropagation() {},
        ...extra,
      };
      this.listeners.get(name)?.forEach((fn) => fn(event));
    }
    setAttribute(name, value) {
      this.attributes[name] = value;
    }
  }
  const frames = new Map(),
    observers = [],
    calls = [];
  let sequence = 0,
    now = performance.now(),
    draws = 0;
  const ctx = {};
  for (const name of [
    "setTransform",
    "fillRect",
    "beginPath",
    "moveTo",
    "lineTo",
    "stroke",
    "fill",
    "arc",
    "setLineDash",
    "fillText",
  ]) {
    ctx[name] = (...args) => {
      for (const arg of args)
        if (typeof arg === "number") assert.ok(Number.isFinite(arg), name);
      if (name === "moveTo" || name === "arc")
        calls.push([name, ...args, ctx.globalAlpha]);
    };
  }
  ctx.clearRect = () => {
    draws++;
    calls.length = 0;
  };
  ctx.createRadialGradient = () => ({ addColorStop() {} });
  const canvas = new Target(),
    container = new Target(),
    doc = new Target();
  const state = { textContent: "" },
    inspector = { innerHTML: "" };
  const labels = Array.from({ length: 14 }, (_, i) => {
    const label = new Target();
    label.offsetWidth = 120;
    label.dataset.nodeIndex = String(i);
    label.closest = (selector) =>
      [".network-node", "button"].includes(selector) ? label : null;
    return label;
  });
  const quality = [8, 14, 22].map((value) => {
    const button = new Target();
    button.dataset.quality = String(value);
    button.closest = (selector) => (selector === "button" ? button : null);
    return button;
  });
  const spin = new Target();
  const reset = new Target();
  reset.id = "network-reset";
  reset.closest = (s) => (s === "button" ? reset : null);
  const modes = ["atlas", "ambient"].map((mode) => {
    const b = new Target();
    b.dataset.networkMode = mode;
    b.closest = (s) => (s === "button" ? b : null);
    return b;
  });
  const zoom = ["-1", "1"].map((value) => {
    const b = new Target();
    b.dataset.zoom = value;
    b.closest = (s) => (s === "button" ? b : null);
    return b;
  });
  spin.id = "sky-pause";
  spin.closest = (selector) => (selector === "button" ? spin : null);
  canvas.closest = () => null;
  canvas.setPointerCapture = () => {};
  canvas.getBoundingClientRect = () => ({ width: 720, height: 460 });
  canvas.getContext = () => (canvasAvailable ? ctx : null);
  canvas.focus = () => {
    doc.activeElement = canvas;
    container.emit("focusin", { target: canvas });
  };
  const viewport = {
    contains: (target) => target === canvas || labels.includes(target),
  };
  container.querySelector = (selector) =>
    ({
      canvas,
      ".network-viewport": viewport,
      ".network-state": state,
      ".network-inspector": inspector,
    })[selector];
  container.querySelectorAll = (selector) =>
    selector === ".network-node"
      ? labels
      : selector === "[data-network-mode]"
        ? modes
        : quality;
  doc.documentElement = { dataset: { motion } };
  doc.hidden = false;
  doc.activeElement = null;
  class Observer {
    constructor(callback) {
      this.callback = callback;
      observers.push(this);
    }
    observe(target) {
      this.target = target;
    }
    disconnect() {
      this.disconnected = true;
    }
  }
  const globals = {
    document: doc,
    devicePixelRatio: 1,
    getComputedStyle: () => ({
      getPropertyValue: (key) => (key === "--accent" ? "#fcee0a" : "#79edf0"),
    }),
    ResizeObserver: Observer,
    IntersectionObserver: Observer,
    requestAnimationFrame: (callback) => {
      const id = ++sequence;
      frames.set(id, callback);
      return id;
    },
    cancelAnimationFrame: (id) => frames.delete(id),
  };
  const originals = new Map(
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
  const dispose = createProjectNetwork(container, { scrollZoom });
  const tick = (count = 1) => {
    for (let i = 0; i < count && frames.size; i++) {
      now += 16;
      const batch = [...frames.values()];
      frames.clear();
      batch.forEach((callback) => callback(now));
    }
  };
  t.after(() => {
    dispose();
    originals.forEach((descriptor, key) =>
      descriptor
        ? Object.defineProperty(globalThis, key, descriptor)
        : delete globalThis[key],
    );
  });
  return {
    doc,
    canvas,
    container,
    state,
    inspector,
    reset,
    modes,
    zoom,
    labels,
    quality,
    spin,
    frames,
    observers,
    calls,
    tick,
    dispose,
    get draws() {
      return draws;
    },
  };
}
test("embedded night sky never intercepts normal page scrolling", (t) => {
  const h = harness(t, { scrollZoom: false });
  let prevented = false;
  h.canvas.emit("wheel", {
    deltaY: 100,
    preventDefault() {
      prevented = true;
    },
  });
  assert.equal(prevented, false);
});

test("Atlas index search finds shared tools and can recover an empty result", (t) => {
  const h = harness(t);
  h.container.emit("input", {
    target: { id: "atlas-index-search", value: "Python FastAPI" },
  });
  assert.equal(h.labels.filter((b) => !b.hidden).length, 4);
  h.container.emit("input", {
    target: { id: "atlas-index-search", value: "qzx-no-project" },
  });
  assert.ok(h.labels.every((b) => b.hidden));
  h.container.emit("input", {
    target: { id: "atlas-index-search", value: "" },
  });
  assert.ok(h.labels.every((b) => !b.hidden));
});

test("sky twinkles while visible, suspends offscreen/background, and resumes", (t) => {
  const h = harness(t);
  h.tick();
  assert.equal(h.frames.size, 1);
  const drawing = JSON.stringify(h.calls);
  h.tick(20);
  assert.notEqual(JSON.stringify(h.calls), drawing);
  h.doc.hidden = true;
  h.doc.emit("visibilitychange");
  assert.equal(h.frames.size, 0);
  const before = h.draws;
  h.tick(20);
  assert.equal(h.draws, before);
  h.doc.hidden = false;
  h.doc.emit("visibilitychange");
  h.tick();
  assert.equal(h.frames.size, 1);
  h.observers[1].callback([{ isIntersecting: false }]);
  assert.equal(h.frames.size, 0);
  h.observers[1].callback([{ isIntersecting: true }]);
  h.tick();
  assert.equal(h.frames.size, 1);
});

test("FX off draws a static sky and manual controls remain usable", (t) => {
  const h = harness(t, { motion: "off" });
  h.tick();
  assert.equal(h.frames.size, 0);
  assert.equal(h.state.textContent, "STATIC / FX OFF");
  const drawing = JSON.stringify(h.calls);
  h.canvas.emit("keydown", { key: "ArrowRight" });
  h.tick();
  assert.notEqual(JSON.stringify(h.calls), drawing);
  assert.equal(h.frames.size, 0);
  h.canvas.emit("wheel", { deltaY: -100000 });
  h.tick();
  assert.equal(h.frames.size, 0);
  assert.ok(h.calls.length > 0);
});

test("pause, keyboard focus and quality settings have bounded frame behavior", (t) => {
  const h = harness(t);
  h.tick(3);
  h.container.emit("click", { target: h.spin });
  h.tick(100);
  assert.equal(h.frames.size, 0);
  assert.equal(h.spin.attributes["aria-pressed"], "true");
  h.container.emit("click", { target: h.quality[2] });
  h.tick();
  assert.equal(h.quality[2].attributes["aria-pressed"], "true");
  assert.equal(h.quality[1].attributes["aria-pressed"], "false");
  h.container.emit("click", { target: h.spin });
  h.canvas.focus();
  h.tick(100);
  assert.equal(h.state.textContent, "FOCUS / STILL");
  assert.equal(h.frames.size, 0);
  h.canvas.emit("keydown", { key: "ArrowUp" });
  h.tick(100);
  assert.equal(h.frames.size, 0);
  h.container.emit("focusout", { relatedTarget: null });
  h.tick();
  assert.equal(h.frames.size, 1);
});

test("changing FX preference stops an active render loop; disposal removes listeners", (t) => {
  const h = harness(t);
  h.tick(5);
  h.doc.documentElement.dataset.motion = "off";
  h.doc.emit("appearancechange");
  h.tick(3);
  assert.equal(h.frames.size, 0);
  h.doc.documentElement.dataset.motion = "on";
  h.doc.emit("appearancechange");
  h.tick();
  assert.equal(h.frames.size, 1);
  h.dispose();
  assert.equal(h.frames.size, 0);
  assert.ok(h.observers.every((observer) => observer.disconnected));
  for (const target of [h.canvas, h.container, h.doc])
    for (const listeners of target.listeners.values())
      assert.equal(listeners.size, 0);
});

test("a missing 2D canvas degrades to accessible links without starting a loop", (t) => {
  const h = harness(t, { canvasAvailable: false });
  assert.equal(h.container.dataset.renderer, "unavailable");
  assert.equal(h.frames.size, 0);
  assert.equal(h.observers.length, 0);
});
test("star selection glides to a project, keeps ambience, and reset restores the atlas", (t) => {
  const h = harness(t);
  h.tick(3);
  h.container.emit("click", { target: h.labels[4] });
  h.tick(150);
  assert.equal(h.labels[4].attributes["aria-pressed"], "true");
  assert.match(h.inspector.innerHTML, /MaintainerOS/);
  assert.match(h.inspector.innerHTML, /Python · FastAPI · SQLite/);
  assert.equal(h.frames.size, 1);
  assert.equal(h.state.textContent, "NIGHT SKY / ACTIVE");
  h.container.emit("click", { target: h.reset });
  h.tick(150);
  assert.equal(h.labels[4].attributes["aria-pressed"], "false");
  assert.match(h.inspector.innerHTML, /Every build leaves a light/);
  assert.equal(h.frames.size, 1);
});
test("display layers and zoom controls work without ongoing animation", (t) => {
  const h = harness(t, { motion: "off" });
  h.tick();
  const initial = h.calls.length;
  h.container.emit("click", { target: h.modes[1] });
  h.tick();
  assert.equal(h.modes[1].attributes["aria-pressed"], "true");
  assert.ok(h.calls.length < initial);
  const before = JSON.stringify(h.calls);
  h.container.emit("click", { target: h.zoom[1] });
  h.tick();
  assert.notEqual(JSON.stringify(h.calls), before);
  assert.equal(h.frames.size, 0);
});
test("dedicated map wheel zoom requires focus and secondary pointers cannot steal dragging", (t) => {
  const h = harness(t, { motion: "off" });
  let prevented = false;
  h.canvas.emit("wheel", {
    deltaY: 100,
    preventDefault() {
      prevented = true;
    },
  });
  assert.equal(prevented, false);
  h.canvas.focus();
  h.canvas.emit("wheel", {
    deltaY: 100,
    preventDefault() {
      prevented = true;
    },
  });
  assert.equal(prevented, true);
  h.canvas.emit("pointerdown", {
    button: 0,
    pointerId: 1,
    clientX: 10,
    clientY: 10,
  });
  h.tick();
  const initial = JSON.stringify(h.calls);
  h.canvas.emit("pointerdown", {
    button: 0,
    pointerId: 2,
    clientX: 90,
    clientY: 90,
  });
  h.canvas.emit("pointermove", { pointerId: 2, clientX: 500, clientY: 500 });
  h.tick();
  assert.equal(JSON.stringify(h.calls), initial);
  h.canvas.emit("pointerup", { pointerId: 2 });
  h.canvas.emit("pointermove", { pointerId: 1, clientX: 50, clientY: 30 });
  h.tick();
  assert.notEqual(JSON.stringify(h.calls), initial);
  h.canvas.emit("pointercancel", { pointerId: 1 });
  h.tick();
  assert.equal(h.frames.size, 0);
});

test("a bright-star click selects its project; dragging does not trigger selection", (t) => {
  const h = harness(t, { motion: "off" });
  h.tick();
  const p = atlasProject(atlasPoints()[0], atlasCamera(), 720, 460);
  h.canvas.emit("pointerdown", {
    button: 0,
    pointerId: 1,
    clientX: p.x,
    clientY: p.y,
  });
  h.canvas.emit("pointerup", { pointerId: 1, clientX: p.x, clientY: p.y });
  h.tick();
  assert.equal(h.labels[0].attributes["aria-pressed"], "true");
  assert.match(h.inspector.innerHTML, /Robo Telescope/);
  h.canvas.emit("keydown", { key: "Home" });
  h.tick();
  assert.equal(h.labels[0].attributes["aria-pressed"], "false");
  h.canvas.emit("pointerdown", {
    button: 0,
    pointerId: 2,
    clientX: p.x,
    clientY: p.y,
  });
  h.canvas.emit("pointermove", {
    pointerId: 2,
    clientX: p.x + 40,
    clientY: p.y,
  });
  h.canvas.emit("pointerup", { pointerId: 2, clientX: p.x + 40, clientY: p.y });
  h.tick();
  assert.match(h.inspector.innerHTML, /Every build leaves a light/);
  assert.equal(h.frames.size, 0);
});

test("portrait resize keeps the selected constellation framed and never creates invalid geometry", (t) => {
  const h = harness(t, { motion: "off" });
  h.container.emit("click", { target: h.labels[4] });
  h.tick();
  h.canvas.getBoundingClientRect = () => ({ width: 320, height: 560 });
  h.observers[0].callback();
  h.tick();
  const p = atlasProject(
    atlasPoints()[4],
    { ...atlasCamera(), ...atlasFocus(atlasPoints()[4]) },
    320,
    560,
  );
  assert.ok(
    h.calls.some(
      ([method, x, y, r]) =>
        method === "arc" &&
        Math.abs(x - p.x) < 0.001 &&
        Math.abs(y - p.y) < 0.001 &&
        r === 4,
    ),
  );
  assert.equal(h.frames.size, 0);
});

test("canvas fallback still lets every project button inspect its actual file", (t) => {
  const h = harness(t, { canvasAvailable: false });
  h.container.emit("click", { target: h.labels[3] });
  assert.match(h.inspector.innerHTML, /NEXUS Macro Pad/);
  assert.equal(h.labels[3].attributes["aria-pressed"], "true");
  assert.equal(h.canvas.tabIndex, -1);
  assert.equal(h.frames.size, 0);
});
