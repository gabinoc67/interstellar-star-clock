// ✅ main.js — Core Warp Drive Simulation Logic

let warpSpeed = 1;
let destination = "Mars";
let isEngaged = false;
let travelLog = [];

const clocks = ["c1", "c2", "c3", "c4", "c5"];

function updateClocks() {
  const now = new Date().toLocaleTimeString();
  clocks.forEach(id => document.getElementById(id).innerText = now);
}

function updateCompassHeading(degrees) {
  const heading = document.getElementById("compass-heading");
  heading.textContent = `🧭 Heading: ${degrees}°`;
}

function updateLog(message) {
  const log = document.getElementById("cmdLog");
  if (log) {
    const time = new Date().toLocaleTimeString();
    log.innerHTML += `&bull; [${time}] ${message}<br>`;
    log.scrollTop = log.scrollHeight;
  }
}

function downloadLog() {
  const log = document.getElementById("cmdLog").innerText;
  const blob = new Blob([log], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "warp_log.txt";
  a.click();
}

function startSequence() {
  warpSpeed = parseInt(document.getElementById("warpSpeed").value);
  destination = document.getElementById("destination").value;
  updateLog(`Initialized warp sequence to ${destination} at Warp ${warpSpeed}`);
  isEngaged = false;
}

function engageWarp() {
  if (isEngaged) return;
  isEngaged = true;
  updateLog(`Engaging warp drive to ${destination}...`);
  document.getElementById("ship-render").style.animationPlayState = "running";
  // Trigger animation/simulation from render modules
  simulateTravel();
}

function stopWarp() {
  if (!isEngaged) return;
  isEngaged = false;
  updateLog("Warp sequence aborted.");
  document.getElementById("ship-render").style.animationPlayState = "paused";
  // Reset animations if needed
}

function simulateTravel() {
  // Placeholder — connected to curve.js, orbit.js, and gravity-vector-engine.js
  updateCompassHeading(Math.floor(Math.random() * 360));
  updateLog(`Calculating optimal curve to ${destination} at Warp ${warpSpeed}...`);
  // Add actual path animation / arrival triggers here
}

// Event Bindings
document.getElementById("startBtn").onclick = startSequence;
document.getElementById("engageBtn").onclick = engageWarp;
document.getElementById("stopBtn").onclick = stopWarp;
document.getElementById("toggleView").onclick = () => {
  const toggleBtn = document.getElementById("toggleView");
  const mode = toggleBtn.textContent.includes("Front") ? "Rear" : "Front";
  toggleBtn.textContent = `Toggle View: ${mode}`;
  updateLog(`Switched ship view to ${mode}`);
};

// Clock Sync
setInterval(updateClocks, 1000);
