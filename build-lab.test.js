import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { Window } from "happy-dom";
import { buildLabContent, mountBuildLab } from "./build-lab.js";
import {
  aim,
  aimPoint,
  pointAim,
  blendAim,
  labServices,
  macroLayers,
} from "./build-lab-model.js";
import { projects } from "./projects.js";
import { resolveRoute } from "./console-model.js";

function harness(t) {
  const win = new Window({
    url: "https://portfolio.test/",
    settings: {
      disableJavaScriptFileLoading: true,
      disableIframePageLoading: true,
      enableCSSFileLoading: false,
    },
  });
  win.document.body.innerHTML = buildLabContent();
  win.document.documentElement.dataset.motion = "on";
  const frames = new Map();
  let seq = 0;
  const globals = {
    window: win,
    document: win.document,
    requestAnimationFrame: (fn) => {
      frames.set(++seq, fn);
      return seq;
    },
    cancelAnimationFrame: (id) => frames.delete(id),
  };
  const old = new Map(
    Object.keys(globals).map((k) => [
      k,
      Object.getOwnPropertyDescriptor(globalThis, k),
    ]),
  );
  Object.entries(globals).forEach(([key, value]) =>
    Object.defineProperty(globalThis, key, {
      value,
      configurable: true,
      writable: true,
    }),
  );
  const $ = (s) => win.document.querySelector(s),
    dispose = mountBuildLab(win.document.body);
  t.after(async () => {
    dispose();
    old.forEach((v, k) =>
      v ? Object.defineProperty(globalThis, k, v) : delete globalThis[k],
    );
    await win.happyDOM.close();
  });
  const event = (s, type, data = {}) => {
    const e = new win.Event(type, { bubbles: true, cancelable: true });
    Object.entries(data).forEach(([k, value]) =>
      Object.defineProperty(e, k, { value }),
    );
    $(s).dispatchEvent(e);
    return e;
  };
  return {
    win,
    $,
    frames,
    dispose,
    event,
    input: (s, v) => {
      $(s).value = String(v);
      event(s, "input");
    },
    key: (s, key) => event(s, "keydown", { key }),
    frame: (time) => {
      const list = [...frames.values()];
      frames.clear();
      list.forEach((fn) => fn(time));
    },
  };
}
test("illustrative aim math wraps, clamps and takes the short route across north", () => {
  assert.deepEqual(aim({ az: -10, alt: 120 }), { az: 350, alt: 90 });
  assert.deepEqual(aim({ az: Infinity, alt: "bad" }), { az: 0, alt: 25 });
  assert.deepEqual(aimPoint({ az: 0, alt: 90 }), { x: 160, y: 160 });
  assert.equal(blendAim({ az: 350, alt: 0 }, { az: 10, alt: 90 }, 0.5).az, 0);
  for (const az of [0, 30, 90, 180, 270, 359])
    for (const alt of [0, 25, 70]) {
      const p = aimPoint({ az, alt }),
        back = pointAim(p.x, p.y);
      assert.ok(Math.abs(back.az - az) < 0.00001);
      assert.ok(Math.abs(back.alt - alt) < 0.00001);
    }
  assert.equal(pointAim(900, 900).alt, 0);
});
test("Build Lab has only personal build demos, factual status and resolving accessible targets", (t) => {
  const h = harness(t),
    html = h.win.document.body.innerHTML;
  assert.equal(h.win.document.querySelectorAll('[role="tabpanel"]').length, 3);
  assert.match(html, /under repair|Under repair/);
  assert.match(html, /Physical assembly/);
  assert.doesNotMatch(
    html,
    /signal-source|Copy CSS|Download CSS|Lost packets|FF:06:B5/,
  );
  const ids = [...h.win.document.querySelectorAll("[id]")].map((e) => e.id);
  assert.equal(ids.length, new Set(ids).size);
  for (const el of h.win.document.querySelectorAll(
    "[aria-controls],[aria-labelledby],[for]",
  ))
    for (const name of ["aria-controls", "aria-labelledby", "for"])
      for (const id of (el.getAttribute(name) || "").split(" ").filter(Boolean))
        assert.ok(h.$("#" + id), id);
});
test("tab keyboard wraps, preserves selection and leaves exactly one active panel", (t) => {
  const h = harness(t);
  h.key("#bl-tab-scope", "ArrowLeft");
  assert.equal(h.$("#bl-panel-pad").hidden, false);
  assert.equal(h.win.document.activeElement, h.$("#bl-tab-pad"));
  h.key("#bl-tab-pad", "Home");
  assert.equal(h.$("#bl-panel-scope").hidden, false);
  assert.equal(
    h.win.document.querySelectorAll('[role="tab"][tabindex="0"]').length,
    1,
  );
  assert.equal(
    h.win.document.querySelectorAll('[role="tabpanel"]:not([hidden])').length,
    1,
  );
});
test("target sliders, presets and map selection update the same demo angles", (t) => {
  const h = harness(t);
  h.input("#aim-az", 150);
  h.input("#aim-alt", 60);
  assert.equal(h.$("#aim-az-value").textContent, "150°");
  assert.equal(h.$("#aim-alt-value").textContent, "60°");
  h.$('[data-aim="210,30"]').click();
  assert.equal(h.$("#aim-az").value, "210");
  h.$("#aim-map").getBoundingClientRect = () => ({
    left: 0,
    top: 0,
    width: 320,
    height: 320,
  });
  h.event("#aim-map", "click", { button: 0, clientX: 286, clientY: 160 });
  assert.equal(h.$("#aim-az").value, "90");
  assert.equal(h.$("#aim-alt").value, "0");
  assert.equal(h.frames.size, 0);
});
test("telescope movement is bounded, ends exactly and never claims the real build moved", (t) => {
  const h = harness(t);
  h.$("#aim-run").click();
  assert.equal(h.frames.size, 1);
  h.frame(0);
  h.frame(700);
  assert.equal(h.$("#aim-current-az").textContent, "045");
  h.frame(1400);
  assert.equal(h.$("#aim-current-az").textContent, "090");
  assert.equal(h.frames.size, 0);
  assert.equal(h.$("#aim-stop").disabled, true);
  assert.match(
    h.$("#aim-status").textContent,
    /real telescope is still under repair/,
  );
});
test("stopping, editing target, switching tab, hiding and disposal all cancel telescope motion", (t) => {
  const h = harness(t);
  for (const stop of [
    () => h.$("#aim-stop").click(),
    () => h.input("#aim-alt", 30),
    () => h.$("#bl-tab-home").click(),
    () => {
      Object.defineProperty(h.win.document, "hidden", {
        value: true,
        configurable: true,
      });
      h.win.document.dispatchEvent(new h.win.Event("visibilitychange"));
    },
  ]) {
    Object.defineProperty(h.win.document, "hidden", {
      value: false,
      configurable: true,
    });
    h.$("#bl-tab-scope").click();
    h.$("#aim-run").click();
    h.frame(0);
    stop();
    assert.equal(h.frames.size, 0);
    assert.equal(h.$("#aim-run").disabled, false);
  }
  Object.defineProperty(h.win.document, "hidden", {
    value: false,
    configurable: true,
  });
  h.$("#aim-run").click();
  h.dispose();
  assert.equal(h.frames.size, 0);
  h.input("#aim-az", 300);
  assert.notEqual(h.$("#aim-az-value").textContent, "300°");
});
test("motion-off updates pointing immediately and keeps all controls usable", (t) => {
  const h = harness(t);
  h.$("#aim-run").click();
  h.win.document.documentElement.dataset.motion = "off";
  h.win.document.dispatchEvent(new h.win.Event("appearancechange"));
  assert.equal(h.frames.size, 0);
  h.input("#aim-az", 240);
  h.$("#aim-run").click();
  assert.equal(h.$("#aim-current-az").textContent, "240");
  assert.match(h.$("#aim-status").textContent, /no hardware moved/);
  h.$("#aim-reset").click();
  assert.equal(h.$("#aim-current-az").textContent, "000");
  assert.equal(h.$("#aim-az").value, "90");
});
test("Pi service controls and manual steps expose only the documented home-lab scope", (t) => {
  const h = harness(t);
  h.$("#bl-tab-home").click();
  assert.deepEqual(
    labServices.map((s) => s.id),
    ["pihole", "tailscale", "vpn"],
  );
  for (const service of labServices) {
    h.$(`[data-pi-service="${service.id}"]`).click();
    assert.equal(h.$("#pi-title").textContent, service.headline);
    h.$("#pi-next").click();
    assert.match(h.$("#pi-step-count").textContent, /02 OF 03/);
    h.$('[data-pi-step="2"]').click();
    assert.equal(h.$("#pi-step-title").textContent, service.steps[2].title);
    assert.equal(h.win.document.activeElement, h.$('[data-pi-step="2"]'));
  }
});
test("Pi trace completes, cancels on service/tab/visibility changes and stays manual with motion off", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const h = harness(t);
  h.$("#bl-tab-home").click();
  h.$("#pi-trace").click();
  t.mock.timers.tick(900);
  assert.match(h.$("#pi-step-count").textContent, /02 OF 03/);
  t.mock.timers.tick(900);
  assert.match(h.$("#pi-step-count").textContent, /03 OF 03/);
  assert.equal(h.$("#pi-trace").disabled, false);
  h.$("#pi-trace").click();
  h.$('[data-pi-service="vpn"]').click();
  t.mock.timers.tick(2000);
  assert.match(h.$("#pi-step-count").textContent, /01 OF 03/);
  h.$("#pi-trace").click();
  h.$("#bl-tab-pad").click();
  t.mock.timers.tick(2000);
  assert.equal(h.$("#pi-flow").dataset.tracing, undefined);
  h.$("#bl-tab-home").click();
  h.$("#pi-trace").click();
  Object.defineProperty(h.win.document, "hidden", {
    value: true,
    configurable: true,
  });
  h.win.document.dispatchEvent(new h.win.Event("visibilitychange"));
  t.mock.timers.tick(2000);
  assert.equal(h.$("#pi-trace").disabled, false);
  h.win.document.documentElement.dataset.motion = "off";
  h.$("#pi-trace").click();
  assert.match(h.$("#pi-status").textContent, /Use Next step/);
});
test("macro layers, click and scoped keyboard input map all seven real projects without system actions", (t) => {
  const h = harness(t);
  h.$("#bl-tab-pad").click();
  const seen = new Set();
  for (const [layer, entries] of Object.entries(macroLayers)) {
    h.$(`[data-macro-layer="${layer}"]`).click();
    assert.equal(entries.length, 6);
    for (let i = 0; i < 6; i++) {
      h.$(`[data-macro-key="${i}"]`).click();
      seen.add(entries[i].id);
      assert.equal(h.$("#macro-title").textContent, entries[i].title);
      assert.equal(
        h.$("#macro-open").getAttribute("href"),
        "#" + entries[i].id,
      );
    }
  }
  assert.equal(seen.size, projects.length);
  h.key('[data-macro-key="5"]', "1");
  assert.equal(
    h.$('[data-macro-key="0"]').getAttribute("aria-pressed"),
    "true",
  );
  h.key('[data-macro-key="0"]', "ArrowUp");
  assert.equal(h.win.document.activeElement, h.$('[data-macro-key="3"]'));
});
test("retired CSS playground and fiction routes are absent; legacy archive opens Build Lab", () => {
  assert.equal(resolveRoute("#archive"), "lab");
  for (const file of [
    "console.js",
    "index.html",
    "layouts.js",
    "overdrive-content.js",
    "switchboard.js",
    "network-view.js",
  ]) {
    const text = readFileSync(new URL(file, import.meta.url), "utf8");
    assert.doesNotMatch(
      text,
      /Signal Lab|Lost packets|signal-pages|glitch CSS generator|MAKE AN EFFECT/,
    );
  }
  assert.equal(existsSync(new URL("signal-pages.js", import.meta.url)), false);
  assert.equal(existsSync(new URL("signal-model.js", import.meta.url)), false);
});
test("automatic Pi steps preserve focused controls and disposal cancels a pending trace", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const h = harness(t);
  h.$("#bl-tab-home").click();
  h.$("#pi-trace").click();
  const control = h.$('[data-pi-step="1"]');
  control.focus();
  t.mock.timers.tick(900);
  assert.equal(h.win.document.activeElement, control);
  assert.equal(h.$('[data-pi-step="1"]'), control);
  h.dispose();
  t.mock.timers.tick(2000);
  assert.match(h.$("#pi-step-count").textContent, /02 OF 03/);
  assert.equal(h.$("#pi-flow").dataset.tracing, undefined);
});

