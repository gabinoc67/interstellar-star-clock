// ✅ system/engine/hull-breach.js – Hull Breach Detection & Repair

window.addEventListener("DOMContentLoaded", () => {
  const panel = document.getElementById("hud");

  const breachBox = document.createElement("div");
  breachBox.id = "hull-breach-panel";
  breachBox.style.background = "#300";
  breachBox.style.color = "#f66";
  breachBox.style.fontSize = "13px";
  breachBox.style.padding = "8px";
  breachBox.style.marginTop = "8px";
  breachBox.style.border = "1px solid #900";
  breachBox.style.borderRadius = "6px";

  breachBox.innerHTML = `
    <h4>🛠 Hull Integrity Monitor</h4>
    <div>Integrity: <progress id="hull-bar" max="100" value="100" style="width:100%"></progress></div>
    <div>Status: <span id="hull-status">Nominal</span></div>
    <button id="repair-btn" style="margin-top:6px;">🔧 Auto-Repair</button>
  `;

  panel?.appendChild(breachBox);
  document.getElementById("repair-btn").addEventListener("click", repairHull);

  setInterval(simulateHullDamage, 7000);
});

function simulateHullDamage() {
  const bar = document.getElementById("hull-bar");
  const status = document.getElementById("hull-status");

  if (!bar || !status) return;

  const drop = Math.random() * 10;
  bar.value = Math.max(0, bar.value - drop);

  if (bar.value < 40) {
    status.textContent = "⚠️ Breach Risk!";
    status.style.color = "red";
  } else {
    status.textContent = "Nominal";
    status.style.color = "#0f0";
  }

  if (bar.value <= 0) {
    status.textContent = "❌ Critical Breach!";
  }
}

function repairHull() {
  const bar = document.getElementById("hull-bar");
  const status = document.getElementById("hull-status");
  if (bar) {
    bar.value = 100;
    status.textContent = "Repaired";
    status.style.color = "#0f0";
  }
}
