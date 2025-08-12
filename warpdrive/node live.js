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

const STATE = new Map(); // key -> {name, id, type, l
