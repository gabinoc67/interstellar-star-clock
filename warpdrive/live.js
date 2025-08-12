// live.js — single file server + UI + proxy + per-second live propagation
// Run: node live.js  (Node v18+)

import http from "node:http";
import { URL } from "node:url";

/* ----------------------- CONFIG YOU CAN EDIT ----------------------- */
const PORT = 8787;

// Edit your targets here (no separate files needed)
let TARGETS = {
  planets: [
    { name: "Mars",    type: "planet", horizonsId: "499" },
    { name: "Jupiter", type: "planet", horizonsId: "599" }
  ],
  stars: [
    { name: "Sirius",  type: "star",   ra: 101.2875, dec: -16.7161 }
  ]
};

// Allowlist for proxy (add hosts if needed)
const ALLOW = new Set([
  "ssd-api.jpl.nasa.gov", // NASA Horizons
  "mast.stsci.edu"        // Gaia TAP
]);

/* --------------------- EMBEDDED SINGLE-PAGE APP -------------------- */
const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>FTL Nav Console — Live (Single File)</title>
<style>
:root{--bg:#060a16;--card:#0f1630;--ink:#eaf0ff;--muted:#9fb0e0;--good:#3dd07f;--warn:#ffd166;--bad:#ef476f;--grid:16px}
*{box-sizing:border-box}
body{margin:0;background:linear-gradient(180deg,#060a16,#0b1233);color:var(--ink);font:16.5px/1.5 system-ui,Segoe UI,Roboto,Helvetica,Arial}
header{padding:24px 28px;border-bottom:1px solid rgba(255,255,255,.06);position:sticky;top:0;background:rgba(8,12,30,.78);backdrop-filter:blur(8px);z-index:50}
.wrap{padding:26px;max-width:1900px;margin:0 auto}
.grid{display:grid;grid-template-columns:repeat(12,1fr);gap:var(--grid)}
.card{background:var(--card);border:1px solid rgba(255,255,255,.06);border-radius:18px;padding:20px;box-shadow:0 10px 28px rgba(0,0,0,.28)}
.card h2{margin:0 0 10px 0;font-size:19px}
.row{display:grid;grid-template-columns:340px 96px 1.2fr 0.9fr 0.9fr 1fr 1fr 0.0fr 0.9fr 0.9fr 0.9fr 1.1fr 1fr;gap:12px;align-items:flex-start;padding:12px 0;border-bottom:1px dashed rgba(255,255,255,.08)}
.row.header{font-weight:700;color:#cbd5ff;border-bottom:1px solid rgba(255,255,255,.14);position:sticky;top:86px;background:linear-gradient(180deg,#0f1630,rgba(15,22,48,.6));z-index:5}
.row > div{min-height:24px}
.group{padding:10px 12px;margin:10px 0;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);font-weight:700;color:#b9c7ff}
.mono{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:1.06em;word-break:break-word}
.pill{display:inline-block;padding:4px 10px;border-radius:999px;background:rgba(255,255,255,.08);font-size:.95em}
.ok{color:var(--good)}.warn{color:var(--warn)}.bad{color:var(--bad)}
.small{font-size:13.3px;color:#9fb0e0}
button{background:#19234d;color:#eaf0ff;border:1px solid rgba(255,255,255,.16);padding:8px 12px;border-radius:12px;cursor:pointer;white-space:nowrap}
button:hover{background:#1e2a5c}
.scrolly{max-height:66vh;overflow:auto;padding-right:6px}
.banner{margin:12px 0;padding:12px 14px;border-radius:12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12)}
input{background:#0b1233;color:#eaf0ff;border:1px solid rgba(255,255,255,.16);padding:8px 10px;border-radius:9px;width:120px}
</style>
</head>
<body>
<header>
  <h1>FTL Nav Console — CST + Live</h1>
  <div class="small">Single-file server with built-in CORS proxy. Per-second live miles (propagated) + periodic Horizons refresh.</div>
</header>

<div class="wrap grid">
  <section class="card" style="grid-column: span 7">
    <h2>Quantum Clocks</h2>
    <div class="grid" style="grid-template-columns: repeat(3,1fr); gap:14px">
      <div><div class="small">Local Time (America/Chicago)</div><div class="mono" id="localTime">—</div><div class="small" id="tzName">—</div></div>
      <div><div class="small">Interstellar Time (demo)</div><div class="mono" id="interstellarYear">—</div></div>
      <div><div class="small">Stardate (demo)</div><div class="mono" id="stardate">—</div></div>
    </div>
    <div class="small" style="margin-top:6px">CST↔UTC offset: <span id="cstOffset">—</span> • UTC epoch: <span class="mono" id="utcEpoch">—</span></div>
    <div class="banner mono" id="statusBanner">Loading targets…</div>
  </section>

  <section class="card" style="grid-column: span 5">
    <h2>Solver Settings</h2>
    <div>
      <label>H₀ <input id="h0" type="number" step="0.1" value="70"></label>
      <label style="margin-left:10px">Tolerance (km) <input id="tolKm" type="number" step="100" value="10000"></label>
      <label style="margin-left:10px">Refresh (s) <input id="refreshSec" type="number" min="5" step="1" value="30"></label>
      <button id="applyRefresh" style="margin-left:10px">Apply</button>
    </div>
  </section>

  <section class="card" style="grid-column: span 12">
    <h2>Targets + CST Solver</h2>
    <div class="row header">
      <div>Name</div><div>Type</div><div>Live Vector (AU)</div><div>Dist. Sun</div><div>Dist. Earth</div>
      <div>Proper Motion</div><div>Radial Vel.</div><div>Distance</div><div>Rec. Vel</div>
      <div>Uncertainty</div><div>Last Update</div><div>Status</div><div>Actions</div>
    </div>
    <div id="targets" class="scrolly"></div>
    <div class="small" style="margin-top:10px">Actions → <b>Solve T<sub>c</sub></b> and <b>Shape Bubble</b>.</div>
  </section>
</div>

<script>
/*** CONFIG ***/
const TARGETS_URL = "/targets.json";
const PROXY = "/proxy?url=";
const HORIZONS = "https://ssd-api.jpl.nasa.gov/horizons.api";
const GAIA = "https://mast.stsci.edu/vo-tap/api/v0.1/gaiadr3/tap/sync";

/*** TIME & UNITS ***/
const AU_KM=149_597_870.700, KM_PER_MI=1.609344, MI_PER_AU=AU_KM/KM_PER_MI, C_KM_S=299_792.458;
const fmt=(n,d=6)=>Number(n).toFixed(d);
const fmtAU=x=>fmt(x,6)+" AU";
const fmtMi=x=>Number(x).toLocaleString(undefined,{minimumFractionDigits:1,maximumFractionDigits:1})+" miles";
const fmtISO=d=>new Date(d).toISOString().replace(".000Z","Z");
function chicagoNow(){const o={timeZone:'America/Chicago',hour12:true,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'};return new Intl.DateTimeFormat(undefined,o).format(new Date())}
function tzLabel(){try{return Intl.DateTimeFormat().resolvedOptions().timeZone}catch{return'Local TZ'}}
function interstellarYear(){const s=Date.now()/1000;const y=57_800_000+(s/31557600)*100;return "Year ~"+y.toFixed(2)}
function stardate(){const ms=Date.now();const base=Date.UTC(2323,0,1);const sd=1000*((ms-base)/31557600000);return "Stardate "+(sd/10).toFixed(1)}
function cstToUtcOffset(){const off=-new Date().getTimezoneOffset()/60;const s=off>=0?'+':'';return s+off.toFixed(0)+" h"}

/*** VEC MATH ***/
const norm=v=>Math.hypot(v[0],v[1],v[2]);
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const scale=(a,s)=>[a[0]*s,a[1]*s,a[2]*s];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];

/*** FETCH HELPERS (via local proxy) ***/
async function horizonsVector(command, isoUtc){
  const params=new URLSearchParams({format:'json',COMMAND:String(command),EPHEM_TYPE:'VECTORS',CENTER:'500@0',TLIST:"'"+isoUtc+"'",REF_PLANE:'ECLIPTIC'});
  const url = HORIZONS+'?'+params.toString();
  const res = await fetch(PROXY+encodeURIComponent(url));
  if(!res.ok) throw new Error('Horizons '+res.status);
  const j=await res.json(); const vecTxt=j && (j.result||j.vectors); if(!vecTxt) throw new Error('No vectors');
  const m=vecTxt.match(/X\\s*=\\s*([\\-0-9\\.E\\+]+).*?Y\\s*=\\s*([\\-0-9\\.E\\+]+).*?Z\\s*=\\s*([\\-0-9\\.E\\+]+).*?VX\\s*=\\s*([\\-0-9\\.E\\+]+).*?VY\\s*=\\s*([\\-0-9\\.E\\+]+).*?VZ\\s*=\\s*([\\-0-9\\.E\\+]+)/s);
  if(!m) throw new Error('Parse error');
  const km=[+m[1],+m[2],+m[3]], vkm=[+m[4],+m[5],+m[6]];
  return { r_au:[km[0]/AU_KM,km[1]/AU_KM,km[2]/AU_KM], v_au_s:[vkm[0]/AU_KM,vkm[1]/AU_KM,vkm[2]/AU_KM], v_km_s:vkm };
}
async function gaiaCone(raDeg,decDeg,radiusDeg=0.2,limit=1){
  const adql=\`SELECT TOP \${limit} ra,dec,parallax,pmra,pmdec,radial_velocity
FROM gaiadr3.gaia_source
WHERE 1=CONTAINS(POINT('ICRS', ra, dec), CIRCLE('ICRS', \${raDeg}, \${decDeg}, \${radiusDeg}))
ORDER BY phot_g_mean_mag ASC\`;
  const form=new URLSearchParams({QUERY:adql});
  const r=await fetch(PROXY+encodeURIComponent(GAIA),{method:'POST',body:form});
  if(!r.ok) return [];
  const text=await r.text(); const lines=text.trim().split(/\\n+/); if(lines.length<2) return [];
  const keys=lines[0].split(/,|\\t/);
  return lines.slice(1).map(l=>{const vals=l.split(/,|\\t/); const o={}; keys.forEach((k,i)=>o[k.trim()]=+vals[i]); return o;});
}

/*** UI + STATE ***/
const rowsEl=document.getElementById('targets');
const banner=document.getElementById('statusBanner');
function setBanner(msg,cls){banner.textContent=msg;banner.className='banner mono '+(cls||'')}

const STATE = new Map(); // key -> {name, id, type, live, r0, v, e0, ev, t0_ms}
const cache = new Map(); // for actions

function makeRow(t){
  const id=(t.id||t.name).toString().replace(/\\W+/g,'_');
  const el=document.createElement('div'); el.className='row';
  el.innerHTML=\`
    <div><div><strong>\${t.name||'(unnamed target)'}</strong></div><div class="small">\${t.id||''}</div></div>
    <div><span class="pill">\${t.type||t.group||'—'}</span></div>
    <div class="mono" id="vec-\${id}">—</div>
    <div id="sun-\${id}">—</div>
    <div id="earth-\${id}">—</div>
    <div id="pm-\${id}">—</div>
    <div id="rv-\${id}">—</div>
    <div id="dist-\${id}">—</div>
    <div id="rec-\${id}">—</div>
    <div id="unc-\${id}">—</div>
    <div class="small" id="upd-\${id}">—</div>
    <div class="small" id="status-\${id}">pending…</div>
    <div><button id="solve-\${id}">Solve Tc</button> <button id="shape-\${id}">Shape Bubble</button></div>\`;
  rowsEl.appendChild(el);
  document.getElementById(\`solve-\${id}\`).addEventListener('click',()=>solveRow(t,id));
  document.getElementById(\`shape-\${id}\`).addEventListener('click',()=>shapeRow(t,id));
}

/*** Propagation tick (per second) ***/
function perSecondTick(){
  const now = Date.now();
  for(const [key,s] of STATE){
    if(!s.live || !s.r0 || !s.e0) continue;
    const dt = (now - s.t0_ms)/1000; // seconds since last fetch
    const r = add(s.r0, scale(s.v, dt));
    const e = add(s.e0, scale(s.ev, dt));
    const id = key;

    // Update UI
    const vecEl=document.getElementById('vec-'+id);
    const sunEl=document.getElementById('sun-'+id);
    const earthEl=document.getElementById('earth-'+id);
    const updEl=document.getElementById('upd-'+id);
    const uncEl=document.getElementById('unc-'+id);

    if(vecEl) vecEl.textContent=\`[\${fmt(r[0])}, \${fmt(r[1])}, \${fmt(r[2])}]\`;
    const rSun=norm(r), rEarth=norm(sub(r,e));
    if(sunEl)   sunEl.textContent=\`\${fmtAU(rSun)} (\${fmtMi(rSun*MI_PER_AU)})\`;
    if(earthEl) earthEl.textContent=\`\${fmtAU(rEarth)} (\${fmtMi(rEarth*MI_PER_AU)})\`;
    if(updEl)   updEl.textContent=fmtISO(new Date().toISOString());

    // Uncertainty demo based on speed magnitude
    const vmag = Math.hypot(s.v_km[0], s.v_km[1], s.v_km[2]);
    const sigmaKm = vmag*0.5;
    if(uncEl) uncEl.textContent=\`\${(sigmaKm/AU_KM).toExponential(2)} AU (~\${Math.round(sigmaKm)} km)\`;

    // Cache for actions
    cache.set(s.name,{ vec:{au:r, v_au_s:s.v, vkm:s.v_km}, earth:{au:e, v_au_s:s.ev} });
  }
}

/*** Periodic refetch from Horizons (to re-anchor propagation) ***/
let REFRESH_MS = 30000;
async function refetchAll(){
  const nowIso = new Date().toISOString();
  const jobs = [];
  for(const [key,s] of STATE){
    if(!s.live) continue;
    jobs.push((async()=>{
      try{
        const obj = await horizonsVector(s.command, nowIso);
        const earth = await horizonsVector("399", nowIso);
        s.r0 = obj.r_au; s.v = obj.v_au_s; s.v_km = obj.v_km_s;
        s.e0 = earth.r_au; s.ev = earth.v_au_s;
        s.t0_ms = Date.now();
        const stEl = document.getElementById('status-'+key);
        if(stEl){ stEl.textContent = "live (propagating + refreshed)"; stEl.className="small ok"; }
      }catch(e){
        const stEl = document.getElementById('status-'+key);
        if(stEl){ stEl.textContent = "refresh error: "+e.message; stEl.className="small bad"; }
        // keep old r0/v if any; next cycle will try again
      }
    })());
  }
  await Promise.allSettled(jobs);
}
let refetchTimer=null;
function startRefetchLoop(){
  if(refetchTimer) clearInterval(refetchTimer);
  refetchTimer = setInterval(()=>{ if(!document.hidden) refetchAll(); }, REFRESH_MS);
}

/*** Gaia one-time fill ***/
async function fillGaia(t){
  if(!(typeof t.ra==='number' && typeof t.dec==='number')) return;
  const id=(t.id||t.name).toString().replace(/\\W+/g,'_');
  const pmEl=document.getElementById('pm-'+id);
  const rvEl=document.getElementById('rv-'+id);
  const distEl=document.getElementById('dist-'+id);
  const recEl=document.getElementById('rec-'+id);
  try{
    const g=await gaiaCone(t.ra,t.dec,0.2,1);
    if(g.length){
      const s=g[0];
      if(pmEl) pmEl.textContent=\`\${(+s.pmra||0).toFixed(1)}, \${(+s.pmdec||0).toFixed(1)} mas/yr\`;
      if(rvEl && Number.isFinite(s.radial_velocity)) rvEl.textContent=\`\${(+s.radial_velocity).toFixed(1)} km/s\`;
      if(distEl && s.parallax>0){
        const pc=1000/s.parallax; distEl.textContent=\`\${pc.toFixed(0)} pc\`;
        const H0=+document.getElementById('h0').value || 70;
        if(recEl) recEl.textContent=\`\${(H0*(pc/1e6)).toFixed(3)} km/s\`;
      }
    }
  }catch(e){
    const stEl=document.getElementById('status-'+id);
    if(stEl){ stEl.textContent='gaia error: '+e.message; stEl.className='small bad'; }
  }
}

/*** Actions ***/
function solveRow(t,id){
  const stEl=document.getElementById('status-'+id);
  const entry=cache.get(t.name); if(!entry){ stEl.textContent='solve: no live vectors yet'; stEl.className='small warn'; return; }
  const vec=entry.vec, earth=entry.earth;
  const R0=sub(vec.au,earth.au), Vrel=sub(vec.v_au_s,earth.v_au_s);
  const denom=dot(Vrel,Vrel);
  if(denom===0){ stEl.textContent='solve: zero relative velocity'; stEl.className='small warn'; return; }
  let Tstar=-dot(R0,Vrel)/denom; if(!isFinite(Tstar)||Tstar<0) Tstar=Math.max(0,Tstar||0);
  const errKm=norm(add(R0,scale(Vrel,Tstar)))*AU_KM;
  const tolKm=+document.getElementById('tolKm').value || 10000;
  const ok=errKm<=tolKm;
  stEl.textContent = ok ? \`Tc ≈ \${Tstar.toFixed(1)} s (within tol)\` : \`Tc ≈ \${Tstar.toFixed(1)} s, residual \${Math.round(errKm)} km > tol\`;
  stEl.className='small '+(ok?'ok':'warn');
  const state=STATE.get(id); if(state){ state.tc=Tstar; state.residualKm=errKm; }
}
function shapeRow(t,id){
  const stEl=document.getElementById('status-'+id);
  const state=STATE.get(id); if(!state || !state.tc){ stEl.textContent='shape: run Solve Tc first'; stEl.className='small warn'; return; }
  const I = (state.residualKm||0) / C_KM_S;
  const flat = I / state.tc;
  stEl.textContent=\`Shape: ∫(γ⁻¹−1)dt ≈ \${I.toExponential(3)} s ⇒ flat (γ⁻¹−1) ≈ \${flat.toExponential(3)}\`;
  stEl.className='small ok';
}

/*** Loader ***/
async function loadTargets(){
  const r=await fetch(TARGETS_URL+"?v="+Date.now()); const data=await r.json();
  // flatten known groups or handle array
  const lst = Array.isArray(data) ? data :
    ["planets","moons","stars","galaxies"].flatMap(k => Array.isArray(data[k]) ? data[k].map(x=>({...x, group:k})) : []);
  rowsEl.innerHTML='';
  lst.forEach(makeRow);

  // Initialize STATE and attempt first anchor fetch
  for(const t of lst){
    const key=(t.id||t.name).toString().replace(/\\W+/g,'_');
    STATE.set(key,{
      name:t.name, id:key, type:t.type||t.group||'',
      command: t.horizonsId||t.naifId||t.command,
      live: !!(t.horizonsId||t.naifId||t.command),
      r0:null, v:null, v_km:null, e0:null, ev:null, t0_ms:0
    });
  }

  setBanner(\`Loaded \${lst.length} target(s).\`, 'ok');

  // First Horizons anchor (in parallel)
  await refetchAll();

  // One-time Gaia fills
  lst.forEach(fillGaia);

  // Start loops
  perSecondTick(); // initial
  setInterval(()=>{ if(!document.hidden) perSecondTick(); }, 1000);
  startRefetchLoop();

  // Refresh period control
  document.getElementById('applyRefresh').onclick = ()=>{
    const s = Math.max(5, (+document.getElementById('refreshSec').value || 30));
    REFRESH_MS = s*1000; startRefetchLoop();
  };
}

/*** Clocks ***/
function tickClocks(){
  document.getElementById('localTime').textContent=chicagoNow();
  document.getElementById('tzName').textContent=tzLabel();
  document.getElementById('interstellarYear').textContent=interstellarYear();
  document.getElementById('stardate').textContent=stardate();
  document.getElementById('cstOffset').textContent=cstToUtcOffset();
  document.getElementById('utcEpoch').textContent=new Date().toISOString().replace('T',' ').replace('Z','Z');
}
setInterval(tickClocks,1000); tickClocks();

loadTargets();
</script>
</body>
</html>`;

/* -------------------------- TINY HTTP SERVER -------------------------- */
function send(res, code, body, type="text/plain; charset=utf-8") {
  res.statusCode = code;
  res.setHeader("Content-Type", type);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, "http://localhost");

    // Page
    if (u.pathname === "/") return send(res, 200, HTML, "text/html; charset=utf-8");

    // Serve current targets as JSON
    if (u.pathname === "/targets.json" && req.method === "GET") {
      return send(res, 200, JSON.stringify(TARGETS, null, 2), "application/json; charset=utf-8");
    }

    // Optional: update targets via POST /set-targets  (raw JSON string body)
    if (u.pathname === "/set-targets" && req.method === "POST") {
      let body = "";
      req.on("data", c => body += c);
      req.on("end", () => {
        try { TARGETS = JSON.parse(body); send(res, 200, JSON.stringify({ ok:true }), "application/json"); }
        catch(e){ send(res, 400, JSON.stringify({ error:"invalid JSON" }), "application/json"); }
      });
      return;
    }

    // CORS proxy (GET or POST)
    if (u.pathname === "/proxy") {
      const target = u.searchParams.get("url");
      if (!target) return send(res, 400, JSON.stringify({ error:"missing ?url=" }), "application/json");
      let t;
      try { t = new URL(target); } catch { return send(res, 400, JSON.stringify({ error:"bad url" }), "application/json"); }
      if (!ALLOW.has(t.host)) return send(res, 403, JSON.stringify({ error:"host not allowed" }), "application/json");

      // collect body if POST
      let reqBody = null;
      if (req.method === "POST") {
        const chunks = [];
        await new Promise((resolve) => {
          req.on("data", c => chunks.push(c));
          req.on("end", resolve);
        });
        reqBody = Buffer.concat(chunks);
      }

      // forward method + body + minimal headers
      const upstream = await fetch(t.toString(), {
        method: req.method,
        headers: {
          "User-Agent": "Mozilla/5.0",
          // Important for Gaia TAP form posts:
          ...(req.method === "POST" ? { "Content-Type": req.headers["content-type"] || "application/x-www-form-urlencoded" } : {})
        },
        body: req.method === "POST" ? reqBody : undefined
      });

      const buf = Buffer.from(await upstream.arrayBuffer());
      res.statusCode = upstream.status;
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", upstream.headers.get("content-type") || "application/octet-stream");
      return res.end(buf);
    }

    // 404
    send(res, 404, "Not found");
  } catch (e) {
    send(res, 500, JSON.stringify({ error:String(e) }), "application/json; charset=utf-8");
  }
});

server.listen(PORT, () => {
  console.log(`\n✅ Live server running at http://localhost:${PORT}`);
  console.log(`   • Page:           http://localhost:${PORT}/`);
  console.log(`   • Targets JSON:   http://localhost:${PORT}/targets.json`);
  console.log(`   • Proxy endpoint: http://localhost:${PORT}/proxy?url=...`);
  console.log(`   (Edit targets at top of live.js, or POST to /set-targets)`);
});
