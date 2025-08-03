// ✅ render/orbit.js – Animated Heliocentric Map with Vector Tracking & Selection

const planets = [
  { name: "Mercury", color: "#aaa", angle: 30, speed: 4.74 },
  { name: "Venus", color: "#f5c542", angle: 60, speed: 3.5 },
  { name: "Earth", color: "#00bfff", angle: 90, speed: 2.98 },
  { name: "Mars", color: "#d94c2e", angle: 120, speed: 2.41 },
  { name: "Jupiter", color: "#ffcc66", angle: 160, speed: 1.31 },
  { name: "Saturn", color: "#f2e68c", angle: 200, speed: 0.97 },
  { name: "Uranus", color: "#a3e6ff", angle: 240, speed: 0.68 },
  { name: "Neptune", color: "#4286f4", angle: 280, speed: 0.54 },
  { name: "Pluto", color: "#ccc", angle: 320, speed: 0.47 }
];

const mapCanvas = document.createElement("canvas");
mapCanvas.width = 400;
mapCanvas.height = 400;
mapCanvas.style.width = "100%";
mapCanvas.style.background = "#000";

const mapCtx = mapCanvas.getContext("2d");

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("heliocentric-map").appendChild(mapCanvas);
  mapCanvas.addEventListener("click", handlePlanetClick);
  animateOrbits();
});

function animateOrbits() {
  mapCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
  const cx = mapCanvas.width / 2;
  const cy = mapCanvas.height / 2;
  const radiusStep = 20;

  // Draw the Sun
  mapCtx.beginPath();
  mapCtx.arc(cx, cy, 8, 0, 2 * Math.PI);
  mapCtx.fillStyle = "yellow";
  mapCtx.fill();

  let earthX = cx, earthY = cy;
  let destX = null, destY = null;
  const selected = document.getElementById("destination").value;

  planets.forEach((planet, i) => {
    planet.angle += planet.speed * 0.01;
    const r = 50 + i * radiusStep;
    const angleRad = (planet.angle * Math.PI) / 180;
    const x = cx + r * Math.cos(angleRad);
    const y = cy + r * Math.sin(angleRad);

    planet.x = x;
    planet.y = y;
    planet.radius = 6;

    // Save Earth and Destination positions
    if (planet.name === "Earth") {
      earthX = x;
      earthY = y;
    }
    if (planet.name === selected) {
      destX = x;
      destY = y;
    }

    // Draw planet
    mapCtx.beginPath();
    mapCtx.arc(x, y, planet.radius, 0, 2 * Math.PI);
    mapCtx.fillStyle = planet.color;
    mapCtx.fill();

    // Label
    mapCtx.fillStyle = planet.name === selected ? "#0f0" : "white";
    mapCtx.font = "10px sans-serif";
    mapCtx.fillText(planet.name, x + 8, y);
  });

  // Draw vector from Earth to destination
  if (destX !== null && destY !== null) {
    mapCtx.beginPath();
    mapCtx.moveTo(earthX, earthY);
    mapCtx.lineTo(destX, destY);
    mapCtx.strokeStyle = "red";
    mapCtx.lineWidth = 1.5;
    mapCtx.stroke();
  }

  requestAnimationFrame(animateOrbits);
}

// 🎯 Detect planet click and set as destination
function handlePlanetClick(e) {
  const rect = mapCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  for (const planet of planets) {
    const dx = x - planet.x;
    const dy = y - planet.y;
    if (Math.sqrt(dx * dx + dy * dy) <= planet.radius + 5) {
      document.getElementById("destination").value = planet.name;
      drawGVE();
      logStatus(`🪐 Selected ${planet.name} as destination.`);
      break;
    }
  }
}
