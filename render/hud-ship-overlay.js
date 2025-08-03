// ✅ render/hud-ship-overlay.js – Ship Interior + Radiation + Shield Health

window.addEventListener("DOMContentLoaded", () => {
  const hud = document.getElementById("hud");

  // 🔋 Power Core & Warp Matrix
  const shipCore = document.createElement("div");
  shipCore.innerHTML = `
    <div style="margin-top:10px">
      <h4 style="color:#0ff; margin:4px 0;">Ship Core</h4>
      <div style="display:flex; flex-direction:column; gap:6px;">
        <div><span style="color:#ccc">⚡ Core Load:</span> <progress value="60" max="100"></progress></div>
        <div><span style="color:#ccc">🌀 Warp Matrix:</span> <progress value="40" max="100"></progress></div>
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

  hud.appendChild(shipCore);
  hud.appendChild(radMonitor);
  hud.appendChild(shieldStat);

  simulateVitals();
});

function simulateVitals() {
  setInterval(() => {
    const radBar = document.getElementById("rad-bar");
    const shieldBar = document.getElementById("shield-bar");

    if (radBar) radBar.value = 10 + Math.random() * 30;
    if (shieldBar) shieldBar.value = 75 + Math.random() * 20;
  }, 2000);
}
