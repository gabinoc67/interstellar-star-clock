// ELEMENTS
const engageBtn  = document.getElementById('engage-btn');
const resetBtn   = document.getElementById('reset-btn');
const planetSel  = document.getElementById('planet-select');
const speedInput = document.getElementById('warp-speed');
const speedDisp  = document.getElementById('speed-display');

const rearCtx   = document.getElementById('rear-canvas').getContext('2d');
const frontCtx  = document.getElementById('front-canvas').getContext('2d');
const miniEarth = document.getElementById('mini-earth').getContext('2d');
const miniDest  = document.getElementById('mini-dest').getContext('2d');

const trajCtx   = document.getElementById('traj-canvas').getContext('2d');

const statRear  = document.getElementById('stat-rear');
const statFront = document.getElementById('stat-front');
const angX      = document.getElementById('ang-x');
const angY      = document.getElementById('ang-y');
const angT      = document.getElementById('ang-t');
const destLabel = document.getElementById('dest-label');
const frontTitle= document.getElementById('front-title');

// LOAD IMAGES
const planets = ['mercury','venus','earth','mars','jupiter','saturn','uranus','neptune','pluto','moon'];
const imgs = {};
planets.forEach(name=>{
  const i=new Image();
  i.src = name + '.png';
  imgs[name]=i;
});

// DRAW HELPERS
function drawPlanet(ctx,img,scale){
  const W=ctx.canvas.width, H=ctx.canvas.height;
  const w=img.width*scale, h=img.height*scale;
  ctx.clearRect(0,0,W,H);
  ctx.drawImage(img,(W-w)/2,(H-h)/2,w,h);
}

function drawCurve(speed){
  const W=trajCtx.canvas.width, H=trajCtx.canvas.height;
  const start={x:40,y:H/2}, end={x:W-40,y:H/2};
  const cpY = H/2 - (speed/10)*(H/3);
  trajCtx.clearRect(0,0,W,H);
  trajCtx.strokeStyle='#0f0'; trajCtx.lineWidth=2;
  trajCtx.beginPath();
  trajCtx.moveTo(start.x,start.y);
  trajCtx.quadraticCurveTo(W/2,cpY,end.x,end.y);
  trajCtx.stroke();
  return {start,cp:{x:W/2,y:cpY},end};
}

function animateShip(path,speed){
  const {start,cp,end}=path;
  const dur = 2000/speed;
  const t0=performance.now();
  function frame(now){
    let t=(now-t0)/dur; if(t>1)t=1;
    drawCurve(speed);
    // interpolate
    const x=(1-t)**2*start.x + 2*(1-t)*t*cp.x + t**2*end.x;
    const y=(1-t)**2*start.y + 2*(1-t)*t*cp.y + t**2*end.y;
    trajCtx.fillStyle='#f00';
    trajCtx.beginPath(); trajCtx.arc(x,y,5,0,2*Math.PI); trajCtx.fill();
    if(t<1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function updateStats(r,f){
  statRear.textContent  = Math.round(r*100)+'%';
  statFront.textContent = Math.round(f*100)+'%';
}

// ENGAGE
engageBtn.addEventListener('click',()=>{
  const speed = +speedInput.value;
  const dest  = planetSel.value;
  speedDisp.textContent = speed;

  // zoom scales
  const rearScale  = 1 - speed/10;
  const frontScale = speed/10;

  // redraw panels
  drawPlanet(rearCtx, imgs.earth, rearScale);
  if(dest){
    drawPlanet(frontCtx, imgs[dest], frontScale);
    frontTitle.textContent = dest.charAt(0).toUpperCase()+dest.slice(1);
  }

  // minis
  drawPlanet(miniEarth, imgs.earth, 0.6);
  if(dest) drawPlanet(miniDest, imgs[dest], 0.6);
  destLabel.textContent = dest.charAt(0).toUpperCase()+dest.slice(1);

  // stats
  updateStats(rearScale, frontScale);

  // trajectory
  const path = drawCurve(speed);
  animateShip(path,speed);
});

// RESET
resetBtn.addEventListener('click',()=>{
  planetSel.value = 'mercury';
  speedInput.value = 1;
  speedDisp.textContent = '1';
  frontTitle.textContent = 'Front View';
  destLabel.textContent = 'Destination';
  updateStats(0.9,0.1);
  drawPlanet(rearCtx, imgs.earth, 0.9);
  drawPlanet(frontCtx, imgs.mercury, 0); // hidden until engage
  trajCtx.clearRect(0,0, trajCtx.canvas.width, trajCtx.canvas.height);
  drawPlanet(miniEarth, imgs.earth, 0.6);
  miniDest.clearRect(0,0, miniDest.canvas.width, miniDest.canvas.height);
});

// INITIAL STATE
window.addEventListener('load',()=>{
  drawPlanet(rearCtx, imgs.earth, 0.9);
  drawPlanet(miniEarth, imgs.earth, 0.6);
  updateStats(0.9,0.1);
});
