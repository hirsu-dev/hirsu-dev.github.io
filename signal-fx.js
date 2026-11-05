const panelSelector =
  ".od-build,.latest-feature,.recent-secondary article,.project-card,.panel,.nr-window,.relic-file,.sb-console,.sb-patchbay,.project-terminal,.terminal-profile,.wb-entry,.od-stack-grid article,.network-inspector,.orbit-reader,.orbit-insight";
const actionSelector =
  "button,a.od-button,a.bracket,.od-text-link,.layout-action,.city-nav a,.terminal-tabs button";
const noop = () => {};

export function signalEnabled(data, hidden = false) {
  return (
    data.motion === "on" &&
    data.fx !== "clean" &&
    data.contrast !== "high" &&
    !hidden
  );
}

export function interferenceBand(time, lane, width, height, strength = 1) {
  const phase = time / 1000,
    seed = (lane * 73 + 19) % 127;
  return {
    x: (Math.sin(phase * 0.31 + seed) + 1) * 0.5 * width,
    y: (phase * (11 + (lane % 4)) + seed * 11) % height,
    width: Math.min(width, (28 + seed * 2.1) * strength),
    height: lane % 5 === 0 ? 3 : 1,
    alpha: (0.025 + (lane % 4) * 0.012) * strength,
    offset: Math.sin(phase * 2 + lane) * 12,
  };
}

