import { newProjects } from "./new-projects.js?v=24";
export const skyObjects = Object.freeze(
  [
    {
      id: "robo-telescope",
      label: "SCOPE",
      wide: [0.16, 0.27],
      tall: [0.26, 0.16],
      shape: [
        [0, 0],
        [-0.07, -0.035],
        [-0.105, 0.025],
        [-0.04, 0.065],
        [0, 0],
        [0.055, 0.025],
        [0.085, -0.04],
      ],
    },
    {
      id: "nexus-ai",
      label: "NEXUS",
      wide: [0.79, 0.23],
      tall: [0.72, 0.28],
      shape: [
        [0, 0],
        [-0.055, -0.065],
        [-0.09, 0.015],
        [0, 0],
        [0.07, 0.055],
        [0.105, -0.025],
      ],
    },
    {
      id: "pi-homelab",
      label: "HOME LAB",
      wide: [0.82, 0.66],
      tall: [0.72, 0.71],
      shape: [
        [0, 0],
        [-0.06, -0.035],
        [-0.09, 0.025],
        [-0.035, 0.06],
        [0, 0],
        [0.05, -0.06],
      ],
    },
    {
      id: "custom-keyboard",
      label: "MACRO PAD",
      wide: [0.36, 0.55],
      tall: [0.3, 0.48],
      shape: [
        [0, 0],
        [-0.06, -0.045],
        [-0.09, 0.02],
        [-0.035, 0.065],
        [0.025, 0.035],
        [0, 0],
        [0.07, -0.025],
      ],
    },
    {
      id: "maintaineros",
      label: "MAINTAINER",
      wide: [0.49, 0.21],
      tall: [0.67, 0.1],
      shape: [
        [0, 0],
        [-0.07, -0.035],
        [-0.1, 0.025],
        [-0.025, 0.06],
        [0.035, 0.015],
        [0.07, -0.07],
      ],
    },
    {
      id: "civiclens",
      label: "CIVICLENS",
      wide: [0.6, 0.79],
      tall: [0.28, 0.86],
      shape: [
        [0, 0],
        [-0.065, -0.035],
        [-0.1, 0.03],
        [-0.045, 0.065],
        [0, 0],
        [0.06, -0.04],
        [0.085, 0.035],
      ],
    },
    {
      id: "hyprland-forge",
      label: "FORGE",
      wide: [0.16, 0.79],
      tall: [0.25, 0.68],
      shape: [
        [0, 0],
        [-0.05, -0.065],
        [-0.085, 0.01],
        [0, 0],
        [0.055, 0.065],
        [0.095, 0.015],
      ],
    },
  ]
    .concat(
      newProjects.map((p, i) => ({
        id: p.id,
        label: p.title.split(" / ")[0].toUpperCase(),
        wide: [0.15 + (i % 4) * 0.23, 0.15 + Math.floor(i / 4) * 0.65],
        tall: [0.2 + (i % 2) * 0.6, 0.1 + Math.floor(i / 2) * 0.24],
        shape: [
          [0, 0],
          [-0.045, -0.035],
          [-0.075, 0.02],
          [-0.02, 0.06],
          [0.04, 0.02],
          [0.065, -0.04],
          [0, 0],
        ],
      })),
    )
    .map(Object.freeze),
);
export const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
export function skyPoints(width, height) {
  const portrait = width / height < 1.15;
  return skyObjects.map((object) => {
    const [x, y] = portrait ? object.tall : object.wide;
    const unit = Math.min(width, height);
    return {
      id: object.id,
      x,
      y,
      shape: object.shape.map(([dx, dy]) => ({
        x: x + (dx * unit) / Math.max(1, width),
        y: y + (dy * unit) / Math.max(1, height),
      })),
    };
  });
}
export function projectStar(point, camera, width, height) {
  return {
    x: width / 2 + (point.x - 0.5 + camera.x) * width * camera.zoom,
    y: height / 2 + (point.y - 0.5 + camera.y) * height * camera.zoom,
  };
}
export function focusStar(point) {
  return { x: 0.5 - point.x, y: 0.5 - point.y, zoom: 1.5 };
}
export function starfield(count = 420, seed = 2077) {
  let state = seed >>> 0;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  return Array.from({ length: clamp(Math.floor(count), 0, 900) }, (_, i) => {
    const x = random();
    const band = i % 3 === 0;
    const y = band
      ? clamp(0.95 - x * 0.85 + (random() + random() - 1) * 0.26, 0.02, 0.98)
      : random();
    return {
      x,
      y,
      size: 0.35 + random() * (i % 19 === 0 ? 1.65 : 0.7),
      depth: 0.2 + random() * 0.8,
      phase: random() * Math.PI * 2,
      brightness: 0.25 + random() * 0.55,
    };
  });
}
export function nearestStar(positions, x, y, radius = 24) {
  let nearest = -1,
    distance = radius;
  positions.forEach((point, index) => {
    const d = Math.hypot(point.x - x, point.y - y);
    if (d < distance) {
      distance = d;
      nearest = index;
    }
  });
  return nearest;
}
export function meteorAt(time) {
  const cycle = Math.floor(time / 12),
    local = time % 12;
  if (local < 7 || local > 8.25) return null;
  const progress = (local - 7) / 1.25;
  return {
    x: 0.18 + (cycle % 3) * 0.18 + progress * 0.3,
    y: 0.12 + progress * 0.24,
    opacity: Math.sin(progress * Math.PI) * 0.65,
  };
}
