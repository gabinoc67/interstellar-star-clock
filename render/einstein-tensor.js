// ✅ render/einstein-tensor.js – GR Curvature Visual

const tensorCanvas = document.createElement("canvas");
tensorCanvas.width = 300;
tensorCanvas.height = 150;
tensorCanvas.style.width = "100%";
tensorCanvas.style.background = "#000";

const tensorCtx = tensorCanvas.getContext("2d");

// Attach to tensor panel
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("einstein-tensor").appendChild(tensorCanvas);
  drawTensorWave(0);
});

// ✅ Draw animated wave to simulate spacetime distortion
function drawTensorWave(offset = 0) {
  tensorCtx.clearRect(0, 0, tensorCanvas.width, tensorCanvas.height);

  const w = tensorCanvas.width;
  const h = tensorCanvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const amp = 20;
  const freq = 0.1;

  tensorCtx.beginPath();
  for (let x = 0; x < w; x++) {
    const y = cy + Math.sin((x + offset) * freq) * amp;
    if (x === 0) {
      tensorCtx.moveTo(x, y);
    } else {
      tensorCtx.lineTo(x, y);
    }
  }

  tensorCtx.strokeStyle = "lime";
  tensorCtx.lineWidth = 2;
  tensorCtx.stroke();

  requestAnimationFrame(() => drawTensorWave(offset + 2));
}
