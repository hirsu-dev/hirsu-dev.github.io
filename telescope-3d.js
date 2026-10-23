import {
  add3,
  sub3,
  mul3,
  unit3,
  cross3,
  rotate3,
  project3,
  insidePolygon,
  clamp,
  seededRandom,
} from "./space-math.js?v=21";

export const telescopeParts = {
  optics: [
    "Optical tube",
    "Light enters the aperture and travels along the tube. This is an illustrative optical assembly, not a measured replica of my build.",
  ],
  focus: [
    "Focuser",
    "Extend the rear focuser with the slider. Real focusing changes the eyepiece or sensor position; this demo shows that mechanical movement.",
  ],
  mount: [
    "Motorized mount",
    "Two axes turn the tube toward a computer-entered direction. Preview motion animates those axes; no commands leave this browser.",
  ],
  tripod: [
    "Tripod + base",
    "Three legs stabilize the mount. The exploded view separates the assembly to make its parts easier to inspect.",
  ],
};

// Solid cylinder meshes, transformed in world space and depth-sorted by the renderer.
export function telescopeMesh({
  az = 0,
  alt = 25,
  focus = 35,
  exploded = false,
} = {}) {
  const faces = [],
    gap = exploded ? 0.48 : 0;
  function cylinder(
    a,
    b,
    radius,
    color,
    part,
    transform = (p) => p,
    segments = 20,
  ) {
    const axis = unit3(sub3(b, a)),
      u = unit3(cross3(axis, Math.abs(axis[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0])),
      v = cross3(axis, u);
    const ring = (c) =>
      Array.from({ length: segments }, (_, i) =>
        transform(
          add3(
            c,
            add3(
              mul3(u, radius * Math.cos((i * 2 * Math.PI) / segments)),
              mul3(v, radius * Math.sin((i * 2 * Math.PI) / segments)),
            ),
          ),
        ),
      );
    const ra = ring(a),
      rb = ring(b);
    for (let i = 0; i < segments; i++)
      faces.push({
        points: [ra[i], ra[(i + 1) % segments], rb[(i + 1) % segments], rb[i]],
        color,
        part,
      });
    faces.push(
      { points: ra.toReversed(), color, part },
      { points: rb, color, part },
    );
  }
  const tube = (p) =>
    add3(
      rotate3(rotate3(p, 0, (-alt * Math.PI) / 180), (az * Math.PI) / 180, 0),
      [0, 0.6 + gap, 0],
    );
  for (let i = 0; i < 3; i++) {
    const t = (i * 2 * Math.PI) / 3;
    cylinder(
      [Math.sin(t) * 0.2, -0.3, Math.cos(t) * 0.2],
      [Math.sin(t) * 1.08, -1.65 - gap * 0.3, Math.cos(t) * 1.08],
      0.065,
      [85, 100, 114],
      "tripod",
    );
    cylinder(
      [Math.sin(t) * 1.08, -1.68 - gap * 0.3, Math.cos(t) * 1.08],
      [Math.sin(t) * 1.08, -1.58 - gap * 0.3, Math.cos(t) * 1.08],
      0.12,
      [24, 32, 43],
      "tripod",
    );
  }
  cylinder([0, -0.65, 0], [0, -0.15, 0], 0.21, [46, 59, 73], "tripod");
  cylinder([0, -0.2, 0], [0, 0.05, 0], 0.42, [43, 56, 70], "mount");
  cylinder(
    [0, 0.05 + gap * 0.5, 0],
    [0, 0.6 + gap, 0],
    0.13,
    [197, 168, 47],
    "mount",
  );
  cylinder(
    [-0.46, 0.6 + gap, 0],
    [0.46, 0.6 + gap, 0],
    0.19,
    [46, 57, 74],
    "mount",
    (p) => rotate3(p, (az * Math.PI) / 180, 0),
  );
  cylinder(
    [0, 0, -0.7],
    [0, 0, 0.9],
    0.29,
    [154, 172, 184],
    "optics",
    tube,
    28,
  );
  for (const z of [-0.45, 0.45])
    cylinder(
      [0, 0, z - 0.045],
      [0, 0, z + 0.045],
      0.32,
      [36, 47, 61],
      "optics",
      tube,
    );
  cylinder(
    [0, 0, 0.88 + gap],
    [0, 0, 1.04 + gap],
    0.34,
    [32, 45, 60],
    "optics",
    tube,
    28,
  );
  cylinder(
    [0, 0, 1.045 + gap],
    [0, 0, 1.05 + gap],
    0.275,
    [46, 136, 160],
    "optics",
    tube,
    28,
  );
  const extension = clamp(focus, 0, 100) * 0.0035;
  cylinder(
    [0, 0, -0.68 - gap],
    [0, 0, -0.9 - extension - gap],
    0.14,
    [58, 72, 86],
    "focus",
    tube,
  );
  cylinder(
    [0, 0, -0.92 - extension - gap],
    [0, 0, -1.12 - extension - gap],
    0.11,
    [161, 176, 187],
    "focus",
    tube,
  );
  cylinder(
    [0.12, 0, -0.82 - gap],
    [0.23, 0, -0.82 - gap],
    0.09,
    [220, 182, 49],
    "focus",
    tube,
  );
  return faces;
}

export function telescopeControls() {
  return `<div class="scope-3d"><div class="scope-hud"><span>ROBO / ASSEMBLY 01</span><span>3D INSPECTION</span></div><canvas id="scope-canvas" tabindex="0" aria-label="Interactive 3D telescope. Drag or use arrow keys to orbit. Plus and minus zoom. Home resets the camera. Click a part to inspect it."></canvas><p class="scope-fallback" hidden>3D drawing unavailable. All pointing controls, part descriptions and the planetarium remain available.</p><div class="scope-hud scope-hud-bottom"><span>DRAG TO ORBIT / CLICK A PART</span><span>CONCEPT / NOT TO SCALE</span></div></div>
    <div class="scope-tools"><button id="scope-reset">Reset camera</button><button id="scope-explode" aria-pressed="false">Explode assembly</button><button id="scope-wire" aria-pressed="false">Wireframe</button><label for="scope-zoom">Camera zoom <input id="scope-zoom" type="range" min="80" max="190" value="130" /></label><label for="scope-focus">Focuser extension <input id="scope-focus" type="range" min="0" max="100" value="35" /></label></div>
    <div class="scope-parts" aria-label="Inspect telescope components">${Object.entries(
      telescopeParts,
    )
      .map(
        ([id, [name]]) =>
          `<button data-scope-part="${id}" aria-pressed="${id === "optics"}">${name}</button>`,
      )
      .join(
        "",
      )}</div><div class="scope-detail" role="status"><b id="scope-part-title"></b><p id="scope-part-description"></p></div>`;
}

export function planetariumContent() {
  return `<section class="planetarium" aria-labelledby="planetarium-title"><header><div><p class="eyebrow">OBSERVATION DECK / EXTERNAL PLANETARIUM</p><h2 id="planetarium-title">The real sky. Stellarium Web.</h2><p>Explore stars, planets, constellations, time and location in Stellarium’s web interface. Its sky and the model above are separate: selections do not move the model or real hardware. This is the web edition, not every feature of desktop Stellarium.</p></div><a href="https://stellarium-web.org/" target="_blank" rel="noopener noreferrer">Open in its own tab ↗</a></header><div class="planetarium-actions"><button id="stellarium-load">Load Stellarium Web ↗</button><button id="stellarium-close" hidden>Unload planetarium</button><button id="stellarium-expand" aria-pressed="false" hidden>Expand sky</button></div><p id="stellarium-status" role="status">Loads only on request from stellarium-web.org, which uses its own servers and analytics. No precise location permission is passed by this portfolio.</p><div id="stellarium-host"></div><footer>Planetarium by <a href="https://stellarium-labs.com/stellarium-web/" target="_blank" rel="noopener noreferrer">Stellarium Labs</a> · <a href="https://github.com/Stellarium/stellarium-web-engine" target="_blank" rel="noopener noreferrer">Open-source Web Engine (AGPL-3.0)</a>. Independently hosted; availability and features are controlled by Stellarium.</footer></section>`;
}

export function mountTelescope(container) {
  const $ = (s) => container.querySelector(s),
    canvas = $("#scope-canvas"),
    ctx = canvas?.getContext("2d");
  const camera = {
    yaw: -0.7,
    pitch: 0.22,
    zoom: 1.3,
    distance: 6.2,
    center: [0, 0, 0],
  };
  const target = { ...camera };
  let current = { az: 0, alt: 25 },
    width = 0,
    height = 0,
    faces = [],
    selected = "optics",
    exploded = false,
    wire = false,
    focus = 35,
    drag = null,
    raf = 0,
    disposed = false,
    visible = true,
    last = 0;
  const listeners = [],
    random = seededRandom(38),
    stars = Array.from({ length: 140 }, () => [random(), random(), random()]);
  const listen = (el, name, fn) => {
    el.addEventListener(name, fn);
    listeners.push([el, name, fn]);
  };
  function select(part) {
    if (!telescopeParts[part]) return;
    selected = part;
    $("#scope-part-title").textContent = telescopeParts[part][0];
    $("#scope-part-description").textContent = telescopeParts[part][1];
    container
      .querySelectorAll("[data-scope-part]")
      .forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.scopePart === part)),
      );
    draw();
  }
  function draw() {
    if (!ctx || !width || !height || disposed || !visible || document.hidden)
      return;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#070c15";
    ctx.fillRect(0, 0, width, height);
    for (const [x, y, r] of stars) {
      ctx.fillStyle = `rgba(180,211,237,${0.15 + r * 0.4})`;
      ctx.fillRect(x * width, y * height, 1 + r, 1 + r);
    }
    const project = (p) => project3(p, camera, width, height);
    ctx.strokeStyle = "#243142";
    ctx.lineWidth = 0.6;
    for (let i = -4; i <= 4; i++)
      for (const points of [
        [
          [i * 0.5, -1.72, -2],
          [i * 0.5, -1.72, 2],
        ],
        [
          [-2, -1.72, i * 0.5],
          [2, -1.72, i * 0.5],
        ],
      ]) {
        const [a, b] = points.map(project);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    faces = telescopeMesh({ ...current, focus, exploded })
      .map((face) => ({ ...face, projected: face.points.map(project) }))
      .sort(
        (a, b) =>
          b.projected.reduce((s, p) => s + p.depth, 0) / b.points.length -
          a.projected.reduce((s, p) => s + p.depth, 0) / a.points.length,
      );
    for (const face of faces) {
      if (face.projected.some((p) => !p.visible)) continue;
      const normal = unit3(
          cross3(
            sub3(face.points[1], face.points[0]),
            sub3(face.points[2], face.points[0]),
          ),
        ),
        light =
          0.4 +
          0.6 * Math.abs(normal[0] * 0.35 + normal[1] * 0.8 + normal[2] * 0.48);
      ctx.beginPath();
      face.projected.forEach((p, i) =>
        i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y),
      );
      ctx.closePath();
      ctx.fillStyle = `rgb(${face.color.map((c) => Math.round(c * light)).join(",")})`;
      if (!wire) ctx.fill();
      ctx.strokeStyle =
        face.part === selected ? "#e3cf5870" : wire ? "#77dbe078" : "#0c172433";
      ctx.lineWidth = 0.55;
      ctx.stroke();
    }
    canvas.dataset.azimuth = current.az.toFixed(2);
    canvas.dataset.elevation = current.alt.toFixed(2);
    canvas.dataset.yaw = camera.yaw.toFixed(3);
    canvas.dataset.exploded = String(exploded);
    canvas.dataset.focus = String(focus);
  }
  function frame(now) {
    raf = 0;
    if (disposed || !visible || document.hidden) return;
    const ease =
      document.documentElement.dataset.motion === "off"
        ? 1
        : 1 - Math.exp(-Math.min(0.05, (now - last) / 1000) * 13);
    last = now;
    let delta = 0;
    for (const key of ["yaw", "pitch", "zoom"]) {
      camera[key] += (target[key] - camera[key]) * ease;
      delta += Math.abs(target[key] - camera[key]);
    }
    draw();
    if (delta > 0.0001) raf = requestAnimationFrame(frame);
  }
  function refresh() {
    if (ctx && !raf && !disposed && visible && !document.hidden) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }
  function resize() {
    if (!ctx) return;
    const r = canvas.getBoundingClientRect(),
      dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
    width = r.width;
    height = r.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }
  function unload() {
    $("#stellarium-host").replaceChildren();
    $("#stellarium-load").hidden = false;
    $("#stellarium-close").hidden = $("#stellarium-expand").hidden = true;
    $(".planetarium").classList.remove("expanded");
    $("#stellarium-expand").setAttribute("aria-pressed", "false");
    $("#stellarium-expand").textContent = "Expand sky";
    $("#stellarium-status").textContent =
      "Planetarium unloaded. Load it again whenever you want to observe.";
  }
  listen(container, "click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.scopePart) select(b.dataset.scopePart);
    if (b.id === "scope-reset") {
      Object.assign(target, { yaw: -0.7, pitch: 0.22, zoom: 1.3 });
      $("#scope-zoom").value = 130;
      refresh();
    }
    if (b.id === "scope-explode") {
      exploded = !exploded;
      b.setAttribute("aria-pressed", String(exploded));
      draw();
    }
    if (b.id === "scope-wire") {
      wire = !wire;
      b.setAttribute("aria-pressed", String(wire));
      draw();
    }
    if (b.id === "stellarium-load") {
      const frame = document.createElement("iframe");
      frame.title = "Stellarium Web interactive planetarium";
      frame.src = "https://stellarium-web.org/";
      frame.referrerPolicy = "no-referrer";
      frame.allow = "fullscreen";
      frame.setAttribute(
        "sandbox",
        "allow-scripts allow-same-origin allow-forms allow-popups",
      );
      $("#stellarium-host").replaceChildren(frame);
      b.hidden = true;
      $("#stellarium-close").hidden = $("#stellarium-expand").hidden = false;
      $("#stellarium-status").textContent =
        "Use Stellarium’s controls below to search the sky and change time or location. If the embed stays blank or your browser blocks it, use Open in its own tab.";
    }
    if (b.id === "stellarium-close") unload();
    if (b.id === "stellarium-expand") {
      const on = $(".planetarium").classList.toggle("expanded");
      b.setAttribute("aria-pressed", String(on));
      b.textContent = on ? "Compact sky" : "Expand sky";
    }
  });
  listen(container, "input", (e) => {
    if (e.target.id === "scope-focus") {
      focus = Number(e.target.value);
      draw();
    }
    if (e.target.id === "scope-zoom") {
      target.zoom = Number(e.target.value) / 100;
      refresh();
    }
  });
  if (ctx) {
    listen(canvas, "pointerdown", (e) => {
      if (e.button !== 0 || drag) return;
      drag = {
        id: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        sx: e.clientX,
        sy: e.clientY,
        moved: false,
      };
      canvas.setPointerCapture(e.pointerId);
      canvas.focus();
    });
    listen(canvas, "pointermove", (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      drag.moved ||= Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 5;
      target.yaw += (e.clientX - drag.x) * 0.008;
      target.pitch = clamp(
        target.pitch + (e.clientY - drag.y) * 0.006,
        -0.7,
        1,
      );
      drag.x = e.clientX;
      drag.y = e.clientY;
      refresh();
    });
    const up = (e) => {
      if (!drag || drag.id !== e.pointerId) return;
      const pick = !drag.moved && e.type === "pointerup";
      drag = null;
      if (canvas.hasPointerCapture?.(e.pointerId))
        canvas.releasePointerCapture(e.pointerId);
      if (pick) {
        const r = canvas.getBoundingClientRect();
        const face = faces
          .toReversed()
          .find((f) =>
            insidePolygon(e.clientX - r.left, e.clientY - r.top, f.projected),
          );
        if (face) select(face.part);
      }
    };
    for (const ev of ["pointerup", "pointercancel", "lostpointercapture"])
      listen(canvas, ev, up);
    listen(canvas, "keydown", (e) => {
      if (
        ![
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
          "+",
          "=",
          "-",
          "Home",
        ].includes(e.key)
      )
        return;
      e.preventDefault();
      e.stopPropagation();
      if (e.key === "Home") {
        $("#scope-reset").click();
        return;
      }
      if (e.key === "ArrowLeft") target.yaw -= 0.15;
      if (e.key === "ArrowRight") target.yaw += 0.15;
      if (e.key === "ArrowUp")
        target.pitch = clamp(target.pitch - 0.1, -0.7, 1);
      if (e.key === "ArrowDown")
        target.pitch = clamp(target.pitch + 0.1, -0.7, 1);
      if (["+", "=", "-"].includes(e.key)) {
        target.zoom = clamp(
          target.zoom + (e.key === "-" ? -0.1 : 0.1),
          0.8,
          1.9,
        );
        $("#scope-zoom").value = Math.round(target.zoom * 100);
      }
      refresh();
    });
  } else {
    canvas.hidden = true;
    $(".scope-fallback").hidden = false;
  }
  const observer =
    ctx && typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(resize)
      : null;
  observer?.observe(canvas);
  const intersection =
    ctx && typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver((entries) => {
          visible = entries[0].isIntersecting;
          cancelAnimationFrame(raf);
          raf = 0;
          if (visible) {
            resize();
            refresh();
          }
        })
      : null;
  intersection?.observe(canvas);
  const suspend = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    drag = null;
    refresh();
  };
  listen(document, "visibilitychange", suspend);
  listen(document, "appearancechange", suspend);
  select("optics");
  resize();
  return {
    update(value) {
      current = { ...value };
      draw();
    },
    activate(on) {
      visible = on;
      cancelAnimationFrame(raf);
      raf = 0;
      if (on) {
        resize();
        refresh();
      } else unload();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(raf);
      observer?.disconnect();
      intersection?.disconnect();
      if (drag && canvas.hasPointerCapture?.(drag.id))
        canvas.releasePointerCapture(drag.id);
      listeners.forEach(([el, name, fn]) => el.removeEventListener(name, fn));
      $("#stellarium-host").replaceChildren();
    },
  };
}
