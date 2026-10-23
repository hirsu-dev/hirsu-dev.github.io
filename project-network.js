import { projects } from "./projects.js?v=8";
import { networkLinks, networkInspector } from "./network-view.js?v=21";
import {
  atlasPoints,
  atlasProject,
  atlasCamera,
  atlasFocus,
  atlasHubs,
  atlasDust,
} from "./atlas-model.js?v=21";
import {
  skyObjects,
  starfield,
  nearestStar,
  meteorAt,
  clamp,
} from "./sky-model.js?v=17";

export const connections = networkLinks.map(([a, b]) => [a, b]);

// A perspective volume of projects and their shared tools, not a globe.
export function createProjectNetwork(container, { scrollZoom = true } = {}) {
  const canvas = container.querySelector("canvas"),
    ctx = canvas.getContext("2d");
  const labels = [...container.querySelectorAll(".network-node")];
  const stateLabel = container.querySelector(".network-state");
  const inspector = container.querySelector(".network-inspector");
  const listeners = [];
  container.dataset.scrollZoom = String(scrollZoom);
  container.dataset.renderer = ctx ? "night-sky-3d" : "unavailable";
  let width = 0,
    height = 0,
    phase = 0,
    reveal = 0,
    last = 0,
    raf = 0;
  let disposed = false,
    visible = true,
    paused = false,
    focused = false,
    drag = null;
  let selected = -1,
    hover = -1,
    mode = "atlas",
    quality = 14,
    filter = "all";
  let dust = atlasDust(560);
  let points = [],
    positions = [],
    stars = starfield(),
    glows = [];
  let ink = "#fcee0a",
    cyan = "#9ccee5",
    contrast = false;
  const camera = atlasCamera(),
    target = { ...camera };
  const motion = () => document.documentElement.dataset.motion !== "off";
  const ambience = () => motion() && !paused && !focused && !drag;
  const edges = networkLinks.map(([a, b]) => [
    skyObjects.findIndex((p) => p.id === a),
    skyObjects.findIndex((p) => p.id === b),
  ]);
  const listen = (node, name, fn, options) => {
    node.addEventListener(name, fn, options);
    listeners.push([node, name, fn]);
  };
  const project = (p) => atlasProject(p, camera, width, height);
  const line = (a, b, color, alpha, weight = 1, progress = 1) => {
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = weight;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(a.x + (b.x - a.x) * progress, a.y + (b.y - a.y) * progress);
    ctx.stroke();
  };
  const star = (x, y, size, color, alpha) => {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  };
  function draw() {
    if (!ctx || disposed || width <= 0 || height <= 0) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = 1;
    ctx.fillStyle = contrast ? "#02040a" : "#050914";
    ctx.fillRect(0, 0, width, height);
    if (!contrast && mode === "atlas") {
      for (const glow of glows) {
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);
      }
    }
    if (!contrast)
      for (const speck of dust) {
        const p = project(speck);
        if (p.visible) star(p.x, p.y, speck.size, "#9baec9", speck.alpha);
      }
    for (const s of stars) {
      const projected = project({
        position: [(s.x - 0.5) * 20, (0.5 - s.y) * 14, -3 - s.depth * 6],
      });
      if (!projected.visible) continue;
      const x = projected.x,
        y = projected.y;
      const brightness =
        s.brightness * (0.82 + 0.18 * Math.sin(phase * 0.55 + s.phase));
      star(x, y, s.size, s.depth > 0.75 ? "#e8d9c2" : "#b7d5ee", brightness);
      if (s.size > 1.65) {
        line(
          { x: x - 4, y },
          { x: x + 4, y },
          "#c2ddf0",
          brightness * 0.35,
          0.6,
        );
        line(
          { x, y: y - 4 },
          { x, y: y + 4 },
          "#c2ddf0",
          brightness * 0.35,
          0.6,
        );
      }
    }
    positions = points.map(project);
    const active = hover >= 0 ? hover : selected;
    if (mode === "atlas") {
      const activeId = skyObjects[active]?.id;
      for (const hub of atlasHubs.filter(
        (h) => filter === "all" || h.kind === filter,
      )) {
        const node = project(hub),
          linked = !!activeId && hub.members.includes(activeId);
        for (const id of hub.members) {
          const i = skyObjects.findIndex((p) => p.id === id);
          line(
            positions[i],
            node,
            hub.kind === "language" ? "#d7b982" : cyan,
            (linked ? 0.55 : activeId ? 0.06 : 0.22) * reveal,
            linked ? 1.2 : 0.65,
          );
        }
        star(
          node.x,
          node.y,
          linked ? 3.5 : 2.2,
          hub.kind === "language" ? "#edcb92" : "#9bd6db",
          reveal * (activeId && !linked ? 0.25 : 0.9),
        );
        if (!activeId || linked) {
          ctx.font = "10px monospace";
          ctx.textAlign = "center";
          ctx.fillStyle = linked ? ink : "#a7bace";
          ctx.globalAlpha = reveal;
          ctx.fillText(hub.label, node.x, node.y + 15);
        }
      }
      // Theme links remain secondary to the explicit technology hubs.
      for (const [a, b] of edges) {
        if (filter !== "all" && filter !== "theme") continue;
        const linked = active === a || active === b;
        line(
          positions[a],
          positions[b],
          linked ? ink : cyan,
          (linked ? 0.3 : 0.045) * reveal,
          linked ? 1.1 : 0.6,
          reveal,
        );
        if (linked && reveal === 1) {
          const t = (phase * 0.1 + a * 0.17) % 1;
          const p = {
            x: positions[a].x + (positions[b].x - positions[a].x) * t,
            y: positions[a].y + (positions[b].y - positions[a].y) * t,
          };
          star(p.x, p.y, 1.4, ink, 0.7);
        }
      }
    }
    points.forEach((object, i) => {
      const main = positions[i],
        shape = object.shape.map(project),
        activeStar = i === active;
      if (mode === "atlas") {
        for (let j = 1; j < shape.length; j++) {
          const progress = clamp((reveal - i * 0.035 - j * 0.025) * 2, 0, 1);
          line(
            shape[j - 1],
            shape[j],
            activeStar ? ink : "#aac9e2",
            activeStar ? 0.8 : 0.3,
            activeStar ? 1.25 : 0.8,
            progress,
          );
        }
        shape
          .slice(1)
          .forEach((p, j) =>
            star(
              p.x,
              p.y,
              1.15 + (j % 2) * 0.4,
              "#d6e5f4",
              reveal * (0.55 + 0.15 * Math.sin(phase * 0.6 + j + i)),
            ),
          );
      }
      const alpha =
          reveal * (activeStar ? 1 : Math.max(0.5, 1 - main.depth / 16)),
        size = activeStar ? 4 : Math.max(2.1, 17 / main.depth);
      star(main.x, main.y, size * 3.8, activeStar ? ink : cyan, alpha * 0.045);
      star(main.x, main.y, size * 2, activeStar ? ink : cyan, alpha * 0.12);
      star(main.x, main.y, size, "#eef5ff", alpha);
      line(
        { x: main.x - 10, y: main.y },
        { x: main.x + 10, y: main.y },
        activeStar ? ink : "#c9e6ff",
        alpha * 0.55,
        0.7,
      );
      line(
        { x: main.x, y: main.y - 10 },
        { x: main.x, y: main.y + 10 },
        activeStar ? ink : "#c9e6ff",
        alpha * 0.55,
        0.7,
      );
      if (i === selected) {
        const radius = 19 + Math.sin(phase) * 1.5;
        ctx.strokeStyle = ink;
        ctx.globalAlpha = 0.55;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(main.x, main.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (
        main.x > 6 &&
        main.x < width - 6 &&
        main.y > 16 &&
        main.y < height - 26
      ) {
        const fontSize =
          document.documentElement.dataset.textSize === "large" ? 12 : 10;
        ctx.font = (activeStar ? "600 " : "") + fontSize + "px monospace";
        ctx.fillStyle = activeStar ? ink : "#aebed0";
        ctx.globalAlpha = alpha;
        const text =
          String(i + 1).padStart(2, "0") + " / " + skyObjects[i].label;
        const alignRight =
          main.x + 14 + text.length * fontSize * 0.62 > width - 12;
        ctx.textAlign = alignRight ? "right" : "left";
        ctx.fillText(text, main.x + (alignRight ? -14 : 14), main.y - 13);
      }
    });
    const meteor = !contrast ? meteorAt(phase) : null;
    if (meteor) {
      for (let j = 0; j < 18; j++) {
        const x = meteor.x * width - j * 4,
          y = meteor.y * height - j * 2.5;
        line(
          { x, y },
          { x: x - 4, y: y - 2.5 },
          "#cbe9ff",
          meteor.opacity * (1 - j / 18),
          1.4,
        );
      }
    }
    ctx.globalAlpha = 1;
  }
  function frame(time) {
    raf = 0;
    if (disposed || !visible || document.hidden || !ctx || !width || !height)
      return;
    const dt = clamp((time - last) / 1000, 0.001, 0.05);
    last = time;
    if (ambience()) phase += dt;
    reveal = motion() ? Math.min(1, reveal + dt / 1.25) : 1;
    const ease = motion() ? 1 - Math.exp(-dt * (drag ? 18 : 7)) : 1;
    for (const key of ["x", "y", "z", "yaw", "pitch", "zoom"])
      camera[key] += (target[key] - camera[key]) * ease;
    const settling =
      Math.abs(target.x - camera.x) +
        Math.abs(target.y - camera.y) +
        Math.abs(target.zoom - camera.zoom) +
        Math.abs(target.z - camera.z) +
        Math.abs(target.yaw - camera.yaw) +
        Math.abs(target.pitch - camera.pitch) >
      0.0001;
    draw();
    if (ambience() || settling || reveal < 1)
      raf = requestAnimationFrame(frame);
  }
  function refresh() {
    if (stateLabel)
      stateLabel.textContent = !ctx
        ? "STATIC / PROJECT INDEX"
        : !motion()
          ? "STATIC / FX OFF"
          : paused
            ? "SKY / PAUSED"
            : focused
              ? "FOCUS / STILL"
              : "NIGHT SKY / ACTIVE";
    if (
      !raf &&
      !disposed &&
      ctx &&
      visible &&
      !document.hidden &&
      width &&
      height
    ) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }
  function select(index) {
    if (!skyObjects[index]) return;
    selected = index;
    hover = -1;
    if (points[index]) Object.assign(target, atlasFocus(points[index]));
    labels.forEach((label, i) => {
      label.setAttribute("aria-pressed", String(index === i));
      label.dataset.active = String(index === i);
    });
    if (inspector)
      inspector.innerHTML = networkInspector(
        projects.findIndex((p) => p.id === skyObjects[index].id),
      );
    refresh();
  }
  function resize() {
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect(),
      ratio = Math.min(globalThis.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    points = atlasPoints();
    glows =
      width && height
        ? [
            [0.2, 0.7, 0.65, "#314e6d24"],
            [0.6, 0.35, 0.7, "#46538920"],
            [0.85, 0.1, 0.55, "#68436b18"],
          ].map(([x, y, r, color]) => {
            const glow = ctx.createRadialGradient(
              x * width,
              y * height,
              0,
              x * width,
              y * height,
              Math.max(width, height) * r,
            );
            glow.addColorStop(0, color);
            glow.addColorStop(1, "#05091400");
            return glow;
          })
        : [];
    if (selected >= 0) Object.assign(target, atlasFocus(points[selected]));
    refresh();
  }
  const coordinate = (e) => {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - (rect.left || 0), y: e.clientY - (rect.top || 0) };
  };
  const down = (e) => {
    if (!ctx || e.button !== 0 || drag) return;
    drag = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
    };
    canvas.setPointerCapture(e.pointerId);
    canvas.focus();
  };
  const move = (e) => {
    if (!ctx) return;
    if (!drag) {
      const p = coordinate(e),
        next = nearestStar(positions, p.x, p.y);
      if (hover !== next) {
        hover = next;
        canvas.style.cursor = next >= 0 ? "pointer" : "grab";
        refresh();
      }
      return;
    }
    if (drag.id !== e.pointerId) return;
    target.yaw += (e.clientX - drag.x) * 0.006;
    target.pitch = clamp(
      target.pitch + (e.clientY - drag.y) * 0.005,
      -1.1,
      1.1,
    );
    drag.moved ||=
      Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > 6;
    drag.x = e.clientX;
    drag.y = e.clientY;
    refresh();
  };
  const up = (e) => {
    if (!drag || drag.id !== e.pointerId) return;
    const shouldSelect = !drag.moved && e.type === "pointerup",
      id = drag.id;
    drag = null;
    if (canvas.hasPointerCapture?.(id)) canvas.releasePointerCapture(id);
    if (shouldSelect) {
      const p = coordinate(e);
      select(nearestStar(positions, p.x, p.y));
    }
    refresh();
  };
  const wheel = (e) => {
    if (!ctx || !scrollZoom || document.activeElement !== canvas) return;
    e.preventDefault();
    target.zoom = clamp(target.zoom - e.deltaY * 0.001, 0.7, 2.1);
    refresh();
  };
  const key = (e) => {
    if (
      !ctx ||
      ![
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "+",
        "-",
        "=",
        "Home",
      ].includes(e.key)
    )
      return;
    e.preventDefault();
    e.stopPropagation();
    if (e.key === "ArrowLeft") target.yaw -= 0.12;
    if (e.key === "ArrowRight") target.yaw += 0.12;
    if (e.key === "ArrowUp")
      target.pitch = clamp(target.pitch - 0.1, -1.1, 1.1);
    if (e.key === "ArrowDown")
      target.pitch = clamp(target.pitch + 0.1, -1.1, 1.1);
    if (e.key === "+" || e.key === "=")
      target.zoom = clamp(target.zoom + 0.15, 0.7, 2.1);
    if (e.key === "-") target.zoom = clamp(target.zoom - 0.15, 0.7, 2.1);
    if (e.key === "Home") reset();
    refresh();
  };
  function reset() {
    selected = hover = -1;
    Object.assign(target, atlasCamera());
    labels.forEach((label) => {
      label.setAttribute("aria-pressed", "false");
      label.dataset.active = "false";
    });
    if (inspector) inspector.innerHTML = networkInspector();
  }
  const click = (e) => {
    const button = e.target.closest("button");
    if (!button) return;
    if (
      button.dataset.nodeIndex !== undefined &&
      /^\d+$/.test(button.dataset.nodeIndex)
    )
      select(Number(button.dataset.nodeIndex));
    if (["atlas", "ambient"].includes(button.dataset.networkMode)) {
      mode = button.dataset.networkMode;
      container
        .querySelectorAll("[data-network-mode]")
        .forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
    }
    if (["-1", "1"].includes(button.dataset.zoom))
      target.zoom = clamp(
        target.zoom + Number(button.dataset.zoom) * 0.15,
        0.7,
        2.1,
      );
    if (button.id === "sky-pause") {
      paused = !paused;
      button.setAttribute("aria-pressed", String(paused));
      button.textContent = paused ? "Resume sky" : "Pause sky";
    }
    if (["8", "14", "22"].includes(button.dataset.quality)) {
      quality = Number(button.dataset.quality);
      stars = starfield(quality * 30);
      dust = atlasDust(quality * 40);
      container
        .querySelectorAll("[data-quality]")
        .forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
    }
    if (button.id === "network-reset") reset();
    refresh();
  };
  const focusIn = (e) => {
    focused = e.target === canvas;
    refresh();
  };
  const focusOut = (e) => {
    focused = e.relatedTarget === canvas;
    refresh();
  };
  const leave = () => {
    hover = -1;
    canvas.style.cursor = "grab";
    refresh();
  };
  const appearance = () => {
    if (!ctx) {
      refresh();
      return;
    }
    const style = getComputedStyle(container);
    ink = style.getPropertyValue("--accent").trim() || "#fcee0a";
    cyan = style.getPropertyValue("--cyan").trim() || "#9ccee5";
    contrast = document.documentElement.dataset.contrast === "high";
    if (!motion()) {
      Object.assign(camera, target);
      reveal = 1;
    }
    resize();
    refresh();
  };
  const visibility = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    const pointerId = drag?.id;
    drag = null;
    if (pointerId !== undefined && canvas.hasPointerCapture?.(pointerId))
      canvas.releasePointerCapture(pointerId);
    refresh();
  };
  const observer =
    ctx && typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(resize)
      : null;
  const intersection =
    ctx && typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver((entries) => {
          visible = entries[0].isIntersecting;
          cancelAnimationFrame(raf);
          raf = 0;
          refresh();
        })
      : null;
  observer?.observe(canvas);
  intersection?.observe(canvas);
  if (!ctx) {
    canvas.tabIndex = -1;
    canvas.setAttribute("aria-disabled", "true");
    container.querySelectorAll("[data-sky-control]").forEach((button) => {
      button.disabled = true;
    });
  }
  for (const [name, fn] of [
    ["pointerdown", down],
    ["pointermove", move],
    ["pointerup", up],
    ["pointercancel", up],
    ["lostpointercapture", up],
    ["pointerleave", leave],
    ["keydown", key],
  ])
    listen(canvas, name, fn);
  listen(canvas, "wheel", wheel, { passive: !scrollZoom });
  listen(container, "click", click);
  listen(container, "change", (e) => {
    if (
      e.target.id === "atlas-filter" &&
      ["all", "language", "stack", "theme"].includes(e.target.value)
    ) {
      filter = e.target.value;
      refresh();
    }
  });
  listen(container, "focusin", focusIn);
  listen(container, "focusout", focusOut);
  listen(document, "visibilitychange", visibility);
  listen(document, "appearancechange", appearance);
  appearance();
  return () => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(raf);
    observer?.disconnect();
    intersection?.disconnect();
    if (drag && canvas.hasPointerCapture?.(drag.id))
      canvas.releasePointerCapture(drag.id);
    drag = null;
    listeners.forEach(([node, name, fn]) => node.removeEventListener(name, fn));
  };
}
