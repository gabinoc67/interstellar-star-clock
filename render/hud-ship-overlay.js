// ✅ render/hud-ship-overlay.js – Full HUD with Alerts, Compass, and Responsive Menu

window.addEventListener("DOMContentLoaded", () => {
  const hud = document.getElementById("hud");

  // 🔄 Compass Heading
  const compass = document.createElement("div");
  compass.innerHTML = `
    <div id="compass" style="color:#ffa; text-align:center; font-size:1.1rem; margin:4px 0;">
      🧭 Heading: <span id="heading-angle">000</span>°
    </div>
  `;
  hud.appendChild(compass);

  // 🖼 Ship 3D Render
  const shipRender = document.createElement("div");
  shipRender.innerHTML = `
    <div style="margin:8px 0; text-align:center;">
      <h4 style="color:#fff;">🛸 Ship Display</h4>
      <img src="/main/ship_render.png" alt="Ship Model" id="ship3d" style="width:150px; animation: rotate 10s linear infinite;">
    </div>
  `;
  hud.appendChild(shipRender);

  // 🔃 Tab Buttons
  const tabBar = document.createElement("div");
  tabBar.style.display = "flex";
  tabBar.style.flexWrap = "wrap";
  tabBar.style.gap = "6px";
  tabBar.style.marginBottom = "4px";

  const tabs = ["Core", "Shield", "Sensors"];
  const tabContent = document.createElement("div");
  tabContent.id = "systems-box";
  tabContent.style.display = "block";

  tabs.forEach(name => {
    const btn = document.createElement("button");
    btn.textContent = name;
    btn.style.padding = "4px 8px";
    btn.addEventListener("click", () => switchTab(name));
    tabBar.appendChild(btn);
  });

  // 📱 Responsive Menu Toggle
  const menuToggle = document.createElement("button");
  menuToggle.textContent = "📦 Menu";
  menuToggle.style.margin = "4px 0";
  menuToggle.addEventListener("click", () => {
    tabContent.style.display = tabContent.style.display === "none" ? "block" : "none";
  });

  hud.appendChild(menuToggle);
  hud.appendChild(tabBar);
  hud.appendChild(tabContent);

  const tabData = {
    Core: `
      <h4 style="color:#0ff;">Ship Core ⚙️</h4>
      <div title="Displays internal energy distribution">
        ⚡ Core Load: <progress id="core-load" value="60" max="100"></progress><br>
        🌀 Warp Matrix: <progress id="warp-matrix" value="40" max="100"></progress>
      </div>
    `,
    Shield: `
      <h4 style="color:#6f6;">Shield Integrity 🛡</h4>
      <div title="Protects from cosmic debris and radiation">
        Status: <progress id="shield-bar" value="80" max="100"></progress>
      </div>
    `,
    Sensors: `
      <h4 style="color:#ffa500;">Deep Space Sensors 📡</h4>
      <div title="Monitors external conditions and hazards">
        ☢️ Radiation Level: <progress id="rad-bar" value="15" max="100"></progress><br>
        📡 Signal Strength: <progress id="signal-bar" value="50" max="100"></progress>
      </div>
    `
  };

  function switchTab(name) {
    tabContent.innerHTML = tabData[name];
  }

  switchTab("Core");
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
    const heading = document.getElementById("heading-angle");

    if (radBar) {
      let r = 10 + Math.random() * 30;
      radBar.value = r;
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
      if (s < 60) {
        document.body.style.boxShadow = "0 0 30px red";
        console.warn(`🛡 Shield Warning: ${Math.round(s)}%`);
      }
    }

    if (signalBar) signalBar.value = 30 + Math.random() * 60;
    if (core) core.value = 50 + Math.random() * 40;
    if (warp) warp.value = 30 + Math.random() * 50;
    if (heading) heading.textContent = `${Math.floor(Math.random() * 360).toString().padStart(3, '0')}`;

    updateVectorDisplay();
  }, 2000);
}

function updateVectorDisplay() {
  const warp = document.getElementById("warp-matrix");
  const gveOut = document.getElementById("gve-output");
  if (warp && gveOut) {
    gveOut.textContent = `Vector Integrity: ${Math.round(warp.value)}
