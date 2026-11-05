import test from "node:test";
import assert from "node:assert/strict";
import { Window } from "happy-dom";
import { mountSignalFX, signalEnabled, interferenceBand } from "./signal-fx.js";

function harness(t, { motion = "on", canvas = true } = {}) {
  const win = new Window(),
    doc = win.document,
    frames = new Map(),
    played = [];
  Object.assign(doc.documentElement.dataset, {
    motion,
    fx: "signal",
    contrast: "normal",
  });
  let sequence = 0,
    now = 0,
    draws = 0,
    hidden = false;
  Object.defineProperty(doc, "hidden", { get: () => hidden });
  const observers = [];
  class Observer {
    targets = new Set();
    constructor(callback) {
      this.callback = callback;
      observers.push(this);
    }
    observe(node) {
      this.targets.add(node);
      this.callback([{ target: node, isIntersecting: true }]);
    }
    disconnect() {
      this.targets.clear();
    }
  }
  const view = {
    innerWidth: 1280,
    innerHeight: 900,
    devicePixelRatio: 2,
    performance: { now: () => now },
    IntersectionObserver: Observer,
    requestAnimationFrame(fn) {
      const id = ++sequence;
      frames.set(id, fn);
      return id;
    },
    cancelAnimationFrame(id) {
      frames.delete(id);
    },
    addEventListener: win.addEventListener.bind(win),
    removeEventListener: win.removeEventListener.bind(win),
  };
  const ctx = {
    setTransform() {},
    clearRect() {},
    save() {},
    restore() {},
    translate() {},
    fillRect(...args) {
      args.forEach((n) => assert.ok(Number.isFinite(n)));
      draws++;
    },
    createPattern: () => ({}),
    createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
    putImageData() {},
  };
  win.HTMLCanvasElement.prototype.getContext = () => (canvas ? ctx : null);
  win.HTMLElement.prototype.animate = function (keyframes, options) {
    let resolve;
    const animation = {
      finished: new Promise((done) => {
        resolve = done;
      }),
      cancelled: false,
      cancel() {
        this.cancelled = true;
        resolve();
      },
    };
    played.push({ node: this, keyframes, options, animation });
    return animation;
  };
  doc.body.innerHTML =
    '<main><article class="project-card"><h2>A real project</h2><button>Open</button></article></main>';
  const fx = mountSignalFX(doc, view);
  t.after(() => {
    fx.destroy();
    win.happyDOM.abort();
  });
  return {
    win,
    doc,
    fx,
    frames,
    played,
    observers,
    get draws() {
      return draws;
    },
    tick(delta = 42) {
      now += delta;
      const pending = [...frames];
      frames.clear();
      for (const [, fn] of pending) fn(now);
    },
    hidden(value) {
      hidden = value;
      doc.dispatchEvent(new win.Event("visibilitychange"));
    },
    appearance(values) {
      Object.assign(doc.documentElement.dataset, values);
      doc.dispatchEvent(new win.Event("appearancechange"));
    },
  };
}

test("static geometry remains bounded and finite across viewport sizes and long sessions", () => {
  for (const [w, h] of [
    [320, 568],
    [1440, 900],
    [3840, 2160],
  ])
    for (const time of [0, 16, 1000, 12500, 3600000])
      for (let i = 0; i < 22; i++) {
        const b = interferenceBand(time, i, w, h, 2.1);
        assert.ok(Object.values(b).every(Number.isFinite));
        assert.ok(b.x >= 0 && b.x <= w && b.y >= 0 && b.y < h);
        assert.ok(b.width > 0 && b.width <= w);
      }
  for (const disabled of [
    { motion: "off" },
    { fx: "clean" },
    { contrast: "high" },
  ])
    assert.equal(
      signalEnabled({
        motion: "on",
        fx: "signal",
        contrast: "normal",
        ...disabled,
      }),
      false,
    );
});

test("ambient drawing uses a single bounded loop and stops for clean, reduced motion and hidden tabs", (t) => {
  const h = harness(t);
  assert.equal(h.frames.size, 1);
  const canvas = h.doc.querySelector("#signal-field");
  assert.ok(canvas.width <= 1440);
  h.tick();
  assert.ok(h.draws > 0);
  for (const change of [
    { fx: "clean" },
    { motion: "off" },
    { contrast: "high" },
  ]) {
    h.appearance(change);
    assert.equal(h.frames.size, 0);
    assert.equal(h.doc.documentElement.dataset.signal, "idle");
    h.appearance({ motion: "on", fx: "crt", contrast: "normal" });
    assert.equal(h.frames.size, 1);
  }
  h.hidden(true);
  assert.equal(h.frames.size, 0);
  h.hidden(false);
  assert.equal(h.frames.size, 1);
  h.fx.sync();
  h.fx.sync();
  assert.equal(h.frames.size, 1);
});

test("transition bands cancel when effects stop and cannot cover the page after disposal", async (t) => {
  const h = harness(t);
  h.fx.transition();
  assert.equal(h.played.length, 8);
  assert.ok(
    h.played.every(({ options }) => options.duration + options.delay < 800),
  );
  assert.equal(
    h.doc.querySelector("#signal-shutter").getAttribute("aria-hidden"),
    "true",
  );
  h.appearance({ motion: "off" });
  assert.ok(h.played.every(({ animation }) => animation.cancelled));
  h.fx.destroy();
  assert.equal(h.doc.querySelector("#signal-shutter"), null);
  assert.equal(h.doc.querySelector("#signal-field"), null);
  h.appearance({ motion: "on" });
  assert.equal(h.frames.size, 0);
});

test("redecorating and route replacement keep one circuit per panel and release observers", (t) => {
  const h = harness(t),
    host = h.doc.querySelector("main");
  h.fx.decorate(host);
  h.fx.decorate(host);
  assert.equal(host.querySelectorAll(".signal-circuit").length, 1);
  assert.equal(host.textContent, "A real projectOpen");
  assert.ok(host.querySelector("article").classList.contains("signal-live"));
  host.innerHTML = '<section class="panel">Next route</section>';
  h.fx.decorate(host);
  assert.equal(h.observers[0].targets.size, 1);
  assert.equal(host.querySelectorAll(".signal-circuit").length, 1);
  h.fx.destroy();
  assert.equal(h.observers[0].targets.size, 0);
  assert.equal(host.querySelectorAll(".signal-circuit").length, 0);
});

test("no-canvas browsers keep decorative CSS transitions and ordinary buttons usable", (t) => {
  const h = harness(t, { canvas: false }),
    button = h.doc.querySelector("button");
  assert.equal(h.frames.size, 0);
  h.fx.decorate(h.doc.querySelector("main"));
  h.fx.transition();
  assert.equal(h.played.length, 8);
  let clicks = 0;
  button.addEventListener("click", () => clicks++);
  button.click();
  assert.equal(clicks, 1);
  h.appearance({ fx: "clean" });
  h.fx.transition();
  assert.equal(h.played.length, 8);
});

test("ambient frames are throttled and inactive documents schedule no work", (t) => {
  const h = harness(t, { motion: "off" });
  assert.equal(h.frames.size, 0);
  h.fx.transition();
  assert.equal(h.played.length, 0);
  h.appearance({ motion: "on" });
  h.tick(16);
  const first = h.draws;
  h.tick(16);
  h.tick(16);
  assert.equal(h.draws, first);
  h.tick(16);
  assert.ok(h.draws > first);
  h.fx.destroy();
  assert.equal(h.frames.size, 0);
});
