import { escapeHTML as esc } from "./console-model.js?v=24";
import {
  boardKey,
  boardProjects,
  boardLinks,
  boardArrangement,
  boardState,
  bound,
  connectedIds,
  visibleProjects,
  compareProjects,
  wirePath,
} from "./switchboard-model.js?v=24";

const byId = (id) => boardProjects.find((p) => p.id === id);
const number = (i) => String(i + 1).padStart(2, "0");
const tags = (items) =>
  items.length
    ? items.map((tag) => `<span>${esc(tag)}</span>`).join("")
    : "<span>None documented</span>";
const source = (p) =>
  p.source
    ? `<a href="${esc(p.source)}" target="_blank" rel="noopener noreferrer">Source & setup ↗</a>`
    : "<span>Personal build / no public repository</span>";

export function switchboardHome() {
  return `<div class="switchboard-home" data-board-root>
    <header class="sb-masthead"><div><p class="sb-kicker"><span>HIRSU / INTERFACE 04</span> PERSONAL PROJECT ROUTER</p><h1>SWITCH<span>BOARD<span class="sb-title-cursor" aria-hidden="true">_</span></span></h1></div><div class="sb-manifest"><p>FOLLOW THE WIRE.<br />FIND THE IDEA.</p><span>Move the files. Trace the connections.<br />Patch two builds together to compare them.</span><div><b>${boardProjects.length} <small>PROJECTS</small></b><b>${boardProjects.filter((p) => p.source).length} <small>PUBLIC REPOS</small></b></div></div></header>
    <section class="sb-console" aria-label="Interactive project switchboard">
      <div class="sb-toolbar"><label class="sb-search"><span>FILTER /</span><input type="search" id="sb-search" placeholder="Name, tool, idea…" maxlength="120" autocomplete="off" /></label><div class="sb-filters" aria-label="Filter by project type">${[
        ["all", "All signals"],
        ["software", "Software"],
        ["hardware", "Hardware"],
        ["homelab", "Home lab"],
      ]
        .map(
          ([id, label]) =>
            `<button data-sb-filter="${id}" aria-pressed="${id === "all"}">${label}</button>`,
        )
        .join(
          "",
        )}</div><span id="sb-count" role="status">${boardProjects.length} / ${boardProjects.length}</span></div>
      <div class="sb-workspace"><div class="sb-map-panel"><div class="sb-map-bar"><span>01 / PATCH FIELD</span><div><button data-sb-arrange="circuit">Circuit</button><button data-sb-arrange="rows">Align</button><button id="sb-isolate" aria-pressed="false">Isolate links</button><button id="sb-trace">Trace signal ↗</button></div></div>
        <p id="sb-move-help" class="sb-move-help"><span class="sb-drag-help">Select a file to inspect. Drag its grip to move it, or focus the grip and use arrow keys. Escape cancels a drag.</span><span class="sb-touch-help">Tap a file to inspect, then patch it into A or B below.</span></p>
        <div class="sb-board" id="sb-board"><svg class="sb-wires" viewBox="0 0 1000 640" preserveAspectRatio="none" aria-hidden="true">${boardLinks.map(([a, b], i) => `<path data-wire="${i}" data-a="${a}" data-b="${b}" />`).join("")}</svg><div class="sb-watermark" aria-hidden="true"><span>H / 04</span>LOCAL TOPOLOGY</div>
          ${boardProjects.map((p, i) => `<article class="sb-node" data-sb-node="${p.id}"><button class="sb-node-open" data-sb-select="${p.id}" aria-pressed="false" aria-controls="sb-inspector"><span class="sb-node-id">${number(i)} / ${esc(p.filters[0].toUpperCase())}<i aria-hidden="true"></i></span><b>${esc(p.title)}</b><small>${esc(p.status)}</small></button><button class="sb-grip" data-sb-grip="${p.id}" aria-label="Move ${esc(p.title)}" aria-describedby="sb-move-help">⠿</button><span class="sb-socket-badge" aria-hidden="true"></span></article>`).join("")}
          <p id="sb-empty" hidden>No signals match.<br />Try another search, or <button id="sb-clear">clear the filters</button>.</p>
        </div><div class="sb-map-footer"><span id="sb-status" role="status">Illustrated connections / not live devices</span><span class="sb-map-code" aria-hidden="true">PATCH / EXPLORE / REPEAT</span></div></div>
        <aside class="sb-inspector" aria-labelledby="sb-file-title"><div class="sb-inspector-bar"><span>02 / FILE INSPECTOR</span><button id="sb-expand" aria-expanded="false" aria-controls="sb-inspector">Expand file ↗</button></div><div id="sb-inspector"></div></aside>
      </div>
    </section>
    <section class="sb-patchbay" aria-labelledby="sb-compare-title"><header><div><p class="sb-kicker">03 / PATCH BAY</p><h2 id="sb-compare-title">TWO BUILDS.<br /><em>ONE CONNECTION?</em></h2></div><p>Patch a project into each socket.<br />Compare actual tools, status and related work.<br /><span>No rankings. No made-up compatibility scores.</span></p></header><div class="sb-sockets">${["A", "B"].map((slot, i) => `<label><span class="sb-socket-letter">${slot}</span><span>PROJECT INPUT ${slot}<select data-sb-socket="${i}" aria-label="Project socket ${slot}">${boardProjects.map((p) => `<option value="${p.id}">${esc(p.title)}</option>`).join("")}</select></span></label>`).join("")}<button id="sb-swap" aria-label="Swap projects in sockets A and B">A ⇄ B</button></div><div id="sb-comparison" aria-live="polite"></div></section>
    <nav class="sb-exits" aria-label="Continue exploring"><a href="#network"><span>04 / AFTER DARK</span>Night-sky atlas <b>↗</b></a><a href="#lab"><span>05 / MY WORKBENCH</span>Build Lab <b>↗</b></a><a href="#projects"><span>06 / ALL FILES</span>Project archive <b>↗</b></a></nav>
    <p class="sb-local-note">Your arrangement and patch pair stay in this browser. Repositioning a card never changes a project or connects to a device. On small screens, the map becomes a touch-friendly file grid.</p>
  </div>`;
}

