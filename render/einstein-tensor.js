// ✅ render/einstein-tensor.js – GR Curvature Visual + Values

const tensorCanvas = document.createElement("canvas");
tensorCanvas.width = 300;
tensorCanvas.height = 150;
tensorCanvas.style.width = "100%";
tensorCanvas.style.background = "#000";

const tensorCtx = tensorCanvas.getContext("2d");
let tensorOffset = 0;

// Attach canvas and value display
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("einstein-tensor").appendChild(tensorCanvas);

  const valueBox = document.createElement("div");
  valueBox.id = "tensor-values";
  valueBox.style.color = "lime";
  valueBox.style.fontSize = "12px";
  valueBox.style.marginTop = "6px";
  document.getElementById("einstein-tensor").appendChild(valueBox);

  drawTensorWave();
});

function drawTensorWave() {
  tensorCtx.clearRect(0, 0, tensorCanvas.width, tensorCanvas.height);
  const w = tensorCanvas.width;
  const h = tensorCanvas.height;
  const cy = h / 2;
  const amp = 20;
  const freq = 0.1;

  tensorCtx.beginPath();
  for (let x = 0; x < w; x++) {
    const y = cy + Math.sin((x + tensorOffset) * freq) * amp;
    if (x === 0) {
      tensorCtx.moveTo(x, y);
    } else {
      tensorCtx.lineTo(x, y);
    }
  }
  tensorCtx.strokeStyle = "lime";
  tensorCtx.lineWidth = 2;
  tensorCtx.stroke();

  const curvature = Math.abs(Math.sin(tensorOffset * freq)) * 0.9;
  const energyFlux = (curvature * 1000).toFixed(2);
  const tensorVal = curvature.toFixed(5);
  document.getElementById("tensor-values").textContent = `Tensor: ${tensorVal}  |  Flux: ${energyFlux}μJ`;

  tensorOffset += 2;
  requestAnimationFrame(drawTensorWave);
}
