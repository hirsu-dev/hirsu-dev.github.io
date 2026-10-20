export const wrap = (value, length) => ((value % length) + length) % length;
const seeded = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export function createEffects(state, count) {
  const $ = (s) => document.querySelector(s);
  const wheel = $("#wheel-ink"),
    worm = $("#worm-canvas"),
    graph = $("#session-graph");
  const pointer = { x: innerWidth * 0.7, y: innerHeight * 0.35 };
  const ghost = { x: innerWidth * 0.7, y: innerHeight * 0.7 };
  const tail = Array.from({ length: 48 }, () => ({ ...pointer }));
  let colors = {},
    position = state.target,
    frame = 0,
    previous = 0,
    lastEye = 0;
  let sizes = new WeakMap();
  function palette() {
    const s = getComputedStyle(document.documentElement);
    colors = Object.fromEntries(
      ["fg", "muted", "faint", "accent", "line", "bg"].map((k) => [
        k,
        s.getPropertyValue(`--${k}`).trim(),
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
  function wheelLayout() {
    const track = $("#wheel-track");
    if (matchMedia("(max-width:640px)").matches) return;
    const h = track.clientHeight,
      center = h / 2 - 47;
    for (const [i, button] of [...track.children].entries()) {
      let d = wrap(i - position + count / 2, count) - count / 2;
      const x = Math.pow(Math.abs(d), 1.65) * 12;
      const scale = Math.max(0.65, 1 - Math.abs(d) * 0.105);
      button.style.transform = `translate(${x.toFixed(2)}px,${(center + d * 97).toFixed(2)}px) rotate(${(-d * 0.125).toFixed(4)}rad) scale(${scale.toFixed(3)})`;
      button.style.opacity = Math.max(0.22, 1 - Math.abs(d) * 0.16).toFixed(3);
      button.style.visibility = Math.abs(d) > 4 ? "hidden" : "visible";
      button.style.zIndex = String(100 - Math.round(Math.abs(d) * 10));
    }
  }
  function drawWheel(t) {
    if (matchMedia("(max-width:640px)").matches) return;
    const { ctx, w, h } = fit(wheel),
      center = h / 2;
    const spine = (y) =>
      78 +
      Math.pow((y - center) / 100, 2) * 6 +
      Math.sin(y * 0.013 + t * 0.0003) * 2;
    ctx.strokeStyle = colors.fg;
    ctx.globalAlpha = 0.72;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let y = 8; y < h - 12; y += 3) {
      const x = spine(y);
      if (y === 8) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    for (let branch = 0; branch < 105; branch++) {
      const y = 14 + seeded(branch + 5) * (h - 40),
        length = 14 + seeded(branch + 18) * 55;
      const bustle = Math.sin(y * 0.035 + position * 0.5) * 0.5 + 0.5;
      if (bustle < 0.58 && branch % 4 !== 0) continue;
      const x = spine(y),
        direction = seeded(branch + 27) > 0.38 ? -1 : 1;
      const dx = direction * length * (0.6 + bustle),
        dy = (seeded(branch + 89) - 0.55) * 65;
      ctx.globalAlpha = 0.12 + seeded(branch + 71) * 0.55;
      ctx.lineWidth = seeded(branch + 34) > 0.8 ? 1 : 0.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(
        x + dx * 0.2,
        y + dy * 0.8,
        x + dx * 0.8,
        y + dy * 0.15,
        x + dx,
        y + dy,
      );
      ctx.stroke();
      const endX = x + dx,
        endY = y + dy;
      if (branch % 2 === 0) {
        ctx.beginPath();
        ctx.moveTo(x + dx * 0.6, y + dy * 0.6);
        ctx.lineTo(endX - 8, endY - 12);
        ctx.lineTo(endX + 4, endY - 19);
        ctx.stroke();
      }
      if (branch % 3 === 0) {
        ctx.fillStyle = colors.fg;
        ctx.fillRect(endX, endY, 1.2, 1.2);
      }
    }
    // Fine dendrite fans grow around the curved spine, independent of project data.
    for (let cluster = 0; cluster < 8; cluster++) {
      const baseY = 22 + (cluster / 7) * (h - 55);
      const baseX = spine(baseY);
      for (let tip = 0; tip < 25; tip++) {
        const seed = cluster * 41 + tip;
        const dx = -(12 + seeded(seed + 400) * 48);
        const dy = (seeded(seed + 600) - 0.6) * 75;
        ctx.lineWidth = 0.45;
        ctx.globalAlpha = 0.17 + seeded(seed + 700) * 0.6;
        ctx.beginPath();
        ctx.moveTo(baseX, baseY);
        ctx.bezierCurveTo(
          baseX + dx * 0.25,
          baseY + dy * 0.9,
          baseX + dx * 0.6,
          baseY + dy * 0.2,
          baseX + dx,
          baseY + dy,
        );
        ctx.stroke();
        ctx.fillStyle = colors.fg;
        ctx.fillRect(baseX + dx, baseY + dy, 0.9, 0.9);
      }
    }
    ctx.globalAlpha = 1;
    for (let i = 0; i < 8; i++) {
      const y = wrap(t * 0.025 + (i * h) / 8, h - 20) + 10;
      ctx.fillStyle = i % 3 === 0 ? colors.accent : colors.fg;
      ctx.fillRect(spine(y) - 1, y - 1, 2, 2);
    }
  }
  function blueprint(t) {
    const canvas = $("#blueprint-canvas");
    if (!canvas) return;
    const { ctx, w, h } = fit(canvas);
    if (!w) return;
    ctx.strokeStyle = colors.fg;
    ctx.lineWidth = 0.6;
    const rootX = w * 0.17,
      rootY = h * 0.85;
    for (let i = 0; i < 74; i++) {
      const s = seeded(i + 4),
        endX = w * (0.2 + s * 0.58),
        endY = h * (0.2 + seeded(i + 201) * 0.48);
      const sway = Math.sin(t * 0.0004 + i * 0.4) * 2;
      ctx.globalAlpha = 0.18 + seeded(i + 91) * 0.62;
      ctx.beginPath();
      ctx.moveTo(rootX, rootY);
      ctx.bezierCurveTo(
        rootX + w * 0.07,
        rootY - h * 0.2,
        rootX + w * 0.08,
        h * 0.22,
        rootX + w * 0.25 + sway,
        h * 0.4,
      );
      ctx.bezierCurveTo(
        rootX + w * 0.38,
        h * 0.1,
        rootX + w * 0.28,
        endY,
        endX,
        endY,
      );
      ctx.stroke();
      if (i % 3 === 0) {
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX + 7, endY - 6);
        ctx.lineTo(endX + 13, endY - 5);
        ctx.stroke();
        ctx.fillStyle = colors.fg;
        ctx.fillRect(endX + 12, endY - 6, 1.5, 1.5);
      }
    }
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = colors.muted;
    ctx.setLineDash([2, 4]);
    ctx.beginPath();
    ctx.moveTo(14, h * 0.56);
    ctx.lineTo(w - 12, h * 0.56);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = colors.muted;
    ctx.font = "8px Consolas,monospace";
    ctx.fillText("A", 11, h * 0.56 - 7);
    ctx.fillText("A", w - 18, h * 0.56 - 7);
    const bx = w * 0.68,
      by = h * 0.68,
      bw = w * 0.28,
      bh = h * 0.15;
    ctx.strokeStyle = colors.line;
    ctx.strokeRect(bx, by, bw, bh);
    ctx.globalAlpha = 0.8;
    ctx.strokeStyle = colors.fg;
    ctx.beginPath();
    for (let n = 0; n < 45; n++) {
      const x = bx + (n / 44) * bw,
        y = by + bh - (Math.sin(n * 0.5 + t * 0.0005) * 0.3 + 0.5) * bh * 0.75;
      if (n === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.fillStyle = colors.muted;
    ctx.fillText("signal / curiosity", bx, by - 5);
    ctx.globalAlpha = 1;
  }
  function eye(t) {
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
  function sessionGraph(t) {
    const { ctx, w, h } = fit(graph);
    ctx.fillStyle = colors.muted;
    for (let i = 0; i < 50; i++) {
      const height =
        2 + (Math.sin(i * 0.65 + t * 0.0008) * 0.5 + 0.5) * 8 + seeded(i) * 5;
      ctx.fillRect((i * w) / 50, h - height, 1, height);
    }
  }
  function paint(t) {
    wheelLayout();
    drawWheel(t);
    blueprint(t);
    companions(t);
    sessionGraph(t);
    inputSkeleton(t);
    if (t - lastEye > 110 || !state.motion) {
      eye(t);
      lastEye = t;
    }
  }
  function inputSkeleton(t) {
    const canvas = $("#input-skeleton");
    const { ctx, w, h } = fit(canvas);
    if (!w || matchMedia("(max-width:640px)").matches) return;
    const px = state.motion ? pointer.x / innerWidth : 0.5;
    const py = state.motion ? pointer.y / innerHeight : 0.5;
    ctx.strokeStyle = colors.muted;
    ctx.fillStyle = colors.fg;
    ctx.lineWidth = 0.6;
    const cx = w * 0.28,
      cy = 82;
    ctx.strokeRect(cx - 29, 22, 65, 96);
    for (let finger = 0; finger < 5; finger++) {
      const base = { x: cx + (finger - 2) * 6, y: cy + 5 };
      const tip = {
        x: cx + (finger - 2) * 11 + (px - 0.5) * 9,
        y:
          cy - 36 + Math.abs(finger - 2) * 7 + Math.sin(t * 0.001 + finger) * 2,
      };
      const joint = {
        x: base.x + (tip.x - base.x) * 0.6,
        y: (base.y + tip.y) * 0.5 + py * 7,
      };
      ctx.beginPath();
      ctx.moveTo(cx + 2, cy + 43);
      ctx.lineTo(base.x, base.y);
      ctx.lineTo(joint.x, joint.y);
      ctx.lineTo(tip.x, tip.y);
      ctx.stroke();
      for (const p of [base, joint, tip]) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.beginPath();
    ctx.moveTo(cx - 13, cy + 6);
    ctx.lineTo(cx + 14, cy + 6);
    ctx.stroke();
    const mx = w * 0.86,
      my = 75;
    ctx.strokeRect(mx - 28, 22, 57, 96);
    ctx.beginPath();
    ctx.ellipse(mx, my, 18, 34, 0, 0, Math.PI * 2);
    ctx.moveTo(mx - 18, my - 7);
    ctx.lineTo(mx + 18, my - 7);
    ctx.moveTo(mx, my - 34);
    ctx.lineTo(mx, my + 34);
    ctx.stroke();
    for (let i = 0; i < 5; i++) {
      const y = my - 25 + i * 12;
      ctx.beginPath();
      ctx.moveTo(mx - 16, y);
      ctx.lineTo(mx, y + 9);
      ctx.lineTo(mx + 16, y);
      ctx.stroke();
    }
    ctx.fillStyle = colors.fg;
    ctx.fillRect(mx + (px - 0.5) * 20 - 1, my + (py - 0.5) * 35 - 1, 2, 2);
    ctx.font = "8px Consolas,monospace";
    ctx.fillText(`['hand:u'] ${px.toFixed(4)}`, cx - 32, 15);
    ctx.fillText(`['mouse:u'] ${py.toFixed(4)}`, mx - 36, 15);
  }
  function tick(t) {
    frame = 0;
    if (document.hidden || !state.motion) return;
    if (t - previous > 30) {
      position += (state.target - position) * 0.18;
      if (Math.abs(position - state.target) < 0.001) position = state.target;
      paint(t);
      previous = t;
    }
    frame = requestAnimationFrame(tick);
  }
  function refresh() {
    palette();
    if (!state.motion) position = state.target;
    paint(state.motion ? performance.now() : 0);
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    if (state.motion && !document.hidden) frame = requestAnimationFrame(tick);
  }
  window.addEventListener(
    "pointermove",
    (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
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
