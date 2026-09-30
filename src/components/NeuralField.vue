<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from "vue";
const props = defineProps({ motion: { type: Boolean, default: true }, light: Boolean });
const canvas = ref(null);
const host = ref(null);
let ctx,
  width = 1,
  height = 1,
  raf = 0,
  resizeObserver,
  intersectionObserver,
  media;
let visible = true,
  reduced = false,
  last = 0,
  elapsed = 0,
  lastTick = 0;
let pointer = { x: -5000, y: -5000 },
  smoothed = { x: 0, y: 0 },
  burstAt = -100;
const nodes = [];
const edges = [];
const columns = 28,
  rows = 14;
for (let row = 0; row < rows; row++) {
  for (let col = 0; col < columns; col++) {
    const u = col / (columns - 1),
      v = (row / (rows - 1) - 0.5) * 2;
    const wobble = Math.sin(col * 31.9 + row * 17.1);
    nodes.push({
      x: (u - 0.5) * 1100,
      y: Math.sin(u * Math.PI * 2.1 + v * 0.65) * 145 + v * 175,
      z: Math.cos(u * Math.PI * 2 + v * 1.7) * 175 + Math.sin(v * 2.2) * 110,
      seed: (wobble + 1) * 0.5,
      major: (row * 11 + col * 7) % 37 === 0,
    });
    const i = row * columns + col;
    if (col > 0) edges.push([i - 1, i]);
    if (row > 0) edges.push([i - columns, i]);
    if (row > 0 && col > 0 && (col + row) % 3 !== 0) edges.push([i - columns - 1, i]);
  }
}
function draw(time = 0) {
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);
  const t = time * 0.00012;
  const mobile = width < 650;
  const scale = Math.min(width / (mobile ? 850 : 1120), height / 700);
  const cx = width * 0.55,
    cy = height * 0.49;
  const yaw = -0.18 + Math.sin(t * 0.5) * 0.1 + smoothed.x * 0.09;
  const roll = -0.23 + smoothed.y * 0.04;
  const ca = Math.cos(yaw),
    sa = Math.sin(yaw),
    cr = Math.cos(roll),
    sr = Math.sin(roll);
  const points = nodes.map((n) => {
    const breathing = Math.sin(t * 2 + n.x * 0.006 + n.seed) * 7;
    const x = n.x * ca + n.z * sa;
    const z = -n.x * sa + n.z * ca;
    const y = n.y + breathing;
    const depth = 1000 / (1000 + z);
    let px = cx + (x * cr - y * sr) * scale * depth;
    let py = cy + (x * sr + y * cr) * scale * depth;
    const dx = px - pointer.x,
      dy = py - pointer.y,
      d = Math.hypot(dx, dy);
    const influence = Math.max(0, 1 - d / (mobile ? 100 : 190));
    if (d > 0 && props.motion && !reduced) {
      px += (dx / d) * influence * 24;
      py += (dy / d) * influence * 24;
    }
    const wave = Math.max(
      0,
      1 - Math.abs(Math.hypot(px - cx, py - cy) - (time - burstAt) * 0.28) / 85,
    );
    return { x: px, y: py, depth, glow: Math.min(1, influence + wave), n };
  });
  // Depth changes line opacity, retaining the volume without a solid surface.
  for (let e = 0; e < edges.length; e++) {
    const [ia, ib] = edges[e],
      a = points[ia],
      b = points[ib];
    const g = Math.max(a.glow, b.glow);
    const opacity = Math.min(0.85, 0.16 + (a.depth - 0.7) * 0.25 + g * 0.4);
    ctx.strokeStyle = props.light
      ? `rgba(56,108,67,${opacity})`
      : `rgba(${g > 0.2 ? "177,232,135" : "105,156,129"},${opacity})`;
    ctx.lineWidth = g > 0.2 ? 1.3 : 0.85;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    if (e % 19 === 0) {
      const p = (time * 0.00017 + e * 0.137) % 1;
      const px = a.x + (b.x - a.x) * p,
        py = a.y + (b.y - a.y) * p;
      ctx.fillStyle = props.light ? "rgba(58,116,70,.55)" : "rgba(220,255,183,.85)";
      ctx.beginPath();
      ctx.arc(px, py, 1.25, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // Long signals propagate coherently along the neural pathways.
  for (const row of [2, 5, 9, 12]) {
    const head = (time * 0.003 + row * 3.7) % (columns + 10);
    for (let col = 1; col < columns; col++) {
      const alpha = Math.max(0, 1 - Math.abs(head - col) / 6) * 0.8;
      if (alpha < 0.02) continue;
      const a = points[row * columns + col - 1],
        b = points[row * columns + col];
      ctx.strokeStyle = props.light ? `rgba(65,119,63,${alpha})` : `rgba(198,244,159,${alpha})`;
      ctx.lineWidth = 1.4;
      ctx.shadowColor = "#a3e635";
      ctx.shadowBlur = 7;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }
  ctx.shadowBlur = 0;
  for (const p of points) {
    const r = (p.n.major ? 3 : 1) * p.depth + p.glow * 1.6;
    if (p.n.major || p.glow > 0.45) {
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 18 + p.glow * 16);
      glow.addColorStop(0, props.light ? "rgba(91,150,62,.20)" : "rgba(155,229,119,.32)");
      glow.addColorStop(1, "rgba(100,180,100,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 34, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = props.light
      ? `rgba(60,110,71,${0.3 + p.glow * 0.6})`
      : `rgba(219,246,202,${Math.min(1, 0.22 + p.n.seed * 0.38 + p.glow * 0.5)})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
    if (p.n.major) {
      ctx.strokeStyle = props.light ? "#637ba160" : "#a8c7ed35";
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r + 5, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}
function animate(timestamp) {
  raf = 0;
  if (!visible || document.hidden || !props.motion || reduced) return;
  const interval = width < 650 ? 1000 / 30 : 1000 / 45;
  if (timestamp - last >= interval) {
    if (lastTick) elapsed += Math.min(timestamp - lastTick, 60);
    lastTick = timestamp;
    last = timestamp;
    smoothed.x += (pointer.x > 0 ? pointer.x / width - 0.5 - smoothed.x : -smoothed.x) * 0.035;
    smoothed.y += (pointer.y > 0 ? pointer.y / height - 0.5 - smoothed.y : -smoothed.y) * 0.035;
    draw(elapsed);
  }
  raf = requestAnimationFrame(animate);
}
function start() {
  cancelAnimationFrame(raf);
  raf = 0;
  lastTick = 0;
  if (visible && !document.hidden && props.motion && !reduced) raf = requestAnimationFrame(animate);
  else draw(elapsed);
}
function resize() {
  const bounds = host.value.getBoundingClientRect();
  width = bounds.width;
  height = bounds.height;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
  canvas.value.width = width * dpr;
  canvas.value.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  draw(elapsed);
}
function move(event) {
  if (!props.motion || reduced) return;
  const r = host.value.getBoundingClientRect();
  pointer = { x: event.clientX - r.left, y: event.clientY - r.top };
}
function leave() {
  pointer = { x: -5000, y: -5000 };
}
function activate() {
  if (!props.motion || reduced) return;
  burstAt = elapsed;
}
function mediaChange() {
  reduced = media.matches;
  start();
}
watch(() => [props.motion, props.light], start);
onMounted(() => {
  ctx = canvas.value.getContext("2d");
  if (!ctx) return;
  media = window.matchMedia("(prefers-reduced-motion: reduce)");
  reduced = media.matches;
  media.addEventListener("change", mediaChange);
  resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host.value);
  intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      start();
    },
    { threshold: 0 },
  );
  intersectionObserver.observe(host.value);
  document.addEventListener("visibilitychange", start);
  resize();
  start();
});
onBeforeUnmount(() => {
  cancelAnimationFrame(raf);
  resizeObserver?.disconnect();
  intersectionObserver?.disconnect();
  media?.removeEventListener("change", mediaChange);
  document.removeEventListener("visibilitychange", start);
});
defineExpose({ activate });
</script>
<template>
  <div
    ref="host"
    class="neural-field"
    @pointermove="move"
    @pointerleave="leave"
    @pointerdown="activate"
  >
    <canvas ref="canvas" aria-label="可随指针响应的三维神经网络，光点沿连线流动" role="img" />
    <div class="neural-vignette" />
  </div>
</template>
<style scoped>
.neural-field {
  position: absolute;
  inset: 0;
  overflow: hidden;
  isolation: isolate;
  mask-image: linear-gradient(90deg, transparent, black 20%, black 80%, transparent);
  touch-action: pan-y;
}
canvas {
  display: block;
  width: 100%;
  height: 100%;
}
.neural-vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: none;
}
</style>
