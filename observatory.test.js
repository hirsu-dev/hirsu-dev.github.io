import test from "node:test";
import assert from "node:assert/strict";
import { telescopeMesh, telescopeParts } from "./telescope-3d.js";
import { project3, rotate3, insidePolygon } from "./space-math.js";
import {
  atlasPoints,
  atlasProject,
  atlasCamera,
  atlasFocus,
  atlasHubs,
  relatedHubs,
  atlasDust,
} from "./atlas-model.js";
import { projects } from "./projects.js";

test("telescope is a solid 3D assembly; both axes, focus and explosion change its geometry", () => {
  const initial = telescopeMesh(),
    serialize = (mesh) => JSON.stringify(mesh);
  assert.ok(initial.length > 300);
  assert.equal(
    new Set(initial.map((f) => f.part)).size,
    Object.keys(telescopeParts).length,
  );
  for (const options of [
    { az: 90 },
    { alt: 80 },
    { focus: 100 },
    { exploded: true },
  ])
    assert.notEqual(serialize(initial), serialize(telescopeMesh(options)));
  for (const az of [0, 90, 180, 270, 359])
    for (const alt of [0, 45, 90])
      for (const face of telescopeMesh({ az, alt, exploded: true })) {
        assert.ok(face.points.length >= 3);
        assert.ok(face.points.flat().every(Number.isFinite));
      }
});
test("perspective changes apparent size with depth and orbit preserves length", () => {
  const near = project3([1, 0, 2], {}, 800, 600),
    far = project3([1, 0, -2], {}, 800, 600);
  assert.ok(near.scale > far.scale);
  assert.ok(
    Math.abs(Math.hypot(...rotate3([1, 2, 3], 0.7, 0.4)) - Math.sqrt(14)) <
      1e-9,
  );
  assert.equal(project3([0, 0, 7], {}, 800, 600).visible, false);
  assert.equal(
    insidePolygon(2, 2, [
      { x: 0, y: 0 },
      { x: 5, y: 0 },
      { x: 5, y: 5 },
      { x: 0, y: 5 },
    ]),
    true,
  );
  assert.equal(
    insidePolygon(6, 2, [
      { x: 0, y: 0 },
      { x: 5, y: 0 },
      { x: 5, y: 5 },
      { x: 0, y: 5 },
    ]),
    false,
  );
});
test("3D atlas has actual depth, finite projection at all orientations, and selected stars stay framed", () => {
  const points = atlasPoints();
  assert.equal(points.length, projects.length);
  assert.ok(new Set(points.map((p) => p.z)).size > 3);
  for (const yaw of [0, 0.5, 1.5, 3])
    for (const pitch of [-1, 0, 1])
      for (const point of points) {
        const camera = { ...atlasCamera(), ...atlasFocus(point), yaw, pitch };
        const p = atlasProject(point, camera, 350, 560);
        assert.ok(p.x > 0 && p.x < 350);
        assert.ok(p.y > 0 && p.y < 560);
        for (const other of points) {
          const q = atlasProject(other, camera, 350, 560);
          assert.ok([q.x, q.y, q.depth].every(Number.isFinite));
        }
      }
});
test("shared-technology hubs cover all real projects without inventing a telescope language", () => {
  const ids = new Set(projects.map((p) => p.id));
  for (const h of atlasHubs) {
    assert.ok(h.members.length >= 2);
    assert.ok(h.members.every((id) => ids.has(id)));
    assert.equal(h.position.length, 3);
  }
  for (const id of ids) assert.ok(relatedHubs(id).length);
  assert.equal(relatedHubs("robo-telescope", "language").length, 0);
  assert.match(
    relatedHubs("custom-keyboard", "language")[0].why,
    /CircuitPython/,
  );
  assert.ok(
    relatedHubs("maintaineros", "stack").some((h) => h.id === "fastapi"),
  );
  assert.deepEqual(atlasDust(5), atlasDust(5));
});
