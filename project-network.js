import { projects } from "./projects.js?v=8";

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
export function dockLabels(sizes, width, height) {
  return sizes.map((size, i) => {
    const left = i % 2 === 0,
      half = Math.min(size, width - 20) / 2;
    const row = width < 440 ? i : Math.floor(i / 2);
    const count =
      width < 440
        ? sizes.length
        : left
          ? Math.ceil(sizes.length / 2)
          : Math.floor(sizes.length / 2);
    return {
      x: left ? half + 10 : width - half - 10,
      y: 115 + (row * (height - 195)) / Math.max(1, count - 1),
      edge: left ? 20 + half * 2 : width - 20 - half * 2,
      left,
    };
  });
}
// Spherical interpolation keeps links on the globe instead of cutting through it.
export function arcPoints(a, b, steps = 48, lift = 0.13) {
  const dot = Math.max(
    -1,
    Math.min(
      1,
      a.reduce((sum, n, i) => sum + n * b[i], 0),
    ),
  );
  const theta = Math.acos(dot),
    sine = Math.sin(theta);
  const axis = Math.abs(a[0]) < 0.8 ? [1, 0, 0] : [0, 1, 0];
  const cross = [
    a[1] * axis[2] - a[2] * axis[1],
    a[2] * axis[0] - a[0] * axis[2],
    a[0] * axis[1] - a[1] * axis[0],
  ];
  const length = Math.hypot(...cross);
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps,
      radius = 1 + Math.sin(t * Math.PI) * lift;
    if (theta < 1e-6) return a.map((n) => n * radius);
    if (Math.abs(sine) < 1e-6)
      return a.map(
        (n, j) =>
          (n * Math.cos(Math.PI * t) +
            (cross[j] / length) * Math.sin(Math.PI * t)) *
          radius,
      );
    return a.map(
      (n, j) =>
        ((n * Math.sin((1 - t) * theta) + b[j] * Math.sin(t * theta)) / sine) *
        radius,
    );
  });
}

function gridLines(detail) {
  const lines = [];
  for (let lat = 1; lat < detail; lat++) {
    const a = (lat / detail) * Math.PI;
    lines.push(
      Array.from({ length: 73 }, (_, i) => {
        const b = (i / 72) * Math.PI * 2;
        return [
          Math.sin(a) * Math.cos(b),
          Math.cos(a),
          Math.sin(a) * Math.sin(b),
        ];
      }),
    );
  }
  for (let lon = 0; lon < detail; lon++) {
    const a = (lon / detail) * Math.PI * 2;
    lines.push(
      Array.from({ length: 49 }, (_, i) => {
        const b = (i / 48) * Math.PI;
        return [
          Math.sin(b) * Math.cos(a),
          Math.cos(b),
          Math.sin(b) * Math.sin(a),
        ];
      }),
    );
  }
  return lines;
}

