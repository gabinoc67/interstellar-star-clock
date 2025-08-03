// ✅ render/hud-ship-overlay.js – Console, Life Support, HUD Mirror Integration

window.addEventListener("DOMContentLoaded", () => {
  const hud = document.getElementById("hud");

  // 🧭 Compass Heading
  const compass = document.createElement("div");
  compass.innerHTML = `
    <div id="compass" style="color:#ffa; text-align:center; font-size:1.1rem; margin:4px 0;">
      🧭 Heading: <span id="heading-angle">000</span>°
    </div>
  `;
  hud.appendChild(compass);

  // 🛸 Ship Render
  const shipRender = document.createElement("div");
  shipRender.innerHTML = `
    <div style="margin:8px 0; text-align:center;">
      <h4 style="color:#fff;">🛸 Ship Display</h4>
      <img src="/main/ship_render.png" alt="Ship Model" id="ship3d" style="width:150px; transform: rotateZ(0deg); transition: transform 0.5s linear;">
    </div>
  `;
  hud.appendChild(shipRender);

  // 📤 CSV Export Button
  const exportBtn = document.createElement("button");
  exportBtn.textContent = "📤 Download Vitals CSV";
  exportBtn.addEventListener("click", exportVitalsCSV);
  hud.appendChild(exportBtn);

  // 🎛 Command Override Console
  const consoleBox = document.createElement("div");
  consoleBox.innerHTML = `
    <h4 style="color:#f0f;">🎛 Command Console</h4>
    <input type="text" id="cmdInput" placeholder="Enter command..." style="width:80%; padding:4px;">
    <button onclick="runConsoleCommand()">Run</button>
    <div id="cmdLog" style="font-size:0.9rem; margin-top:6px; max-height:80px; overflow:auto; background:#111; padding:4px; border-radius:4px;"></div>
  `;
  hud.appendChild(consoleBox);

  // 🧪 Life Support Panel
  const lifeSupport = document.createElement("div");
  lifeSupport.innerHTML = `
    <h4 style="color:#0cf;">🧪 Life Support</h4>
    O₂ Level: <progress id="o2-bar" value="98" max="100"></progress><br>
    CO₂ Level: <progress id="co2-bar" value="10" max="100"></progress><br>
    Temp (°F): <progress id="temp-bar" value="72" max="120"></progress>
  `;
  hud.appendChild(lifeSupport);

  // 🌐 HUD Mirror (right panel)
  const mirror = document.createElement("iframe");
  mirror.srcdoc = `
    <html><body style='background:#000; color:#0f0; font-family:monospace;'>
    <h3>📡 HUD Mirror Active</h3>
    <div id='mirror-content'>Waiting for sync...</div>
    <script>
      window.addEventListener('message', e => {
        document.getElementById('mirror-content').innerHTML = e.data;
      });
    </script>
    </body></html>
  `;
  mirror.style.width = "100%";
  mirror.style.height = "180px";
  hud.appendChild(mirror);

  setInterval(() => mirror.contentWindow.postMessage(document.getElementById("systems-box")?.innerHTML || "", "*"), 2000);

  switchTab("Core");
  simulateVitals();
});

let curveAngle = 0;
let vitalsLog = [];

function simulateVitals() {
  const audio = new Audio("https://www.soundjay.com/button/beep-07.wav");
  audio.volume = 0.4;

  setInterval(() => {
    const radBar = document.getElementById("rad-bar");
    const shieldBar = document.getElementById("shield-bar");
    const signalBar = document.getElementById("signal-bar");
    const core = document.getElementById("core-load");
    const warp = document.getElementById("warp-matrix");
    const heading = document.getElementById("heading-angle");
    const ship3d = document.getElementById("ship3d");

    const now = new Date().toLocaleTimeString();
    const data = { time: now };

    if (radBar) {
      let r = 10 + Math.random() * 30;
      radBar.value = r;
      data.radiation = Math.round(r);
      if (r > 35) {
        audio.play();
        document.body.style.boxShadow = "0 0 30px red";
        console.warn(`☢️ High Radiation Level: ${Math.round(r)}%`);
      } else {
        document.body.style.boxShadow = "none";
      }
    }

    if (shieldBar) {
      let s = 75 + Math.random() * 20;
      if (warp && warp.value > 75) s -= 5;
      shieldBar.value = s;
      data.shield = Math.round(s);
      if (s < 60) {
        document.body.style.boxShadow = "0 0 30px red";
        console.warn(`🛡 Shield Warning: ${Math.round(s)}%`);
      }
    }

    if (signalBar) {
      let sig = 30 + Math.random() * 60;
      signalBar.value = sig;
      data.signal = Math.round(sig);
    }

    if (core) {
      let c = 50 + Math.random() * 40;
      core.value = c;
      data.core = Math.round(c);
    }

    if (warp) {
      let w = 30 + Math.random() * 50;
      warp.value = w;
      data.warp = Math.round(w);
    }

    if (heading) {
      let ang = Math.floor((curveAngle % 360));
      heading.textContent = ang.toString().padStart(3, '0');
      data.heading = ang;
    }

    if (ship3d) {
      ship3d.style.transform = `rotateZ(${curveAngle}deg)`;
    }

    // 🧪 Life Support values
    const o2 = document.getElementById("o2-bar");
    const co2 = document.getElementById("co2-bar");
    const temp = document.getElementById("temp-bar");
    if (o2) o2.value = 95 + Math.random() * 5;
    if (co2) co2.value = 10 + Math.random() * 30;
    if (temp) temp.value = 70 + Math.random() * 20;

    curveAngle += 5;
    vitalsLog.push(data);
    updateVectorDisplay();
  }, 2000);
}

function updateVectorDisplay() {
  const warp = document.getElementById("warp-matrix");
  const gveOut = document.getElementById("gve-output");
  if (warp && gveOut) {
    gveOut.textContent = `Vector Integrity: ${Math.round(warp.value)}%`;
  }
}

function exportVitalsCSV() {
  let csv = "Time,Heading,Core,Warp,Shield,Radiation,Signal\n";
  vitalsLog.forEach(d => {
    csv += `${d.time},${d.heading || ""},${d.core || ""},${d.warp || ""},${d.shield || ""},${d.radiation || ""},${d.signal || ""}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "vitals-log.csv";
  a.click();
}

function runConsoleCommand() {
  const cmd = document.getElementById("cmdInput").value.trim().toLowerCase();
  const log = document.getElementById("cmdLog");
  if (!cmd) return;
  const out = document.createElement("div");

  if (cmd.includes("shutdown")) {
    out.textContent = "🛑 Systems shutting down...";
  } else if (cmd.includes("boost")) {
    out.textContent = "⚡ Warp boosted to max!";
    const warp = document.getElementById("warp-matrix");
    if (warp) warp.value = 100;
  } else if (cmd.includes("log")) {
    exportVitalsCSV();
    out.textContent = "📤 Log exported.";
  } else {
    out.textContent = `❓ Unknown command: ${cmd}`;
  }

  log.appendChild(out);
  document.getElementById("cmdInput").value = "";
}
