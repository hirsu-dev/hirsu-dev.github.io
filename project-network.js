import { projects } from "./projects.js";

// A conceptual map of project relationships, not a map of devices or locations.
export const connections = [
  ["maintaineros", "civiclens"], // Python / FastAPI / SQLite
  ["civiclens", "hyprland-forge"], // Python tooling
  ["hyprland-forge", "custom-keyboard"], // personal computing
  ["custom-keyboard", "robo-telescope"], // physical electronics
  ["robo-telescope", "pi-homelab"], // hardware experiments
  ["pi-homelab", "nexus-ai"], // home-service interfaces
  ["nexus-ai", "maintaineros"], // software interfaces
];
export function spherePoints(count) {
  return Array.from({ length: count }, (_, i) => {
    const y = 1 - (2 * (i + 0.5)) / count,
      r = Math.sqrt(1 - y * y);
    const a = i * Math.PI * (3 - Math.sqrt(5));
    return [Math.cos(a) * r, y, Math.sin(a) * r];
  });
}
export function separateLabels(points, height, gap = 38) {
  const sorted = points
    .map((p, i) => ({ y: p.y, i }))
    .sort((a, b) => a.y - b.y);
  let previous = 35 - gap;
  for (const p of sorted) {
    p.y = Math.max(p.y, previous + gap);
    previous = p.y;
  }
  const overflow = Math.max(0, (sorted.at(-1)?.y || 0) - (height - 25));
  const ys = [];
  for (const p of sorted) ys[p.i] = p.y - overflow;
  return ys;
}
export function createProjectNetwork(container) {
  const canvas = container.querySelector("canvas"),
    ctx = canvas.getContext("2d");
  const labels = [...container.querySelectorAll(".network-node")];
  if (!ctx) return () => {};
  let width = 0,
    height = 0,
    angle = 0.4,
    tilt = -0.14,
    zoom = 1;
  let spinning = true,
    focused = false,
    quality = 14,
    drag = null,
    raf = 0,
    last = 0,
    disposed = false;
  const points = spherePoints(projects.length);
  const motion = () => document.documentElement.dataset.motion !== "off";
  const rotate = ([x, y, z]) => {
    const rx = x * Math.cos(angle) + z * Math.sin(angle);
    const rz = z * Math.cos(angle) - x * Math.sin(angle);
    return [
      rx,
      y * Math.cos(tilt) - rz * Math.sin(tilt),
      y * Math.sin(tilt) + rz * Math.cos(tilt),
    ];
  };
  function project(p) {
    const [x, y, z] = rotate(p),
      radius = Math.min(width * 0.29, height * 0.36) * zoom;
    return { x: width / 2 + x * radius, y: height / 2 + y * radius, z };
  }
  function linePath(points, color, alpha) {
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    points.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.stroke();
  }
  function draw() {
    if (disposed || !width) return;
    const style = getComputedStyle(container),
      ink = style.getPropertyValue("--accent").trim(),
      cyan = style.getPropertyValue("--cyan").trim();
    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 0.65;
    for (let lat = 1; lat < quality; lat++) {
      const a = (lat / quality) * Math.PI;
      linePath(
        Array.from({ length: 97 }, (_, i) => {
          const b = (i / 96) * Math.PI * 2;
          return project([
            Math.sin(a) * Math.cos(b),
            Math.cos(a),
            Math.sin(a) * Math.sin(b),
          ]);
        }),
        ink,
        0.3,
      );
    }
    for (let lon = 0; lon < quality; lon++) {
      const a = (lon / quality) * Math.PI * 2;
      linePath(
        Array.from({ length: 65 }, (_, i) => {
          const b = (i / 64) * Math.PI;
          return project([
            Math.sin(b) * Math.cos(a),
            Math.cos(b),
            Math.sin(b) * Math.sin(a),
          ]);
        }),
        ink,
        0.32,
      );
    }
    const positions = points.map(project);
    for (const [a, b] of connections) {
      const p = positions[projects.findIndex((x) => x.id === a)],
        q = positions[projects.findIndex((x) => x.id === b)];
      linePath([p, q], cyan, 0.4);
    }
    const labelYs =
      width < 450
        ? separateLabels(positions, height)
        : positions.map((p) => p.y);
    positions.forEach((p, i) => {
      const label = labels[i],
        half = label.offsetWidth / 2 + 8;
      const labelX = Math.max(half, Math.min(width - half, p.x)),
        labelY = Math.max(40, Math.min(height - 30, labelYs[i]));
      label.style.left = labelX + "px";
      label.style.top = labelY + "px";
      label.style.opacity = String(0.75 + (0.25 * (p.z + 1)) / 2);
      label.style.zIndex = String(Math.round((p.z + 1) * 10));
      if (width < 450) linePath([p, { x: labelX, y: labelY }], cyan, 0.45);
      ctx.fillStyle = ink;
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }
  function frame(time) {
    raf = 0;
    if (disposed) return;
    const animate =
      motion() && spinning && !focused && !drag && !document.hidden;
    if (animate) angle += Math.min((time - last) / 1000, 0.06) * 0.12;
    last = time;
    draw();
    if (animate) raf = requestAnimationFrame(frame);
  }
  function refresh() {
    if (!raf && !disposed) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }
  function resize() {
    const rect = canvas.getBoundingClientRect(),
      ratio = Math.min(devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    refresh();
  }
  const down = (e) => {
    if (e.button !== 0) return;
    drag = { x: e.clientX, y: e.clientY };
    canvas.setPointerCapture(e.pointerId);
    canvas.focus();
  };
  const move = (e) => {
    if (!drag) return;
    angle += (e.clientX - drag.x) * 0.007;
    tilt = Math.max(-1, Math.min(1, tilt + (e.clientY - drag.y) * 0.006));
    drag = { x: e.clientX, y: e.clientY };
    refresh();
  };
  const up = () => {
    drag = null;
    refresh();
  };
  const wheel = (e) => {
    e.preventDefault();
    zoom = Math.max(0.65, Math.min(1.3, zoom - e.deltaY * 0.0008));
    refresh();
  };
  const key = (e) => {
    if (
      ![
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "+",
        "-",
        "=",
      ].includes(e.key)
    )
      return;
    e.preventDefault();
    e.stopPropagation();
    if (e.key === "ArrowLeft") angle -= 0.12;
    if (e.key === "ArrowRight") angle += 0.12;
    if (e.key === "ArrowUp") tilt = Math.max(-1, tilt - 0.1);
    if (e.key === "ArrowDown") tilt = Math.min(1, tilt + 0.1);
    if (e.key === "+" || e.key === "=") zoom = Math.min(1.3, zoom + 0.1);
    if (e.key === "-") zoom = Math.max(0.65, zoom - 0.1);
    refresh();
  };
  const click = (e) => {
    const button = e.target.closest("button");
    if (button?.id === "spin-button") {
      spinning = !spinning;
      button.setAttribute("aria-pressed", String(spinning));
      button.textContent = spinning
        ? "[ Pause rotation ]"
        : "[ Resume rotation ]";
      refresh();
    }
    if (button?.dataset.quality) {
      quality = Number(button.dataset.quality);
      container
        .querySelectorAll("[data-quality]")
        .forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
      refresh();
    }
    if (button?.id === "network-reset") {
      angle = 0.4;
      tilt = -0.14;
      zoom = 1;
      refresh();
    }
  };
  const viewport = container.querySelector(".network-viewport");
  const focusIn = (e) => {
    focused = viewport.contains(e.target);
    refresh();
  };
  const focusOut = (e) => {
    focused = viewport.contains(e.relatedTarget);
    refresh();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);
  canvas.addEventListener("lostpointercapture", up);
  canvas.addEventListener("wheel", wheel, { passive: false });
  canvas.addEventListener("keydown", key);
  container.addEventListener("click", click);
  container.addEventListener("focusin", focusIn);
  container.addEventListener("focusout", focusOut);
  document.addEventListener("visibilitychange", refresh);
  document.addEventListener("appearancechange", refresh);
  resize();
  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    observer.disconnect();
    canvas.removeEventListener("pointerdown", down);
    canvas.removeEventListener("pointermove", move);
    canvas.removeEventListener("pointerup", up);
    canvas.removeEventListener("pointercancel", up);
    canvas.removeEventListener("lostpointercapture", up);
    canvas.removeEventListener("wheel", wheel);
    canvas.removeEventListener("keydown", key);
    container.removeEventListener("click", click);
    container.removeEventListener("focusin", focusIn);
    container.removeEventListener("focusout", focusOut);
    document.removeEventListener("visibilitychange", refresh);
    document.removeEventListener("appearancechange", refresh);
  };
}
