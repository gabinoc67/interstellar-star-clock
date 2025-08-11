// --- Constants & State -------------------------------------------------------
const TZ = "America/Chicago"; // locked CST/CDT demo
const WARP_MIN = 1, WARP_MAX = 10;
const TIME_SCALES = [1, 10, 100, 1000, 1_000_000]; // real→sim accelerated

const state = {
  warp: 1,
  scale: 1,
  heading: 0,
  engaged: false,
  destClass: "Planet",
  targetName: "",
  t0Wall: 0,       // real wall-clock ms at engage
  t0Sim: 0,        // simulated ms at engage
  simElapsed: 0,   // ms simulated total
};

// --- DOM Helpers -------------------------------------------------------------
const $ = sel => document.querySelector(sel);
const clockEl = $("#cst-clock");
const bioEl = $("#biorhythm");
const headingEl = $("#heading");
const speedCEl = $("#speedC");
const bubbleVEl = $("#bubbleV");
const pulseEl = $("#pulse");
const etaEl = $("#eta");
const pcPerYrEl = $("#pcPerYr");
const travelTimeEl = $("#travel-time");
const depEl = $("#dep");
const arrEl = $("#arr");
const logEl = $("#log");
const missionsEl = $("#missions");
const canvas = $("#nav-canvas");
const ctx = canvas.getContext("2d");

// Build warp buttons & time-scale chips
(function initControls(){
  const wb = $("#warp-buttons");
  for(let w=WARP_MIN; w<=WARP_MAX; w++){
    const b = document.createElement("button");
    b.className = "chip";
    b.textContent = `Warp ${w}`;
    b.setAttribute("data-warp", w);
    b.addEventListener("click", () => setWarp(w));
    wb.appendChild(b);
  }
  const ts = $("#time-scale");
  TIME_SCALES.forEach(s=>{
    const b = document.createElement("button");
    b.className = "chip";
    b.textContent = s.toLocaleString() + "×";
    b.setAttribute("data-scale", s);
    b.addEventListener("click", ()=> setScale(s));
    ts.appendChild(b);
  });

  // Radios + target name
  document.querySelectorAll('[name="destClass"]').forEach(r=>{
    r.addEventListener("change", ()=> state.destClass = r.value);
  });
  $("#target-name").addEventListener("input", e=> state.targetName = e.target.value.trim());

  $("#engage").addEventListener("click", toggleEngage);
  $("#save-mission").addEventListener("click", onSaveMission);
  $("#reset-all").addEventListener("click", resetAll);
  $("#reset-metrics").addEventListener("click", resetMetrics);
  $("#test-alarm").addEventListener("click", ()=> log("Alarm: test tone OK", "warn"));

  // restore persisted selection
  const save = JSON.parse(localStorage.getItem("warpDemo:v1")||"{}");
  if(save.warp) setWarp(save.warp);
  if(save.scale) setScale(save.scale);
  if(save.destClass) {
    state.destClass = save.destClass;
    const r = document.querySelector(`[name="destClass"][value="${state.destClass}"]`);
    if(r) r.checked = true;
  }
  if(save.targetName){ state.targetName=save.targetName; $("#target-name").value = save.targetName; }
  renderMissions();
})();

// --- CST Clock ---------------------------------------------------------------
function tickCST(){
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-US", { hour12:false, timeZone:TZ,
    hour:"2-digit", minute:"2-digit", second:"2-digit" });
  clockEl.textContent = fmt.format(now);
}
setInterval(tickCST, 250); tickCST();

// --- Warp Model (placeholder, swap with your physics) -----------------------
// Simple toy model: v/c ≈ α * warp^3  (α=0.1) clamped at 10c equivalent bubble velocity.
// Pulse rate scales with warp; loop efficiency gently falls off with warp.
function modelForWarp(w){
  const alpha = 0.1;
  const vOverC = Math.min(alpha * Math.pow(w,3), 10); // "effective" bubble velocity (sci-fi)
  const pulseMHz = (w * 12.5);    // arbitrary demo scale
  const loopEta  = Math.max(0.998 - w*0.02, 0.70); // 0.998→0.78
  const pcPerYr  = vOverC / 3.26; // 1c ~= 1/3.26 pc/yr
  return { vOverC, pulseMHz, loopEta, pcPerYr };
}

// --- Engage / Sim Time -------------------------------------------------------
let rafId = null, lastWall = performance.now();

function toggleEngage(){
  state.engaged = !state.engaged;
  if(state.engaged){
    state.t0Wall = performance.now();
    state.t0Sim  = state.simElapsed;
    log(`Engaged at Warp ${state.warp} → ${state.destClass} ${state.targetName||"—"}`, "ok");
    loop();
  } else {
    cancelAnimationFrame(rafId);
    log("Disengaged", "warn");
  }
}

function loop(now=performance.now()){
  const dtWall = now - lastWall;
  lastWall = now;
  // advance simulated time by scale
  state.simElapsed = state.t0Sim + ( (now - state.t0Wall) * state.scale );
  updateMetrics(dtWall);
  drawNav();
  if(state.engaged) rafId = requestAnimationFrame(loop);
}