function inspector(p) {
  return `<figure><img src="${p.image}" alt="${esc(p.alt)}" width="1200" height="750" /><figcaption>${esc(p.caption)}</figcaption></figure><div class="sb-file-copy"><p class="sb-kicker">${esc(p.category)}</p><h2 id="sb-file-title">${esc(p.title)}</h2><p class="sb-file-state">${esc(p.status)}</p><p>${esc(p.description)}</p><div class="sb-tool-tags">${tags(p.tags)}</div><div class="sb-patch-actions"><button data-sb-pin="0">Patch to A</button><button data-sb-pin="1">Patch to B</button></div><details><summary>Build notes + evidence</summary><p>${esc(p.progress)}</p><ul>${p.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul><p class="sb-evidence">${esc(p.evidence)}</p></details><div class="sb-file-links"><a href="#${p.id}">Open complete file ↗</a>${source(p)}</div><div class="sb-neighbors"><p>CONNECTED FILES</p>${boardLinks
    .filter(([a, b]) => a === p.id || b === p.id)
    .map(([a, b, why]) => {
      const next = byId(a === p.id ? b : a);
      return `<button data-sb-select="${next.id}"><b>${esc(next.title)} ↗</b><small>${esc(why)}</small></button>`;
    })
    .join("")}</div></div>`;
}

function comparison(a, b) {
  const pair = compareProjects(a, b);
  if (!pair) return "<p>Choose two different projects.</p>";
  return `<div class="sb-connection"><span aria-hidden="true">A ──╱── B</span><div><h3>${esc(pair.connection || "Different paths. Different tools.")}</h3><p>${pair.connection ? "Documented relationship between these projects." : "No direct relationship is documented for this pair. Explore their tools and build notes instead."}</p></div></div><div class="sb-compare-grid"><article><span>A / ${esc(pair.left.title)}</span><h3>Only in A</h3><div class="sb-tool-tags">${tags(pair.onlyLeft)}</div><p>${esc(pair.left.status)}</p><a href="#${pair.left.id}">Read build A ↗</a></article><article class="sb-shared"><span>INTERSECTION</span><h3>${pair.shared.length} shared ${pair.shared.length === 1 ? "tool" : "tools"}</h3><div class="sb-tool-tags">${tags(pair.shared)}</div><p>Exact matches in the documented tool lists.</p></article><article><span>B / ${esc(pair.right.title)}</span><h3>Only in B</h3><div class="sb-tool-tags">${tags(pair.onlyRight)}</div><p>${esc(pair.right.status)}</p><a href="#${pair.right.id}">Read build B ↗</a></article></div>`;
}

