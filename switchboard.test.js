import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { Window } from "happy-dom";
import { switchboardHome, mountSwitchboard } from "./switchboard.js";
import {
  boardKey,
  boardProjects,
  boardLinks,
  boardState,
  boardArrangement,
  visibleProjects,
  compareProjects,
  connectedIds,
  wirePath,
} from "./switchboard-model.js";
import { normalizeSettings } from "./settings-model.js";

// DOM/interaction checks only; Happy DOM is not a rendering browser.
function harness(t, { raw = null, blocked = false } = {}) {
  const win = new Window({
    url: "https://portfolio.test/",
    settings: {
      disableJavaScriptFileLoading: true,
      enableCSSFileLoading: false,
    },
  });
  win.document.body.innerHTML = switchboardHome();
  win.document.documentElement.dataset.motion = "on";
  const frames = new Map(),
    store = new Map([[boardKey, raw]]),
    animations = [];
  let frameId = 0;
  const globals = {
    document: win.document,
    window: win,
    requestAnimationFrame: (fn) => {
      frames.set(++frameId, fn);
      return frameId;
    },
    cancelAnimationFrame: (id) => frames.delete(id),
  };
  const original = new Map(
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
  const $ = (s) => win.document.querySelector(s);
  const board = $("#sb-board");
  board.getBoundingClientRect = () => ({
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    width: 1000,
    height: 640,
  });
  for (const grip of win.document.querySelectorAll("[data-sb-grip]")) {
    grip.captured = null;
    grip.setPointerCapture = (id) => {
      grip.captured = id;
    };
    grip.hasPointerCapture = (id) => grip.captured === id;
    grip.releasePointerCapture = () => {
      grip.captured = null;
    };
  }
  const dispose = mountSwitchboard(win.document.body, {
    read: (key) => store.get(key),
    write: (key, value) => {
      if (blocked) throw Error("blocked");
      store.set(key, value);
      return true;
    },
    animate: (...args) => animations.push(args),
  });
  t.after(async () => {
    dispose();
    for (const [key, descriptor] of original)
      descriptor
        ? Object.defineProperty(globalThis, key, descriptor)
        : delete globalThis[key];
    await win.happyDOM.close();
  });
  const event = (el, type, fields = {}) => {
    const e = new win.Event(type, { bubbles: true, cancelable: true });
    for (const [key, value] of Object.entries(fields))
      Object.defineProperty(e, key, { value });
    el.dispatchEvent(e);
    return e;
  };
  return {
    win,
    $,
    board,
    store,
    frames,
    animations,
    dispose,
    event,
    input: (s, value) => {
      $(s).value = value;
      event($(s), "input");
    },
    change: (s, value) => {
      $(s).value = value;
      event($(s), "change");
    },
    pointer: (s, type, x, y, id = 1) =>
      event($(s), type, { clientX: x, clientY: y, pointerId: id, button: 0 }),
    key: (s, key, extra = {}) => event($(s), "keydown", { key, ...extra }),
    flush: () => {
      const pending = [...frames.values()];
      frames.clear();
      pending.forEach((fn) => fn(16));
    },
    saved: () => JSON.parse(store.get(boardKey)),
  };
}

test("Switchboard validates local positions, IDs and distinct socket pairs", () => {
  for (const raw of [null, "broken", "null", "[]", "{}", "42"])
    assert.deepEqual(boardState(raw), boardState(null));
  const dirty = boardState(
    JSON.stringify({
      positions: {
        maintaineros: { x: 999, y: -999 },
        "nexus-ai": { x: "0.3", y: 4 },
        unknown: { x: 0.5, y: 0.5 },
      },
      selected: "<script>",
      sockets: ["civiclens", "civiclens"],
    }),
  );
  assert.deepEqual(dirty.positions.maintaineros, { x: 0.88, y: 0.14 });
  assert.deepEqual(dirty.positions["nexus-ai"], boardArrangement()["nexus-ai"]);
  assert.equal(dirty.selected, "maintaineros");
  assert.deepEqual(dirty.sockets, ["maintaineros", "civiclens"]);
  assert.equal(Object.keys(dirty.positions).length, 7);
});
test("both map arrangements and every wire stay finite and bounded", () => {
  for (const mode of ["circuit", "rows"]) {
    const points = boardArrangement(mode);
    for (const p of Object.values(points))
      assert.ok(p.x >= 0.12 && p.x <= 0.88 && p.y >= 0.14 && p.y <= 0.86);
    for (const [a, b] of boardLinks)
      assert.doesNotMatch(
        wirePath(points[a], points[b]),
        /NaN|undefined|Infinity/,
      );
    assert.equal(
      new Set(Object.values(points).map((p) => JSON.stringify(p))).size,
      7,
    );
  }
});
test("filtering and isolation use real project metadata", () => {
  assert.equal(visibleProjects().length, 7);
  assert.deepEqual(
    visibleProjects({ query: "python fastapi" }).map((p) => p.id),
    ["maintaineros", "civiclens"],
  );
  assert.equal(visibleProjects({ category: "hardware" }).length, 2);
  assert.equal(visibleProjects({ query: "not a project" }).length, 0);
  assert.equal(connectedIds("maintaineros").size, 3);
  assert.equal(
    visibleProjects({ isolated: true, selected: "maintaineros" }).length,
    3,
  );
});
test("comparison reports documented shared tools without invented relationships", () => {
  const pair = compareProjects("maintaineros", "civiclens");
  assert.ok(pair.shared.includes("Python"));
  assert.ok(pair.shared.includes("FastAPI"));
  assert.match(pair.connection, /SQLite/);
  assert.equal(compareProjects("robo-telescope", "civiclens").connection, null);
  assert.equal(compareProjects("x", "civiclens"), null);
  assert.equal(compareProjects("civiclens", "civiclens"), null);
});
test("Switchboard renders seven working files with factual imagery and accessible targets", (t) => {
  const h = harness(t);
  assert.equal(h.win.document.querySelectorAll("[data-sb-node]").length, 7);
  for (const p of boardProjects) {
    h.$(`[data-sb-select="${p.id}"]`).click();
    assert.equal(h.$("#sb-file-title").textContent, p.title);
    assert.equal(h.$("#sb-inspector img").getAttribute("src"), p.image);
    assert.equal(h.$("#sb-inspector figcaption").textContent, p.caption);
    assert.match(h.$("#sb-inspector").textContent, new RegExp(p.status));
  }
  const ids = [...h.win.document.querySelectorAll("[id]")].map((el) => el.id);
  assert.equal(ids.length, new Set(ids).size);
  for (const el of h.win.document.querySelectorAll(
    "[aria-controls],[aria-labelledby],[aria-describedby]",
  ))
    for (const attr of ["aria-controls", "aria-labelledby", "aria-describedby"])
      for (const id of (el.getAttribute(attr) || "").split(" ").filter(Boolean))
        assert.ok(h.$(`#${id}`), id);
});
test("search, category, isolate and empty-state recovery compose", (t) => {
  const h = harness(t);
  h.$("#sb-isolate").click();
  assert.match(h.$("#sb-count").textContent, /03/);
  h.input("#sb-search", "python fastapi");
  assert.match(h.$("#sb-count").textContent, /02/);
  h.$('[data-sb-filter="hardware"]').click();
  assert.equal(h.$("#sb-empty").hidden, false);
  h.$("#sb-clear").click();
  assert.equal(h.$("#sb-empty").hidden, true);
  assert.match(h.$("#sb-count").textContent, /07/);
  assert.equal(h.$("#sb-isolate").getAttribute("aria-pressed"), "false");
});
test("socket pinning, selectors and swap keep distinct projects and persist", (t) => {
  const h = harness(t);
  h.$('[data-sb-select="robo-telescope"]').click();
  h.$('[data-sb-pin="0"]').click();
  assert.equal(h.saved().sockets[0], "robo-telescope");
  assert.match(h.$("#sb-comparison").textContent, /Under repair/);
  h.change('[data-sb-socket="1"]', "robo-telescope");
  assert.deepEqual(h.saved().sockets, ["civiclens", "robo-telescope"]);
  h.$("#sb-swap").click();
  assert.deepEqual(h.saved().sockets, ["robo-telescope", "civiclens"]);
  assert.match(h.$("#sb-comparison").textContent, /No direct relationship/);
});
test("expanded inspector opens build evidence and connected-file focus survives rerender", (t) => {
  const h = harness(t);
  h.$("#sb-expand").click();
  assert.equal(h.$("#sb-inspector details").open, true);
  assert.equal(h.$("#sb-expand").getAttribute("aria-expanded"), "true");
  h.$('.sb-neighbors [data-sb-select="nexus-ai"]').click();
  assert.equal(h.win.document.activeElement, h.$("#sb-file-title"));
  assert.equal(h.$("#sb-inspector details").open, true);
  assert.match(h.$("#sb-inspector").textContent, /existing models/);
  h.$("#sb-expand").click();
  assert.equal(h.$("#sb-inspector details").open, false);
});
test("dragging is bounded, owns its pointer and updates wires without an idle animation loop", (t) => {
  const h = harness(t),
    grip = '[data-sb-grip="maintaineros"]';
  const old = h.$('[data-wire="0"]').getAttribute("d");
  h.pointer(grip, "pointerdown", 100, 100);
  h.pointer(grip, "pointermove", 700, 700, 2);
  assert.equal(h.frames.size, 0);
  h.pointer(grip, "pointermove", 400, 230);
  assert.equal(h.frames.size, 1);
  h.flush();
  assert.notEqual(h.$('[data-wire="0"]').getAttribute("d"), old);
  h.pointer(grip, "pointermove", 99999, -99999);
  h.pointer(grip, "pointerup", 99999, -99999);
  assert.deepEqual(h.saved().positions.maintaineros, { x: 0.88, y: 0.14 });
  assert.equal(h.$(grip).captured, null);
  assert.equal(h.frames.size, 0);
});
test("Escape, cancellation and viewport resize restore an unfinished move", (t) => {
  const h = harness(t),
    grip = '[data-sb-grip="maintaineros"]';
  for (const cancel of [
    () => h.key(grip, "Escape"),
    () => h.pointer(grip, "pointercancel", 500, 500),
    () => h.win.dispatchEvent(new h.win.Event("resize")),
  ]) {
    h.pointer(grip, "pointerdown", 100, 100);
    h.pointer(grip, "pointermove", 500, 500);
    h.flush();
    cancel();
    assert.equal(
      h.$('[data-sb-node="maintaineros"]').style.getPropertyValue("--node-x"),
      "51%",
    );
    assert.equal(h.$(grip).captured, null);
    assert.equal(h.frames.size, 0);
  }
});
test("keyboard movement, Home and Align are genuine alternatives to dragging", (t) => {
  const h = harness(t),
    grip = '[data-sb-grip="maintaineros"]';
  h.key(grip, "ArrowRight");
  assert.equal(h.saved().positions.maintaineros.x, 0.53);
  h.key(grip, "ArrowDown", { shiftKey: true });
  assert.equal(h.saved().positions.maintaineros.y, 0.54);
  h.key(grip, "Home");
  assert.deepEqual(
    h.saved().positions.maintaineros,
    boardArrangement().maintaineros,
  );
  h.$('[data-sb-arrange="rows"]').click();
  assert.deepEqual(h.saved().positions, boardArrangement("rows"));
  h.$('[data-sb-arrange="circuit"]').click();
  assert.deepEqual(h.saved().positions, boardArrangement());
});
test("saved positions and selected pair restore; blocked storage stays usable", (t) => {
  const state = boardState(null);
  state.selected = "robo-telescope";
  state.positions.maintaineros = { x: 0.2, y: 0.2 };
  state.sockets = ["nexus-ai", "pi-homelab"];
  const h = harness(t, { raw: JSON.stringify(state), blocked: true });
  assert.match(h.$("#sb-file-title").textContent, /Telescope/);
  assert.equal(h.$('[data-sb-socket="0"]').value, "nexus-ai");
  assert.equal(
    h.$('[data-sb-node="maintaineros"]').style.getPropertyValue("--node-x"),
    "20%",
  );
  h.$('[data-sb-select="civiclens"]').click();
  assert.match(h.$("#sb-status").textContent, /Session only/);
  assert.equal(h.$("#sb-file-title").textContent, "CivicLens");
});
test("trace is bounded and cancels immediately for motion-off, hidden page and disposal", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const h = harness(t);
  h.$("#sb-trace").click();
  assert.equal(h.board.dataset.tracing, "true");
  t.mock.timers.tick(1800);
  assert.equal(h.board.dataset.tracing, undefined);
  assert.equal(h.$("#sb-trace").disabled, false);
  h.$("#sb-trace").click();
  h.win.document.documentElement.dataset.motion = "off";
  h.win.document.dispatchEvent(new h.win.Event("appearancechange"));
  assert.equal(h.board.dataset.tracing, undefined);
  h.$("#sb-trace").click();
  assert.equal(h.board.dataset.tracing, undefined);
  assert.match(h.$("#sb-status").textContent, /2 documented connections/);
  h.win.document.documentElement.dataset.motion = "on";
  h.$("#sb-trace").click();
  Object.defineProperty(h.win.document, "hidden", {
    value: true,
    configurable: true,
  });
  h.win.document.dispatchEvent(new h.win.Event("visibilitychange"));
  assert.equal(h.board.dataset.tracing, undefined);
  Object.defineProperty(h.win.document, "hidden", {
    value: false,
    configurable: true,
  });
  h.$("#sb-trace").click();
  h.dispose();
  assert.equal(h.board.dataset.tracing, undefined);
  assert.equal(h.frames.size, 0);
  const title = h.$("#sb-file-title").textContent;
  h.$('[data-sb-select="nexus-ai"]').click();
  assert.equal(h.$("#sb-file-title").textContent, title);
});
test("Switchboard survives settings validation and first-paint preference restore", () => {
  assert.equal(
    normalizeSettings({ layout: "switchboard" }).layout,
    "switchboard",
  );
  const html = readFileSync(new URL("index.html", import.meta.url), "utf8");
  const document = { documentElement: { dataset: {} } };
  runInNewContext(html.match(/<script>([\s\S]*?)<\/script>/)[1], {
    document,
    matchMedia: () => ({ matches: false }),
    localStorage: {
      getItem: (key) =>
        key === "hirsu-settings-v14"
          ? JSON.stringify({ layout: "switchboard" })
          : null,
    },
  });
  assert.equal(document.documentElement.dataset.layout, "switchboard");
  assert.match(html, /value="switchboard"/);
});
test("motion-off keeps inspection and patching functional without animation callbacks", (t) => {
  const h = harness(t);
  h.win.document.documentElement.dataset.motion = "off";
  const before = h.animations.length;
  h.$('[data-sb-select="robo-telescope"]').click();
  h.$('[data-sb-pin="1"]').click();
  assert.equal(h.animations.length, before);
  assert.match(h.$("#sb-comparison").textContent, /Under repair/);
  assert.equal(h.frames.size, 0);
});
test("navigation disposes a pending drag even after another control redraws the board", (t) => {
  const h = harness(t),
    grip = '[data-sb-grip="maintaineros"]';
  h.pointer(grip, "pointerdown", 100, 100);
  h.pointer(grip, "pointermove", 250, 150);
  h.$('[data-sb-filter="software"]').click();
  assert.equal(h.frames.size, 1);
  h.dispose();
  assert.equal(h.frames.size, 0);
  assert.equal(h.$(grip).captured, null);
  const path = h.$('[data-wire="0"]').getAttribute("d");
  h.pointer(grip, "pointermove", 500, 500);
  h.flush();
  assert.equal(h.$('[data-wire="0"]').getAttribute("d"), path);
});
