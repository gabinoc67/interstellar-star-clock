const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const log = document.getElementById("log");
const planetSelect = document.getElementById("planetSelect");
const warpSelect = document.getElementById("warpSelect");
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

images.earth.src = "https://raw.githubusercontent.com/gabinoc67/interstellar-star-clock/blob/main/earth.png";
images.ship.src = "https://raw.githubusercontent.com/gabinoc67/interstellar-star-clock/main/colonialship.png";
images.mercury.src = "https://raw.githubusercontent.com/gabinoc67/interstellar-star-clock/main/mercury.png";
images.venus.src = "https://raw.githubusercontent.com/gabinoc67/interstellar-star-clock/blob/main/venus.png";
images.mars.src = "https://raw.githubusercontent.com/gabinoc67/interstellar-star-clock/blob/main/mars.png";
images.pluto.src = "https://raw.githubusercontent.com/gabinoc67/interstellar-star-clock/blob/main/pluto.png";

const positions = {
  earth: { x: 80, y: 400, w: 220, h: 220 },
  planet: { x: 1100, y: 400, w: 220, h: 220 }
};

let selectedPlanet = "mars";
let arcHeight = 150;

function drawScene(shipX = null, shipY = null) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(images.earth, positions.earth.x, positions.earth.y, positions.earth.w, positions.earth.h);
  ctx.drawImage(images[selectedPlanet], positions.planet.x, positions.planet.y, positions.planet.w, positions.planet.h);

  ctx.beginPath();
  ctx.moveTo(positions.earth.x + positions.earth.w / 2, positions.earth.y);
  ctx.quadraticCurveTo(
    canvas.width / 2,
    510 - arcHeight,
    positions.planet.x + positions.planet.w / 2,
    positions.planet.y
  );
  ctx.strokeStyle = "#00ffff";
  ctx.lineWidth = 3;
  ctx.stroke();

  if (shipX !== null && shipY !== null) {
    ctx.drawImage(images.ship, shipX - 24, shipY - 24, 48, 48);
  }
}

function engageWarp() {
  selectedPlanet = planetSelect.value;
  const warp = parseInt(warpSelect.value);
  arcHeight = 170 - warp * 15;

  log.textContent = `Warp ${warp} to ${selectedPlanet} initiated at CST time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}`;
  playWarpSound();
  speak(`Warp ${warp} engaged. Destination: ${selectedPlanet}.`);
  animateShip();
}

function resetScene() {
  planetSelect.value = "mercury";
  warpSelect.value = "1";
  selectedPlanet = "mercury";
  arcHeight = 150;
  drawScene();
  log.textContent = "Status: Reset. Waiting for warp command...";
}

function animateShip() {
  let step = 0;
  const steps = 400;
  const x1 = positions.earth.x + positions.earth.w / 2;
  const y1 = positions.earth.y;
  const x2 = canvas.width / 2;
  const y2 = 510 - arcHeight;
  const x3 = positions.planet.x + positions.planet.w / 2;
  const y3 = positions.planet.y;

  function animate() {
    step++;
    const t = step / steps;
    const x = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * x2 + t * t * x3;
    const y = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * y2 + t * t * y3;
    drawScene(x, y);

    if (step < steps) {
      requestAnimationFrame(animate);
    } else {
      flashArrival();
      speak(`Arrived at ${selectedPlanet}. Warp complete.`);
      log.textContent += `\nArrived at ${selectedPlanet} at CST time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}`;
    }
  }

  animate();
}

function flashArrival() {
  flash.style.opacity = 1;
  setTimeout(() => {
    flash.style.opacity = 0;
  }, 300);
}

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

let loaded = 0;
const total = Object.keys(images).length;
for (let key in images) {
  images[key].onload = () => {
    loaded++;
    if (loaded === total) drawScene();
  };
}
