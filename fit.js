/**
 * Author: Omar Raza
 * Student ID: 230013491
 * Description: Draws the scatter plot and updates the curve + status text
 * when the slider moves (simple line vs fitting every blue point).
 * Very simple version with lots of room for improvement
 */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const slider = document.getElementById("wiggle");
const status = document.getElementById("status");

// Gentle upward trend used as the "simple" pattern
const trueFn = (x) => 0.22 + 0.62 * x;

// Blue: already measured (deliberately bumpy)
const oldPts = [
  { x: 0.10, y: 0.48 },
  { x: 0.28, y: 0.18 },
  { x: 0.46, y: 0.72 },
  { x: 0.64, y: 0.30 },
  { x: 0.82, y: 0.88 },
];

// Red: new points near each blue, placed on the simple trend
const newPts = oldPts.map((p) => ({
  x: Math.min(0.95, p.x + 0.07),
  y: trueFn(p.x + 0.07),
}));

// Mix simple trend with a path through the blue points (slider controls mix)
function curveY(x, wiggle) {
  const t = wiggle / 8;
  return (1 - t) * trueFn(x) + t * interpolateOld(x);
}

// Smooth path that passes through consecutive blue points
function interpolateOld(x) {
  const pts = oldPts;
  if (x <= pts[0].x) return pts[0].y;
  if (x >= pts[pts.length - 1].x) return pts[pts.length - 1].y;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    if (x >= a.x && x <= b.x) {
      const u = (x - a.x) / (b.x - a.x);
      const s = u * u * (3 - 2 * u);
      return a.y + s * (b.y - a.y);
    }
  }
  return pts[pts.length - 1].y;
}

function pad() {
  return { l: 28, r: 12, t: 16, b: 28 };
}

// Map data coords (0–1) onto canvas pixels
function toCanvas(x, y) {
  const { l, r, t, b } = pad();
  return {
    cx: l + x * (canvas.width - l - r),
    cy: t + (1 - y) * (canvas.height - t - b),
  };
}

function draw(wiggle) {
  const { l, r, t, b } = pad();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Light axes
  ctx.strokeStyle = "#ddd";
  ctx.beginPath();
  ctx.moveTo(l, t);
  ctx.lineTo(l, canvas.height - b);
  ctx.lineTo(canvas.width - r, canvas.height - b);
  ctx.stroke();

  // Fitted curve for the current slider value
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 0; i <= 100; i++) {
    const x = i / 100;
    const { cx, cy } = toCanvas(x, curveY(x, wiggle));
    if (i === 0) ctx.moveTo(cx, cy);
    else ctx.lineTo(cx, cy);
  }
  ctx.stroke();
  ctx.lineWidth = 1;

  // Blue then red dots
  for (const p of oldPts) {
    const { cx, cy } = toCanvas(p.x, p.y);
    ctx.fillStyle = "#1a6ecc";
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const p of newPts) {
    const { cx, cy } = toCanvas(p.x, p.y);
    ctx.fillStyle = "#c44";
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Redraw + pick a short status line for left / middle / right
function update() {
  const w = Number(slider.value);
  draw(w);

  if (w <= 2) {
    status.textContent =
      "Simple line: near the red points, even if it misses some blue ones.";
  } else if (w >= 6) {
    status.textContent =
      "Eventually hits every blue point — but drifts away from the red ones.";
  } else {
    status.textContent =
      "Somewhat close: following the blues more, starting to leave the reds.";
  }
}

slider.addEventListener("input", update);
update();
