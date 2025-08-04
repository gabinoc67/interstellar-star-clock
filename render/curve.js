// curve.js

let warpLevel = 1;
let curveCanvas;
let ctx;
let shipPos = 0;
let isWarping = false;
let frontView = true;

function setupCurveCanvas() {
  curveCanvas = document.createElement('canvas');
  curveCanvas.width = 300;
  curveCanvas.height = 100;
  curveCanvas.style.border = '1px solid #0f0';
  curveCanvas.style.display = 'block';
  curveCanvas.style.margin = '4px auto';
  document.getElementById('trajectory-vectors').appendChild(curveCanvas);
  ctx = curveCanvas.getContext('2d');
  drawCurve();
}

function drawCurve() {
  if (!ctx) return;
  ctx.clearRect(0, 0, curveCanvas.width, curveCanvas.height);
  ctx.strokeStyle = '#0f0';
  ctx.beginPath();
  ctx.moveTo(0, curveHeight(warpLevel, 0));
  for (let x = 0; x <= 300; x++) {
    let y = curveHeight(warpLevel, x);
    ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Draw ship
  let shipX = shipPos;
  let shipY = curveHeight(warpLevel, shipX);
  ctx.fillStyle = '#f00';
  ctx.beginPath();
  ctx.arc(shipX, shipY, 4, 0, Math.PI * 2);
  ctx.fill();
}

function curveHeight(warp, x) {
  const maxHeight = 40;
  const flatness = 10 - warp;
  return 50 - Math.sin((x / 300) * Math.PI) * maxHeight / flatness;
}

function startWarpAnimation() {
  if (!ctx || isWarping) return;
  isWarping = true;
  shipPos = 0;
  const interval = setInterval(() => {
    shipPos += 2;
    drawCurve();
    if (shipPos >= 300) {
      clearInterval(interval);
      isWarping = false;
    }
  }, 30);
}

document.addEventListener('DOMContentLoaded', () => {
  setupCurveCanvas();
  document.getElementById('engageBtn').addEventListener('click', () => {
    warpLevel = parseInt(document.getElementById('warpSpeed').value);
    startWarpAnimation();
  });
});
