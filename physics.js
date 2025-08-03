// ✅ engine/physics.js - Core ETA & GVE Logic

// Constants
const AU_KM = 149597870.7; // 1 AU in kilometers
const WARP_SPEEDS = {
  1: 1.0,   // baseline multiplier
  2: 4.0,
  3: 9.0,
  4: 16.0,
  5: 25.0,
  6: 36.0,
  7: 49.0,
  8: 64.0,
  9: 81.0,
 10: 100.0
};

// Approximate AU distances from Earth to each planet
const PLANET_DISTANCES_AU = {
  Mercury: 0.39,
  Venus:   0.72,
  Mars:    0.52,
  Jupiter: 4.2,
  Saturn:  8.5,
  Uranus:  18.0,
  Neptune: 30.0,
  Pluto:   39.5
};

// ✅ Computes ETA in seconds and AU
function computeETASeconds() {
  const warp = Number(document.getElementById("warpSpeed").value || 1);
  const dest = document.getElementById("destination").value;

  const dAU = PLANET_DISTANCES_AU[dest] || 1.0;
  const warpFactor = WARP_SPEEDS[warp] || 1.0;

  // Speed in AU/sec (simplified)
  const speedAUPerSec = warpFactor * 0.01; // 0.01 = 1% AU/sec
  const etaSeconds = dAU / speedAUPerSec;

  console.log(`📐 ETA to ${dest} at Warp ${warp}: ${Math.round(etaSeconds)} sec over ${dAU} AU`);
  return { etaSeconds, dAU };
}

// ✅ Placeholder to validate General Relativity constraints
function validateGR() {
  console.log("🧠 Validating curvature threshold...");
  // Future: add Einstein tensor checks, bubble stability
}
