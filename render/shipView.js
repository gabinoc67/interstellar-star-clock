// ✅ Final Recommended: shipView.js

let frontView = true;
const shipRender = document.getElementById("ship-render");
const toggleViewBtn = document.getElementById("toggleView");
const compassHeading = document.getElementById("compass-heading");

let heading = 0;
function updateHeading() {
  heading = (heading + 1) % 360;
  compassHeading.textContent = `🧭 Heading: ${heading.toString().padStart(3, "0")}°`;
  updateVectorDirection?.(heading); // Optional external hook
}

function toggleShipView() {
  frontView = !frontView;
  toggleViewBtn.textContent = `Toggle View: ${frontView ? "Front" : "Rear"}`;
  shipRender.style.transform = frontView ? "scaleX(1)" : "scaleX(-1)";
}

if (shipRender && toggleViewBtn) {
  toggleViewBtn.addEventListener("click", toggleShipView);
  setInterval(updateHeading, 300);
}
