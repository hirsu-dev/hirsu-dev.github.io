// Original motion, inspired by sliding HUD panels and clipped menu reveals.
// No rapid flashing, no autoplay audio, and no interaction-blocking intro.
export const panelFrames = [
  { opacity: 0, transform: "translateX(22px)", clipPath: "inset(0 0 0 4%)" },
  { opacity: 1, transform: "translateX(0)", clipPath: "inset(0 0 0 0)" },
];
export function createCityMotion() {
  let observer = null,
    scene = null,
    pointerFrame = 0,
    pointerX = 0,
    pointerY = 0;
  const animations = new Set();
  const enabled = () =>
    document.documentElement.dataset.motion === "on" &&
    document.documentElement.dataset.view === "neon";
  function animate(element, frames = panelFrames, duration = 480) {
    if (!enabled() || !element?.animate) return;
    const animation = element.animate(frames, {
      duration,
      easing: "cubic-bezier(.2,.75,.25,1)",
      fill: "none",
    });
    animations.add(animation);
    animation.finished
      .catch(() => {})
      .finally(() => animations.delete(animation));
  }
  function observe(container) {
    observer?.disconnect();
    observer = null;
    const elements = [
      ...container.querySelectorAll(
        "[data-reveal],.detail-layout>.panel,.project-media,.stack-grid>.panel",
      ),
    ];
    if (!enabled()) {
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
      { threshold: 0.08, rootMargin: "0px 0px -15px 0px" },
    );
    elements.forEach((e, i) => {
      e.classList.add("motion-ready");
      e.style.setProperty("--reveal-delay", Math.min(i % 3, 2) * 70 + "ms");
      if (!e.classList.contains("revealed")) observer.observe(e);
    });
  }
  function enter(container, { transition = true } = {}) {
    scene = container;
    observe(container);
    if (transition) {
      const heroCopy = container.querySelector(".city-hero-content");
      if (heroCopy)
        animate(
          heroCopy,
          [
            { opacity: 0, transform: "translateY(22px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          650,
        );
      else animate(container);
    }
  }
  const pointer = (e) => {
    if (!enabled() || !matchMedia("(pointer:fine)").matches) return;
    const hero = e.target.closest(".city-hero");
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    pointerX = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    pointerY = ((e.clientY - rect.top) / rect.height - 0.5) * 8;
    if (!pointerFrame)
      pointerFrame = requestAnimationFrame(() => {
        pointerFrame = 0;
        hero.style.setProperty("--hero-x", pointerX + "px");
        hero.style.setProperty("--hero-y", pointerY + "px");
      });
  };
  const appearance = () => {
    if (!enabled()) {
      animations.forEach((a) => a.cancel());
      animations.clear();
      cancelAnimationFrame(pointerFrame);
      pointerFrame = 0;
      document.querySelectorAll(".city-hero").forEach((e) => {
        e.style.removeProperty("--hero-x");
        e.style.removeProperty("--hero-y");
      });
    }
    if (scene) observe(scene);
  };
  document.addEventListener("pointermove", pointer, { passive: true });
  document.addEventListener("appearancechange", appearance);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      animations.forEach((a) => a.finish());
      cancelAnimationFrame(pointerFrame);
      pointerFrame = 0;
    }
  });
  return { enter, observe, animate };
}
