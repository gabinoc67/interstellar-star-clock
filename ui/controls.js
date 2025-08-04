// ui/controls.js

// ✅ UI Scaling
const uiScaleInput = document.getElementById('ui-scale');
uiScaleInput.addEventListener('input', () => {
  const scale = uiScaleInput.value;
  document.body.style.transform = `scale(${scale / 100})`;
  document.body.style.transformOrigin = 'top left';
});

// ✅ Toggle Tabs
function switchTab(tab) {
  document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
  document.getElementById(`${tab.toLowerCase()}-tab`).style.display = 'block';
}

// ✅ Emergency Functions
function triggerEject() {
  alert('🚨 Escape pod ejected!');
  log('Ejection sequence initiated.');
}

function shutdownAllPower() {
  alert('⚡ Power has been shut down!');
  log('All systems powered off.');
}

function openHUDMirror() {
  window.open('hud.html', 'HUD Mirror', 'width=800,height=600');
  log('HUD Stream opened in new window.');
}
