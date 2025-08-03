// ✅ render/curve.js - Draw curved trajectory & ship movement

const canvas = document.createElement("canvas");
canvas.width = 400;
canvas.height = 200;
canvas.style.width = "100%";
canvas.style.height = "150px";
canvas.style.background = "black";

const ctx = canvas.getContext("2d");
const ship = { x: 0, y: 0, t: 0, moving: false, reverse: false };

// Attach canvas and toggle button
window.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("ship-view");
  container.appendChild(canvas);

  const toggleBtn = document.createElement("button");
  toggleBtn.textContent = "Toggle View: Front";
  toggleBtn.style.marginTop = "8px";
  toggleBtn.onclick = () => {
    ship.reverse = !ship.reverse;
    toggleBtn.textContent = `Toggle View: ${ship.reverse ? "Rear" : "Front"}`;
    drawCurve();
  };
  container.appendChild(toggleBtn);
});

// ✅ Main curve drawing function
function drawCurve() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const { dAU } = computeETASeconds();
  const warp = Number(document.getElementById("warpSpeed").value || 1);

  const startX = 50;
  const endX = canvas.width - 50;
  const midX = (startX + endX) / 2;
  const baseHeight = canvas.height / 2;
  const arcHeight = Math.max(10, 80 - warp * 6);

  const startY = baseHeight;
  const endY = baseHeight;
  const cpX = midX;
  const cpY = baseHeight - arcHeight;

  ship.path = { startX, startY, cpX, cpY, endX, endY };
  ship.t = ship.reverse ? 1 : 0;
  ship.moving = true;

  // Draw curve
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.quadraticCurveTo(cpX, cpY, endX, endY);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.stroke();

  drawShip();
}

// ✅ Animate ship along curve
function drawShip() {
  if (!ship.moving) return;

  ship.t += ship.reverse ? -0.005 : 0.005;
  if ((!ship.reverse && ship.t > 1) || (ship.reverse && ship.t < 0)) {
    ship.t = ship.reverse ? 0 : 1;
    ship.moving = false;
  }

  const { startX, startY, cpX, cpY, endX, endY } = ship.path;
  const t = ship.t;
  const x = (1 - t) ** 2 * startX + 2 * (1 - t) * t * cpX + t ** 2 * endX;
  const y = (1 - t) ** 2 * startY + 2 * (1 - t) * t * cpY + t ** 2 * endY;

  ship.x = x;
  ship.y = y;

  // Redraw
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.quadraticCurveTo(cpX, cpY, endX, endY);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Ship icon (circle)
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, 2 * Math.PI);
  ctx.fillStyle = "cyan";
  ctx.fill();

  if (ship.moving) requestAnimationFrame(drawShip);
}
