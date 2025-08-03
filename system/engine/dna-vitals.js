// ✅ system/engine/dna-vitals.js – Crew DNA & Vitals Monitor System

window.addEventListener("DOMContentLoaded", () => {
  const vitalsPanel = document.getElementById("hud");

  const dnaBox = document.createElement("div");
  dnaBox.id = "dna-monitor";
  dnaBox.style.background = "#111";
  dnaBox.style.color = "#0ff";
  dnaBox.style.fontSize = "13px";
  dnaBox.style.padding = "8px";
  dnaBox.style.marginTop = "8px";
  dnaBox.style.border = "1px solid #0ff";
  dnaBox.style.borderRadius = "6px";

  dnaBox.innerHTML = `
    <h4>🧬 DNA & Neural Sync</h4>
    <div>DNA Signature: <span id="dna-code">---</span></div>
    <div>Neural Sync: <span id="neural-sync">---</span></div>
    <div>Status: <span id="dna-status">Monitoring...</span></div>
  `;

  vitalsPanel?.appendChild(dnaBox);
  updateDNAVitals();
  setInterval(updateDNAVitals, 5000);
});

function updateDNAVitals() {
  const dnaCode = generateDNA();
  const sync = (90 + Math.random() * 10).toFixed(2);
  const danger = Math.random() < 0.05;

  document.getElementById("dna-code").textContent = dnaCode;
  document.getElementById("neural-sync").textContent = `${sync}%`;

  const statusEl = document.getElementById("dna-status");
  if (danger) {
    statusEl.textContent = "⚠️ Sync Disruption Detected!";
    statusEl.style.color = "red";
  } else {
    statusEl.textContent = "Stable";
    statusEl.style.color = "#0f0";
  }
}

function generateDNA() {
  const bases = ['A', 'T', 'C', 'G'];
  let sequence = '';
  for (let i = 0; i < 12; i++) {
    sequence += bases[Math.floor(Math.random() * bases.length)];
  }
  return sequence;
}
