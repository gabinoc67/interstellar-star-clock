// orbit.js

let orbitCtx, orbitCanvas;

function setupPlanetMapCanvas() {
  orbitCanvas = document.getElementById("planetMap");
  if (!orbitCanvas) return;

  orbitCtx = orbitCanvas.getContext("2d");
  orbitCanvas.width = 300;
  orbitCanvas.height = 300;
}

function drawHeliocentricMap() {
  if (!orbitCtx) return;

  orbitCtx.clearRect(0, 0, 300, 300);

  // Draw sun at center
  orbitCtx.beginPath();
  orbitCtx.arc(150, 150, 8, 0, 2 * Math.PI);
  orbitCtx.fillStyle = "yellow";
  orbitCtx.fill();

  const planets = [
    { name: "Mercury", radius: 40 },
    { name: "Venus", radius: 60 },
    { name: "Earth", radius: 80 },
    { name: "Mars", radius: 100 },
    { name: "Jupiter", radius: 120 },
    { name: "Saturn", radius: 140 },
    { name: "Uranus", radius: 160 },
    { name: "Neptune", radius: 180 },
    { name: "Pluto", radius: 195 },
  ];

  planets.forEach((planet, index) => {
    const angle = (Date.now() / 10000 + index * 50) % 360;
    const radians = (angle * Math.PI) / 180;
    const x = 150 + planet.radius * Math.cos(radians);
    const y = 150 + planet.radius * Math.sin(radians);

    orbitCtx.beginPath();
    orbitCtx.arc(x, y, 3, 0, 2 * Math.PI);
    orbitCtx.fillStyle = "#0f0";
    orbitCtx.fill();
  });
}

function animatePlanetMap() {
  drawHeliocentricMap();
  requestAnimationFrame(animatePlanetMap);
}

setupPlanetMapCanvas();
animatePlanetMap();
