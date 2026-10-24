import test from "node:test";
import assert from "node:assert/strict";
import { createCityMotion, bootDuration, bootPhases } from "./city-motion.js";
import { intros } from "./intro-variants.js";

function harness(
  t,
  { motion = "on", hidden = false, modalError = false, intro = "redline" } = {},
) {
  const root = { dataset: { motion, view: "neon", intro } };
  const doc = new EventTarget();
  doc.documentElement = root;
  doc.hidden = hidden;
  const focusTarget = {
    isConnected: true,
    getClientRects: () => [{}],
    closest: () => null,
    focus() {
      doc.activeElement = this;
    },
  };
  const main = {
    focus() {
      doc.activeElement = this;
    },
  };
  doc.activeElement = focusTarget;
  const skip = new EventTarget(),
    boot = new EventTarget();
  const percent = { textContent: "" };
  const art = { innerHTML: "" },
    label = { textContent: "" },
    description = { textContent: "" };
  boot.dataset = {};
  boot.open = false;
  boot.showModal = () => {
    if (modalError) throw new Error("modal unavailable");
    boot.open = true;
    doc.activeElement = skip;
  };
  boot.close = () => {
    boot.open = false;
    boot.dispatchEvent(new Event("close"));
  };
  doc.querySelector = (selector) =>
    ({
      "#boot-dialog": boot,
      "#skip-intro": skip,
      "#main": main,
      "#boot-percent": percent,
      "#boot-variant-art": art,
      "#boot-sequence-label": label,
      "#boot-description": description,
    })[selector] || null;
  let now = 0,
    next = 0;
  const timers = new Map();
  const globals = {
    document: doc,
    setTimeout: (fn, delay) => {
      const id = ++next;
      timers.set(id, { fn, due: now + delay });
      return id;
    },
    clearTimeout: (id) => timers.delete(id),
    cancelAnimationFrame: () => {},
  };
  const originals = new Map(
    Object.keys(globals).map((key) => [
      key,
      Object.getOwnPropertyDescriptor(globalThis, key),
    ]),
  );
  for (const [key, value] of Object.entries(globals))
    Object.defineProperty(globalThis, key, {
      value,
      configurable: true,
      writable: true,
    });
  t.after(() => {
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  const tick = (ms) => {
    now += ms;
    for (const [id, { fn, due }] of [...timers])
      if (due <= now && timers.has(id)) {
        timers.delete(id);
        fn();
      }
  };
  return {
    controller: createCityMotion(),
    root,
    doc,
    skip,
    boot,
    percent,
    art,
    label,
    description,
    main,
    focusTarget,
    timers,
    tick,
  };
}
test("autoplay off skips arrival but allows intentional preview", (t) => {
  const h = harness(t);
  h.root.dataset.autoplay = "off";
  assert.equal(h.controller.opening(), false);
  assert.equal(h.timers.size, 0);
  assert.equal(h.controller.opening({ replay: true }), true);
  h.tick(bootDuration);
  assert.equal(h.boot.open, false);
});
test("opening advances then always releases its modal, timers and scroll lock", (t) => {
  const h = harness(t);
  assert.equal(h.controller.opening(), true);
  assert.equal(h.controller.opening(), false);
  assert.equal(h.boot.open, true);
  assert.equal(h.root.dataset.booting, "true");
  let time = 0;
  for (const phase of bootPhases) {
    h.tick(phase.at - time);
    time = phase.at;
    assert.equal(h.boot.dataset.phase, phase.name);
    if (phase.name === "release") {
      assert.equal(h.percent.textContent, "100%");
      assert.equal(h.root.dataset.booting, "release");
      assert.equal(h.boot.open, true);
    }
  }
  h.tick(bootDuration - time);
  assert.equal(h.boot.open, false);
  assert.equal(h.root.dataset.booting, undefined);
  assert.equal(h.timers.size, 0);
  assert.equal(h.doc.activeElement, h.main);
});
test("Skip closes immediately; a replay gets fresh timers and returns focus", (t) => {
  const h = harness(t);
  h.controller.opening();
  h.skip.dispatchEvent(new Event("click"));
  assert.equal(h.boot.open, false);
  assert.equal(h.timers.size, 0);
  h.doc.activeElement = h.focusTarget;
  assert.equal(h.controller.opening({ replay: true }), true);
  assert.equal(h.percent.textContent, "000%");
  h.boot.dispatchEvent(new Event("close"));
  assert.equal(h.root.dataset.booting, "true");
  h.tick(bootDuration);
  assert.equal(h.doc.activeElement, h.focusTarget);
  assert.equal(h.timers.size, 0);
});
test("native dismissal clears timers and cannot reopen the overlay later", (t) => {
  const h = harness(t);
  h.controller.opening();
  h.tick(500);
  h.boot.close();
  h.tick(10000);
  assert.equal(h.boot.open, false);
  assert.equal(h.boot.dataset.phase, undefined);
  assert.equal(h.root.dataset.booting, undefined);
  assert.equal(h.timers.size, 0);
});
test("disabling FX during the 100% glitch release clears the modal and lock", (t) => {
  const h = harness(t);
  h.controller.opening();
  h.tick(2250);
  assert.equal(h.percent.textContent, "100%");
  assert.equal(h.root.dataset.booting, "release");
  h.root.dataset.motion = "off";
  h.doc.dispatchEvent(new Event("appearancechange"));
  assert.equal(h.boot.open, false);
  assert.equal(h.root.dataset.booting, undefined);
  assert.equal(h.timers.size, 0);
  h.tick(10000);
  assert.equal(h.boot.open, false);
});
test("motion off skips the intro and cancels one already in progress", (t) => {
  const h = harness(t, { motion: "off" });
  assert.equal(h.controller.opening(), false);
  assert.equal(h.timers.size, 0);
  h.root.dataset.motion = "on";
  h.controller.opening();
  h.root.dataset.motion = "off";
  h.doc.dispatchEvent(new Event("appearancechange"));
  assert.equal(h.boot.open, false);
  assert.equal(h.timers.size, 0);
});
test("backgrounding dismisses the intro rather than trapping a returning visitor", (t) => {
  const h = harness(t);
  h.controller.opening();
  h.doc.hidden = true;
  h.doc.dispatchEvent(new Event("visibilitychange"));
  assert.equal(h.boot.open, false);
  assert.equal(h.root.dataset.visibility, "hidden");
  assert.equal(h.timers.size, 0);
  assert.equal(h.controller.opening(), false);
});
test("unavailable dialog support leaves content accessible without a scroll lock", (t) => {
  const h = harness(t, { modalError: true });
  assert.equal(h.controller.opening(), false);
  assert.equal(h.root.dataset.booting, undefined);
  assert.equal(h.timers.size, 0);
});
for (const intro of intros) {
  test(`${intro.name}: selected artwork, 100%, completion, replay, Escape and FX cleanup`, (t) => {
    const h = harness(t, { intro: intro.id });
    assert.equal(h.controller.opening(), true);
    assert.equal(h.boot.dataset.intro, intro.id);
    assert.ok(h.label.textContent.includes(intro.name.toUpperCase()));
    assert.equal(h.description.textContent, intro.description);
    assert.equal(Boolean(h.art.innerHTML), intro.id !== "fracture");
    h.tick(2250);
    assert.equal(h.percent.textContent, "100%");
    h.tick(650);
    assert.equal(h.boot.open, false);
    assert.equal(h.timers.size, 0);
    h.controller.opening({ replay: true });
    assert.equal(h.percent.textContent, "000%");
    h.boot.dispatchEvent(new Event("cancel", { cancelable: true }));
    assert.equal(h.boot.open, false);
    assert.equal(h.root.dataset.booting, undefined);
    assert.equal(h.timers.size, 0);
    h.controller.opening();
    h.root.dataset.motion = "off";
    h.doc.dispatchEvent(new Event("appearancechange"));
    assert.equal(h.boot.open, false);
    assert.equal(h.timers.size, 0);
    assert.equal(h.controller.opening(), false);
  });
}
test("invalid saved startup safely uses Redline", (t) => {
  const h = harness(t, { intro: "__proto__" });
  h.controller.opening();
  assert.equal(h.boot.dataset.intro, "redline");
  h.skip.dispatchEvent(new Event("click"));
});
