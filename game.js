let stars = 0;
let starsPerClick = 1;
let autoStars = 0;

// Costos base
let clickCost = 10;
let autoCost = 50;

// Elementos
const startScreen = document.getElementById("start-screen");
const playBtn = document.getElementById("play-btn");
const gameMain = document.getElementById("game");
const planetBtn = document.getElementById("planet-btn");
const coinsDisplay = document.getElementById("coins-display");
const effects = document.getElementById("effects");

const clickBtn = document.getElementById("upgrade-click");
const autoBtn = document.getElementById("upgrade-auto");
const clickCostDisplay = document.getElementById("click-cost");
const autoCostDisplay = document.getElementById("auto-cost");
const autoCountDisplay = document.getElementById("auto-count");
const resetBtn = document.getElementById("reset-btn");

// Iniciar juego
playBtn.addEventListener("click", () => {
  startScreen.classList.add("hidden");
  gameMain.classList.remove("hidden");
  loadGame(); // Cargar progreso al entrar
});

// Click en planeta
planetBtn.addEventListener("click", () => {
  stars += starsPerClick;
  updateStars();
  spawnFloating(`+${starsPerClick} ⭐`);
  saveGame();
});

// Comprar mejora de clic
clickBtn.addEventListener("click", () => {
  if (stars >= clickCost) {
    stars -= clickCost;
    starsPerClick++;
    clickCost = Math.floor(clickCost * 1.5);
    updateStars();
    updateShop();
    saveGame();
  }
});

// Comprar mejora automática
autoBtn.addEventListener("click", () => {
  if (stars >= autoCost) {
    stars -= autoCost;
    autoStars++;
    autoCost = Math.floor(autoCost * 1.5);
    updateStars();
    updateShop();
    saveGame();
  }
});

// Reiniciar progreso
resetBtn.addEventListener("click", () => {
  if (confirm("¿Seguro que quieres reiniciar tu progreso?")) {
    localStorage.removeItem("stellarSave");
    stars = 0;
    starsPerClick = 1;
    autoStars = 0;
    clickCost = 10;
    autoCost = 50;
    updateStars();
    updateShop();
    alert("Progreso reiniciado.");
  }
});

// Generar estrellas automáticas cada segundo
setInterval(() => {
  if (autoStars > 0) {
    stars += autoStars;
    updateStars();
    spawnFloating(`+${autoStars} ⭐`);
    saveGame();
  }
}, 1000);

// Guardar juego
function saveGame() {
  const saveData = {
    stars,
    starsPerClick,
    autoStars,
    clickCost,
    autoCost
  };
  localStorage.setItem("stellarSave", JSON.stringify(saveData));
}

// Cargar juego
function loadGame() {
  const data = localStorage.getItem("stellarSave");
  if (data) {
    const save = JSON.parse(data);
    stars = save.stars || 0;
    starsPerClick = save.starsPerClick || 1;
    autoStars = save.autoStars || 0;
    clickCost = save.clickCost || 10;
    autoCost = save.autoCost || 50;
    updateStars();
    updateShop();
  }
}

// --- Funciones auxiliares ---
function updateStars() {
  coinsDisplay.innerText = stars;
}

function updateShop() {
  clickCostDisplay.innerText = clickCost;
  autoCostDisplay.innerText = autoCost;
  autoCountDisplay.innerText = autoStars;
}

// Texto flotante
function spawnFloating(text) {
  const el = document.createElement("div");
  el.className = "floating";
  el.innerText = text;
  el.style.left = (50 + Math.random()*100) + "px";
  el.style.color = "#facc15";
  effects.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}
