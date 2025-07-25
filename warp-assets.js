// Global Elements
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const log = document.getElementById("log");
const flash = document.getElementById("flash");
const warpSound = document.getElementById("warpSound");

const images = {
  earth: new Image(),
  ship: new Image(),
  mercury: new Image(),
  venus: new Image(),
  mars: new Image(),
  pluto: new Image()
};

const positions = {
  earth: { x: 80, y: 400, w: 220, h: 220 },
  planet: { x: 1100, y: 400, w: 220, h: 220 }
};

let arcY = 510;
let arcHeight = 100;
let selectedPlanet = "mars";

// Image Sources
images.earth.src = "https://raw.githubusercontent.com/gabinoc67/interstellar-star-clock/main/earth.png";
images.ship.src = "https://raw.githubusercontent.com/gabinoc67/interstellar-star-clock/main/colonialship.png";
images.mercury.src = "https://raw.githubusercontent.com/gabinoc67/interstellar-star-clock/main/mercury.png";
images.venus.src = "https://raw.githubusercontent.com/gabinoc67/interstellar-star-clock/main/venus.png";
images.mars.src = "https://raw.githubusercontent.com/gabinoc67/interstellar-star-clock/main/mars.png";
images.pluto.src = "https://raw.githubusercontent.com/gabinoc67/interstellar-star-clock/main/pluto.png";

// Drawing Function
function drawScene(shipX = null, shipY = null) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(images.earth, positions.earth.x, positions.earth.y, positions.earth.w, positions.earth.h);
  ctx.drawImage(images[selectedPlanet], positions.planet.x, positions.planet.y, positions.planet.w, positions.planet.h);

  ctx.beginPath();
  ctx.moveTo(positions.earth.x + positions.earth.w / 2, positions.earth.y);
  ctx.quadraticCurveTo(canvas.width / 2, arcY - arcHeight, positions.planet.x + positions.planet.w / 2, positions.planet.y);
  ctx.strokeStyle = "#00ffff";
  ctx.lineWidth = 3;
  ctx.stroke();

  if (shipX !== null && shipY !== null) {
    ctx.drawImage(images.ship, shipX - 20, shipY - 20, 40, 40);
  }
}

// Warp Engage
function engageWarp() {
  selectedPlanet = document.getElementById("planetSelect").value;
  const warp = parseInt(document.getElementById("warpSelect").value);
  arcHeight = warp === 1 ? 160 : warp === 5 ? 100 : 40;

  log.textContent = `Warp ${warp} to ${selectedPlanet} initiated at CST: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}`;
  playWarpSound();
  speak(`Warp ${warp} engaged. Destination: ${selectedPlanet}.`);
  animateShip(warp);
}

// Reset Button
function resetScene() {
  selectedPlanet = "mars";
  document.getElementById("planetSelect").value = "mars";
  document.getElementById("warpSelect").value = "1";
  drawScene();
  log.textContent = "Status: Reset. Waiting for warp command...";
}

// Animation Logic
function animateShip(warpSpeed) {
  let step = 0;
  const steps = 600 - warpSpeed * 40;

  const x1 = positions.earth.x + positions.earth.w / 2;
  const y1 = positions.earth.y;
  const x2 = canvas.width / 2;
  const y2 = arcY - arcHeight;
  const x3 = positions.planet.x + positions.planet.w / 2;
  const y3 = positions.planet.y;

  function animate() {
    step++;
    const t = step / steps;
    const x = (1 - t) ** 2 * x1 + 2 * (1 - t) * t * x2 + t ** 2 * x3;
    const y = (1 - t) ** 2 * y1 + 2 * (1 - t) * t * y2 + t ** 2 * y3;

    drawScene(x, y);

    if (step < steps) {
      requestAnimationFrame(animate);
    } else {
      flashArrival();
      speak(`Arrived at ${selectedPlanet}. Warp complete.`);
      log.textContent += `\nArrived at ${selectedPlanet} at CST: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}`;
    }
  }

  animate();
}

// Flash Effect
function flashArrival() {
  flash.style.opacity = 1;
  setTimeout(() => {
    flash.style.opacity = 0;
  }, 300);
}

// Sound & Speech
function playWarpSound() {
  warpSound.currentTime = 0;
  warpSound.play();
}

function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 1;
  utter.pitch = 1;
  speechSynthesis.speak(utter);
}

// Preload Images
let loaded = 0;
const total = Object.keys(images).length;
for (let key in images) {
  images[key].onload = () => {
    loaded++;
    if (loaded === total) drawScene();
  };
}