function updateMetrics(/*dtWall*/){
  const { vOverC, pulseMHz, loopEta, pcPerYr } = modelForWarp(state.warp);

  speedCEl.textContent  = vOverC.toFixed(2) + " c";
  bubbleVEl.textContent = vOverC.toFixed(2) + " c";
  pulseEl.textContent   = pulseMHz.toFixed(1) + " MHz";
  etaEl.textContent     = loopEta.toFixed(3);
  pcPerYrEl.textContent = pcPerYr.toFixed(3);

  // travel time (sim)
  const ms = state.simElapsed;
  const s = Math.floor(ms/1000)%60;
  const m = Math.floor(ms/60000)%60;
  const h = Math.floor(ms/3600000);
  const ms3 = Math.floor(ms%1000).toString().padStart(3,"0");
  travelTimeEl.textContent = `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}.${ms3}`;

  // heading animation (simple sweep while engaged)
  if(state.engaged){
    state.heading = (state.heading + (0.02 * state.scale) ) % 360;
    headingEl.textContent = String(Math.round(state.heading)).padStart(3,"0") + "°";
  }
}

// --- Drawing ----------------------------------------------------------------
function drawNav(){
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0,0,w,h);

  // star grid
  ctx.strokeStyle = "#1e2a3b"; ctx.lineWidth = 1;
  for(let x=0; x<w; x+=35){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
  for(let y=0; y<h; y+=35){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }

  // compass ring
  const cx = w*0.5, cy = h*0.6, R = Math.min(w,h)*0.35;
  ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.strokeStyle="#3a516f"; ctx.lineWidth=2; ctx.stroke();

  // heading needle
  const ang = (state.heading-90) * Math.PI/180;
  const nx = cx + Math.cos(ang)*R, ny = cy + Math.sin(ang)*R;
  ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(nx,ny);
  ctx.strokeStyle="#6ae3ff"; ctx.lineWidth=3; ctx.stroke();

  // warp bubble (radius grows with v/c)
  const v = modelForWarp(state.warp).vOverC;
  const r = 18 + v*6;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
  ctx.strokeStyle="#49d39b"; ctx.lineWidth=2; ctx.stroke();
}

// --- UI Mutators -------------------------------------------------------------
function setWarp(w){
  state.warp = w;
  document.querySelectorAll("#warp-buttons .chip").forEach(b=>{
    b.setAttribute("aria-pressed", b.dataset.warp==w ? "true" : "false");
  });
  persist();
  updateMetrics();
  drawNav();
}
function setScale(s){
  state.scale = s;
  document.querySelectorAll("#time-scale .chip").forEach(b=>{
    b.setAttribute("aria-pressed", b.dataset.scale==s ? "true" : "false");
  });
  persist();
}
function resetMetrics(){
  state.simElapsed = 0;
  state.heading = 0;
  updateMetrics();
  drawNav();
  log("Metrics reset", "muted");
}
function resetAll(){
  localStorage.removeItem("warpDemo:v1");
  location.reload();
}
function persist(){
  const save = {
    warp: state.warp, scale: state.scale,
    destClass: state.destClass, targetName: state.targetName
  };
  localStorage.setItem("warpDemo:v1", JSON.stringify(save));
  $("#arr").textContent = state.targetName || "—";
}

// --- Missions ----------------------------------------------------------------
function onSaveMission(){
  const key = "warpDemo:missions";
  const missions = JSON.parse(localStorage.getItem(key)||"[]");
  const rec = {
    id: crypto.randomUUID(),
    t: new Date().toISOString(),
    warp: state.warp,
    scale: state.scale,
    destClass: state.destClass,
    target: state.targetName || "(unspecified)"
  };
  missions.unshift(rec);
  localStorage.setItem(key, JSON.stringify(missions));
  log(`Saved mission: Warp ${rec.warp} → ${rec.destClass} ${rec.target}`, "ok");
  renderMissions();
}

function renderMissions(){
  const key = "warpDemo:missions";
  const missions = JSON.parse(localStorage.getItem(key)||"[]");
  missionsEl.innerHTML = "";
  missions.forEach(m=>{
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <div><strong>Warp ${m.warp}</strong> → ${m.destClass} <em>${escapeHtml(m.target)}</em></div>
        <div class="meta">${new Date(m.t).toLocaleString()}</div>
      </div>
      <div style="display:flex;gap:6px;">
        <button class="ghost" data-load="${m.id}">Load</button>
        <button class="ghost" data-del="${m.id}">Delete</button>
      </div>`;
    missionsEl.appendChild(li);
  });
  missionsEl.querySelectorAll("[data-load]").forEach(b=>{
    b.addEventListener("click", ()=>{
      const id = b.getAttribute("data-load");
      loadMission(id);
    });
  });
  missionsEl.querySelectorAll("[data-del]").forEach(b=>{
    b.addEventListener("click", ()=>{
      const id = b.getAttribute("data-del");
      const arr = JSON.parse(localStorage.getItem(key)||"[]").filter(x=>x.id!==id);
      localStorage.setItem(key, JSON.stringify(arr));
      renderMissions();
    });
  });
}

function loadMission(id){
  const key = "warpDemo:missions";
  const missions = JSON.parse(localStorage.getItem(key)||"[]");
  const m = missions.find(x=>x.id===id);
  if(!m) return;
  setWarp(m.warp);
  setScale(m.scale);
  state.destClass = m.destClass;
  const r = document.querySelector(`[name="destClass"][value="${m.destClass}"]`);
  if(r) r.checked = true;
  state.targetName = m.target; $("#target-name").value = m.target;
  persist();
  log(`Loaded mission ${id.slice(0,8)}…`, "ok");
}

// --- Log ---------------------------------------------------------------------
function log(msg, cls=""){
  const row = document.createElement("div");
  row.className = cls;
  row.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  logEl.prepend(row);
}

// --- Utilities ---------------------------------------------------------------
function escapeHtml(s){ return s.replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }

// initial paint
updateMetrics(); drawNav();