export function mountSignalFX(doc = document, view = globalThis.window) {
  if (!doc.body?.append || !doc.createElement || !view?.requestAnimationFrame)
    return { decorate: noop, transition: noop, sync: noop, destroy: noop };
  const root = doc.documentElement,
    animations = new Set(),
    listeners = [];
  const canvas = doc.createElement("canvas");
  canvas.id = "signal-field";
  canvas.setAttribute("aria-hidden", "true");
  canvas.setAttribute("inert", "");
  const shutter = doc.createElement("div");
  shutter.id = "signal-shutter";
  shutter.setAttribute("aria-hidden", "true");
  shutter.setAttribute("inert", "");
  for (let i = 0; i < 8; i++) {
    const band = doc.createElement("i");
    band.style.setProperty("--lane", i);
    shutter.append(band);
  }
  doc.body.append(canvas, shutter);
  let ctx = null,
    tileCtx = null,
    image = null;
  const tile = doc.createElement("canvas");
  tile.width = 96;
  tile.height = 48;
  try {
    ctx = canvas.getContext("2d", { alpha: true });
    tileCtx = tile.getContext("2d", { alpha: true });
    if (tileCtx) image = tileCtx.createImageData(tile.width, tile.height);
  } catch {
    ctx = null;
  }
  let frame = 0,
    pointerFrame = 0,
    width = 1,
    height = 1,
    last = -Infinity,
    noiseAt = -Infinity,
    burstUntil = 0,
    seed = 15973,
    disposed = false,
    pointer = null,
    activePanel = null,
    observer = null,
    scope = null;
  const enabled = () => !disposed && signalEnabled(root.dataset, doc.hidden);
  const clock = () => view.performance.now();
  const listen = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    listeners.push(() => target.removeEventListener(type, handler, options));
  };
  function track(animation, done = noop) {
    animations.add(animation);
    Promise.resolve(animation.finished)
      .catch(noop)
      .finally(() => {
        animations.delete(animation);
        done();
      });
  }
  function resize() {
    width = Math.max(1, view.innerWidth || 1280);
    height = Math.max(1, view.innerHeight || 720);
    const ratio = Math.min(view.devicePixelRatio || 1, 1.25, 1440 / width);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx?.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  function stop() {
    view.cancelAnimationFrame(frame);
    frame = 0;
    view.cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    animations.forEach((a) => a.cancel());
    animations.clear();
    doc.querySelectorAll(".signal-ripple").forEach((ripple) => ripple.remove());
    ctx?.clearRect(0, 0, width, height);
    burstUntil = 0;
    activePanel?.style.removeProperty("--signal-x");
    activePanel?.style.removeProperty("--signal-y");
    activePanel = pointer = null;
  }
  function draw(now) {
    frame = 0;
    if (!enabled() || !ctx) return;
    frame = view.requestAnimationFrame(draw);
    if (now - last < 40) return;
    last = now;
    ctx.clearRect(0, 0, width, height);
    const crt = root.dataset.fx === "crt",
      burst = now < burstUntil;
    if (tileCtx && image && now - noiseAt > 100) {
      noiseAt = now;
      for (let i = 0; i < image.data.length; i += 4) {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        const value = seed >>> 24;
        image.data[i] = value;
        image.data[i + 1] = value;
        image.data[i + 2] = value;
        image.data[i + 3] = value > 160 ? 150 : 0;
      }
      tileCtx.putImageData(image, 0, 0);
    }
    if (tileCtx) {
      ctx.globalAlpha = crt ? 0.09 : 0.045;
      ctx.fillStyle = ctx.createPattern(tile, "repeat");
      ctx.save();
      ctx.translate((now * 0.03) % 96, (now * 0.05) % 48);
      ctx.fillRect(-96, -48, width + 192, height + 96);
      ctx.restore();
    }
    const storm = now % 12500 > 11200;
    const count = burst ? 22 : storm ? 12 : crt ? 9 : 5;
    for (let i = 0; i < count; i++) {
      const b = interferenceBand(now, i, width, height, burst ? 2.1 : 1);
      ctx.globalAlpha = Math.min(0.22, b.alpha * (storm ? 1.6 : 1));
      ctx.fillStyle = i % 3 === 0 ? "#ff4a70" : "#71f9ed";
      ctx.fillRect(b.x, b.y, b.width, b.height);
      ctx.globalAlpha *= 0.5;
      ctx.fillRect(b.x - b.offset, b.y + 3, b.width * 0.6, 1);
    }
    ctx.globalAlpha = crt ? 0.1 : 0.045;
    ctx.fillStyle = "#b4fff5";
    ctx.fillRect(0, (now * 0.035) % height, width, 2);
    for (let i = 0; i < 14; i++) {
      const y = (height + i * 83 - now * (0.009 + i * 0.0008)) % height;
      ctx.globalAlpha = 0.14 + Math.sin(now / 2400 + i) * 0.06;
      ctx.fillRect(
        i % 2 ? width - 10 - i * 3 : 8 + i * 3,
        y,
        i % 3 ? 2 : 12,
        1,
      );
    }
    ctx.globalAlpha = 1;
  }
  function sync() {
    root.dataset.signal = enabled() ? "active" : "idle";
    if (root.dataset.parallax === "off") {
      view.cancelAnimationFrame(pointerFrame);
      pointerFrame = 0;
      activePanel?.style.removeProperty("--signal-x");
      activePanel?.style.removeProperty("--signal-y");
      activePanel = pointer = null;
    }
    if (!enabled()) {
      stop();
      return;
    }
    resize();
    if (ctx && !frame) {
      last = -Infinity;
      frame = view.requestAnimationFrame(draw);
    }
  }
  function transition() {
    if (!enabled()) return;
    burstUntil = clock() + 780;
    for (const [i, band] of [...shutter.children].entries()) {
      if (!band.animate) continue;
      band.getAnimations?.().forEach((a) => a.cancel());
      const direction = i % 2 ? 1 : -1;
      track(
        band.animate(
          [
            {
              opacity: 0,
              transform: `translate3d(${direction * 112}%,0,0) skewX(-12deg)`,
            },
            {
              opacity: 0.6,
              transform: "translate3d(0,0,0) skewX(-3deg)",
              offset: 0.3,
            },
            {
              opacity: 0.12,
              transform: `translate3d(${-direction * 8}%,0,0) skewX(2deg)`,
              offset: 0.58,
            },
            {
              opacity: 0,
              transform: `translate3d(${-direction * 115}%,0,0) skewX(0)`,
            },
          ],
          {
            duration: 620,
            delay: i * 19,
            easing: "cubic-bezier(.2,.8,.2,1)",
            fill: "none",
          },
        ),
      );
    }
  }
  function decorate(container) {
    if (!container?.querySelectorAll) return;
    if (scope !== container) {
      observer?.disconnect();
      scope = container;
    }
    const panels = [...container.querySelectorAll(panelSelector)];
    if (!observer && view.IntersectionObserver)
      observer = new view.IntersectionObserver(
        (entries) => {
          for (const entry of entries)
            entry.target.classList.toggle("signal-live", entry.isIntersecting);
        },
        { rootMargin: "80px" },
      );
    observer?.disconnect();
    panels.forEach((panel, i) => {
      panel.classList.add("signal-panel");
      panel.style.setProperty("--signal-phase", `${-(i % 7) * 1.3}s`);
      if (!panel.querySelector(":scope > .signal-circuit")) {
        const circuit = doc.createElement("span");
        circuit.className = "signal-circuit";
        circuit.setAttribute("aria-hidden", "true");
        panel.append(circuit);
      }
      if (observer) observer.observe(panel);
      else panel.classList.add("signal-live");
    });
  }
  function ripple(target, x, y) {
    if (!enabled() || !target?.animate) return;
    target.classList.add("signal-action");
    const mark = doc.createElement("span"),
      rect = target.getBoundingClientRect();
    mark.className = "signal-ripple";
    mark.setAttribute("aria-hidden", "true");
    mark.style.left = `${x ?? rect.width / 2}px`;
    mark.style.top = `${y ?? rect.height / 2}px`;
    target.append(mark);
    track(
      mark.animate(
        [
          {
            opacity: 0.65,
            transform: "translate(-50%,-50%) scale(.05) rotate(45deg)",
          },
          {
            opacity: 0,
            transform: "translate(-50%,-50%) scale(2.5) rotate(45deg)",
          },
        ],
        { duration: 700, easing: "cubic-bezier(.16,1,.3,1)" },
      ),
      () => mark.remove(),
    );
  }
  listen(
    doc,
    "pointerdown",
    (event) => {
      if (event.button !== 0) return;
      const target = event.target.closest?.(actionSelector);
      if (!target) return;
      const rect = target.getBoundingClientRect();
      ripple(target, event.clientX - rect.left, event.clientY - rect.top);
    },
    { passive: true },
  );
  listen(doc, "keydown", (event) => {
    if (!event.repeat && ["Enter", " "].includes(event.key))
      ripple(event.target.closest?.(actionSelector));
  });
  listen(
    doc,
    "pointermove",
    (event) => {
      if (
        !enabled() ||
        root.dataset.parallax === "off" ||
        event.pointerType === "touch"
      )
        return;
      const panel = event.target.closest?.(".signal-panel");
      if (!panel) return;
      pointer = { panel, x: event.clientX, y: event.clientY };
      if (pointerFrame) return;
      pointerFrame = view.requestAnimationFrame(() => {
        pointerFrame = 0;
        if (
          !enabled() ||
          root.dataset.parallax === "off" ||
          !pointer?.panel.isConnected
        )
          return;
        if (activePanel !== pointer.panel) {
          activePanel?.style.removeProperty("--signal-x");
          activePanel?.style.removeProperty("--signal-y");
        }
        activePanel = pointer.panel;
        const rect = activePanel.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        activePanel.style.setProperty(
          "--signal-x",
          `${Math.max(0, Math.min(100, ((pointer.x - rect.left) / rect.width) * 100))}%`,
        );
        activePanel.style.setProperty(
          "--signal-y",
          `${Math.max(0, Math.min(100, ((pointer.y - rect.top) / rect.height) * 100))}%`,
        );
      });
    },
    { passive: true },
  );
  listen(doc, "appearancechange", sync);
  listen(doc, "visibilitychange", sync);
  listen(view, "resize", resize, { passive: true });
  resize();
  sync();
  return {
    decorate,
    transition,
    sync,
    destroy() {
      disposed = true;
      stop();
      observer?.disconnect();
      listeners.forEach((remove) => remove());
      canvas.remove();
      shutter.remove();
      delete root.dataset.signal;
      scope
        ?.querySelectorAll(".signal-circuit")
        .forEach((node) => node.remove());
      scope
        ?.querySelectorAll(".signal-panel")
        .forEach((node) =>
          node.classList.remove("signal-panel", "signal-live"),
        );
    },
  };
}
