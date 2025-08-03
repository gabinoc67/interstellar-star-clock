// ✅ render/orbit.js – Heliocentric Map & Planet Positions

const planets = [
  { name: "Mercury", color: "#aaa", angle: 30 },
  { name: "Venus", color: "#f5c542", angle: 60 },
  { name: "Earth", color: "#00bfff", angle: 90 },
  { name: "Mars", color: "#d94c2e", angle: 120 },
  { name: "Jupiter", color: "#ffcc66", angle: 160 },
  { name: "Saturn", color: "#f2e68c", angle: 200 },
  { name: "Uranus", color: "#a3e6ff", angle: 240 },
  { name: "Neptune", color: "#4286f4", angle: 280 },
  { name: "Pluto", color: "#ccc", angle: 320 }
];

// Create map canvas and attach to #heliocentric-map
const mapCanvas = document.createElement("canvas");
mapCanvas.width = 400;
mapCanvas.height = 400;
mapCanvas.style.width = "100%";
mapCanvas.style.background = "#000";

const mapCtx = mapCanvas.getContext("2d");

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("heliocentric-map").appendChild(mapCanvas);
  renderOrbits();
});

// ✅ Draw all planets in circular orbit pattern
function renderOrbits() {
  mapCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);

  const cx = mapCanvas.width / 2;
  const cy = mapCanvas.height / 2;
  const radiusStep = 20;

  // Draw the Sun
  mapCtx.beginPath();
  mapCtx.arc(cx, cy, 8, 0, 2 * Math.PI);
  mapCtx.fillStyle = "yellow";
  mapCtx.fill();

  planets.forEach((planet, i) => {
    const r = 50 + i * radiusStep;
    const angle = (planet.angle * Math.PI) / 180;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);

    // Planet body
    mapCtx.beginPath();
    mapCtx.arc(x, y, 6, 0, 2 * Math.PI);
    mapCtx.fillStyle = planet.color;
    mapCtx.fill();

    // Planet label
    mapCtx.fillStyle = "white";
    mapCtx.font = "10px sans-serif";
    mapCtx.fillText(planet.name, x + 8, y);
  });
}
