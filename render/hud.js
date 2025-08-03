// ✅ render/hud.js – Flight Log & System Status

const hudBox = document.createElement("div");
hudBox.id = "flight-log";
hudBox.style.background = "#0003";
hudBox.style.color = "#fff";
hudBox.style.fontSize = "12px";
hudBox.style.padding = "8px";
hudBox.style.borderTop = "1px solid #444";
hudBox.style.maxHeight = "100px";
hudBox.style.overflowY = "auto";

// Attach to flight plan panel on load
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("flight-plan").appendChild(hudBox);
  logStatus("📡 Warp HUD initialized.");
});

// ✅ Append a line to the flight log
function logStatus(msg) {
  const line = document.createElement("div");
  const timestamp = new Date().toLocaleTimeString();
  line.textContent = `[${timestamp}] ${msg}`;
  hudBox.appendChild(line);
  hudBox.scrollTop = hudBox.scrollHeight;
}
