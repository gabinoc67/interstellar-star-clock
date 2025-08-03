// ✅ render/gravity-vector-engine.js – GVE Visual Panel

const gveCanvas = document.createElement("canvas");
gveCanvas.width = 300;
gveCanvas.height = 200;
gveCanvas.style.width = "100%";
gveCanvas.style.background = "#000";

const gveCtx = gveCanvas.getContext("2d");

const gveImages = {};
const gvePlanets = {
  Mercury: "mercury2",
  Venus: "venus2",
  Mars: "mars",
  Jupiter: "jupiter",
  Saturn: "saturn",
  Uranus: "uranus",
  Neptune: "neptune2",
  Pluto: "pluto2"
};

// ✅ Load planet icons from GitHub-hosted assets
function loadGVEImages() {
  Object.entries(gvePlanets).forEach(([name, file]) => {
    const img = new Image();
    img.src = `https://raw.githubusercontent.com/gabinoc67/interstellar-star-clock/main/${file}.png`;
    gveImages[name] = img;
  });
}

// ✅ Attach to DOM on load
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("gve").appendChild(gveCanvas);
  loadGVEImages();
  drawGVE();
});

// ✅ Draw gravity force bars + selected planet icon
function drawGVE() {
  gveCtx.clearRect(0, 0, gveCanvas.width, gveCanvas.height);

  const dest = document.getElementById("destination").value;
  const front = Number(document.getElementById("frontPct").value || 50);
  const rear = Number(document.getElementById("rearPct").value || 50);
  const mw = Number(document.getElementById("reactorMW").value || 4000);

  // Planet icon
  const img = gveImages[dest];
  if (img?.complete) {
    gveCtx.drawImage(img, 10, 10, 40, 40);
  } else {
    gveCtx.fillStyle = "#888";
    gveCtx.fillText(dest, 10, 30);
  }

  // Reactor power bar
  gveCtx.fillStyle = "lime";
  gveCtx.fillText(`Reactor: ${mw} MW`, 60, 25);
  gveCtx.fillRect(60, 30, mw / 100, 8);

  // Gravity vector bars
  gveCtx.fillStyle = "cyan";
  gveCtx.fillText(`Front: ${front}%`, 10, 80);
  gveCtx.fillRect(10, 85, front * 2, 10);

  gveCtx.fillStyle = "magenta";
  gveCtx.fillText(`Rear: ${rear}%`, 10, 110);
  gveCtx.fillRect(10, 115, rear * 2, 10);

  // Bias indicators
  gveCtx.fillStyle = "white";
  const lr = document.getElementById("lrBias").value;
  const ud = document.getElementById("udBias").value;
  const intake = document.getElementById("intakeMode").value;

  gveCtx.fillText(`L/R Bias: ${lr}`, 10, 150);
  gveCtx.fillText(`U/D Bias: ${ud}`, 110, 150);
  gveCtx.fillText(`Intake: ${intake}`, 200, 150);
}

// ✅ Auto-refresh GVE when destination or warp changes
["destination", "warpSpeed"].forEach(id => {
  const el = document.getElementById(id);
  el.addEventListener("input", drawGVE);
});
