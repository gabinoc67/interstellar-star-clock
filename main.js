// ✅ main.js - Bootstrap Warp Simulator with HUD, Lock, Screenshot

let warpCountdownInterval = null;
let controlsLocked = false;
let fastMode = false;

window.addEventListener("DOMContentLoaded", () => {
  console.log("🌌 Warp Control Simulator Booting...");

  initUI();
  initClockSync();
  initSimulation();
  addHUDIndicators();
  addScreenshotButton();
});

function initUI() {
  const scaleInput = document.getElementById("ui-scale");
  scaleInput.addEventListener("input", () => {
    document.body.style.zoom = `${scaleInput.value}%`;
  });

  const soundToggle = document.getElementById("sound");
  soundToggle.addEventListener("change", () => {
    console.log("🔊 Sound", soundToggle.checked ? "On" : "Off");
  });

  document.getElementById("startBtn").addEventListener("click", startSimulation);
  document.getElementById("stopBtn").addEventListener("click", stopSimulation);
  document.getElementById("engageBtn").addEventListener("click", engageWarp);

  document.getElementById("fastWarpToggle").addEventListener("change", e => {
    fastMode = e.target.checked;
    console.log("⏩ Fast warp mode:", fastMode);
  });

  addMissionStatusBox();
}

function initClockSync() {
  setInterval(() => {
    const now = new Date();
    for (let i = 1; i <= 5; i++) {
      document.getElementById(`c${i}`).textContent = now.toLocaleTimeString();
    }
    updateMissionStatusTime(now);
  }, 1000);
}

function initSimulation() {
  console.log("🧠 Physics + Visuals ready");
  drawCurve();
  renderOrbits();
}

function startSimulation() {
  console.log("🟢 Starting simulation...");
  logStatus("🟢 Simulation started.");
}

function stopSimulation() {
  console.log("🔴 Stopping simulation...");
  logStatus("🔴 Simulation stopped.");
  if (warpCountdownInterval) clearInterval(warpCountdownInterval);
  controlsLocked = false;
  updateControlState();
  updateHUDStatus("🟠 Idle");
}

function engageWarp() {
  console.log("⚡ Warp engaged!");
  logStatus("⚡ Warp engaged.");

  autoCalculateGVE();
  const { etaSeconds, dAU } = computeETASeconds();
  logStatus(`⏳ ETA: ${Math.round(etaSeconds)} sec | Distance: ${dAU} AU`);

  drawCurve();
  validateGR();

  startWarpCountdown(etaSeconds);
  controlsLocked = true;
  updateControlState();
  updateMissionStatusETA(etaSeconds);
  updateHUDStatus("🚀 In Warp");
}

function startWarpCountdown(duration) {
  let remaining = Math.round(duration);
  if (warpCountdownInterval) clearInterval(warpCountdownInterval);

  logStatus(`🕒 Warp countdown started: ${remaining} sec`);

  warpCountdownInterval = setInterval(() => {
    remaining -= fastMode ? 5 : 1;
    remaining = Math.max(remaining, 0);

    logStatus(`⏳ Time left: ${remaining} sec`);
    updateMissionStatusETA(remaining);

    if (remaining <= 0) {
      clearInterval(warpCountdownInterval);
      logStatus("✅ Arrived at destination. Warp complete.");
      controlsLocked = false;
      updateControlState();
      updateHUDStatus("✅ Arrived");
    }
  }, 1000);
}

function updateControlState() {
  ["startBtn", "engageBtn", "destination", "warpSpeed"].forEach(id => {
    document.getElementById(id).disabled = controlsLocked;
  });
}

function addMissionStatusBox() {
  const panel = document.getElementById("flight-plan");
  const box = document.createElement("div");
  box.id = "mission-status";
  box.style.background = "#111";
  box.style.color = "#0f0";
  box.style.padding = "6px";
  box.style.marginTop = "8px";
  box.style.fontSize = "12px";
  box.innerHTML = `CST: --:--<br>ETA: -- sec`;
  panel.appendChild(box);
}

function updateMissionStatusTime(now) {
  const box = document.getElementById("mission-status");
  if (box) {
    const lines = box.innerHTML.split("<br>");
    box.innerHTML = `CST: ${now.toLocaleTimeString()}<br>` + lines[1];
  }
}

function updateMissionStatusETA(seconds) {
  const box = document.getElementById("mission-status");
  if (box) {
    const lines = box.innerHTML.split("<br>");
    box.innerHTML = lines[0] + `<br>ETA: ${seconds} sec`;
  }
}

function addHUDIndicators() {
  const hud = document.getElementById("hud");
  const phase = document.createElement("div");
  phase.id = "hud-status";
  phase.style.margin = "6px 0";
  phase.style.fontWeight = "bold";
  phase.style.color = "#fff";
  phase.textContent = "🟠 Idle";
  hud.prepend(phase);
}

function updateHUDStatus(statusText) {
  const label = document.getElementById("hud-status");
  if (label) label.textContent = statusText;
}

function addScreenshotButton() {
  const panel = document.getElementById("ship-view");
  const btn = document.createElement("button");
  btn.textContent = "📷 Screenshot";
  btn.style.marginTop = "6px";
  btn.addEventListener("click", () => {
    html2canvas(document.body).then(canvas => {
      const link = document.createElement("a");
      link.download = "warp_screenshot.png";
      link.href = canvas.toDataURL();
      link.click();
    });
  });
  panel.appendChild(btn);
}
