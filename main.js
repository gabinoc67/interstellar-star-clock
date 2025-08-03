// ✅ main.js - Bootstrap Warp Simulator

let warpCountdownInterval = null;

// Global initialization on page load
window.addEventListener("DOMContentLoaded", () => {
  console.log("🌌 Warp Control Simulator Booting...");

  initUI();           // setup UI bindings
  initClockSync();    // start C1–C5 clocks
  initSimulation();   // prepare physics + visuals
});

// ✅ Init UI controls (sliders, buttons, dropdowns)
function initUI() {
  // UI Scale
  const scaleInput = document.getElementById("ui-scale");
  scaleInput.addEventListener("input", () => {
    document.body.style.zoom = `${scaleInput.value}%`;
  });

  // Sound toggle (stub)
  const soundToggle = document.getElementById("sound");
  soundToggle.addEventListener("change", () => {
    console.log("🔊 Sound", soundToggle.checked ? "On" : "Off");
  });

  // Button hooks (start, stop, engage)
  document.getElementById("startBtn").addEventListener("click", startSimulation);
  document.getElementById("stopBtn").addEventListener("click", stopSimulation);
  document.getElementById("engageBtn").addEventListener("click", engageWarp);
}

// ✅ Init clock system (C1–C5)
function initClockSync() {
  setInterval(() => {
    const now = new Date();
    for (let i = 1; i <= 5; i++) {
      document.getElementById(`c${i}`).textContent = now.toLocaleTimeString();
    }
  }, 1000);
}

// ✅ Init visual/physics systems
function initSimulation() {
  console.log("🧠 Physics + Visuals ready");
  drawCurve();
  renderOrbits();
}

// 🚀 Start Simulation Logic
function startSimulation() {
  console.log("🟢 Starting simulation...");
  logStatus("🟢 Simulation started.");
}

// ⛔ Stop Simulation Logic
function stopSimulation() {
  console.log("🔴 Stopping simulation...");
  logStatus("🔴 Simulation stopped.");
  if (warpCountdownInterval) clearInterval(warpCountdownInterval);
}

// ⚡ Engage Warp
function engageWarp() {
  console.log("⚡ Warp engaged!");
  logStatus("⚡ Warp engaged.");

  autoCalculateGVE();

  const { etaSeconds, dAU } = computeETASeconds();
  logStatus(`⏳ ETA: ${Math.round(etaSeconds)} sec | Distance: ${dAU} AU`);

  drawCurve(); // Start ship animation
  validateGR();

  startWarpCountdown(etaSeconds);
}

// ⏱ Live countdown timer during warp
function startWarpCountdown(duration) {
  let remaining = Math.round(duration);
  if (warpCountdownInterval) clearInterval(warpCountdownInterval);

  logStatus(`🕒 Warp countdown started: ${remaining} sec`);

  warpCountdownInterval = setInterval(() => {
    remaining--;
    logStatus(`⏳ Time left: ${remaining} sec`);

    if (remaining <= 0) {
      clearInterval(warpCountdownInterval);
      logStatus("✅ Arrived at destination. Warp complete.");
    }
  }, 1000);
}
