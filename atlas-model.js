import { skyObjects } from "./sky-model.js?v=23";
import { project3, seededRandom } from "./space-math.js?v=21";

// Every technology membership is supported by projects.js features/tags.
// CircuitPython is deliberately labeled a family connection, not identical Python.
export const atlasHubs = Object.freeze([
  {
    id: "python",
    label: "PYTHON FAMILY",
    kind: "language",
    members: [
      "maintaineros",
      "civiclens",
      "hyprland-forge",
      "custom-keyboard",
      "observatory-planner",
      "homelab-health",
      "network-privacy-auditor",
    ],
    why: "Python tooling / CircuitPython firmware",
    position: [-0.75, -0.25, 0.6],
  },
  {
    id: "javascript",
    label: "JAVASCRIPT",
    kind: "language",
    members: [
      "maintaineros",
      "civiclens",
      "observatory-planner",
      "coordinate-motor-simulator",
      "homelab-health",
      "network-privacy-auditor",
      "accessible-star-map",
      "repair-parts-tracker",
      "offline-project-notebook",
    ],
    why: "JavaScript web interfaces",
    position: [0.4, 0.15, -0.8],
  },
  {
    id: "fastapi",
    label: "FASTAPI",
    kind: "stack",
    members: [
      "maintaineros",
      "civiclens",
      "observatory-planner",
      "homelab-health",
    ],
    why: "FastAPI backends",
    position: [0.4, -0.75, 0.8],
  },
  {
    id: "sqlite",
    label: "SQLITE",
    kind: "stack",
    members: [
      "maintaineros",
      "civiclens",
      "observatory-planner",
      "homelab-health",
      "network-privacy-auditor",
    ],
    why: "SQLite storage / FTS5 / read-only database adapter",
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
  {
    id: "indexeddb",
    label: "INDEXEDDB",
    kind: "stack",
    members: ["repair-parts-tracker", "offline-project-notebook"],
    why: "Transactional local browser records",
    position: [-1.5, -1.2, 0.4],
  },
  {
    id: "astronomy",
    label: "ASTRONOMY",
    kind: "theme",
    members: [
      "robo-telescope",
      "observatory-planner",
      "coordinate-motor-simulator",
      "accessible-star-map",
    ],
    why: "Related astronomy work, not a shared hardware connection",
    position: [-1.5, 0.3, -0.5],
  },
]);
export const atlasPositions = skyObjects.map((_, i) => {
  const y = 1 - (i * 2) / (skyObjects.length - 1),
    r = Math.sqrt(1 - y * y),
    angle = i * Math.PI * (3 - Math.sqrt(5));
  return [Math.cos(angle) * r * 2.5, y * 1.9, Math.sin(angle) * r * 0.85];
});
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
