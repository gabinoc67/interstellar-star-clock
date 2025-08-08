// --- Element refs ---
const engageBtn    = document.querySelector('.engage-warp');
const resetBtn     = document.getElementById('reset-btn');
const speedInput   = document.getElementById('warp-speed');
const planetSelect = document.getElementById('planet-select');
const rearCtx      = document.getElementById('rear-canvas').getContext('2d');
const frontCtx     = document.getElementById('front-canvas').getContext('2d');
const tCtx         = document.getElementById('trajectory-canvas').getContext('2d');
const earthMini    = document.getElementById('earth-canvas').getContext('2d');
const destMini     = document.getElementById('dest-canvas').getContext('2d');

// --- Load images ---
const planetNames = ['mercury','venus','earth','mars','jupiter','saturn','uranus','neptune','pluto','moon'];
const images = {};
planetNames.forEach(name => {
  const img = new Image();
  img.src = `${name}.png`;
  images[name] = img;
});

// --- Helpers ---
function drawPlanet(ctx, img, scale) {
  const cw = ctx.canvas.width, ch = ctx.canvas.height;
  const w = img.width * scale, h = img.height * scale;
  ctx.clearRect(0, 0, cw, ch);
  ctx.drawImage(img, (cw - w)/2, (ch - h)/2, w, h);
}
function drawStaticPath(speed) {
  const w = tCtx.canvas.width, h = tCtx.canvas.height;
  const start = { x:60, y:h/2 }, end = { x:w-60, y:h/2 };
  const cp = { x:w/2, y:h/2 - (speed/10)*(h/3) };
  tCtx.clearRect(0, 0, w, h);
  tCtx.strokeStyle = '#0f0'; tCtx.lineWidth = 2;
  tCtx.beginPath();
  tCtx.moveTo(start.x, start.y);
  tCtx.quadraticCurveTo(cp.x, cp.y, end.x, end.y);
  tCtx.stroke();
  return { start, cp, end };
}
function animateTravel({ start, cp, end }) {
  const speed = +speedInput.value;
  const duration = 2000 / speed;
  const t0 = performance.now();
  function frame(now) {
    const t = Math.min((now - t0) / duration, 1);
    tCtx.clearRect(0, 0, tCtx.canvas.width, tCtx.canvas.height);
    // redraw path
    tCtx.strokeStyle = '#0f0'; tCtx.lineWidth = 2;
    tCtx.beginPath();
    tCtx.moveTo(start.x, start.y);
    tCtx.quadraticCurveTo(cp.x, cp.y, end.x, end.y);
    tCtx.stroke();
    // ship dot
    const x = (1-t)*(1-t)*start.x + 2*(1-t)*t*cp.x + t*t*end.x;
    const y = (1-t)*(1-t)*start.y + 2*(1-t)*t*cp.y + t*t*end.y;
    tCtx.fillStyle = '#f00';
    tCtx.beginPath(); tCtx.arc(x, y, 6, 0, Math.PI*2); tCtx.fill();
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
function updateStats(rearScale, frontScale) {
  document.getElementById('stat-rear').innerText  = Math.round(rearScale*100) + '%';
  document.getElementById('stat-front').innerText = Math.round(frontScale*100) + '%';
}

// --- Event handlers ---
engageBtn.addEventListener('click', () => {
  const speed = +speedInput.value;
  const dest  = planetSelect.value;
  const rearScale  = 1 - speed/10;
  const frontScale = speed/10;

  // zoom panels
  drawPlanet(rearCtx,  images['earth'],  rearScale);
  if (dest && images[dest]) {
    drawPlanet(frontCtx, images[dest], frontScale);
    document.getElementById('front-title').innerText =
      dest.charAt(0).toUpperCase() + dest.slice(1);
  }

  // animate ship
  const path = drawStaticPath(speed);
  animateTravel(path);

  // update UI
  updateStats(rearScale, frontScale);
  engageBtn.style.transform = 'scale(1.57)';
});

resetBtn.addEventListener('click', () => {
  planetSelect.value = 'mercury';
  speedInput.value   = 1;
  document.getElementById('front-title').innerText = 'Front View';
  updateStats(0.9, 0.1);
  drawPlanet(rearCtx,  images['earth'],  0.9);
  drawPlanet(earthMini, images['earth'], 0.5);
  tCtx.clearRect(0, 0, tCtx.canvas.width, tCtx.canvas.height);
});

window.addEventListener('load', () => {
  // initial draw
  drawPlanet(rearCtx, images['earth'], 0.9);
  updateStats(0.9, 0.1);
});