export function mountSwitchboard(
  container,
  { read = () => null, write = () => false, animate = () => {} } = {},
) {
  const home = container.querySelector("[data-board-root]");
  if (!home) return () => {};
  const $ = (selector) => home.querySelector(selector),
    root = document.documentElement;
  let state;
  try {
    state = boardState(read(boardKey));
  } catch {
    state = boardState(null);
  }
  const board = $("#sb-board"),
    file = $("#sb-inspector"),
    status = $("#sb-status");
  const nodes = [...home.querySelectorAll("[data-sb-node]")],
    wires = [...home.querySelectorAll("[data-wire]")];
  const sockets = [...home.querySelectorAll("[data-sb-socket]")];
  let query = "",
    category = "all",
    isolated = false,
    drag = null,
    raf = 0,
    traceTimer = null,
    disposed = false;
  let visible = new Set(boardProjects.map((p) => p.id));
  const listeners = [];
  const listen = (target, name, fn) => {
    target.addEventListener(name, fn);
    listeners.push([target, name, fn]);
  };
  const announce = (text) => {
    status.textContent = text;
  };
  function save(message) {
    let saved = false;
    try {
      saved = write(boardKey, JSON.stringify(state));
    } catch {
    }
    announce(
      message +
        (saved
          ? " Saved in this browser."
          : " Session only; browser storage unavailable."),
    );
  }
  function draw() {
    if (disposed) return;
    nodes.forEach((node) => {
      const id = node.dataset.sbNode,
        p = state.positions[id];
      node.style.setProperty("--node-x", `${p.x * 100}%`);
      node.style.setProperty("--node-y", `${p.y * 100}%`);
      node.dataset.selected = String(id === state.selected);
      node.hidden = !visible.has(id);
      node
        .querySelector("[data-sb-select]")
        .setAttribute("aria-pressed", String(id === state.selected));
      const socket = state.sockets.indexOf(id);
      node.querySelector(".sb-socket-badge").textContent =
        socket < 0 ? "" : socket === 0 ? "PATCH A" : "PATCH B";
    });
    wires.forEach((wire) => {
      const { a, b } = wire.dataset;
      wire.setAttribute("d", wirePath(state.positions[a], state.positions[b]));
      wire.dataset.active = String(
        a === state.selected || b === state.selected,
      );
      wire.style.display = visible.has(a) && visible.has(b) ? "" : "none";
    });
  }
  function updateVisible() {
    visible = new Set(
      visibleProjects({
        query,
        category,
        selected: state.selected,
        isolated,
      }).map((p) => p.id),
    );
    $("#sb-count").textContent =
      `${String(visible.size).padStart(2, "0")} / ${boardProjects.length}`;
    $("#sb-empty").hidden = visible.size !== 0;
    home
      .querySelectorAll("[data-sb-filter]")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.sbFilter === category),
        ),
      );
    $("#sb-isolate").setAttribute("aria-pressed", String(isolated));
    draw();
  }
  function showFile() {
    file.innerHTML = inspector(byId(state.selected));
    file.querySelector("details").open = home.dataset.expanded === "true";
    if (root.dataset.motion !== "off" && !document.hidden)
      animate(
        file,
        [
          { opacity: 0.4, transform: "translateY(10px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        340,
      );
  }
  function select(id) {
    if (!byId(id)) return;
    state.selected = id;
    showFile();
    updateVisible();
    save(`Inspecting ${byId(id).title}.`);
  }
  function patch() {
    sockets.forEach((select, i) => {
      select.value = state.sockets[i];
    });
    $("#sb-comparison").innerHTML = comparison(...state.sockets);
    draw();
  }
  function assign(slot, id) {
    if (![0, 1].includes(slot) || !byId(id)) return;
    if (state.sockets[1 - slot] === id)
      state.sockets[1 - slot] = state.sockets[slot];
    state.sockets[slot] = id;
    patch();
    save(`Patched ${byId(id).title} to socket ${slot === 0 ? "A" : "B"}.`);
  }
  function stopTrace() {
    clearTimeout(traceTimer);
    traceTimer = null;
    delete board.dataset.tracing;
    $("#sb-trace").disabled = false;
    $("#sb-trace").textContent = "Trace signal ↗";
  }
  function trace() {
    stopTrace();
    const count = connectedIds(state.selected).size - 1;
    announce(
      `${byId(state.selected).title}: ${count} documented connections. This is a visual trace, not a network scan.`,
    );
    if (root.dataset.motion === "off" || document.hidden) return;
    board.dataset.tracing = "true";
    $("#sb-trace").disabled = true;
    $("#sb-trace").textContent = "Tracing…";
    traceTimer = setTimeout(stopTrace, 1800);
  }
  function endDrag(cancel = false) {
    if (!drag) return;
    const current = drag;
    drag = null;
    delete board.dataset.dragging;
    if (current.handle.hasPointerCapture?.(current.pointer))
      current.handle.releasePointerCapture(current.pointer);
    if (cancel) state.positions[current.id] = current.original;
    if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
    draw();
    if (!cancel) save(`Moved ${byId(current.id).title}.`);
    else announce("Move cancelled.");
  }
  const click = (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.sbSelect) {
      const returnFocus = file.contains(button);
      select(button.dataset.sbSelect);
      if (returnFocus) {
        $("#sb-file-title").tabIndex = -1;
        $("#sb-file-title").focus({ preventScroll: true });
      }
    }
    if (button.dataset.sbFilter) {
      category = button.dataset.sbFilter;
      updateVisible();
    }
    if (["circuit", "rows"].includes(button.dataset.sbArrange)) {
      endDrag(true);
      state.positions = boardArrangement(button.dataset.sbArrange);
      draw();
      save("Project positions rearranged.");
    }
    if (button.dataset.sbPin !== undefined)
      assign(Number(button.dataset.sbPin), state.selected);
    if (button.id === "sb-clear") {
      query = "";
      category = "all";
      isolated = false;
      $("#sb-search").value = "";
      updateVisible();
    }
    if (button.id === "sb-isolate") {
      isolated = !isolated;
      updateVisible();
    }
    if (button.id === "sb-trace") trace();
    if (button.id === "sb-swap") {
      state.sockets.reverse();
      patch();
      save("Swapped patch sockets.");
    }
    if (button.id === "sb-expand") {
      const expanded = home.dataset.expanded !== "true";
      home.dataset.expanded = String(expanded);
      file.querySelector("details").open = expanded;
      button.setAttribute("aria-expanded", String(expanded));
      button.textContent = expanded ? "Collapse file ↙" : "Expand file ↗";
    }
  };
  const down = (event) => {
    const handle = event.target.closest("[data-sb-grip]");
    if (!handle || drag || event.button !== 0) return;
    const rect = board.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    event.preventDefault();
    const id = handle.dataset.sbGrip;
    handle.focus({ preventScroll: true });
    drag = {
      id,
      handle,
      pointer: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      rect,
      original: { ...state.positions[id] },
    };
    handle.setPointerCapture?.(event.pointerId);
    board.dataset.dragging = "true";
  };
  const move = (event) => {
    if (!drag || event.pointerId !== drag.pointer) return;
    state.positions[drag.id] = {
      x: bound(
        drag.original.x + (event.clientX - drag.x) / drag.rect.width,
        0.12,
        0.88,
      ),
      y: bound(
        drag.original.y + (event.clientY - drag.y) / drag.rect.height,
        0.14,
        0.86,
      ),
    };
    if (!raf)
      raf = requestAnimationFrame(() => {
        raf = 0;
        draw();
      });
  };
  const up = (event) => {
    if (drag?.pointer === event.pointerId) endDrag(event.type !== "pointerup");
  };
  const key = (event) => {
    if (event.key === "Escape" && drag) {
      event.preventDefault();
      event.stopPropagation();
      endDrag(true);
      return;
    }
    const grip = event.target.closest("[data-sb-grip]");
    if (
      !grip ||
      !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home"].includes(
        event.key,
      )
    )
      return;
    event.preventDefault();
    event.stopPropagation();
    endDrag(true);
    const id = grip.dataset.sbGrip,
      p = state.positions[id],
      step = event.shiftKey ? 0.06 : 0.02;
    if (event.key === "Home") state.positions[id] = boardArrangement()[id];
    if (event.key === "ArrowLeft") p.x = bound(p.x - step, 0.12, 0.88);
    if (event.key === "ArrowRight") p.x = bound(p.x + step, 0.12, 0.88);
    if (event.key === "ArrowUp") p.y = bound(p.y - step, 0.14, 0.86);
    if (event.key === "ArrowDown") p.y = bound(p.y + step, 0.14, 0.86);
    draw();
    save(`Moved ${byId(id).title}.`);
  };
  const appearance = () => {
    if (root.dataset.motion === "off") stopTrace();
  };
  const visibility = () => {
    if (document.hidden) {
      stopTrace();
      endDrag(true);
    }
  };
  listen(home, "click", click);
  listen(home, "input", (event) => {
    if (event.target.id === "sb-search") {
      query = event.target.value;
      updateVisible();
    }
  });
  listen(home, "change", (event) => {
    if (event.target.matches("[data-sb-socket]"))
      assign(Number(event.target.dataset.sbSocket), event.target.value);
  });
  listen(home, "keydown", key);
  listen(home, "pointerdown", down);
  listen(home, "pointermove", move);
  for (const name of ["pointerup", "pointercancel", "lostpointercapture"])
    listen(home, name, up);
  listen(document, "appearancechange", appearance);
  listen(document, "visibilitychange", visibility);
  listen(window, "resize", () => endDrag(true));
  showFile();
  patch();
  updateVisible();
  return () => {
    if (disposed) return;
    endDrag(true);
    stopTrace();
    disposed = true;
    if (raf) cancelAnimationFrame(raf);
    listeners.forEach(([target, name, fn]) =>
      target.removeEventListener(name, fn),
    );
  };
}
