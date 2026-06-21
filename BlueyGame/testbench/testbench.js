const MANIFEST_URL = "../assets/characters/manifest.json";

const gallery = document.getElementById("gallery");
const status = document.getElementById("status");
const zoomSlider = document.getElementById("zoomSlider");
const zoomLabel = document.getElementById("zoomLabel");
const bgSelect = document.getElementById("bgSelect");
const fitAllBtn = document.getElementById("fitAllBtn");

let manifest = null;

function setStatus(text) {
  status.textContent = text;
}

function applyZoom(percent) {
  zoomLabel.textContent = `${percent}%`;
  document.querySelectorAll(".viewport img").forEach((img) => {
    img.style.transform = `scale(${percent / 100})`;
  });
}

function applyBackground(mode) {
  document.querySelectorAll(".viewport").forEach((vp) => {
    vp.className = `viewport ${mode}`;
  });
}

function createCard(character) {
  const card = document.createElement("article");
  card.className = "card";
  card.dataset.id = character.id;

  card.innerHTML = `
    <div class="card-header">
      <h2>${character.name}</h2>
      <p class="role">${character.role}</p>
    </div>
    <div class="viewport checker">
      <img src="../${character.file}" alt="${character.name}" loading="lazy"
           width="${character.width}" height="${character.height}">
    </div>
    <div class="card-meta">
      <strong>${character.width} × ${character.height}</strong> px<br>
      ${character.description}
    </div>
  `;

  return card;
}

async function loadManifest() {
  const response = await fetch(MANIFEST_URL);
  if (!response.ok) {
    throw new Error(`Failed to load manifest (${response.status})`);
  }
  return response.json();
}

async function init() {
  try {
    manifest = await loadManifest();

    if (!manifest.characters?.length) {
      gallery.innerHTML = '<p class="error">No characters in manifest yet. Add HD assets to assets/characters/.</p>';
      setStatus("Manifest empty — waiting for character assets");
      return;
    }

    gallery.replaceChildren(...manifest.characters.map(createCard));
    setStatus(`${manifest.characters.length} characters loaded · manifest v${manifest.version}`);
    applyZoom(Number(zoomSlider.value));
    applyBackground(bgSelect.value);
  } catch (err) {
    gallery.innerHTML = `<p class="error">${err.message}</p>`;
    setStatus("Error loading testbench");
    console.error(err);
  }
}

zoomSlider.addEventListener("input", () => applyZoom(Number(zoomSlider.value)));
bgSelect.addEventListener("change", () => applyBackground(bgSelect.value));
fitAllBtn.addEventListener("click", () => {
  zoomSlider.value = "100";
  applyZoom(100);
});

init();