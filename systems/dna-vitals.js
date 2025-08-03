// ✅ systems/dna-vitals.js – Neural Sync + Crew DNA Monitor

window.addEventListener("DOMContentLoaded", () => {
  const hud = document.getElementById("hud");

  // 🧬 DNA & Neural Sync Panel
  const dnaPanel = document.createElement("div");
  dnaPanel.innerHTML = `
    <h4 style="color:#f8f;">🧬 Neural Sync & DNA Vitals</h4>
    <div style="display:flex; flex-direction:column; gap:4px; font-size:12px;">
      DNA Match: <progress id="dna-match" value="92" max="100"></progress>
      Neural Sync: <progress id="neural-sync" value="87" max="100"></progress>
      Heart Rate: <progress id="heart-rate" value="78" max="200"></progress>
      Brainwave Sync: <progress id="brainwave" value="65" max="100"></progress>
    </div>
    <button id="dna-export" style="margin-top:6px;">📤 Export DNA Vitals</button>
  `;
  hud.appendChild(dnaPanel);

  simulateDNAVitals();

  document.getElementById("dna-export").addEventListener("click", exportDNAVitals);
});

const dnaVitalsLog = [];

function simulateDNAVitals() {
  setInterval(() => {
    const now = new Date().toLocaleTimeString();
    const match = 85 + Math.random() * 15;
    const sync = 80 + Math.random() * 20;
    const heart = 60 + Math.random() * 60;
    const brain = 50 + Math.random() * 50;

    document.getElementById("dna-match").value = match;
    document.getElementById("neural-sync").value = sync;
    document.getElementById("heart-rate").value = heart;
    document.getElementById("brainwave").value = brain;

    dnaVitalsLog.push({ time: now, match, sync, heart, brain });
  }, 4000);
}

function exportDNAVitals() {
  let csv = "Time,DNA Match,Neural Sync,Heart Rate,Brainwave Sync\n";
  dnaVitalsLog.forEach(d => {
    csv += `${d.time},${Math.round(d.match)},${Math.round(d.sync)},${Math.round(d.heart)},${Math.round(d.brain)}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "dna-vitals.csv";
  a.click();
}
