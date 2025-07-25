// warp-assets.js

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const log = document.getElementById("log");
const warpSound = new Audio("https://actions.google.com/sounds/v1/transportation/space_ship_takeoff.ogg");

const images = {
  earth: new Image(),
  ship: new Image(),
  mercury: new Image(),
  venus: new Image(),
  mars: new Image(),
  pluto: new Image(),
};

const positions = {
  earth: { x: 80, y: 400, w: 220, h: 220 },
  planet: { x: 1100, y: 400, w: 220, h: 220 },
};

const arcY = 510;
const arcStart = 190;
const arcEnd = 1210;
let arcHeight = 100;
let selectedPlanet = "mars";

images.earth.src = "https://raw.githubusercontent.com/gabinoc67/interstellar-star-clock/blob/main/earth.png";
images.ship.src = "https://raw.githubusercontent.com/gabinoc67/interstellar-star-clock/main/colonialship.png";
images.mercury.src = "https://raw.githubusercontent.com/gabinoc67/interstellar-star-clock/main/mercury.png";
images.venus.src = "https://raw.githubusercontent.com/gabinoc67/interstellar-star-clock/blob/main/venus.png";
images.mars.src = "https://raw.githubusercontent.com/gabinoc67/interstellar-star-clock/blob/main/mars.png";
images.pluto.src = "https://raw.githubusercontent.com/gabinoc67/interstellar-star-clock/blob/main/pluto.png";

function drawScene(shipX = null, shipY = null) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(images.earth, positions.earth.x, positions.earth.y, positions.earth.w, positions.earth.h);
  ctx.drawImage(images[selectedPlanet], positions.planet.x, positions.planet.y, positions.planet.w, positions.planet.h);

  ctx.beginPath();
  ctx.moveTo(positions.earth.x + positions.earth.w / 2, positions.earth.y);
  ctx.quadraticCurveTo(
    canvas.width / 2,
    arcY - arcHeight,
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
  selectedPlanet = document.getElementById("planetSelect").value;
  const warp = parseInt(document.getElementById("warpSelect").value);
  arcHeight = 200 - warp * 20; // Warp 1 = high arc, Warp 10 = flatter arc

  log.textContent = `Warp ${warp} to ${selectedPlanet} initiated at CST time: ${new Date().toLocaleTimeString('en-US', { timeZone: 'America/Chicago' })}`;
  warpSound.currentTime = 0;
  warpSound.play();
  speak(`Warp ${warp} engaged. Destination: ${selectedPlanet}.`);
  animateShip();
}

function resetScene() {
  document.getElementById("planetSelect").value = "mercury";
  document.getElementById("warpSelect").value = "1";
  selectedPlanet = "mercury";
  arcHeight = 180;
  drawScene();
  log.textContent = "Status: Reset. Waiting for warp command...";
}

function animateShip() {
  let step = 0;
  const steps = 500;
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
      speak(`Arrived at ${selectedPlanet}. Warp complete.`);
      log.textContent += `\nArrived at ${selectedPlanet} at CST time: ${new Date().toLocaleTimeString('en-US', { timeZone: 'America/Chicago' })}`;
    }
  }
  animate();
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
