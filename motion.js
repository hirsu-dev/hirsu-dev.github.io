export const wrap = (value, length) => ((value % length) + length) % length;
const seeded = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export function createEffects(state) {
  const $ = (s) => document.querySelector(s),
    worm = $("#worm-canvas"),
    graph = $("#session-graph");
  const pointer = { x: innerWidth * 0.7, y: innerHeight * 0.35 },
    ghost = { x: innerWidth * 0.7, y: innerHeight * 0.7 };
  const tail = Array.from({ length: 48 }, () => ({ ...pointer }));
  let colors = {},
    frame = 0,
    previous = 0,
    lastEye = -200,
    sizes = new WeakMap(),
    hadWorm = false;
  function palette() {
    const style = getComputedStyle(document.documentElement);
    colors = Object.fromEntries(
      ["bg", "fg", "muted", "faint", "accent", "secondary", "line"].map((k) => [
        k,
        style.getPropertyValue("--" + k).trim(),
      ]),
    );
  }
  function fit(canvas) {
    const rect = canvas.getBoundingClientRect(),
      dpr = Math.min(devicePixelRatio || 1, 2);
    let size = sizes.get(canvas);
    if (
      !size ||
      size.w !== rect.width ||
      size.h !== rect.height ||
      size.dpr !== dpr
    ) {
      size = { w: rect.width, h: rect.height, dpr };
      sizes.set(canvas, size);
      canvas.width = Math.round(size.w * dpr);
      canvas.height = Math.round(size.h * dpr);
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.w, size.h);
    return { ctx, ...size };
  }
  function city(t) {
    const { ctx, w, h } = fit($("#city-canvas"));
    if (!w) return;
    if (state.view === "blacksite") {
      radar(ctx, w, h, t);
      return;
    }
    const small = w < 650,
      origin = {
        x: w * (small ? 0.74 : 0.76) + (pointer.x / innerWidth - 0.5) * 8,
        y: h * (small ? 0.83 : 0.83),
      };
    const scale = small ? 0.65 : 1;
    const project = (x, z, y = 0) => ({
      x: origin.x + (x - z) * 0.78 * scale,
      y: origin.y + (x + z) * 0.31 * scale - y * scale,
    });
    ctx.lineWidth = 0.7;
    ctx.strokeStyle = colors.accent;
    ctx.globalAlpha = 0.13;
    for (let i = -6; i <= 6; i++) {
      const a = project(i * 50, -300),
        b = project(i * 50, 300),
        c = project(-300, i * 50),
        d = project(300, i * 50);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(d.x, d.y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    const glow = ctx.createRadialGradient(
      origin.x,
      origin.y - 120 * scale,
      10,
      origin.x,
      origin.y - 120 * scale,
      250 * scale,
    );
    glow.addColorStop(0, "#ff4bb814");
    glow.addColorStop(1, "#ff4bb800");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    const buildings = [
      [-140, -135, 45, 115],
      [-80, -165, 42, 170],
      [5, -145, 52, 110],
      [80, -100, 40, 190],
      [145, -55, 45, 105],
      [-150, -35, 40, 80],
      [-60, -45, 54, 245],
      [15, 15, 52, 300],
      [95, 35, 40, 125],
      [-125, 65, 44, 95],
      [-25, 100, 49, 140],
      [110, 120, 48, 75],
    ];
    buildings
      .sort((a, b) => a[0] + a[1] - (b[0] + b[1]))
      .forEach(([x, z, size, height], index) => {
        const base = [
            project(x, z),
            project(x + size, z),
            project(x + size, z + size),
            project(x, z + size),
          ],
          top = [
            project(x, z, height),
            project(x + size, z, height),
            project(x + size, z + size, height),
            project(x, z + size, height),
          ];
        const color = index % 3 === 0 ? colors.secondary : colors.accent;
        const polygon = (points, fill, alpha = 1) => {
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          points.forEach((p, i) =>
            i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y),
          );
          ctx.closePath();
          ctx.fillStyle = fill;
          ctx.fill();
          ctx.strokeStyle = color;
          ctx.stroke();
        };
        polygon([base[1], base[2], top[2], top[1]], "#0b1b2f");
        polygon([base[2], base[3], top[3], top[2]], "#081423");
        polygon(top, "#10263a", 0.9);
        for (let level = 1; level < height / 15; level++) {
          const y = level * 15,
            p1 = project(x + size, z, y),
            p2 = project(x + size, z + size, y),
            p3 = project(x, z + size, y);
          ctx.globalAlpha = 0.23;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.stroke();
        }
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 4;
        for (let floor = 1; floor < height / 17 - 1; floor++)
          for (let col = 1; col < 5; col++) {
            if (seeded(floor * 17 + col + index * 29) < 0.42) continue;
            const p = project(x + size * 0.2 * col, z + size, floor * 17);
            ctx.globalAlpha = 0.25 + seeded(floor + col * 8) * 0.55;
            ctx.fillRect(p.x - 1, p.y - 1, 2, 3);
          }
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 0.8;
        if (height > 200) {
          const p = project(x + size / 2, z + size / 2, height),
            q = project(x + size / 2, z + size / 2, height + 35);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
          ctx.fillStyle = colors.secondary;
          ctx.fillRect(q.x - 2, q.y - 2, 4, 4);
        }
      });
    for (let i = 0; i < 7; i++) {
      const u = wrap(t * 0.025 + i * 81, 600) - 300,
        a = project(u, i * 55 - 160),
        b = project(u - 16, i * 55 - 160);
      ctx.globalAlpha = 0.8;
      ctx.strokeStyle = i % 2 ? colors.secondary : colors.accent;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.lineWidth = 0.7;
  }
  function radar(ctx, w, h, t) {
    const cx = w * 0.79,
      cy = h * 0.54,
      r = Math.min(h * 0.38, w * 0.19);
    ctx.strokeStyle = colors.line;
    ctx.lineWidth = 0.7;
    for (let x = w * 0.55; x < w; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 12);
      ctx.lineTo(x, h - 12);
      ctx.stroke();
    }
    for (let y = 12; y < h; y += 24) {
      ctx.beginPath();
      ctx.moveTo(w * 0.55, y);
      ctx.lineTo(w - 12, y);
      ctx.stroke();
    }
    ctx.strokeStyle = colors.accent;
    ctx.globalAlpha = 0.4;
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, (r * i) / 3, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(cx - r - 12, cy);
    ctx.lineTo(cx + r + 12, cy);
    ctx.moveTo(cx, cy - r - 12);
    ctx.lineTo(cx, cy + r + 12);
    ctx.stroke();
    const angle = t * 0.0004;
    ctx.fillStyle = colors.accent + "12";
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, angle - 0.55, angle);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
    ctx.stroke();
    for (let i = 0; i < 7; i++) {
      const a = i * 2.399,
        rr = r * (0.3 + seeded(i + 9) * 0.6),
        x = cx + Math.cos(a) * rr,
        y = cy + Math.sin(a) * rr;
      ctx.globalAlpha = 0.4 + Math.sin(t * 0.001 + i) * 0.2;
      ctx.strokeRect(x - 3, y - 3, 6, 6);
      ctx.fillStyle = colors.fg;
      ctx.font = "7px Consolas,monospace";
      ctx.fillText("0" + (i + 1), x + 7, y + 3);
    }
    ctx.globalAlpha = 1;
  }
  function blueprint(t) {
    const canvas = $("#blueprint-canvas");
    if (!canvas) return;
    const { ctx, w, h } = fit(canvas);
    if (!w) return;
    const angle = t * 0.00025,
      tilt = 0.35,
      scale = Math.min(w * 0.22, h * 0.28);
    const project = (x, y, z) => {
      const xx = x * Math.cos(angle) - z * Math.sin(angle),
        zz = x * Math.sin(angle) + z * Math.cos(angle);
      return {
        x: w * 0.5 + xx * scale,
        y: h * 0.52 + (y * Math.cos(tilt) - zz * Math.sin(tilt)) * scale,
      };
    };
    const vertices = [
      [-1, -1, -1],
      [1, -1, -1],
      [1, 1, -1],
      [-1, 1, -1],
      [-1, -1, 1],
      [1, -1, 1],
      [1, 1, 1],
      [-1, 1, 1],
    ];
    const points = vertices.map((v) => project(...v));
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 0.7;
    ctx.globalAlpha = 0.6;
    for (const [a, b] of [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 4],
      [0, 4],
      [1, 5],
      [2, 6],
      [3, 7],
    ]) {
      ctx.beginPath();
      ctx.moveTo(points[a].x, points[a].y);
      ctx.lineTo(points[b].x, points[b].y);
      ctx.stroke();
    }
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = i === 1 ? colors.secondary : colors.faint;
      ctx.beginPath();
      ctx.ellipse(
        w * 0.5,
        h * 0.52,
        scale * (1.5 + i * 0.1),
        scale * 0.5,
        angle + i,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    points.forEach((p, i) => {
      ctx.fillStyle = i % 2 ? colors.accent : colors.fg;
      ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
    });
    ctx.fillStyle = colors.muted;
    ctx.font = "8px Consolas,monospace";
    ctx.fillText("H / EXPERIMENTAL CORE", 14, h - 16);
    ctx.fillText("X  /  Y  /  Z", w - 90, h - 16);
  }
  function eye(t) {
    if (!$("#ascii-eye").parentElement.clientWidth) return;
    const pre = $("#ascii-eye"),
      px = state.motion ? pointer.x / innerWidth : 0.5,
      py = state.motion ? pointer.y / innerHeight : 0.5;
    const blink = state.motion && t % 6200 > 5990;
    const open = state.eye && !blink;
    const cols = 58,
      rows = 23,
      alphabet = " .,:;i1tfLCG08@";
    let text = "";
    for (let row = 0; row < rows; row++) {
      let line = "";
      for (let col = 0; col < cols; col++) {
        const x = (col - (cols - 1) / 2) / (cols * 0.46),
          y = (row - (rows - 1) / 2) / (rows * 0.44);
        const lid = Math.pow(Math.abs(x), 1.65) + Math.abs(y) * 0.95;
        let char = " ";
        if (!open) {
          if (Math.abs(y - Math.sin(x * 3) * 0.04) < 0.06 && Math.abs(x) < 0.9)
            char = "─";
        } else if (lid < 1) {
          const ix = x - (px - 0.5) * 0.5,
            iy = y - (py - 0.5) * 0.4,
            r = Math.hypot(ix * 1.8, iy);
          const angle = Math.atan2(iy, ix),
            noise = seeded(col + row * 67);
          if (r < 0.24) char = "█";
          else if (r < 0.57)
            char =
              alphabet[
                5 +
                  Math.floor(
                    (Math.sin(angle * 22 + r * 30 + t * 0.0002) * 0.5 + 0.5) *
                      7,
                  )
              ];
          else char = alphabet[Math.floor(noise * 5)];
          if (lid > 0.88) char = noise > 0.4 ? "─" : ".";
          if (Math.hypot(ix + 0.08, iy + 0.16) < 0.09) char = " ";
        }
        line += char;
      }
      text += line + "\n";
    }
    pre.textContent = text;
    $("#eye-x").textContent = px.toFixed(6);
    $("#eye-y").textContent = py.toFixed(6);
    $("#eye-state").textContent = !state.eye
      ? "closed"
      : blink
        ? "blink"
        : "None";
  }

  function companions(t) {
    const pre = $("#ascii-ghost");
    pre.classList.toggle("awake", state.ghost);
    ghost.x += (pointer.x + 35 - ghost.x) * 0.07;
    ghost.y += (pointer.y + 30 - ghost.y) * 0.07;
    const gx = state.motion ? ghost.x : innerWidth * 0.8,
      gy = state.motion ? ghost.y : innerHeight * 0.7;
    pre.style.transform = `translate(${Math.min(innerWidth - 50, Math.max(5, gx))}px,${Math.min(innerHeight - 75, Math.max(5, gy + Math.sin(t * 0.002) * 8))}px)`;
    const { ctx } = fit(worm);
    if (!state.worm) return;
    if (state.motion) {
      tail[0].x += (pointer.x - tail[0].x) * 0.18;
      tail[0].y += (pointer.y - tail[0].y) * 0.18;
      for (let i = 1; i < tail.length; i++) {
        tail[i].x += (tail[i - 1].x - tail[i].x) * 0.35;
        tail[i].y += (tail[i - 1].y - tail[i].y) * 0.35;
      }
    }
    ctx.strokeStyle = colors.fg;
    ctx.lineWidth = 1;
    ctx.beginPath();
    tail.forEach((p, i) => {
      const x = p.x + Math.sin(t * 0.003 - i * 0.4) * i * 0.17,
        y = p.y + Math.cos(t * 0.002 - i * 0.3) * i * 0.2;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    });
    ctx.stroke();
    tail.forEach((p, i) => {
      if (i % 4) return;
      ctx.fillStyle = i % 8 === 0 ? colors.accent : colors.fg;
      ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
    });
  }

  function signal(t) {
    const { ctx, w, h } = fit(graph);
    ctx.fillStyle = colors.accent;
    for (let i = 0; i < 50; i++) {
      const v =
        2 + (Math.sin(i * 0.65 + t * 0.0008) * 0.5 + 0.5) * 8 + seeded(i) * 5;
      ctx.fillRect((i * w) / 50, h - v, 1, v);
    }
  }
  function paint(t) {
    city(t);
    blueprint(t);
    signal(t);
    if (state.worm || state.ghost || hadWorm) {
      companions(t);
      hadWorm = state.worm;
    } else $("#ascii-ghost").classList.remove("awake");
    if (t - lastEye > 110 || !state.motion) {
      eye(t);
      lastEye = t;
    }
  }
  function tick(t) {
    frame = 0;
    if (document.hidden || !state.motion) return;
    if (t - previous > 32) {
      paint(t);
      previous = t;
    }
    frame = requestAnimationFrame(tick);
  }
  function refresh() {
    palette();
    paint(state.motion ? performance.now() : 0);
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    if (state.motion && !document.hidden) frame = requestAnimationFrame(tick);
  }
  window.addEventListener(
    "pointermove",
    (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    },
    { passive: true },
  );
  window.addEventListener(
    "resize",
    () => {
      sizes = new WeakMap();
      refresh();
    },
    { passive: true },
  );
  document.addEventListener("visibilitychange", refresh);
  return { refresh };
}
