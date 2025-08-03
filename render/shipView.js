// ✅ render/shipView.js – Starfield background + direction toggle + screenshot

window.addEventListener("DOMContentLoaded", () => {
  const viewPanel = document.getElementById("ship-view");

  // 🌌 Starfield Canvas
  const starCanvas = document.createElement("canvas");
  starCanvas.width = 380;
  starCanvas.height = 120;
  starCanvas.style.width = "100%";
  starCanvas.style.background = "black";
  viewPanel.appendChild(starCanvas);

  const ctx = starCanvas.getContext("2d");

  function drawStars() {
    ctx.clearRect(0, 0, starCanvas.width, starCanvas.height);
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * starCanvas.width;
      const y = Math.random() * starCanvas.height;
      const r = Math.random() * 1.5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fillStyle = "#fff";
      ctx.fill();
    }
  }

  drawStars();
  setInterval(drawStars, 3000); // Refresh every 3 sec

  // 🔁 Direction Toggle
  const toggleBtn = document.createElement("button");
  toggleBtn.textContent = "View: Front";
  toggleBtn.style.marginTop = "6px";
  toggleBtn.addEventListener("click", () => {
    if (toggleBtn.textContent.includes("Front")) {
      toggleBtn.textContent = "View: Rear";
    } else {
      toggleBtn.textContent = "View: Front";
    }
    // Optional: update direction logic globally here
  });
  viewPanel.appendChild(toggleBtn);

  // 📷 Screenshot Button
  const screenshotBtn = document.createElement("button");
  screenshotBtn.textContent = "📸 Screenshot";
  screenshotBtn.style.marginLeft = "10px";
  screenshotBtn.addEventListener("click", () => {
    html2canvas(document.body).then(canvas => {
      const link = document.createElement("a");
      link.download = "warp_screenshot.png";
      link.href = canvas.toDataURL();
      link.click();
    });
  });
  viewPanel.appendChild(screenshotBtn);
});
