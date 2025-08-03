// ✅ system/engine/physics.js - Warp ETA, GVE auto-calc, GR validator

function computeETASeconds() {
  const warp = Number($("warpSpeed").value || 1);
  const dest = $("destination").value;
  const auMap = {
    Mercury: 0.39,
    Venus: 0.72,
    Mars: 1.52,
    Jupiter: 5.20,
    Saturn: 9.58,
    Uranus: 19.22,
    Neptune: 30.05,
    Pluto: 39.48
  };
  const dAU = Math.abs(auMap[dest] - 1); // Earth baseline at 1 AU
  const etaSeconds = (dAU * 600) / warp; // Base 10min per AU @ Warp 1
  return { etaSeconds, dAU };
}

function autoCalculateGVE() {
  const dest = $("destination").value;
  const warp = Number($("warpSpeed").value || 1);
  const { dAU } = computeETASeconds();

  const gravityMap = {
    Mercury: [34, 66],
    Venus: [36, 64],
    Mars: [35, 65],
    Jupiter: [38, 62],
    Saturn: [37, 63],
    Uranus: [33, 67],
    Neptune: [32, 68],
    Pluto: [30, 70]
  };
  const [fBase, rBase] = gravityMap[dest] || [35, 65];

  const distFactor = Math.min(1, dAU / 5);
  const frontPct = Math.round(fBase - distFactor * 2);
  const rearPct = 100 - frontPct;
  const reactorMW = Math.round(4000 + 600 * warp);

  $("frontPct").value = frontPct;
  $("rearPct").value = rearPct;
  $("reactorMW").value = reactorMW;
  $("lrBias").value = 0;
  $("udBias").value = 0;
  $("intakeMode").value = "balanced";

  $("frontLbl").textContent = `${frontPct}%`;
  $("rearLbl").textContent = `${rearPct}%`;
  $("lrLbl").textContent = `0%`;
  $("udLbl").textContent = `0%`;

  drawCurve();
  validateGR();
}

function validateGR() {
  const eta = computeETASeconds().etaSeconds;
  const gr = Math.round(eta * 0.0075);
  const el = document.getElementById("einstein-tensor");
  el.innerHTML = `<p>Tensor: ${gr}</p><p>ETA: ${Math.round(eta)} sec</p>`;
}

function $(id) {
  return document.getElementById(id);
}
