// ✅ system/engine/copilot-ai.js – AI Copilot Warning System

window.addEventListener("DOMContentLoaded", () => {
  const copilotBox = document.createElement("div");
  copilotBox.id = "copilot-box";
  copilotBox.style.background = "#111";
  copilotBox.style.color = "#0f0";
  copilotBox.style.fontSize = "13px";
  copilotBox.style.padding = "8px";
  copilotBox.style.border = "1px solid #0f0";
  copilotBox.style.marginTop = "8px";
  copilotBox.style.borderRadius = "6px";

  copilotBox.innerHTML = `<h4>🛠 AI Copilot</h4><div id="ai-log">Initializing copilot system...</div>`;

  const panel = document.getElementById("flight-plan") || document.body;
  panel.appendChild(copilotBox);

  setTimeout(() => aiLog("✅ Copilot online. Monitoring vitals..."), 1000);
  setInterval(analyzeVitals, 4000);
});

function aiLog(msg) {
  const log = document.getElementById("ai-log");
  if (log) {
    const ts = new Date().toLocaleTimeString();
    const entry = document.createElement("div");
    entry.textContent = `[${ts}] ${msg}`;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
  }
}

function analyzeVitals() {
  const rad = document.getElementById("rad-bar")?.value || 0;
  const shield = document.getElementById("shield-bar")?.value || 100;
  const warp = document.getElementById("warp-matrix")?.value || 0;

  if (rad > 35) aiLog("⚡ Radiation spike detected. Recommend shielding or reroute.");
  if (shield < 60) aiLog("🛡 Shield weakening. Suggest energy diversion.");
  if (warp > 90) aiLog("🚀 Warp output unstable. Risk of disintegration.");
}
