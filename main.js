// ✅ main.js - Bootstrap Warp Simulator

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
  let startTime = Date.now();
  setInterval(() => {
    const now = new Date();
    for (let i = 1; i <= 5; i++) {
      document.getElementById(`c${i}`).textContent = now.toLocaleTimeString();
    }
  }, 1000);
}

// ✅ Init visual/physics systems
function initSimulation() {
  // Placeholder for future draw/orbit/init logic
  console.log("🧠 Physics + Visuals ready");
}

// 🚀 Start Simulation Logic
function startSimulation() {
  console.log("🟢 Starting simulation...");
  // Future: activate physics, ship movement, tracking
}

// ⛔ Stop Simulation Logic
function stopSimulation() {
  console.log("🔴 Stopping simulation...");
  // Future: stop timers, animations
}

// ⚡ Engage Warp
function engageWarp() {
  console.log("⚡ Warp engaged!");
  // Future: draw curve, start ETA, sync clocks
}
