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
  const panel = document.getElementById("flight-plan");
  panel.appendChild(hudBox);

  const dlBtn = document.createElement("button");
  dlBtn.textContent = "Download Log";
  dlBtn.style.marginTop = "8px";
  dlBtn.onclick = downloadFlightLog;
  panel.appendChild(dlBtn);

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

// 📥 Export log as CSV
function downloadFlightLog() {
  const lines = Array.from(hudBox.children).map(line => line.textContent);
  const csvContent = "data:text/csv;charset=utf-8," + lines.join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "warp_flight_log.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
