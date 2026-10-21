// Original, optional HUD motion. Boot stages are presentation, not network work.
export const panelFrames = [
  { opacity: 0, transform: "translateX(22px)", clipPath: "inset(0 0 0 4%)" },
  { opacity: 1, transform: "translateX(0)", clipPath: "inset(0 0 0 0)" },
];
export const bootPhases = Object.freeze([
  { at: 0, name: "init" },
  { at: 480, name: "signal" },
  { at: 1050, name: "assemble" },
  { at: 1700, name: "ready" },
  { at: 2250, name: "release" },
]);
export const bootDuration = 2900;
export function bootPhaseAt(elapsed) {
  if (elapsed >= bootDuration) return "complete";
  return [...bootPhases].reverse().find((p) => elapsed >= p.at)?.name || "init";
}

export function createCityMotion() {
  const root = document.documentElement;
  const boot = document.querySelector("#boot-dialog");
  const animations = new Set(),
    bootTimers = new Set();
  let observer = null,
    scene = null,
    pointerFrame = 0,
    bootActive = false;
  let returnFocus = null;
  const enabled = () => root.dataset.motion === "on" && !document.hidden;
  function animate(element, frames = panelFrames, duration = 480, delay = 0) {
    if (!enabled() || !element?.animate || bootActive) return;
    const animation = element.animate(frames, {
      duration,
      delay,
      easing: "cubic-bezier(.2,.75,.25,1)",
      fill: "backwards",
    });
    animations.add(animation);
    animation.finished
      .catch(() => {})
      .finally(() => animations.delete(animation));
  }
  function decorate(container) {
    container
      .querySelectorAll(".hero-line,.city-section h2,.page-head h1")
      .forEach((element, i) => {
        if (element.classList.contains("signal-title")) return;
        // Decorative channels leave the real text readable, with no duplicate speech.
        const text = element.innerText;
        element.classList.add("signal-title");
        element.style.setProperty("--signal-delay", `${i * 1.37}s`);
        for (const channel of ["red", "cyan"]) {
          const echo = document.createElement("span");
          echo.className = `signal-echo signal-${channel}`;
          echo.setAttribute("aria-hidden", "true");
          echo.textContent = text;
          element.append(echo);
        }
      });
  }
  function observe(container) {
    observer?.disconnect();
    observer = null;
    decorate(container);
    const elements = [
      ...container.querySelectorAll(
        "[data-reveal],.detail-layout>.panel,.project-media,.stack-grid>.panel,.project-card",
      ),
    ];
    if (!enabled() || !("IntersectionObserver" in window)) {
      elements.forEach((e) => e.classList.add("revealed"));
      return;
    }
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
      },
      { threshold: 0.06, rootMargin: "0px 0px -12px 0px" },
    );
    elements.forEach((e, i) => {
      e.classList.add("motion-ready");
      e.style.setProperty("--reveal-delay", Math.min(i % 3, 2) * 90 + "ms");
      if (!e.classList.contains("revealed")) observer.observe(e);
    });
  }
  function enter(container, { transition = true } = {}) {
    scene = container;
    observe(container);
    if (!transition || bootActive) return;
    const hero = container.querySelector(".city-hero");
    if (hero) {
      animate(
        hero.querySelector(".city-keyart"),
        [
          { opacity: 0, clipPath: "inset(0 0 0 100%)" },
          { opacity: 1, clipPath: "inset(0 0 0 0)" },
        ],
        1000,
      );
      hero
        .querySelectorAll(
          ".hero-disciplines,.city-kicker,.hero-line,.city-intro,.city-actions,.hero-tools,.loadout-item,.hero-bottom",
        )
        .forEach((piece, i) =>
          animate(
            piece,
            [
              {
                opacity: 0,
                transform: "translateY(24px)",
                clipPath: "inset(0 0 100% 0)",
              },
              {
                opacity: 1,
                transform: "translateY(0)",
                clipPath: "inset(0 0 0 0)",
              },
            ],
            650,
            Math.min(i * 65, 550),
          ),
        );
    } else {
      animate(container);
      animate(
        document.querySelector("#route-signal"),
        [
          { opacity: 0, transform: "translateX(-45%) scaleX(.25)" },
          { opacity: 0.65, transform: "translateX(0) scaleX(1)", offset: 0.35 },
          { opacity: 0, transform: "translateX(65%) scaleX(.6)" },
        ],
        480,
      );
    }
  }
  function settleOpening() {
    if (!bootActive) return;
    bootActive = false;
    bootTimers.forEach(clearTimeout);
    bootTimers.clear();
    delete root.dataset.booting;
    delete boot.dataset.phase;
    if (scene) enter(scene);
    const fallback = document.querySelector("#main");
    const target =
      returnFocus?.isConnected &&
      returnFocus.getClientRects().length &&
      !returnFocus.closest("dialog:not([open])")
        ? returnFocus
        : fallback;
    target?.focus({ preventScroll: true });
  }
  function finishOpening() {
    if (boot?.open) boot.close();
    settleOpening();
  }
  function opening({ replay = false } = {}) {
    if (
      !enabled() ||
      !boot ||
      bootActive ||
      document.querySelector("dialog[open]")
    )
      return false;
    animations.forEach((a) => a.cancel());
    animations.clear();
    returnFocus = replay ? document.activeElement : null;
    bootActive = true;
    root.dataset.booting = "true";
    boot.dataset.phase = "init";
    try {
      boot.showModal();
    } catch {
      settleOpening();
      return false;
    }
    for (const phase of bootPhases.slice(1))
      bootTimers.add(
        setTimeout(() => {
          boot.dataset.phase = phase.name;
        }, phase.at),
      );
    // Asset/network loading never holds the page hostage.
    bootTimers.add(setTimeout(finishOpening, bootDuration));
    return true;
  }
  // Ignore a queued close event from a previous, already-replayed sequence.
  boot?.addEventListener("close", () => {
    if (!boot.open) settleOpening();
  });
  boot?.addEventListener("cancel", (event) => {
    event.preventDefault();
    finishOpening();
  });
  document
    .querySelector("#skip-intro")
    ?.addEventListener("click", finishOpening);
  function resetPointer() {
    cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    scene?.querySelectorAll(".city-hero").forEach((e) => {
      e.style.removeProperty("--hero-x");
      e.style.removeProperty("--hero-y");
    });
  }
  document.addEventListener(
    "pointermove",
    (e) => {
      if (
        !enabled() ||
        bootActive ||
        root.dataset.view !== "neon" ||
        !matchMedia("(pointer:fine)").matches
      )
        return;
      const hero = e.target.closest?.(".city-hero");
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 10;
      if (!pointerFrame)
        pointerFrame = requestAnimationFrame(() => {
          pointerFrame = 0;
          hero.style.setProperty("--hero-x", x + "px");
          hero.style.setProperty("--hero-y", y + "px");
        });
    },
    { passive: true },
  );
  document.addEventListener(
    "pointerout",
    (e) => {
      if (
        e.target.closest?.(".city-hero") &&
        !e.relatedTarget?.closest?.(".city-hero")
      )
        resetPointer();
    },
    { passive: true },
  );
  document.addEventListener("appearancechange", () => {
    if (!enabled()) {
      animations.forEach((a) => a.cancel());
      animations.clear();
      finishOpening();
      resetPointer();
    }
    if (scene) observe(scene);
  });
  document.addEventListener("visibilitychange", () => {
    root.dataset.visibility = document.hidden ? "hidden" : "visible";
    if (document.hidden) {
      animations.forEach((a) => a.cancel());
      animations.clear();
      finishOpening();
      resetPointer();
    } else if (scene) observe(scene);
  });
  return { enter, observe, animate, opening };
}
