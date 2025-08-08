// ELEMENT REFS
const engageBtn   = document.getElementById('engage-btn');
const resetBtn    = document.getElementById('reset-btn');
const planetSel   = document.getElementById('planet-select');
const speedSelect = document.getElementById('warp-speed-select');

const rearCtx   = document.getElementById('rear-canvas').getContext('2d');
const frontCtx  = document.getElementById('front-canvas').getContext('2d');
const trajCtx   = document.getElementById('traj-canvas').getContext('2d');

const angX      = document.getElementById('ang-x');
const angY      = document.getElementById('ang-y');
const angT      = document.getElementById('ang-t');
const frontTitle= document.getElementById('front-title');

// LOAD PLANET IMAGES
const planetNames = [
  'mercury','venus','earth','mars',
  'jupiter','saturn','uranus','neptune',
  'pluto','moon'
];
const images = {};
planetNames.forEach(name => {
  const img = new Image();
  img.src = `${name}.png`;
  images[name] = img;
});

// DRAW A PLANET CENTERED IN A CANVAS
function drawCentered(ctx, img, scale) {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  const w = img.width * scale, h = img.height * scale;
  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
}

// COMPUTE CONTROL POINT FOR THE TRAJECTORY
function computeCurve(speed) {
  const W = trajCtx.canvas.width, H = trajCtx.canvas.height;
  const start = { x: 20, y: H / 2 };
  const end   = { x: W - 20, y: H / 2 };
  const cpY   = H / 2 - (speed / 10) * (H / 2);
  return { start, cp: { x: W / 2, y: cpY }, end };
}

// DRAW THE RED CURVE + DOTS
function drawCurve({ start, cp, end }) {
  trajCtx.clearRect(0, 0, trajCtx.canvas.width, trajCtx.canvas.height);
  // curve
  trajCtx.strokeStyle = 'red';
  trajCtx.lineWidth   = 2;
  trajCtx.beginPath();
  trajCtx.moveTo(start.x, start.y);
  trajCtx.quadraticCurveTo(cp.x, cp.y, end.x, end.y);
  trajCtx.stroke();
  // start dot (Earth)
  trajCtx.fillStyle = 'blue';
  trajCtx.beginPath();
  trajCtx.arc(start.x, start.y, 4, 0, 2 * Math.PI);
  trajCtx.fill();
  // arrowhead at end
  trajCtx.fillStyle = 'green';
  trajCtx.beginPath();
  trajCtx.moveTo(end.x, end.y);
  trajCtx.lineTo(end.x - 8, end.y - 5);
  trajCtx.lineTo(end.x - 8, end.y + 5);
  trajCtx.closePath();
  trajCtx.fill();
}

// UPDATE ANGLE READOUTS
function updateAngles(start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const ang = (Math.atan2(dy, dx) * 180 / Math.PI).toFixed(1);
  angX.textContent = ang + '°';
  angY.textContent = (90 - ang).toFixed(1) + '°';
  angT.textContent = ang + '°';
}

// ENGAGE WARP
engageBtn.addEventListener('click', () => {
  const speed = +speedSelect.value;
  const dest  = planetSel.value;

  // hide Earth in rear
  drawCentered(rearCtx, images.earth, 0);

  // zoom front planet
  drawCentered(frontCtx,
    images[dest] || images.mercury,
    speed / 10
  );
  frontTitle.textContent =
    dest.charAt(0).toUpperCase() + dest.slice(1);

  // trajectory
  const path = computeCurve(speed);
  drawCurve(path);
  updateAngles(path.start, path.end);
});

// RESET TO DEFAULTS
resetBtn.addEventListener('click', () => {
  planetSel.value   = 'mercury';
  speedSelect.value = 1;
  frontTitle.textContent = 'Front View';

  // panels
  drawCentered(rearCtx, images.earth, 1);
  drawCentered(frontCtx, images.mercury, 0);

  // clear trajectory
  trajCtx.clearRect(0, 0,
    trajCtx.canvas.width,
    trajCtx.canvas.height
  );
  angX.textContent = '0°';
  angY.textContent = '0°';
  angT.textContent = '0°';
});

// INITIAL STATE ON LOAD
window.addEventListener('load', () => {
  drawCentered(rearCtx, images.earth, 1);
  drawCentered(frontCtx, images.mercury, 0);
});