test("Stellarium loads only on request, is separately attributed, expands and unloads on tab change", (t) => {
  const h = harness(t);
  assert.equal(h.$("iframe"), null);
  h.$("#stellarium-load").click();
  assert.equal(h.$("iframe").src, "https://stellarium-web.org/");
  assert.equal(h.$("iframe").getAttribute("allow"), "fullscreen");
  assert.equal(h.$("iframe").referrerPolicy, "no-referrer");
  assert.match(
    h.$(".planetarium").textContent,
    /not every feature of desktop Stellarium/,
  );
  h.$("#stellarium-expand").click();
  assert.equal(h.$(".planetarium").classList.contains("expanded"), true);
  h.$("#bl-tab-home").click();
  assert.equal(h.$("iframe"), null);
  h.$("#bl-tab-scope").click();
  h.$("#stellarium-load").click();
  h.$("#stellarium-close").click();
  assert.equal(h.$("iframe"), null);
});
test("component descriptions and assembly controls work without canvas support", (t) => {
  const h = harness(t);
  h.$('[data-scope-part="focus"]').click();
  assert.equal(h.$("#scope-part-title").textContent, "Focuser");
  h.$("#scope-explode").click();
  assert.equal(h.$("#scope-explode").getAttribute("aria-pressed"), "true");
  h.$("#scope-wire").click();
  assert.equal(h.$("#scope-wire").getAttribute("aria-pressed"), "true");
});