export function createProjectNetwork(container) {
  const canvas = container.querySelector("canvas"),
    ctx = canvas.getContext("2d");
  const labels = [...container.querySelectorAll(".network-node")];
  if (!ctx) {
    container.dataset.renderer = "unavailable";
    const status = container.querySelector(".network-state");
    if (status) status.textContent = "PROJECT LINKS / STATIC";
    return () => {};
  }
  let width = 0,
    height = 0,
    angle = 0.4,
    tilt = -0.14,
    zoom = 1;
  let targetAngle = angle,
    targetTilt = tilt,
    targetZoom = zoom;
  let spinning = true,
    focused = false,
    quality = 14,
    drag = null;
  let raf = 0,
    last = 0,
    phase = 0,
    disposed = false,
    visible = true,
    active = -1;
  let ink = "#fcee0a",
    cyan = "#79edf0",
    grid = gridLines(quality),
    dots = spherePoints(700),
    labelDocks = [];
  let cosAngle = 1,
    sinAngle = 0,
    cosTilt = 1,
    sinTilt = 0;
  const points = spherePoints(projects.length);
  const arcs = connections.map(([a, b]) => {
    const from = projects.findIndex((p) => p.id === a),
      to = projects.findIndex((p) => p.id === b);
    return { from, to, points: arcPoints(points[from], points[to]) };
  });
  const orbits = [0.42, -0.65].map((inclination, ring) =>
    Array.from({ length: 121 }, (_, i) => {
      const a = (i / 120) * Math.PI * 2,
        r = 1.18 + ring * 0.12;
      return [
        Math.cos(a) * r,
        Math.sin(a) * Math.sin(inclination) * r,
        Math.sin(a) * Math.cos(inclination) * r,
      ];
    }),
  );
  const stars = Array.from({ length: 70 }, (_, i) => ({
    x: ((i * 73 + 17) % 997) / 997,
    y: ((i * 137 + 31) % 991) / 991,
    size: i % 9 === 0 ? 1.4 : 0.6,
  }));
  const stateLabel = container.querySelector(".network-state");
  const motion = () => document.documentElement.dataset.motion !== "off";
  const radius = () => Math.min(width * 0.29, height * 0.32) * zoom;
  const rotate = ([x, y, z]) => {
    const rx = x * cosAngle + z * sinAngle;
    const rz = z * cosAngle - x * sinAngle;
    return [rx, y * cosTilt - rz * sinTilt, y * sinTilt + rz * cosTilt];
  };
  function project(p) {
    const [x, y, z] = rotate(p),
      r = radius();
    return { x: width / 2 + x * r, y: height / 2 + y * r, z };
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
    cosAngle = Math.cos(angle);
    sinAngle = Math.sin(angle);
    cosTilt = Math.cos(tilt);
    sinTilt = Math.sin(tilt);
    ctx.clearRect(0, 0, width, height);
    const r = radius(),
      cx = width / 2,
      cy = height / 2;
    const glow = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 1.45);
    glow.addColorStop(0, "#67dfed0c");
    glow.addColorStop(0.65, "#67dfed10");
    glow.addColorStop(1, "#67dfed00");
    ctx.globalAlpha = 1;
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = cyan;
    ctx.globalAlpha = 0.28;
    for (const star of stars)
      ctx.fillRect(star.x * width, star.y * height, star.size, star.size);
    ctx.lineWidth = 0.65;
    const projectedGrid = grid.map((line) => line.map(project));
    // Batch front/back segments: a clear, translucent shell rather than a flat wire ball.
    for (const front of [false, true]) {
      ctx.strokeStyle = cyan;
      ctx.globalAlpha = front ? 0.26 : 0.065;
      ctx.beginPath();
      for (const line of projectedGrid)
        for (let i = 1; i < line.length; i++) {
          const a = line[i - 1],
            b = line[i];
          if (a.z + b.z >= 0 !== front) continue;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
        }
      ctx.stroke();
    }
    ctx.fillStyle = cyan;
    for (const point of dots) {
      const p = project(point);
      if (p.z < 0) continue;
      ctx.globalAlpha = 0.12 + p.z * 0.38;
      ctx.fillRect(p.x, p.y, 1.2, 1.2);
    }
    orbits.forEach((orbit, i) => {
      ctx.setLineDash(i ? [2, 9] : []);
      linePath(orbit.map(project), i ? ink : cyan, i ? 0.36 : 0.22);
    });
    ctx.setLineDash([]);
    // Static instrument ticks remain crisp when motion is disabled.
    ctx.strokeStyle = cyan;
    ctx.globalAlpha = 0.28;
    ctx.beginPath();
    for (let i = 0; i < 80; i++) {
      const a = (i / 80) * Math.PI * 2,
        inner = r * 1.38,
        outer = inner + (i % 5 ? 3 : 8);
      ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
      ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer);
    }
    ctx.stroke();
    const positions = points.map(project);
    arcs.forEach((arc, i) => {
      const path = arc.points.map(project),
        selected = active === arc.from || active === arc.to;
      ctx.lineWidth = selected ? 1.6 : 0.85;
      linePath(
        path,
        selected ? ink : cyan,
        active < 0 ? 0.5 : selected ? 0.9 : 0.16,
      );
      const packet =
        path[
          Math.floor(((phase * 0.12 + i / arcs.length) % 1) * (path.length - 1))
        ];
      ctx.fillStyle = ink;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(packet.x, packet.y, selected ? 2.8 : 1.8, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.lineWidth = 0.8;
    positions.forEach((p, i) => {
      const label = labels[i],
        { x: labelX, y: labelY, left, edge } = labelDocks[i];
      // Fixed docking rails prevent moving targets, label collisions and keyboard jitter.
      label.dataset.active = String(active === i);
      linePath(
        [p, { x: edge + (left ? 12 : -12), y: labelY }, { x: edge, y: labelY }],
        active === i ? ink : cyan,
        active === i ? 0.85 : 0.23,
      );
      ctx.fillStyle = ink;
      ctx.globalAlpha = 0.65 + (p.z + 1) * 0.175;
      ctx.beginPath();
      ctx.arc(p.x, p.y, active === i ? 4.5 : 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = ink;
      ctx.globalAlpha = active === i ? 0.65 : 0.25;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 8 + Math.sin(phase * 1.5 + i) * 1.5, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
  }
  function frame(time) {
    raf = 0;
    if (disposed || !visible || document.hidden) return;
    const dt = Math.min(Math.max((time - last) / 1000, 0.001), 0.05);
    const animate = motion() && spinning && !focused && !drag;
    if (animate) {
      targetAngle += dt * 0.11;
      phase += dt;
    }
    const ease = motion() ? 1 - Math.exp(-dt * (drag ? 22 : 12)) : 1;
    angle += (targetAngle - angle) * ease;
    tilt += (targetTilt - tilt) * ease;
    zoom += (targetZoom - zoom) * ease;
    last = time;
    draw();
    const settling =
      Math.abs(targetAngle - angle) +
        Math.abs(targetTilt - tilt) +
        Math.abs(targetZoom - zoom) >
      0.0005;
    if (animate || settling) raf = requestAnimationFrame(frame);
  }
  function refresh() {
    if (stateLabel)
      stateLabel.textContent = !motion()
        ? "STATIC / FX OFF"
        : focused
          ? "FOCUS LOCK"
          : spinning
            ? "ORBIT / ACTIVE"
            : "ORBIT / PAUSED";
    if (!raf && !disposed && visible && !document.hidden) {
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
    labelDocks = dockLabels(
      labels.map((label) => label.offsetWidth),
      width,
      height,
    );
    labels.forEach((label, i) => {
      label.style.left = labelDocks[i].x + "px";
      label.style.top = labelDocks[i].y + "px";
    });
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
    targetAngle += (e.clientX - drag.x) * 0.007;
    targetTilt = Math.max(
      -1,
      Math.min(1, targetTilt + (e.clientY - drag.y) * 0.006),
    );
    drag = { x: e.clientX, y: e.clientY };
    refresh();
  };
  const up = () => {
    drag = null;
    refresh();
  };
  const wheel = (e) => {
    e.preventDefault();
    targetZoom = Math.max(0.65, Math.min(1.3, targetZoom - e.deltaY * 0.0008));
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
    if (e.key === "ArrowLeft") targetAngle -= 0.12;
    if (e.key === "ArrowRight") targetAngle += 0.12;
    if (e.key === "ArrowUp") targetTilt = Math.max(-1, targetTilt - 0.1);
    if (e.key === "ArrowDown") targetTilt = Math.min(1, targetTilt + 0.1);
    if (e.key === "+" || e.key === "=")
      targetZoom = Math.min(1.3, targetZoom + 0.1);
    if (e.key === "-") targetZoom = Math.max(0.65, targetZoom - 0.1);
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
      grid = gridLines(quality);
      dots = spherePoints(quality * 50);
      container
        .querySelectorAll("[data-quality]")
        .forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
      refresh();
    }
    if (button?.id === "network-reset") {
      targetAngle = angle + ((0.4 - angle) % (Math.PI * 2));
      targetTilt = -0.14;
      targetZoom = 1;
      refresh();
    }
  };
  const viewport = container.querySelector(".network-viewport");
  const focusIn = (e) => {
    focused = viewport.contains(e.target);
    active = labels.indexOf(e.target.closest(".network-node"));
    if (focused) {
      targetAngle = angle;
      targetTilt = tilt;
    }
    refresh();
  };
  const focusOut = (e) => {
    focused = viewport.contains(e.relatedTarget);
    active = labels.indexOf(e.relatedTarget?.closest?.(".network-node"));
    refresh();
  };
  const hover = (e) => {
    active = labels.indexOf(e.target.closest?.(".network-node"));
    refresh();
  };
  const leave = () => {
    active = labels.indexOf(document.activeElement);
    refresh();
  };
  const appearance = () => {
    const style = getComputedStyle(container);
    ink = style.getPropertyValue("--accent").trim();
    cyan = style.getPropertyValue("--cyan").trim();
    if (!motion()) {
      angle = targetAngle;
      tilt = targetTilt;
      zoom = targetZoom;
    }
    resize();
  };
  const visibility = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    refresh();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  const intersection =
    typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver((entries) => {
          visible = entries[0].isIntersecting;
          cancelAnimationFrame(raf);
          raf = 0;
          refresh();
        });
  intersection?.observe(canvas);
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
  container.addEventListener("pointerover", hover);
  container.addEventListener("pointerleave", leave);
  document.addEventListener("visibilitychange", visibility);
  document.addEventListener("appearancechange", appearance);
  appearance();
  return () => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(raf);
    observer.disconnect();
    intersection?.disconnect();
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
    container.removeEventListener("pointerover", hover);
    container.removeEventListener("pointerleave", leave);
    document.removeEventListener("visibilitychange", visibility);
    document.removeEventListener("appearancechange", appearance);
  };
}
