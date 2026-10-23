// Small, dependency-free perspective camera shared by the two original 3D demos.
export const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
export const add3 = (a, b) => a.map((v, i) => v + b[i]);
export const sub3 = (a, b) => a.map((v, i) => v - b[i]);
export const mul3 = (a, n) => a.map((v) => v * n);
export const cross3 = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const unit3 = (a) => mul3(a, 1 / (Math.hypot(...a) || 1));
export function rotate3([x, y, z], yaw = 0, pitch = 0) {
  const xx = x * Math.cos(yaw) + z * Math.sin(yaw);
  const zz = z * Math.cos(yaw) - x * Math.sin(yaw);
  return [
    xx,
    y * Math.cos(pitch) - zz * Math.sin(pitch),
    y * Math.sin(pitch) + zz * Math.cos(pitch),
  ];
}
export function project3(point, camera, width, height) {
  const p = rotate3(
    sub3(point, camera.center || [0, 0, 0]),
    camera.yaw,
    camera.pitch,
  );
  const depth = (camera.distance || 6) - p[2];
  const scale =
    (Math.min(width, height) * (camera.zoom || 1)) / Math.max(0.1, depth);
  return {
    x: width / 2 + p[0] * scale,
    y: height / 2 - p[1] * scale,
    depth,
    scale,
    visible: depth > 0.15,
  };
}
export function seededRandom(seed = 2077) {
  return () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
export function insidePolygon(x, y, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const a = points[i],
      b = points[j];
    if (
      a.y > y !== b.y > y &&
      x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x
    )
      inside = !inside;
  }
  return inside;
}
