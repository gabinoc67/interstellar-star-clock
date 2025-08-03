// ✅ render/hud-ship-overlay.js – Ship Interior + Radiation + Shield Health + Alerts + Sensor

window.addEventListener("DOMContentLoaded", () => {
  const hud = document.getElementById("hud");

  // 🔋 Ship Core
  const shipCore = document.createElement("div");
  shipCore.innerHTML = `
    <div style="margin-top:10px">
      <h4 style="color:#0ff; margin:4px 0;">Ship Core</h4>
      <div style="display:flex; flex-direction:column; gap:6px;">
        <div><span style="color:#ccc">⚡ Core Load:</span> <progress id="core-load" value="60" max="100"></progress></div>
        <div><span style="color:#ccc">🌀 Warp Matrix:</span> <progress id="warp-matrix" value="40" max="100"></progress></div>
      </div>
    </div>
  `;

  // ☢️ Radiation Monitor
  const radMonitor = document.createElement("div");
  radMonitor.innerHTML = `
    <div style="margin-top:10px">
      <h4 style="color:#f66; margin:4px 0;">Radiation Monitor</h4>
      <div><span style="color:#ccc">☢️ Level:</span> <progress id="rad-bar" value="15" max="100"></progress></div>
    </div>
  `;

  // 🛡 Shield Health
  const shieldStat = document.createElement("div");
  shieldStat.innerHTML = `
    <div style="margin-top:10px">
      <h4 style="color:#6f6; margin:4px 0;">Shield Integrity</h4>
      <div><span style="color:#ccc">🛡 Status:</span> <progress id="shield-bar" value="80" max="100"></progress></div>
    </div>
  `;

  // 📡 Deep Space Sensor
  const sensorPanel = document.createElement("div");
  sensorPanel.innerHTML = `
    <div style="margin-top:10px">
      <h4 style="color:#ffa500; margin:4px 0;">Deep Space Sensor</h4>
      <div><span style="color:#ccc">📡 Signal Strength:</span> <progress id="signal-bar" value="50" max="100"></progress></div>
    </div>
  `;

  // 📦 Collapsible Container
  const toggleBtn = document.createElement("button");
  toggleBtn.textContent = "🧰 Toggle HUD Systems";
  toggleBtn.style.margin = "6px 0";
  toggleBtn.style.padding = "4px 8px";

  const systemBox = document.createElement("div");
  systemBox.id = "systems-box";
  systemBox.style.display = "block";

  systemBox.appendChild(shipCore);
  systemBox.appendChild(radMonitor);
  systemBox.appendChild(shieldStat);
  systemBox.appendChild(sensorPanel);
  hud.appendChild(toggleBtn);
  hud.appendChild(systemBox);

  toggleBtn.addEventListener("click", () => {
    systemBox.style.display = systemBox.style.display === "none" ? "block" : "none";
  });

  simulateVitals();
});

function simulateVitals() {
  const audio = new Audio("https://www.soundjay.com/button/beep-07.wav");
  audio.volume = 0.4;

  setInterval(() => {
    const radBar = document.getElementById("rad-bar");
    const shieldBar = document.getElementById("shield-bar");
    const signalBar = document.getElementById("signal-bar");
    const core = document.getElementById("core-load");
    const warp = document.getElementById("warp-matrix");

    if (radBar) {
      let r = 10 + Math.random() * 30;
      radBar.value = r;
      if (r > 35) audio.play();
    }
    if (shieldBar) shieldBar.value = 75 + Math.random() * 20;
    if (signalBar) signalBar.value = 30 + Math.random() * 60;
    if (core) core.value = 50 + Math.random() * 40;
    if (warp) warp.value = 30 + Math.random() * 50;
  }, 2000);
}
