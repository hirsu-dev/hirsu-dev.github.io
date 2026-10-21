import test from "node:test";
import assert from "node:assert/strict";
import { createProjectNetwork } from "./project-network.js";

// Exercise the real renderer/controller with deterministic canvas, focus and RAF
// boundaries. This checks lifecycle behavior; it is not a visual browser test.
function harness(t, { motion = "on", canvasAvailable = true } = {}) {
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
  ]) {
    ctx[name] = (...args) => {
      for (const arg of args)
        if (typeof arg === "number") assert.ok(Number.isFinite(arg), name);
      if (name === "moveTo" || name === "arc") calls.push([name, ...args]);
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
  const state = { textContent: "" };
  const labels = Array.from({ length: 7 }, () => {
    const label = new Target();
    label.offsetWidth = 120;
    label.closest = (selector) => (selector === ".network-node" ? label : null);
    return label;
  });
  const quality = [8, 14, 22].map((value) => {
    const button = new Target();
    button.dataset.quality = String(value);
    button.closest = (selector) => (selector === "button" ? button : null);
    return button;
  });
  const spin = new Target();
  spin.id = "spin-button";
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
    ({ canvas, ".network-viewport": viewport, ".network-state": state })[
      selector
    ];
  container.querySelectorAll = (selector) =>
    selector === ".network-node" ? labels : quality;
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
  const dispose = createProjectNetwork(container);
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

test("globe spins while visible, suspends offscreen/background, and resumes", (t) => {
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

test("FX off draws a static globe and manual controls remain usable", (t) => {
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
  assert.equal(h.spin.attributes["aria-pressed"], "false");
  h.container.emit("click", { target: h.quality[2] });
  h.tick();
  assert.equal(h.quality[2].attributes["aria-pressed"], "true");
  assert.equal(h.quality[1].attributes["aria-pressed"], "false");
  h.container.emit("click", { target: h.spin });
  h.canvas.focus();
  h.tick(100);
  assert.equal(h.state.textContent, "FOCUS LOCK");
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
