import { skyObjects } from "./sky-model.js?v=17";
import { project3, seededRandom } from "./space-math.js?v=21";

// Every technology membership is supported by projects.js features/tags.
// CircuitPython is deliberately labeled a family connection, not identical Python.
export const atlasHubs = Object.freeze([
  {
    id: "python",
    label: "PYTHON FAMILY",
    kind: "language",
    members: ["maintaineros", "civiclens", "hyprland-forge", "custom-keyboard"],
    why: "Python tooling / CircuitPython firmware",
    position: [-0.75, -0.25, 0.6],
  },
  {
    id: "javascript",
    label: "JAVASCRIPT",
    kind: "language",
    members: ["maintaineros", "civiclens"],
    why: "JavaScript web interfaces",
    position: [0.4, 0.15, -0.8],
  },
  {
    id: "fastapi",
    label: "FASTAPI",
    kind: "stack",
    members: ["maintaineros", "civiclens"],
    why: "FastAPI backends",
    position: [0.4, -0.75, 0.8],
  },
  {
    id: "sqlite",
    label: "SQLITE",
    kind: "stack",
    members: ["maintaineros", "civiclens"],
    why: "SQLite / SQLite FTS5",
    position: [0.75, -0.2, -0.3],
  },
  {
    id: "pihole",
    label: "PI-HOLE",
    kind: "stack",
    members: ["pi-homelab", "nexus-ai"],
    why: "Pi-hole service / interface",
    position: [1.2, 0.25, 0.7],
  },
  {
    id: "tailscale",
    label: "TAILSCALE",
    kind: "stack",
    members: ["pi-homelab", "nexus-ai"],
    why: "Tailscale remote access / interface",
    position: [1.8, -0.2, -0.65],
  },
  {
    id: "electronics",
    label: "PHYSICAL BUILDS",
    kind: "theme",
    members: ["robo-telescope", "custom-keyboard", "pi-homelab"],
    why: "Related hardware work (not a shared language)",
    position: [-0.7, 0.7, -0.3],
  },
]);
export const atlasPositions = [
  [-2.15, 1.45, 0.25],
  [2.0, 1.2, -0.65],
  [2.1, -1.3, 0.5],
  [-1.2, -0.55, 1.35],
  [0.05, 1.7, 0.1],
  [0.45, -1.7, -0.6],
  [-2.15, -1.4, -0.65],
];
export const atlasCamera = () => ({
  x: 0,
  y: 0,
  z: 0,
  yaw: 0,
  pitch: 0,
  zoom: 1.1,
});
export function atlasProject(p, camera, width, height) {
  return project3(
    p.position || [p.x, p.y, p.z],
    { ...camera, center: [camera.x, camera.y, camera.z], distance: 6 },
    width,
    height,
  );
}
export function atlasPoints() {
  return skyObjects.map((p, i) => ({
    id: p.id,
    x: atlasPositions[i][0],
    y: atlasPositions[i][1],
    z: atlasPositions[i][2],
    shape: p.shape.map(([x, y], j) => ({
      x: atlasPositions[i][0] + x * 4,
      y: atlasPositions[i][1] - y * 4,
      z: atlasPositions[i][2] + Math.sin(j * 1.7) * 0.22,
    })),
  }));
}
// A gentle reframe keeps connected projects visible instead of zooming into
// an isolated star and pushing its shared-language nodes beyond the viewport.
export const atlasFocus = (p) => ({
  x: p.x * 0.32,
  y: p.y * 0.32,
  z: p.z * 0.32,
  zoom: 1.1,
});
export function atlasDust(count = 900) {
  const rand = seededRandom(181);
  return Array.from({ length: count }, () => {
    const x = (rand() - 0.5) * 18;
    return {
      position: [
        x,
        -x * 0.45 + (rand() + rand() + rand() - 1.5) * 1.8,
        -4 - rand() * 4,
      ],
      size: 0.3 + rand() * 0.6,
      alpha: 0.08 + rand() * 0.25,
    };
  });
}
export function relatedHubs(id, filter = "all") {
  return atlasHubs.filter(
    (h) =>
      (filter === "all" || h.kind === filter) &&
      (!id || h.members.includes(id)),
  );
}
